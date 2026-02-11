/**
 * @fileoverview Textarea UI 组件，基于 Radix UI 的多行文本输入框
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark 本模块提供了可复用的多行文本输入框组件，特性包括：
 *          - 支持 React ref 转发
 *          - 继承所有原生 textarea HTML 属性
 *          - 内置 Tailwind CSS 样式类
 *          - 支持自定义 className
 *          - 提供完整的焦点和禁用状态样式
 *          - 固定最小高度，禁止调整大小
 *
 *          样式特性：
 *          - 圆角边框（rounded-md）
 *          - 聚焦时显示外环（focus-visible:ring-1）
 *          - 禁用时降低透明度（disabled:opacity-50）
 *          - 禁用时显示禁止光标（disabled:cursor-not-allowed）
 *
 *          使用方式：
 *          - 导入 Textarea 组件
 *          - 使用 ref 引用 DOM 元素
 *          - 传入 className 自定义样式
 *          - 传入原生 textarea 属性（placeholder、value、onChange 等）
 */
import * as React from "react"

import { cn } from "../../utils"

/** Textarea 组件属性接口，继承原生 textarea 所有属性 */
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

/**
 * Textarea 多行文本输入框组件
 * 提供样式化的多行文本输入功能，支持 ref 转发和自定义样式
 *
 * @param className - 自定义 CSS 类名
 * @param props - 原生 textarea 属性
 * @param ref - textarea 元素的 ref
 * @returns {React.ReactElement} 返回 textarea 元素
 */
const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
/** 设置组件显示名称，便于调试 */
Textarea.displayName = "Textarea"

/** 导出 Textarea 组件 */
export { Textarea }
