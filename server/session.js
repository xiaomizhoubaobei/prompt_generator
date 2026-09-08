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
 * 实现要点：
 * - 使用 Node 内置 crypto 的 HMAC-SHA256 对「payload + 过期时间」签名，避免引入第三方依赖；
 * - secret 取自服务端环境变量 SESSION_SECRET，绝不写入源码或随前端 bundle 分发；
 * - 校验采用 timingSafeEqual 抵御时序攻击。
 */

import crypto from 'node:crypto'

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
 * 载荷仅含会话标识与签发时间，不含任何密钥材料。
 *
 * @returns {string} URL 安全的签名令牌
 */
export function signSession() {
  const payload = {
    sid: crypto.randomBytes(16).toString('hex'),
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
 * 校验并解析会话令牌
 *
 * @param {string} token - 前端携带的会话令牌
 * @returns {object|null} 解析成功且未过期返回 { sid, iat }，否则返回 null
 */
export function verifySession(token) {
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
    return payload
  } catch {
    return null
  }
}

/**
 * 生成 HttpOnly Cookie 字符串（会话令牌放入 Cookie，浏览器自动携带，前端不可读）
 *
 * @returns {string} Set-Cookie 语句（不含前导 "Set-Cookie: "）
 */
export function buildSessionCookie() {
  const token = signSession()
  // Secure 为默认行为：会话 Cookie 仅在 HTTPS 链路上传输，杜绝经明文链路被截获。
  // 仅当显式设置 ALLOW_INSECURE_COOKIES=1（本地 http 开发）时才省略 Secure，
  // 避免因容器遗漏 NODE_ENV 而在生产环境错误签发非 Secure 会话 Cookie。
  const secure = process.env.ALLOW_INSECURE_COOKIES !== '1'
  return [
    `prompt_session=${token}`,
    'Path=/',
    'HttpOnly',
    ...(secure ? ['Secure'] : []),
    'SameSite=Lax',
    `Max-Age=${Math.floor(ttlMs() / 1000)}`,
  ].join('; ')
}

/**
 * 从请求头 Cookie 中解析 prompt_session 令牌
 *
 * @param {string|undefined} cookieHeader - HTTP Cookie 请求头原文
 * @returns {string|null} 会话令牌或 null
 */
export function readSessionTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null
  for (const part of cookieHeader.split(';')) {
    const trimmed = part.trim()
    if (trimmed.startsWith('prompt_session=')) {
      return trimmed.slice('prompt_session='.length)
    }
  }
  return null
}
