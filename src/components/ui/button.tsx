/**
 * @fileoverview Button 组件 - 基于 Radix UI 实现的按钮控件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了多种样式的按钮控件，支持不同的变体和尺寸。
 * 支持的特性：
 * - 基于 Radix UI 的无障碍实现
 * - 完整的键盘导航支持
 * - 多种变体样式：default、destructive、outline、secondary、ghost、link
 * - 多种尺寸：default、sm、lg、icon
 * - 自定义样式和主题
 * - 过渡动画效果
 * - 禁用状态支持
 * - 支持作为子组件渲染（asChild）
 * 使用方式：
 * ```tsx
 * <Button variant="default" size="default">默认按钮</Button>
 * <Button variant="destructive">危险按钮</Button>
 * <Button variant="outline">边框按钮</Button>
 * <Button variant="ghost">幽灵按钮</Button>
 * <Button variant="link">链接按钮</Button>
 * <Button variant="outline" asChild><a href="#">链接</a></Button>
 * ```
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline:
          "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * ButtonProps 按钮属性接口
 * 扩展原生 HTML button 元素的所有属性以及按钮变体属性
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

/**
 * Button 按钮组件
 * 提供多种样式的按钮控件，支持不同的变体和尺寸
 *
 * @param className - 自定义类名，用于扩展样式
 * @param variant - 按钮变体：default、destructive、outline、secondary、ghost、link
 * @param size - 按钮尺寸：default、sm、lg、icon
 * @param asChild - 是否将按钮的样式应用于子元素，默认为 false
 * @param props - 所有其他原生 HTML button 属性
 * @param ref - 转发到内部 button 元素的引用
 * @returns 返回一个 Button 组件
 */
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      ></Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
