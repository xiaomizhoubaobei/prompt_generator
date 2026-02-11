/**
 * @fileoverview RadioGroup 组件 - 基于 Radix UI 实现的单选按钮组控件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了一组单选按钮，用于在多个选项中选择一个。
 * 支持的特性：
 * - 基于 Radix UI 的无障碍实现
 * - 完整的键盘导航支持
 * - 自定义样式和主题
 * - 过渡动画效果
 * - 禁用状态支持
 * 使用方式：
 * ```tsx
 * <RadioGroup value={value} onValueChange={setValue}>
 *   <RadioGroupItem value="option1">选项1</RadioGroupItem>
 *   <RadioGroupItem value="option2">选项2</RadioGroupItem>
 * </RadioGroup>
 * ```
 */

"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle } from "lucide-react"

import { cn } from "../../utils"

/**
 * RadioGroup 单选按钮组组件
 * 提供一组单选按钮，用于在多个选项中选择一个
 *
 * @param className - 自定义类名，用于扩展样式
 * @param props - Radix UI RadioGroup.Root 组件的所有其他属性
 * @param ref - 转发到内部 RadioGroup.Root 元素的引用
 * @returns 返回一个 RadioGroup 组件
 */
const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
    />
  )
})
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName

/**
 * RadioGroupItem 单选按钮项组件
 * 单选按钮组中的单个选项
 *
 * @param className - 自定义类名，用于扩展样式
 * @param props - Radix UI RadioGroup.Item 组件的所有其他属性
 * @param ref - 转发到内部 RadioGroup.Item 元素的引用
 * @returns 返回一个 RadioGroupItem 组件
 */
const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
})
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName

export { RadioGroup, RadioGroupItem }
