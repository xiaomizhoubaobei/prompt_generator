/**
 * @fileoverview 上游 AI 网关配置模块 - 仅在服务端持有并注入真实 API Key
 * @author 祁筱欣
 * @date 2026-09-08
 * @since 2026-09-08
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE MPL-2.0 license
 * @remark
 * 本模块集中管理对上游 AI 网关（如 api.302.ai）的基础地址与鉴权密钥。
 * 安全边界：
 * - UPSTREAM_API_KEY 仅从【服务端环境变量】读取（如 .env 由后端进程加载），
 *   绝不通过 VITE_* 注入前端 bundle，也不落入任何源码常量；
 * - 服务端所有代理出站请求统一由此注入 Authorization 头，浏览器始终零 Key；
 * - 若部署方未配置密钥，服务端应明确报错提示，而不是放行无鉴权出站。
 */

/**
 * 校验给定 URL 是否为合法的 http/https 上游地址，防 SSRF/任意协议注入
 *
 * @param {string} raw - 待校验的 base URL
 * @returns {boolean} 合法返回 true
 */
function isAllowedUpstreamUrl(raw) {
  let u
  try {
    u = new URL(raw)
  } catch {
    return false
  }
  // 生产上游一律要求 HTTPS，避免服务端持有的 API Key 经明文链路外发
  if (u.protocol === 'https:') return true
  // http 明文仅限「显式开启的开发模式」且目标是回环/本机地址：
  // 须设置 ALLOW_HTTP_UPSTREAM=1 才放行 localhost/127.0.0.1/[::1]，
  // 其余 http 目标 fail-closed，杜绝凭据明文传输。
  if (u.protocol === 'http:') {
    if (process.env.ALLOW_HTTP_UPSTREAM !== '1') return false
    const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, '')
    return host === 'localhost' || host === '127.0.0.1' || host === '::1'
  }
  return false
}

/**
 * 读取上游网关基础地址
 * 支持从服务端环境变量 UPSTREAM_API_URL 覆盖，默认 api.302.ai。
 *
 * @returns {string} 上游 base URL（不含末尾斜杠）
 */
export function getUpstreamBaseUrl() {
  const raw = process.env.UPSTREAM_API_URL || 'https://api.302.ai'
  // 过滤危险 scheme，确保出站目标永远合法
  const base = isAllowedUpstreamUrl(raw) ? raw.replace(/\/+$/, '') : 'https://api.302.ai'
  return base
}

/**
 * 读取上游网关 API Key（仅服务端持有）
 *
 * @returns {string} 已配置的 API Key；未配置则返回空字符串
 */
export function getUpstreamApiKey() {
  return (process.env.UPSTREAM_API_KEY || '').trim()
}

/**
 * 是否已就绪（配置了上游密钥）。未配置时前端代理请求应被拒绝而非盲目转发。
 *
 * @returns {boolean} 配置就绪返回 true
 */
export function isUpstreamReady() {
  return getUpstreamApiKey().length > 0
}
