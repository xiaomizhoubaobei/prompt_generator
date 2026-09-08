/**
 * @fileoverview API Key 运行时内存存储模块 - 提供会话内 API Key 的读写能力
 * @author 祁筱欣
 * @date 2026-09-08
 * @since 2026-09-08
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE MPL-2.0 license
 * @remark
 * 本模块用于在纯前端架构下安全地承载用户填写的第三方 API Key。
 *
 * 背景：前端为无后端 SPA，调用外部 AI 网关（如 api.302.ai）时必须在浏览器内
 * 持有 API Key 以构造 Bearer 请求头。此前实现将该 Key 用「硬编码密钥」AES-GCM
 * 加密后写入 localStorage——密钥随 bundle 分发，任何拿到构建产物的人都能离线
 * 解密，实质等同明文落盘（CodeQL: js/clear-text-storage-of-sensitive-data）。
 *
 * 修复策略（贴合安全审计要求且不引入后端依赖）：
 * - API Key 仅在【本次运行期】保存于模块级内存变量，绝不写入 localStorage/
 *   sessionStorage 等可持久化、可被 XSS/同机窃取的目标；
 * - 页面刷新后内存清空，自动回退到构建期环境变量 VITE_APP_API_KEY（由部署者
 *   在其自有环境注入，不随源码泄露）；
 * - 保留既有的 apiUrl / modelName 等非敏感配置持久化能力。
 *
 * 对外接口：
 * - getApiKey(): 读取当前内存中的 API Key，内存为空时回退环境变量
 * - setApiKey(key): 将 API Key 写入内存
 * - clearApiKey(): 清空内存中的 API Key
 */

// 会话期内存中的 API Key（仅存于 JS 堆内存，页面刷新即清空）
let apiKey: string = ''

/**
 * 读取当前 API Key
 * 优先返回本次运行期用户通过设置写入的 Key，内存为空时回退到构建期环境变量。
 *
 * @returns {string} 当前可用的 API Key（可能为空字符串）
 */
export function getApiKey(): string {
  return apiKey || import.meta.env.VITE_APP_API_KEY || ''
}

/**
 * 写入 API Key 到内存
 * 仅保存在模块级内存变量中，不会持久化到 localStorage / sessionStorage。
 *
 * @param {string} key - 用户填写的第三方 API Key
 * @returns {void}
 */
export function setApiKey(key: string): void {
  apiKey = key.trim()
}

/**
 * 清空内存中的 API Key
 *
 * @returns {void}
 */
export function clearApiKey(): void {
  apiKey = ''
}
