/**
 * @fileoverview Popover 组件 - 基于 Radix UI 实现的弹出框控件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了一个浮动的弹出框，用于显示额外的内容或操作选项。
 * 支持的特性：
 * - 基于 Radix UI 的无障碍实现
 * - 完整的键盘导航支持
 * - 自定义样式和主题
 * - 过渡动画效果
 * - 支持多种对齐方式
 * 使用方式：
 * ```tsx
 * <Popover>
 *   <PopoverTrigger>触发按钮</PopoverTrigger>
 *   <PopoverContent>弹出内容</PopoverContent>
 * </Popover>
 * ```
 */

"use client"

import * as React from "react"
import * as PopoverPrimitive from "@radix-ui/react-popover"

import { cn } from "../../utils"

/**
 * Popover 弹出框组件
 * 提供一个浮动的弹出框容器，用于包裹触发器和内容
 */
const Popover = PopoverPrimitive.Root

/**
 * PopoverTrigger 弹出框触发器组件
 * 用于触发弹出框显示的按钮或其他元素
 */
const PopoverTrigger = PopoverPrimitive.Trigger

/**
 * PopoverContent 弹出框内容组件
 * 弹出框的实际内容区域，支持自定义对齐和偏移
 *
 * @param className - 自定义类名，用于扩展样式
 * @param align - 内容对齐方式，默认为 "center"
 * @param sideOffset - 内容与触发器的偏移距离，默认为 4
 * @param props - Radix UI PopoverPrimitive.Content 组件的所有其他属性
 * @param ref - 转发到内部 PopoverPrimitive.Content 元素的引用
 * @returns 返回一个 PopoverContent 组件
 */
const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = PopoverPrimitive.Content.displayName

export { Popover, PopoverTrigger, PopoverContent }
