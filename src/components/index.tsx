/**
 * @fileoverview 组件导出模块 - 统一导出所有 UI 组件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该模块统一导出项目中的所有 UI 组件，方便其他模块引用。
 * 导出的组件包括：
 * - button: 按钮组件
 * - checkbox: 复选框组件
 * - dialog: 对话框组件
 * - input: 输入框组件
 * - label: 标签组件
 * - select: 下拉选择组件
 * - slider: 滑块组件
 * - switch: 开关组件
 * - textarea: 文本域组件
 * 使用方式：
 * ```tsx
 * import { Button, Input, Dialog } from '@/components'
 * ```
 */

export * from "./ui/button"
export * from "./ui/checkbox"
export * from "./ui/dialog"
export * from "./ui/input"
export * from "./ui/label"
export * from "./ui/select"
export * from "./ui/slider"
export * from "./ui/switch"
export * from "./ui/textarea"