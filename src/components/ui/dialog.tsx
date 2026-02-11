/**
 * @fileoverview Dialog 组件 - 基于 Radix UI 实现的对话框控件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了一组对话框控件，用于在页面中心显示模态对话框。
 * 支持的特性：
 * - 基于 Radix UI 的无障碍实现
 * - 完整的键盘导航支持
 * - 自定义样式和主题
 * - 过渡动画效果
 * - 支持遮罩层和关闭功能
 * 使用方式：
 * ```tsx
 * <Dialog>
 *   <DialogTrigger>打开对话框</DialogTrigger>
 *   <DialogContent>
 *     <DialogHeader>
 *       <DialogTitle>标题</DialogTitle>
 *     </DialogHeader>
 *     <DialogDescription>内容描述</DialogDescription>
 *   </DialogContent>
 * </Dialog>
 * ```
 */

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Cross2Icon } from "@radix-ui/react-icons"

import { cn } from "../../utils"

/**
 * Dialog 对话框组件
 * 对话框的根组件，用于管理对话框的状态
 */
const Dialog = DialogPrimitive.Root

/**
 * DialogTrigger 对话框触发器组件
 * 用于触发对话框显示的按钮或其他元素
 */
const DialogTrigger = DialogPrimitive.Trigger

/**
 * DialogPortal 对话框传送门组件
 * 将对话框内容传送到 body 根元素
 */
const DialogPortal = DialogPrimitive.Portal

/**
 * DialogClose 对话框关闭组件
 * 用于关闭对话框的按钮
 */
const DialogClose = DialogPrimitive.Close

/**
 * DialogOverlay 对话框遮罩层组件
 * 提供背景遮罩层，点击可关闭对话框
 *
 * @param className - 自定义类名，用于扩展样式
 * @param props - Radix UI DialogPrimitive.Overlay 组件的所有其他属性
 * @param ref - 转发到内部 DialogPrimitive.Overlay 元素的引用
 * @returns 返回一个 DialogOverlay 组件
 */
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

/**
 * DialogContent 对话框内容组件
 * 对话框的主要内容区域，包含标题、描述和操作按钮
 *
 * @param className - 自定义类名，用于扩展样式
 * @param children - 对话框的子元素
 * @param props - Radix UI DialogPrimitive.Content 组件的所有其他属性
 * @param ref - 转发到内部 DialogPrimitive.Content 元素的引用
 * @returns 返回一个 DialogContent 组件
 */
const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <Cross2Icon className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

/**
 * DialogHeader 对话框头部组件
 * 用于显示对话框的标题和描述信息
 *
 * @param className - 自定义类名，用于扩展样式
 * @param props - HTML div 元素的所有其他属性
 * @returns 返回一个 DialogHeader 组件
 */
const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

/**
 * DialogFooter 对话框底部组件
 * 用于放置对话框的操作按钮
 *
 * @param className - 自定义类名，用于扩展样式
 * @param props - HTML div 元素的所有其他属性
 * @returns 返回一个 DialogFooter 组件
 */
const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

/**
 * DialogTitle 对话框标题组件
 * 用于显示对话框的标题文本
 *
 * @param className - 自定义类名，用于扩展样式
 * @param props - Radix UI DialogPrimitive.Title 组件的所有其他属性
 * @param ref - 转发到内部 DialogPrimitive.Title 元素的引用
 * @returns 返回一个 DialogTitle 组件
 */
const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

/**
 * DialogDescription 对话框描述组件
 * 用于显示对话框的详细描述文本
 *
 * @param className - 自定义类名，用于扩展样式
 * @param props - Radix UI DialogPrimitive.Description 组件的所有其他属性
 * @param ref - 转发到内部 DialogPrimitive.Description 元素的引用
 * @returns 返回一个 DialogDescription 组件
 */
const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
