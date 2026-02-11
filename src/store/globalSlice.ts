/**
 * @fileoverview 全局状态 slice，管理应用的全局配置状态
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark 本模块是 Redux Toolkit slice，管理应用的全局状态：
 *          - language：应用语言设置（中文、英文、日文）
 *
 *          技术栈：
 *          - Redux Toolkit（createSlice）
 *          - TypeScript（类型安全）
 *
 *          使用方式：
 *          - 导入 setGlobalState action 来更新全局状态
 *          - 导入 selectGlobal selector 来获取全局状态
 *          - 通过 hooks.ts 提供的类型安全 hooks 使用
 *
 *          示例：
 *          - dispatch(setGlobalState({ language: 'english' }))
 *          - const global = useAppSelector(selectGlobal)
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '.'

/**
 * 全局状态接口
 * 定义应用的全局配置状态
 */
interface GlobalStateProps {
  /** 应用语言：中文、英文或日文 */
  language: 'chinese' | 'english' | 'japanese'
  /** 选中的 AI 模型 */
  selectedModel?: string
}

/**
 * 全局状态 slice
 * 使用 Redux Toolkit 创建的全局状态管理 slice
 */
export const globalStateSlice = createSlice({
  name: 'global',
  initialState: {
    language: 'chinese',
    selectedModel: 'gpt-4o-2024-08-06'
  } as GlobalStateProps,
  reducers: {
    /**
     * 设置全局状态
     * 更新全局配置状态，支持部分更新
     *
     * @param state - 当前全局状态
     * @param action - 包含要更新的状态字段
     */
    setGlobalState: (
      state: GlobalStateProps,
      action: PayloadAction<{
        [key in keyof GlobalStateProps]?: GlobalStateProps[key]
      }>
    ) => {
      const { language, selectedModel } = action.payload
      if (language !== undefined) state.language = language
      if (selectedModel !== undefined) state.selectedModel = selectedModel
    }
  }
})

/** 全局状态 actions */
export const { setGlobalState } = globalStateSlice.actions

/**
 * 全局状态 selector
 * 从 store 中获取全局状态
 *
 * @param state - Redux 根状态
 * @returns 全局状态对象
 */
export const selectGlobal = (state: RootState) => state.global

/** 全局状态 reducer */
export default globalStateSlice.reducer
