/**
 * @fileoverview Input 组件 - 基于原生 HTML input 元素的输入框控件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了一个样式化的输入框控件，用于接收用户输入。
 * 支持的特性：
 * - 支持所有原生 HTML input 属性
 * - 自定义样式和主题
 * - 禁用状态支持
 * - 文件上传样式优化
 * - 焦点状态样式
 * 使用方式：
 * ```tsx
 * <Input type="text" placeholder="请输入内容" />
 * ```
 */

import * as React from "react"

import { cn } from "../../utils"

/**
 * InputProps 输入框属性接口
 * 扩展原生 HTML input 元素的所有属性
 */
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

/**
 * Input 输入框组件
 * 提供一个样式化的输入框控件，用于接收用户输入
 *
 * @param className - 自定义类名，用于扩展样式
 * @param type - 输入框类型，默认为 text
 * @param props - 所有其他原生 HTML input 属性
 * @param ref - 转发到内部 input 元素的引用
 * @returns 返回一个 Input 组件
 */
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border-2 border-input bg-transparent px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
