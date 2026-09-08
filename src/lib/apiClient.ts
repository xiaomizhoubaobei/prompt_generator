/**
 * @fileoverview 服务端代理客户端 - 前端所有 AI 调用的统一入口（浏览器零 API Key）
 * @author 祁筱欣
 * @date 2026-09-08
 * @since 2026-09-08
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE MPL-2.0 license
 * @remark
 * 安全架构升级后，前端不再持有任何 API Key，也不再直连外部 AI 网关：
 * - 所有上游密钥由后端 BFF 持有并注入（见 server/upstream.js）；
 * - 前端统一请求同源 /api/proxy/*，会话经 HttpOnly Cookie 自动携带；
 * - 本模块在首次调用时向后端建立短期会话，并在遇到 401（会话过期）时自动
 *   续期后重试一次，前端无需感知 Token 细节。
 *
 * 对外接口：
 * - ensureSession(): 建立/续期短期会话（HttpOnly Cookie）
 * - proxyChat(body): 代理文本生成（SSE 流式），返回 Response
 * - proxyImageSubmit(body): 代理图片生成（JSON），返回 Response
 */

import ky from 'ky'

// 会话建立状态的进程内记忆（仅存 JS 堆，不落 localStorage / sessionStorage）
let sessionEstablishedAt = 0
let inflightSession: Promise<void> | null = null

/**
 * 向后端建立/续期短期会话
 * 会话经后端下发的 HttpOnly Cookie 自动携带，浏览器无法用 JS 读取其内容；
 * 该方法为幂等操作，会话在有效期内不会重复请求。
 *
 * @returns {Promise<void>} 会话就绪时解析
 */
export async function ensureSession(): Promise<void> {
  const now = Date.now()
  // 会话有效期约 30 分钟，距上次建立不足 15 分钟直接复用，减少无谓请求
  if (now - sessionEstablishedAt < 15 * 60 * 1000) return
  if (inflightSession) return inflightSession

  inflightSession = (async () => {
    const res = await fetch('/api/session', { method: 'POST', credentials: 'same-origin' })
    if (!res.ok) {
      throw new Error('无法建立安全会话，请确认后端 BFF 服务已就绪')
    }
    sessionEstablishedAt = Date.now()
  })().finally(() => {
    inflightSession = null
  })
  return inflightSession
}

/**
 * 强制刷新会话（供 401 时调用）
 *
 * @returns {Promise<void>} 续期完成时解析
 */
async function forceRefreshSession(): Promise<void> {
  sessionEstablishedAt = 0
  try {
    // 通过 /api/session/refresh 续期（携带既有 HttpOnly Cookie）
    const res = await fetch('/api/session/refresh', { method: 'POST', credentials: 'same-origin' })
    if (!res.ok) {
      // 旧会话已彻底失效时退回重新建立会话
      await ensureSession()
      return
    }
    sessionEstablishedAt = Date.now()
  } catch {
    await ensureSession()
  }
}

/**
 * 代理文本生成请求（OpenAI 兼容 SSE 流式）
 * 将请求体透传给服务端 /api/proxy/v1/chat/completions，由服务端注入真实 Key。
 *
 * @param {Object} body - chat/completions 请求体
 * @returns {Promise<Response>} 服务端（上游）流式响应
 */
export async function proxyChat(body: Record<string, unknown>): Promise<Response> {
  await ensureSession()
  try {
    return await ky('/api/proxy/v1/chat/completions', {
      method: 'POST',
      json: body,
      timeout: false,
      credentials: 'same-origin',
    })
  } catch (error) {
    // 会话过期（401）时续期后重试一次；其它错误原样上抛交由调用方处理
    const status = (error as { response?: { status?: number } }).response?.status
    if (status === 401) {
      await forceRefreshSession()
      return ky('/api/proxy/v1/chat/completions', {
        method: 'POST',
        json: body,
        timeout: false,
        credentials: 'same-origin',
      })
    }
    throw error
  }
}

/**
 * 代理图片生成请求（如 302 flux-dev，返回 JSON）
 * 将原始 body 透传给服务端 /api/proxy/302/submit/flux-dev。
 *
 * @param {string} rawBody - 已序列化的图片生成请求体
 * @returns {Promise<Response>} 服务端（上游）JSON 响应
 */
export async function proxyImageSubmit(rawBody: string): Promise<Response> {
  await ensureSession()
  const headers = { 'Content-Type': 'application/json' }
  try {
    return await ky('/api/proxy/302/submit/flux-dev', {
      method: 'POST',
      body: rawBody,
      headers,
      timeout: 90000,
      credentials: 'same-origin',
    })
  } catch (error) {
    const status = (error as { response?: { status?: number } }).response?.status
    if (status === 401) {
      await forceRefreshSession()
      return ky('/api/proxy/302/submit/flux-dev', {
        method: 'POST',
        body: rawBody,
        headers,
        timeout: 90000,
        credentials: 'same-origin',
      })
    }
    throw error
  }
}
