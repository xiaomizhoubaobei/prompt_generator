/**
 * @fileoverview Switch 组件 - 基于 Radix UI 实现的开关切换控件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了一种可视化的开关切换控件，用于在两种状态之间进行切换。
 * 支持的特性：
 * - 基于 Radix UI 的无障碍实现
 * - 完整的键盘导航支持
 * - 自定义样式和主题
 * - 过渡动画效果
 * - 禁用状态支持
 * 使用方式：
 * ```tsx
 * <Switch checked={isChecked} onCheckedChange={setChecked} />
 * ```
 */

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "../../utils"

/**
 * Switch 开关组件
 * 提供一个可视化的开关切换控件，用于在两种状态之间进行切换
 *
 * @param className - 自定义类名，用于扩展样式
 * @param props - Radix UI Switch.Root 组件的所有其他属性
 * @param ref - 转发到内部 Switch.Root 元素的引用
 * @returns 返回一个 Switch 组件
 */
const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    />
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
