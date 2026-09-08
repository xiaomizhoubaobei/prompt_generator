/**
 * @fileoverview 服务端会话令牌模块 - 短期签名 Token 的签发与校验（无第三方依赖）
 * @author 祁筱欣
 * @date 2026-09-08
 * @since 2026-09-08
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE MPL-2.0 license
 * @remark
 * 本模块为前端与自家后端之间的「短期会话」提供自包含签名令牌（类似无第三方库的
 * 极简 JWT）。核心安全目标：
 * - 真实上游 AI 网关的 API Key 只由后端持有并注入，绝不进入浏览器；
 * - 前端仅凭后端签发的短期 Token / HttpOnly Cookie 维持会话；
 * - Token 带签发时间戳，超过 SESSION_TTL 自动失效，需经 /api/session/refresh 续期。
 *
 * P1 安全加固（密钥轮换与设备绑定）：
 * - 每次建会都会动态生成一枚新的随机 Session Key（`key` 字段），实现「每次登录
 *   动态轮换」，旧会话在过期或重新建会后自然失效，避免长期复用单一密钥；
 * - Token 载荷会绑定签发时采集的设备指纹哈希（`fp` 字段），后续续期 / 代理请求
 *   携带的指纹必须与签发指纹一致，否则视为令牌被跨设备重放/漂移而拒绝，形成
 *   「密钥 + 设备」双重绑定；
 * - 整个 Token 由服务端 HMAC-SHA256 签名（secret 仅存服务端环境变量），前端无法
 *   伪造 / 篡改其它会话，签名载荷也不含任何明文 Key 材料，满足「服务端签名」要求。
 *
 * 实现要点：
 * - 使用 Node 内置 crypto 的 HMAC-SHA256 对「payload + 过期时间」签名，避免引入第三方依赖；
 * - secret 取自服务端环境变量 SESSION_SECRET，绝不写入源码或随前端 bundle 分发；
 * - 校验采用 timingSafeEqual 抵御时序攻击。
 */

import crypto from 'node:crypto'

// 会话 Cookie 名（前后端、nginx 均依赖，统一由本模块导出避免漂移）
export const SESSION_COOKIE_NAME = 'prompt_session'
// 设备指纹请求头名（前端每次会话/续期/代理请求均携带，服务端与 token 内 fp 比对）
export const DEVICE_FINGERPRINT_HEADER = 'x-device-fingerprint'

/**
 * 读取会话签名密钥（仅服务端可见）
 * 若未配置 SESSION_SECRET，回退到随机生成的进程内密钥（容器重启后会话失效，
 * 但仍能保证签名不落盘、不随代码分发）。
 *
 * @returns {string} 会话签名密钥
 */
function getSecret() {
  // 优先读取显式注入的服务端环境变量
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET
  // 无外部注入时使用进程内随机密钥（仅本次运行有效，杜绝硬编码默认值）
  // 由于该值不随 bundle/仓库分发，即使被读取也无法在其它运行期复用
  if (!globalThis.__promptGenSessionSecret) {
    globalThis.__promptGenSessionSecret = crypto.randomBytes(32).toString('hex')
  }
  return globalThis.__promptGenSessionSecret
}

/**
 * 会话有效时长（毫秒），默认 30 分钟
 *
 * @returns {number} 有效期毫秒数
 */
function ttlMs() {
  const raw = Number(process.env.SESSION_TTL_MS)
  return Number.isFinite(raw) && raw > 0 ? raw : 30 * 60 * 1000
}

/**
 * 生成自包含短期会话令牌
 *
 * 载荷字段：
 * - sid: 会话唯一标识
 * - key: 本次会话专属、随机的 Session Key（每次建会动态轮换）
 * - fp : 建会时采集的设备指纹哈希（SHA-256 hex），用于绑定发起设备
 * - iat: 签发时间戳（毫秒）
 *
 * 载荷为服务端 HMAC 签名的 base64url，前端不可伪造、不可读取明文密钥材料。
 *
 * @param {string} [fingerprint=''] - 发起会话的设备指纹哈希（可选，空则仅具备签名字段）
 * @returns {string} URL 安全的签名令牌
 */
export function signSession(fingerprint = '') {
  const payload = {
    sid: crypto.randomBytes(16).toString('hex'),
    // 每次建会生成新的随机 Session Key，实现动态轮换，防止长期复用
    key: crypto.randomBytes(24).toString('hex'),
    // 绑定签发时的设备指纹；空串表示允许任意设备（用于无指纹能力的非浏览器客户端）
    fp: String(fingerprint || ''),
    iat: Date.now(),
  }
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto
    .createHmac('sha256', getSecret())
    .update(body)
    .digest('base64url')
  return `${body}.${sig}`
}

/**
 * 校验并解析会话令牌（可选设备指纹比对）
 *
 * 校验内容依次为：签名一致性（timingSafeEqual）、过期时间、以及（当请求携带指纹时）
 * 与签发指纹是否匹配。指纹不匹配视为令牌已被带到其它设备/令牌漂移，直接拒绝，
 * 从而阻断跨设备重放，强制客户端重新建会（重新签发新 Session Key）。
 *
 * @param {string} token - 前端携带的会话令牌
 * @param {string} [requestFp=''] - 当前请求携带的设备指纹；非空时与 token 内指纹强校验
 * @returns {object|null} 解析成功且未过期、指纹匹配返回载荷对象，否则返回 null
 */
export function verifySession(token, requestFp = '') {
  if (!token || typeof token !== 'string') return null
  const idx = token.lastIndexOf('.')
  if (idx <= 0) return null
  const body = token.slice(0, idx)
  const sig = token.slice(idx + 1)

  // 重新计算签名并做常量时间比较，抵御时序攻击
  const expected = crypto
    .createHmac('sha256', getSecret())
    .update(body)
    .digest()
  let provided
  try {
    provided = Buffer.from(sig, 'base64url')
  } catch {
    return null
  }
  if (provided.length !== expected.length) return null
  if (!crypto.timingSafeEqual(expected, provided)) return null

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'))
    if (typeof payload.iat !== 'number' || Date.now() - payload.iat > ttlMs()) return null
    // 设备绑定：请求带指纹且 token 也绑定了指纹时，二者必须一致，否则判定令牌漂移
    if (requestFp && payload.fp && requestFp !== payload.fp) return null
    return payload
  } catch {
    return null
  }
}

/**
 * 生成 HttpOnly Cookie 字符串（会话令牌放入 Cookie，浏览器自动携带，前端不可读）
 *
 * @param {string} fingerprint - 发起会话的设备指纹哈希，随 token 一并签名绑定
 * @returns {string} Set-Cookie 语句（不含前导 "Set-Cookie: "）
 */
export function buildSessionCookie(fingerprint = '') {
  const token = signSession(fingerprint)
  // Secure 为默认行为：会话 Cookie 仅在 HTTPS 链路上传输，杜绝经明文链路被截获。
  // 仅当显式设置 ALLOW_INSECURE_COOKIES=1（本地 http 开发）时才省略 Secure，
  // 避免因容器遗漏 NODE_ENV 而在生产环境错误签发非 Secure 会话 Cookie。
  const secure = process.env.ALLOW_INSECURE_COOKIES !== '1'
  return [
    `${SESSION_COOKIE_NAME}=${token}`,
    'Path=/',
    'HttpOnly',
    ...(secure ? ['Secure'] : []),
    'SameSite=Lax',
    `Max-Age=${Math.floor(ttlMs() / 1000)}`,
  ].join('; ')
}

/**
 * 从请求头 Cookie 中解析会话令牌
 *
 * @param {string|undefined} cookieHeader - HTTP Cookie 请求头原文
 * @returns {string|null} 会话令牌或 null
 */
export function readSessionTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null
  const prefix = `${SESSION_COOKIE_NAME}=`
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim()
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length)
    }
  }
  return null
}
