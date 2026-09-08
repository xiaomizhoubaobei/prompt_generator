/**
 * @fileoverview 上游请求代理模块 - 服务端转发前端请求并注入真实密钥
 * @author 祁筱欣
 * @date 2026-09-08
 * @since 2026-09-08
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE MPL-2.0 license
 * @remark
 * 前端不再直连外部 AI 网关，改为调用同源 /api/proxy/*，由本模块把剩余路径透传给
 * 上游并注入 Authorization: Bearer <UPSTREAM_API_KEY>。支持 SSE 流式响应透传。
 *
 * 安全说明：
 * - 真实密钥仅在此处注入，绝不出现在响应体/前端；
 * - 仅允许代理白名单前缀路径，避免被当作任意 URL 跳板；
 * - 会剥离前端可能伪造的 Authorization 等敏感请求头，统一以服务端密钥为准。
 */

import http from 'node:http'
import https from 'node:https'
import { getUpstreamBaseUrl, getUpstreamApiKey } from './upstream.js'

// 允许代理到上游的功能前缀（对应前端实际业务路径）
const ALLOWED_PATH_PREFIXES = [
  '/v1/chat/completions',
  '/302/submit/flux-dev',
]

/**
 * 判断给定请求路径是否命中允许透传的上游功能前缀
 *
 * @param {string} path - 去掉 /api/proxy 前缀后的目标路径
 * @returns {boolean} 命中返回 true
 */
export function isAllowedPath(path) {
  return ALLOWED_PATH_PREFIXES.some((prefix) => path === prefix || path.startsWith(prefix + '?'))
}

/**
 * 在映射中删除指定请求头（大小写不敏感），避免前端伪造敏感头
 *
 * @param {Object} headers - 请求头对象（小写键）
 * @param {string} headerName - 要移除的请求头名
 * @returns {void}
 */
function stripHeader(headers, headerName) {
  delete headers[headerName]
}

/**
 * 代理单个出站请求到上游（流式透传）
 *
 * @param {string} method - HTTP 方法（GET/POST 等，大写）
 * @param {string} upstreamPath - 上游目标路径（含查询串）
 * @param {Object} clientHeaders - 原始客户端请求头（将被清洗）
 * @param {import('node:stream').Readable} requestBody - 客户端请求体流（POST 时透传）
 * @returns {Promise} 返回上游 http/https 的 ClientRequest，便于调用方写回响应
 */
export function proxyToUpstream({ method, upstreamPath, clientHeaders, requestBody }) {
  const upstreamBase = getUpstreamBaseUrl()
  const apiKey = getUpstreamApiKey()
  const upstreamUrl = new URL(upstreamBase + upstreamPath)

  // 构造出站请求头：剥离前端可能注入的鉴权/来源等敏感头，统一以服务端密钥为准
  const headers = { ...clientHeaders }
  stripHeader(headers, 'authorization')
  stripHeader(headers, 'cookie')
  stripHeader(headers, 'host')
  // 注入服务端持有的真实上游密钥
  headers['authorization'] = `Bearer ${apiKey}`

  const isHttps = upstreamUrl.protocol === 'https:'
  const client = isHttps ? https : http

  return new Promise((resolve, reject) => {
    const upstreamReq = client.request(
      {
        method,
        hostname: upstreamUrl.hostname,
        port: upstreamUrl.port || (isHttps ? 443 : 80),
        path: upstreamUrl.pathname + upstreamUrl.search,
        headers,
      },
      (upstreamRes) => resolve(upstreamRes)
    )
    upstreamReq.on('error', reject)

    // POST 场景把客户端请求体透传给上游；GET 直接结束
    if (requestBody && method === 'POST') {
      requestBody.pipe(upstreamReq)
    } else {
      upstreamReq.end()
    }
  })
}
