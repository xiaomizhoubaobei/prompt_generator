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
 * 路由：
 * - POST /api/session          : 建立会话，下发 HttpOnly Cookie 与短期 Token
 * - POST /api/session/refresh  : 续期会话（返回新的 Token/Cookie）
 * - POST /api/proxy/*          : 携带有效会话时透传到上游（注入真实 Key，流式）
 * - GET  /healthz              : 健康检查
 */

import http from 'node:http'
import { buildSessionCookie, verifySession, readSessionTokenFromCookie } from './session.js'
import { isUpstreamReady } from './upstream.js'
import { proxyToUpstream, isAllowedPath } from './proxy.js'

const PORT = Number(process.env.SERVER_PORT) || 3001

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
  })
  res.end(body)
}

/**
 * 校验请求是否携带有效会话（支持 Cookie 内 Token 或 Authorization Bearer）
 *
 * @param {import('node:http').IncomingMessage} req - 客户端请求对象
 * @returns {boolean} 会话有效返回 true
 */
function hasValidSession(req) {
  const fromCookie = readSessionTokenFromCookie(req.headers.cookie)
  const fromAuth = (req.headers.authorization || '').replace(/^Bearer\s+/i, '')
  const token = fromCookie || fromAuth
  return verifySession(token) !== null
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
  // 续期时须先校验旧会话，避免被无会话者任意刷取
  if (refresh && !hasValidSession(req)) {
    sendJson(res, 401, { ok: false, error: 'unauthorized' })
    return
  }
  // 下发 HttpOnly Cookie 与短期 Token 的 JSON 体
  const cookie = buildSessionCookie()
  const token = cookie.match(/prompt_session=([^;]+)/)?.[1] || ''
  const secure = process.env.NODE_ENV === 'production'
  res.writeHead(200, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Set-Cookie': cookie,
    ...(secure ? {} : {}),
  })
  res.end(JSON.stringify({ ok: true, token, expiresIn: 30 * 60 }))
}

/**
 * 处理上游代理请求
 *
 * @param {import('node:http').IncomingMessage} req - 客户端请求对象
 * @param {import('node:http').ServerResponse} res - 服务端响应对象
 * @returns {void}
 */
async function handleProxy(req, res) {
  // 1. 必须持有有效会话，防止未授权者滥用代理出口
  if (!hasValidSession(req)) {
    sendJson(res, 401, { ok: false, error: 'session_expired', message: '会话无效或已过期，请刷新会话后重试' })
    return
  }
  // 2. 后端必须已配置上游密钥，否则拒绝转发
  if (!isUpstreamReady()) {
    sendJson(res, 503, { ok: false, error: 'upstream_not_configured', message: '服务端尚未配置上游 API Key' })
    return
  }

  // 3. 只允许 POST 且命中白名单路径
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

  try {
    const upstreamRes = await proxyToUpstream({
      method: req.method,
      upstreamPath,
      clientHeaders: req.headers,
      requestBody: req,
    })
    // 透传上游响应状态与可转发的响应头（SSE 流式 / JSON 均可）
    const forwardable = ['content-type', 'content-length', 'transfer-encoding', 'connection', 'cache-control', 'date']
    const headers = {}
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
  }
}

const server = http.createServer((req, res) => {
  const { method, url } = req
  const pathname = url.split('?')[0]

  // 健康检查
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
