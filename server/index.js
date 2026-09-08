/**
 * @fileoverview 服务端 BFF 入口 - 为前端提供短期会话与上游代理能力
 * @author 祁筱欣
 * @date 2026-09-08
 * @since 2026-09-08
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE MPL-2.0 license
 * @remark
 * 架构升级：将原本「前端持 API Key 直连 AI 网关」改为「后端 BFF 统一代理」。
 * 前端仅与同源 /api/* 通信，真实上游 Key 由服务端环境变量 UPSTREAM_API_KEY 持有，
 * 浏览器零密钥。前端先经 /api/session 建立短期会话（HttpOnly Cookie + 签名 Token），
 * 随后 AI 调用均携带该会话，由本服务校验后转发到上游。
 *
 * 安全加固（依据安全评审 P2 结论）：
 * - 会话令牌只写入 HttpOnly Cookie，JSON 响应体不再回传 token；
 * - 取消 Authorization: Bearer 透传通道，会话仅依赖浏览器自动携带的 Cookie；
 * - 对 /api/session、/api/session/refresh、/api/proxy/* 实施按 IP 滑动窗口限流；
 * - 对代理出站请求限制并发数，避免单一客户端拖垮服务或耗尽上游配额；
 * - 通过 Content-Length 限制请求体大小，防止超大载荷轰炸；
 * - 校验 Origin 来源，阻断跨站/CSRF 式对会话接口的滥用。
 *
 * 路由：
 * - POST /api/session          : 建立会话，下发 HttpOnly Cookie（限流保护）
 * - POST /api/session/refresh  : 续期会话（需旧会话有效 + 限流保护）
 * - POST /api/proxy/*          : 携带有效会话时透传到上游（注入真实 Key，流式）
 * - GET  /healthz              : 健康检查
 */

import http from 'node:http'
import { buildSessionCookie, verifySession, readSessionTokenFromCookie, DEVICE_FINGERPRINT_HEADER } from './session.js'
import { isUpstreamReady } from './upstream.js'
import { proxyToUpstream, isAllowedPath } from './proxy.js'

const PORT = Number(process.env.SERVER_PORT) || 3001

/**
 * 限流配置：针对不同端点的单 IP 窗口限流与全局并发上限
 * 均可由部署方通过环境变量调整；默认值面向单/少量访问者的自部署场景，
 * 在「保障可用」与「防止被外部刷量拖垮」之间取得平衡。
 */
const RATE_LIMITS = {
  session: {
    windowMs: Number(process.env.RATE_LIMIT_SESSION_WINDOW_MS) || 60 * 1000,
    max: Number(process.env.RATE_LIMIT_SESSION_MAX) || 10,
  },
  refresh: {
    windowMs: Number(process.env.RATE_LIMIT_REFRESH_WINDOW_MS) || 60 * 1000,
    max: Number(process.env.RATE_LIMIT_REFRESH_MAX) || 20,
  },
  proxy: {
    windowMs: Number(process.env.RATE_LIMIT_PROXY_WINDOW_MS) || 60 * 1000,
    max: Number(process.env.RATE_LIMIT_PROXY_MAX) || 30,
  },
}
// 代理并发上限（超出时立即拒绝而非排队，避免雪崩）
const MAX_CONCURRENT_PROXY = Number(process.env.PROXY_MAX_CONCURRENT) || 5
// 代理请求体大小上限（默认 5MB），防止超大请求轰炸上游
const MAX_PROXY_BODY_BYTES = Number(process.env.PROXY_MAX_BODY_BYTES) || 5 * 1024 * 1024

// 进程内限流桶：ip -> { session: number[], refresh: number[], proxy: number[] }
// 以数组记录每个时间窗内的请求时间戳，滑动窗口淘汰旧记录
const rateBuckets = new Map()
// 当前进行中的代理出站请求数
let activeProxyCount = 0

/**
 * 从请求中提取客户端 IP（兼容 nginx 反向代理透传头）
 *
 * @param {import('node:http').IncomingMessage} req - 客户端请求对象
 * @returns {string} 客户端 IP 字符串
 */
function getClientIp(req) {
  const xff = req.headers['x-forwarded-for']
  if (xff && typeof xff === 'string') {
    return xff.split(',')[0].trim()
  }
  const realIp = req.headers['x-real-ip']
  if (realIp && typeof realIp === 'string') return realIp
  return req.socket.remoteAddress || 'unknown'
}

/**
 * 滑动窗口限流检查（进程内，内存占用随活跃 IP 增长，长时间空闲自动回收由 GC 完成）
 *
 * @param {string} clientIp - 客户端 IP
 * @param {'session'|'refresh'|'proxy'} kind - 限流类别
 * @returns {boolean} 放行返回 true，超限返回 false
 */
function rateLimit(clientIp, kind) {
  const cfg = RATE_LIMITS[kind]
  const now = Date.now()
  let entry = rateBuckets.get(clientIp)
  if (!entry) {
    entry = { session: [], refresh: [], proxy: [] }
    rateBuckets.set(clientIp, entry)
  }
  const timestamps = entry[kind]
  // 淘汰窗口外的旧时间戳
  while (timestamps.length > 0 && timestamps[0] <= now - cfg.windowMs) {
    timestamps.shift()
  }
  if (timestamps.length >= cfg.max) return false
  timestamps.push(now)
  return true
}

/**
 * 清理长时间空闲的限流桶（防止 Map 无限膨胀），每分钟由定时器调用一次
 *
 * @returns {void}
 */
function cleanupRateBuckets() {
  const cutoff = Date.now() - 10 * 60 * 1000 // 10 分钟无任何记录即清理
  for (const [ip, entry] of rateBuckets) {
    const recent =
      entry.session.length + entry.refresh.length + entry.proxy.length
    if (recent === 0) {
      rateBuckets.delete(ip)
      continue
    }
    const latest = Math.max(
      entry.session[entry.session.length - 1] || 0,
      entry.refresh[entry.refresh.length - 1] || 0,
      entry.proxy[entry.proxy.length - 1] || 0
    )
    if (latest < cutoff) rateBuckets.delete(ip)
  }
}
// 定期清理过期限流桶
setInterval(cleanupRateBuckets, 60 * 1000).unref()

/**
 * 从请求头读取前端声明的设备指纹
 * 指纹由前端基于浏览器稳定特征计算并随会话/续期/代理请求携带，
 * 服务端用它与会话令牌内的绑定指纹比对，实现设备绑定。
 *
 * @param {import('node:http').IncomingMessage} req - 客户端请求对象
 * @returns {string} 指纹十六进制串（缺失则为空串）
 */
function getDeviceFingerprint(req) {
  const fp = req.headers[DEVICE_FINGERPRINT_HEADER]
  return fp && typeof fp === 'string' ? fp.trim().slice(0, 128) : ''
}

// 所有 JSON / 代理响应统一附加的安全响应头（XSS 纵深防御，与服务端 BFF 职责联动）：
// - nosniff：禁止浏览器对响应做 MIME 嗅探，杜绝把 JSON 当 HTML 解析执行；
// - CSP：即使 BFF 侧发生反射/注入，也强制拒绝任何外部脚本与内联执行，
//       与 nginx 侧对静态 HTML 施加的 CSP 形成双层收敛；
// - Referrer-Policy / X-Frame-Options：防止会话元数据经 Referrer 外泄与点击劫持。
const SECURITY_RESPONSE_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy':
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'self'; " +
    "script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; " +
    "connect-src 'self'; font-src 'self' data:; form-action 'self'; frame-src 'none'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN',
}

/**
 * 向响应写入 JSON
 *
 * @param {import('node:http').ServerResponse} res - 服务端响应对象
 * @param {number} status - HTTP 状态码
 * @param {Object} data - 待序列化数据
 * @returns {void}
 */
function sendJson(res, status, data) {
  const body = JSON.stringify(data)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    ...SECURITY_RESPONSE_HEADERS,
  })
  res.end(body)
}

/**
 * 校验请求是否携带有效会话
 * 只接受来自 HttpOnly Cookie 的会话令牌 —— 浏览器自动携带，脚本无法读取；
 * 拒绝 Authorization: Bearer 头，杜绝任何脚本/代理/日志层截获可回放的明文凭据。
 *
 * @param {import('node:http').IncomingMessage} req - 客户端请求对象
 * @returns {boolean} 会话有效返回 true
 */
function hasValidSession(req) {
  const token = readSessionTokenFromCookie(req.headers.cookie)
  if (!token) return false
  // 传入当前请求携带的设备指纹：若与会话签发时绑定的指纹不一致（令牌被带到
  // 其它设备 / 令牌漂移），verifySession 将判定为无效，强制客户端重新建会。
  return verifySession(token, getDeviceFingerprint(req)) !== null
}

/**
 * 校验请求来源是否为同源站点（防 CSRF / 跨站伪造对会话接口的滥用）
 * - 缺失 Origin（curl / 非浏览器客户端）放行 —— 限流已覆盖此类流量；
 * - localhost / 127.0.0.1 开发环境来源一律放行（vite proxy changeOrigin 会改 Host）；
 * - 其余来源必须与（x-forwarded-proto + Host）推导的同源 URL 一致才放行。
 *
 * @param {import('node:http').IncomingMessage} req - 客户端请求对象
 * @returns {boolean} 来源合法返回 true
 */
function isAllowedOrigin(req) {
  const origin = req.headers.origin
  if (!origin) return true // 无 Origin 头（curl / 非浏览器）由限流兜底
  try {
    const originUrl = new URL(origin)
    // 开发环境 localhost 任意端口放行（vite proxy 将 Host 改写为目标端口，无法逐端口匹配）
    if (['localhost', '127.0.0.1'].includes(originUrl.hostname)) return true
    const host = req.headers.host || ''
    const proto = req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http')
    const expectedOrigin = `${proto}://${host}`
    return origin === expectedOrigin
  } catch {
    return false
  }
}

/**
 * 处理会话建立 / 续期
 *
 * @param {import('node:http').IncomingMessage} req - 客户端请求对象
 * @param {import('node:http').ServerResponse} res - 服务端响应对象
 * @param {boolean} refresh - 是否为续期请求
 * @returns {void}
 */
function handleSession(req, res, refresh = false) {
  const clientIp = getClientIp(req)

  // 建立/续期会话时读取设备指纹，并随签名令牌一并绑定（后续请求须指纹一致）
  const fingerprint = getDeviceFingerprint(req)

  // 来源校验：跨站请求一律拒绝
  if (!isAllowedOrigin(req)) {
    sendJson(res, 403, { ok: false, error: 'origin_forbidden', message: '来源不合法' })
    return
  }

  // 按 IP 限流，防止匿名刷会拖垮会话签发能力
  const kind = refresh ? 'refresh' : 'session'
  if (!rateLimit(clientIp, kind)) {
    const cfg = RATE_LIMITS[kind]
    const retryAfter = Math.ceil(cfg.windowMs / 1000)
    res.writeHead(429, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': String(retryAfter),
      ...SECURITY_RESPONSE_HEADERS,
    })
    res.end(JSON.stringify({ ok: false, error: 'rate_limited', message: '请求过于频繁，请稍后再试' }))
    return
  }

  // 续期时须先校验旧会话（含设备指纹比对），避免被无会话者或跨设备者任意刷取
  if (refresh && !hasValidSession(req)) {
    sendJson(res, 401, { ok: false, error: 'unauthorized' })
    return
  }

  // 下发 HttpOnly Cookie —— token 仅在 Cookie 中携带，不写入 JSON 响应体；
  // 每次建立/续期都会签发绑定当前设备指纹的新 Session Key，实现密钥轮换
  const cookie = buildSessionCookie(fingerprint)
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Set-Cookie': cookie,
    ...SECURITY_RESPONSE_HEADERS,
  })
  // 会话时长固定为 30 分钟，仅向客户端返回元数据，不暴露令牌内容
  res.end(JSON.stringify({ ok: true, expiresIn: 30 * 60 }))
}

/**
 * 处理上游代理请求
 *
 * @param {import('node:http').IncomingMessage} req - 客户端请求对象
 * @param {import('node:http').ServerResponse} res - 服务端响应对象
 * @returns {void}
 */
async function handleProxy(req, res) {
  const clientIp = getClientIp(req)

  // 1. 来源校验（CSRF 防护）
  if (!isAllowedOrigin(req)) {
    sendJson(res, 403, { ok: false, error: 'origin_forbidden', message: '来源不合法' })
    return
  }

  // 2. 按 IP 限流代理调用，防止单客户端耗尽上游配额
  if (!rateLimit(clientIp, 'proxy')) {
    sendJson(res, 429, { ok: false, error: 'rate_limited', message: '请求过于频繁，请稍后再试' })
    return
  }

  // 3. 限制请求体大小（Content-Length 预检），防止超大请求
  const contentLength = Number(req.headers['content-length'] || 0)
  if (Number.isFinite(contentLength) && contentLength > MAX_PROXY_BODY_BYTES) {
    sendJson(res, 413, { ok: false, error: 'payload_too_large', message: '请求体超出大小限制' })
    return
  }

  // 4. 全局并发上限：超出时快速拒绝，不进入排队
  if (activeProxyCount >= MAX_CONCURRENT_PROXY) {
    sendJson(res, 503, { ok: false, error: 'busy', message: '服务繁忙，请稍后再试' })
    return
  }

  // 5. 必须持有有效会话，防止未授权者滥用代理出口
  if (!hasValidSession(req)) {
    sendJson(res, 401, { ok: false, error: 'session_expired', message: '会话无效或已过期，请刷新会话后重试' })
    return
  }

  // 6. 后端必须已配置上游密钥，否则拒绝转发
  if (!isUpstreamReady()) {
    sendJson(res, 503, { ok: false, error: 'upstream_not_configured', message: '服务端尚未配置上游 API Key' })
    return
  }

  // 7. 只允许 POST 且命中白名单路径
  if (req.method !== 'POST') {
    sendJson(res, 405, { ok: false, error: 'method_not_allowed' })
    return
  }
  // 去掉 /api/proxy 前缀得到上游路径
  const upstreamPath = req.url.slice('/api/proxy'.length) || '/'
  if (!isAllowedPath(upstreamPath)) {
    sendJson(res, 403, { ok: false, error: 'path_forbidden' })
    return
  }

  // 执行代理并跟踪并发计数
  activeProxyCount += 1
  try {
    const upstreamRes = await proxyToUpstream({
      method: req.method,
      upstreamPath,
      clientHeaders: req.headers,
      requestBody: req,
    })
    // 透传上游响应状态与可转发的响应头（SSE 流式 / JSON 均可）
    const forwardable = ['content-type', 'content-length', 'transfer-encoding', 'connection', 'cache-control', 'date']
    const headers = { ...SECURITY_RESPONSE_HEADERS }
    for (const name of forwardable) {
      const val = upstreamRes.headers[name]
      if (val !== undefined) headers[name] = val
    }
    res.writeHead(upstreamRes.statusCode || 500, headers)
    upstreamRes.pipe(res)
  } catch (err) {
    // 上游网络异常等：保留堆栈上下文便于诊断
    console.error('[proxy] upstream error:', err)
    if (!res.headersSent) {
      sendJson(res, 502, { ok: false, error: 'bad_gateway', message: '上游网关请求失败' })
    } else {
      res.end()
    }
  } finally {
    activeProxyCount -= 1
  }
}

const server = http.createServer((req, res) => {
  const { method, url } = req
  const pathname = url.split('?')[0]

  // 健康检查（不参与限流，供负载均衡/探活使用）
  if (method === 'GET' && pathname === '/healthz') {
    sendJson(res, 200, { ok: true, ready: isUpstreamReady() })
    return
  }

  // 建立会话
  if (method === 'POST' && pathname === '/api/session') {
    handleSession(req, res, false)
    return
  }

  // 续期会话
  if (method === 'POST' && pathname === '/api/session/refresh') {
    handleSession(req, res, true)
    return
  }

  // 上游代理
  if (method === 'POST' && pathname.startsWith('/api/proxy/')) {
    handleProxy(req, res)
    return
  }

  sendJson(res, 404, { ok: false, error: 'not_found' })
})

server.listen(PORT, () => {
  console.log(`[server] BFF listening on :${PORT}`)
})
