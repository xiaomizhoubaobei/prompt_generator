/**
 * @fileoverview 安全错误消息渲染组件 - 对含受限 HTML 的错误文本做白名单化解析后渲染
 * @author 祁筱欣
 * @date 2026-09-08
 * @since 2026-09-08
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE MPL-2.0 license
 * @remark
 * 该组件收敛前端唯一的 dangerouslySetInnerHTML 使用点（错误横幅）：
 * 历史实现把 ResponseHandler 等生成的含 <a> 标签的字符串用 dangerouslySetInnerHTML
 * 直接注入，虽错误码来源受限，仍不符合「所有用户/外部输入做上下文编码」的 XSS
 * 防御要求（P1 加固）。
 *
 * 本组件改用 DOMParser 将字符串解析为文档后，仅放行白名单内的标签（a / br），
 * 其余标签一律降级为文本节点；href 仅允许相对路径或 http(s) 绝对地址，杜绝
 * javascript: 等危险 scheme。最终以受控的 React 节点渲染，任何 <script>、事件
 * 处理器、CSS 表达式都不会被带出，实现上下文输出编码。
 */

import React, { useMemo } from 'react'

/**
 * 判断 href 是否安全：仅允许相对路径（/auth 等站内跳转）或 http/https 绝对地址
 *
 * @param {string} href - 待校验的链接地址
 * @returns {boolean} 安全返回 true
 */
function isSafeHref(href: string): boolean {
  const trimmed = (href || '').trim()
  if (!trimmed) return false
  // 相对路径（如 /auth）允许
  if (trimmed.startsWith('/')) return true
  try {
    const protocol = new URL(trimmed, window.location.href).protocol
    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 将一段含受限 HTML 的字符串安全转换为 React 节点数组
 * 仅放行 a（安全 href 时）与 br，其余标签递归取其子文本。
 *
 * @param {string} html - 原始 HTML 字符串
 * @param {number} key - 根节点 key（避免复用冲突）
 * @returns {React.ReactNode[]} 白名单过滤后的安全节点
 */
function parseToSafeNodes(html: string): React.ReactNode[] {
  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    // SSR / 非浏览器环境兜底：剥离标签后按纯文本处理
    return [html]
  }
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const root = doc.body
  const nodes: React.ReactNode[] = []
  let cursor = 0

  const walk = (parent: HTMLElement | ChildNode): void => {
    parent.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        nodes.push(child.textContent ?? '')
        return
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return
      const el = child as Element
      const tag = el.tagName.toLowerCase()
      // 放行 <a>，但仅当 href 安全（相对或 http/https）时渲染为链接
      if (tag === 'a') {
        const href = el.getAttribute('href') || ''
        if (isSafeHref(href)) {
          const text = el.textContent || ''
          nodes.push(
            React.createElement(
              'a',
              {
                key: `a${cursor++}`,
                href,
                target: el.getAttribute('target') === '_blank' ? '_blank' : undefined,
                rel: el.getAttribute('target') === '_blank' ? 'noopener noreferrer' : undefined,
                style: { color: '#0070f0', textDecoration: 'underline' },
              },
              text
            )
          )
          return
        }
        // href 不安全：仅输出其纯文本，不渲染链接
        nodes.push(el.textContent || '')
        return
      }
      // 放行 <br> 作为换行
      if (tag === 'br') {
        nodes.push(React.createElement('br', { key: `br${cursor++}` }))
        return
      }
      // 其余标签（span/b/em 等）仅保留其文本内容，杜绝事件处理器 / 样式 / 脚本被带出
      if (el.childNodes.length > 0) {
        walk(el)
      } else {
        nodes.push(el.textContent || '')
      }
    })
  }
  walk(root)
  return nodes
}

/**
 * 安全错误渲染组件
 * 接收可能含受限 <a>/<br> 的错误消息字符串，白名单过滤后以 React 节点输出，
 * 替代有 XSS 面危险的 dangerouslySetInnerHTML。
 *
 * @param {Object} props - 组件属性
 * @param {string} props.html - 错误消息 HTML 字符串（可为纯文本）
 * @returns {React.JSX.Element} 安全渲染的错误内容
 */
export default function ErrorRenderer({ html }: { html: string }): React.JSX.Element {
  const nodes = useMemo(() => parseToSafeNodes(html), [html])
  return <>{nodes}</>
}
