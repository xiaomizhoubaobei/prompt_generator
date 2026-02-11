/**
 * @fileoverview Slider 组件 - 基于 Radix UI 实现的滑块控件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了一种可视化的滑块控件，用于在指定范围内选择数值。
 * 支持的特性：
 * - 基于 Radix UI 的无障碍实现
 * - 完整的键盘导航支持
 * - 自定义样式和主题
 * - 过渡动画效果
 * - 支持触摸操作
 * - 显示当前选中值
 * 使用方式：
 * ```tsx
 * <Slider value={[value]} onValueChange={setValue} />
 * ```
 */

'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

import { cn } from "../../utils"

/**
 * Slider 滑块组件
 * 提供一个可视化的滑块控件，用于在指定范围内选择数值
 *
 * @param className - 自定义类名，用于扩展样式
 * @param props - Radix UI Slider.Root 组件的所有其他属性
 * @param ref - 转发到内部 Slider.Root 元素的引用
 * @returns 返回一个 Slider 组件
 */
const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <SliderPrimitive.Root
      ref={ref}
      className={cn(
        'relative flex w-full touch-none select-none items-center',
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
        <SliderPrimitive.Range className="absolute h-full bg-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="relative cursor-pointer block h-4 w-4 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50">
        <div className='absolute -top-6'>{props?.value?.[0]}</div>
      </SliderPrimitive.Thumb>
    </SliderPrimitive.Root>
  )
})

export { Slider }
