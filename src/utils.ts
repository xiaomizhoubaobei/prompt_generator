/**
 * @fileoverview 应用程序通用工具函数模块
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark 本模块提供了应用程序中常用的工具函数，包括 CSS 类名合并、代码块提取、HTTP 请求封装和错误消息处理。
 *          该模块实现了以下功能：
 *          - cn(): 使用 clsx 和 tailwind-merge 智能合并 CSS 类名，处理 Tailwind CSS 的类名冲突
 *          - extractCodeBlocksContent(): 从 Markdown 格式的文本中提取代码块内容
 *          - fetchApi(): 基于 ky 库封装的 HTTP 请求函数，支持 GET 和 POST 方法
 *          - errMessage(): 根据错误码和语言环境返回对应的错误消息（支持中文、英文、日文）
 *
 *          使用方式：
 *          - import { cn, extractCodeBlocksContent, fetchApi, errMessage } from '@/utils'
 *          - cn('px-4', 'py-2', { 'bg-blue-500': isActive })
 *          - const codes = extractCodeBlocksContent(markdownText)
 *          - const response = await fetchApi(url, 'post', data, headers)
 *          - const errorHtml = errMessage(-10001, 'chinese')
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import ky from 'ky'
import { responseHandler, Language } from "./lib/ResponseHandler";

/**
 * 智能合并 CSS 类名
 * 使用 clsx 和 tailwind-merge 组合，处理 Tailwind CSS 的类名冲突
 * 
 * @param inputs - CSS 类名，可以是字符串、对象、数组等任意格式
 * @returns 合并后的 CSS 类名字符串
 * 
 * @example
 * cn('px-4', 'py-2', { 'bg-blue-500': isActive }) // 'px-4 py-2 bg-blue-500'
 * cn(['text-sm', 'font-bold']) // 'text-sm font-bold'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 从 Markdown 格式的文本中提取代码块内容
 * 支持带语言标记和不带语言标记的代码块，使用正则表达式匹配
 * 
 * @param markdown - Markdown 格式的文本字符串
 * @returns 提取的代码块内容数组
 * 
 * @example
 * extractCodeBlocksContent('```js\nconsole.log("hello")\n```') // ['console.log("hello")']
 */
export function extractCodeBlocksContent(markdown: string) {
  const codeBlocksRegex =
    /(?:```([a-zA-Z0-9]+)?\s*([\s\S]*?)\s*```|```([a-zA-Z0-9]+)?\s*([\s\S]+?)\s*```)(?![^`]*```)|```([a-zA-Z0-9]+)?\s*([\s\S]+)/gm;
  let match;
  const codeBlocksContent = [];
  while ((match = codeBlocksRegex.exec(markdown))) {
    // Select the first non empty capture group
    const codeBlockContent =
      match[6] || match[5] || match[4] || match[3] || match[2] || match[1];
    if (codeBlockContent) {
      codeBlocksContent.push(codeBlockContent);
    }
  }
  return codeBlocksContent;
}


/**
 * 基于 ky 库封装的 HTTP 请求函数
 * 支持 GET 和 POST 方法，自动处理请求头和超时设置
 * 
 * @param url - 请求的 URL 地址
 * @param method - HTTP 请求方法，支持 'post' 或 'get'
 * @param body - 请求体数据，仅在 POST 请求时使用
 * @param headersOpts - 自定义请求头选项
 * @returns ky 的 Response 对象
 * 
 * @example
 * const response = await fetchApi('https://api.example.com/data', 'get')
 * const response = await fetchApi('https://api.example.com/submit', 'post', { name: 'test' }, { 'Authorization': 'Bearer token' })
 */
export async function fetchApi(
  url: string,
  method: "post" | "get",
  body: any = undefined,
  headersOpts: any = undefined,
) {
  const defaultHeaders = {
    accept: "application/json",
    "Content-Type": "application/json",
  };
  const headers = headersOpts ? { ...defaultHeaders, ...headersOpts } : defaultHeaders;

  return ky(url, {
    method,
    headers,
    body: method === "post" ? JSON.stringify(body) : undefined,
    timeout: false
  });
}

/**
 * 获取 API 配置（API Key、API URL 和模型名称）
 * 优先使用用户设置，如果没有则使用环境变量
 *
 * @returns 包含 apiKey、apiUrl 和 modelName 的对象
 */
export function getApiConfig() {
  let apiKey = import.meta.env.VITE_APP_API_KEY || ''
  let apiUrl = import.meta.env.VITE_APP_API_URL || 'https://api.302.ai'
  let modelName = import.meta.env.VITE_APP_MODEL_NAME || 'gpt-4o-2024-08-06'

  try {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      if (parsed.apiKey) apiKey = parsed.apiKey
      if (parsed.apiUrl) apiUrl = parsed.apiUrl
      if (parsed.modelName) modelName = parsed.modelName
    }
  } catch (e) {
    console.error('Failed to parse settings:', e)
  }

  return { apiKey, apiUrl, modelName }
}

/**
 * 根据错误码和语言环境返回对应的错误消息
 * 支持中文、英文、日文三种语言，返回包含 HTML 格式的错误信息
 * 
 * @param message - 错误消息，可以是错误码（数字）或自定义消息（字符串）
 * @param language - 语言环境，支持 'chinese' | 'english' | 'japanese'
 * @returns HTML 格式的错误消息字符串
 * 
 * @example
 * errMessage(-10001, 'chinese') // "账户凭证丢失，请 <a href='/auth'>重新登录</a>"
 * errMessage('Custom error', 'english') // "Custom error"
 */
/**
 * 根据错误码或错误对象返回对应的错误消息（同步版本，仅支持传入错误码）
 * @param message - 错误码（数字）或自定义消息（字符串）
 * @param language - 语言环境
 * @returns 错误消息字符串
 *
 * @deprecated 推荐使用 responseHandler.getErrorMessage() 处理完整的错误对象
 *
 * @example
 * errMessage(-10001, 'chinese') // "账户凭证丢失，请 <a href='/auth'>重新登录</a>"
 * errMessage(429, 'english') // "Too many requests, please try again later"
 * errMessage('Custom error', 'japanese') // "Custom error"
 */
export function errMessage(
  message: string | number,
  language: Language,
): string {
  if (typeof message === "number") {
    if (message < 0) {
      return responseHandler.getBusinessErrorMessage(message, language);
    }
    return responseHandler.getHttpStatusMessage(message, language);
  }
  return message;
}