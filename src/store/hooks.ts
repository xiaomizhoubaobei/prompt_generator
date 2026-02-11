/**
 * @fileoverview Redux 类型安全 hooks，提供类型安全的状态访问和 dispatch 功能
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark 本模块封装了类型安全的 Redux hooks，提供：
 *          - useAppDispatch：类型安全的 dispatch hook
 *          - useAppSelector：类型安全的 selector hook
 *
 *          这些 hooks 自动推断 RootState 和 AppDispatch 类型，
 *          避免在使用时手动指定类型，提高开发体验和类型安全性。
 *
 *          使用方式：
 *          - 导入 useAppDispatch 替代 useDispatch
 *          - 导入 useAppSelector 替代 useSelector
 *          - 组件中可以直接使用，无需手动指定类型
 *
 *          示例：
 *          - const dispatch = useAppDispatch()
 *          - const language = useAppSelector(state => state.global.language)
 */
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from '.'

/**
 * 类型安全的 dispatch hook
 * 派发 Redux action，自动推断 AppDispatch 类型
 */
export const useAppDispatch: () => AppDispatch = useDispatch

/**
 * 类型安全的 selector hook
 * 从 Redux store 中选择状态，自动推断 RootState 类型
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
