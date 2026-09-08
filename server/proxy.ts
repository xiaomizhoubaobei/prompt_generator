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
 *
 * 由 JS 重构为 TypeScript：出站请求头/配置/回调均补充显式类型，透传头名表改为
 * 只读字符串数组，全程 erasable-only 语法支持 Node 原生 type-stripping 直接运行。
 */

import http from 'node:http'
import https from 'node:https'
import type { IncomingHttpHeaders, IncomingMessage, ClientRequest } from 'node:http'
import type { Readable } from 'node:stream'
import { getUpstreamBaseUrl, getUpstreamApiKey } from './upstream.ts'

// 允许代理到上游的功能前缀（对应前端实际业务路径）
const ALLOWED_PATH_PREFIXES: readonly string[] = [
  '/v1/chat/completions',
  '/302/submit/flux-dev',
]

/**
 * 判断给定请求路径是否命中允许透传的上游功能前缀
 *
 * @param {string} path - 去掉 /api/proxy 前缀后的目标路径
 * @returns {boolean} 命中返回 true
 */
export function isAllowedPath(path: string): boolean {
  return ALLOWED_PATH_PREFIXES.some((prefix: string): boolean =>
    path === prefix || path.startsWith(prefix + '?')
  )
}

/**
 * 在映射中删除指定请求头（大小写不敏感），避免前端伪造敏感头
 *
 * @param {Record<string, string|string[]|undefined>} headers - 请求头对象
 * @param {string} headerName - 要移除的请求头名
 * @returns {void}
 */
function stripHeader(
  headers: Record<string, string | string[] | undefined>,
  headerName: string
): void {
  // Node http 在写入前会把请求头键统一转为小写，故按下键删除即可命中任意大小写
  delete headers[headerName]
}

/**
 * 代理请求入参
 */
export interface ProxyRequestOptions {
  /** HTTP 方法（GET/POST 等，大写） */
  method: string
  /** 上游目标路径（含查询串） */
  upstreamPath: string
  /** 原始客户端请求头（将被清洗） */
  clientHeaders: IncomingHttpHeaders
  /** 客户端请求体流（POST 时透传） */
  requestBody: Readable | undefined
}

/**
 * 代理单个出站请求到上游（流式透传）
 *
 * @param {ProxyRequestOptions} options - 代理出站请求参数
 * @returns {Promise<IncomingMessage>} 上游 http/https 的响应对象，便于调用方写回响应
 * @throws {Error} 上游请求在发出前发生网络层错误时抛出
 */
export function proxyToUpstream({
  method,
  upstreamPath,
  clientHeaders,
  requestBody,
}: ProxyRequestOptions): Promise<IncomingMessage> {
  const upstreamBase: string = getUpstreamBaseUrl()
  const apiKey: string = getUpstreamApiKey()
  const upstreamUrl: URL = new URL(upstreamBase + upstreamPath)

  // 构造出站请求头：剥离前端可能注入的鉴权/来源等敏感头，统一以服务端密钥为准
  const headers: Record<string, string | string[] | undefined> = { ...clientHeaders }
  stripHeader(headers, 'authorization')
  stripHeader(headers, 'cookie')
  stripHeader(headers, 'host')
  // 注入服务端持有的真实上游密钥
  headers['authorization'] = `Bearer ${apiKey}`

  const isHttps: boolean = upstreamUrl.protocol === 'https:'
  const client: typeof http | typeof https = isHttps ? https : http

  return new Promise<IncomingMessage>((resolve, reject): void => {
    const upstreamReq: ClientRequest = client.request(
      {
        method,
        hostname: upstreamUrl.hostname,
        port: upstreamUrl.port || (isHttps ? 443 : 80),
        path: upstreamUrl.pathname + upstreamUrl.search,
        headers,
      },
      (upstreamRes: IncomingMessage): void => resolve(upstreamRes)
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
