/**
 * @fileoverview Checkbox 组件 - 基于 Radix UI 实现的复选框控件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了一个复选框控件，用于选择或取消选择选项。
 * 支持的特性：
 * - 基于 Radix UI 的无障碍实现
 * - 完整的键盘导航支持
 * - 自定义样式和主题
 * - 过渡动画效果
 * - 禁用状态支持
 * - 支持不确定状态（indeterminate）
 * 使用方式：
 * ```tsx
 * <Checkbox checked={isChecked} onCheckedChange={setChecked} />
 * ```
 */

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "@radix-ui/react-icons"

import { cn } from "../../utils"

/**
 * Checkbox 复选框组件
 * 提供一个复选框控件，用于选择或取消选择选项
 *
 * @param className - 自定义类名，用于扩展样式
 * @param props - Radix UI Checkbox.Root 组件的所有其他属性
 * @param ref - 转发到内部 Checkbox.Root 元素的引用
 * @returns 返回一个 Checkbox 组件
 */
const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
      className
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator
      className={cn("flex items-center justify-center text-current")}
    >
      <CheckIcon className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox }
