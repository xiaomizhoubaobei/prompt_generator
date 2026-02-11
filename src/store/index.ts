/**
 * @fileoverview Redux store 配置文件，管理应用的全局状态
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark 本模块是 Redux store 的入口文件，负责：
 *          - 配置 Redux store
 *          - 集成全局状态管理 reducer（globalSlice）
 *          - 导出 TypeScript 类型（RootState、AppDispatch）
 *          - 提供 store 实例供应用使用
 *
 *          状态结构：
 *          - global：全局状态，包含语言、主题等配置
 *
 *          技术栈：
 *          - Redux Toolkit（configureStore）
 *          - TypeScript（类型推断）
 *
 *          使用方式：
 *          - 在 main.tsx 中通过 Provider 包裹应用
 *          - 使用 useAppSelector hook 访问状态
 *          - 使用 useAppDispatch hook 派发 action
 */
import { configureStore } from '@reduxjs/toolkit'
import globalReducers from './globalSlice'

/**
 * Redux store 配置
 * 配置全局状态管理的 store，包含 global reducer
 */
const store = configureStore({
  reducer: {
    global: globalReducers
  }
})

/**
 * RootState 类型
 * 从 store.getState() 推断出的根状态类型，用于访问应用状态
 */
export type RootState = ReturnType<typeof store.getState>

/**
 * AppDispatch 类型
 * store.dispatch 的类型，用于派发 action
 */
export type AppDispatch = typeof store.dispatch

/**
 * Redux store 实例
 * 应用的全局状态管理 store
 */
export default store
