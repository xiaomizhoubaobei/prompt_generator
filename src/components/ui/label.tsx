/**
 * @fileoverview Label 组件 - 基于 Radix UI 实现的标签控件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了一个标签控件，用于为表单元素或其他 UI 元素提供描述性文本。
 * 支持的特性：
 * - 基于 Radix UI 的无障碍实现
 * - 与表单元素自动关联
 * - 自定义样式和主题
 * - 禁用状态支持
 * 使用方式：
 * ```tsx
 * <Label htmlFor="input-id">输入框标签</Label>
 * <Input id="input-id" />
 * ```
 */

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../utils"

const labelVariants = cva(
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
)

/**
 * Label 标签组件
 * 为表单元素或其他 UI 元素提供描述性文本
 *
 * @param className - 自定义类名，用于扩展样式
 * @param props - Radix UI Label.Root 组件的所有其他属性以及 labelVariants 的变体属性
 * @param ref - 转发到内部 Label.Root 元素的引用
 * @returns 返回一个 Label 组件
 */
const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> &
    VariantProps<typeof labelVariants>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(labelVariants(), className)}
    {...props}
  />
))
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
