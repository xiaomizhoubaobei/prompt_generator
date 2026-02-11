/**
 * @fileoverview ModelSelector 组件 - AI 模型选择器
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了一个模型选择弹出框，用户可以在多个 AI 模型之间切换。
 * 支持的功能：
 * - 显示模型切换图标
 * - 点击图标弹出模型选择菜单
 * - 支持多种常用 AI 模型
 * - 模型选择后自动保存到 localStorage
 * 使用方式：
 * ```tsx
 * <ModelSelector />
 * ```
 */

import { IoSettingsOutline } from "react-icons/io5";
import { LANGUAGE_LIBRARY, commonModelList } from "../lib/Language";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { selectGlobal, setGlobalState } from "../store/globalSlice"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Label } from "./ui/label"
import { Button } from "./ui/button"

/**
 * ModelSelector 组件
 * 提供 AI 模型选择弹出框，用户可以在多个 AI 模型之间切换
 *
 * @returns 返回一个模型选择弹出框组件
 */
export function ModelSelector() {
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal)

  /**
   * 处理模型变化
   * 保存选中的模型到 localStorage 和全局状态
   */
  const handleModelChange = (value: string) => {
    localStorage.setItem('selectedModel', value)
    dispatch(setGlobalState({ selectedModel: value }))
  }

  return (
    <Popover>
      <PopoverTrigger>
        <IoSettingsOutline className="text-[20px] cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="w-full p-1" style={{ width: '280px' }}>
        <div className="mb-3 text-sm font-medium text-gray-700">
          {LANGUAGE_LIBRARY[global.language]["模型选择"]}
        </div>
        <RadioGroup
          className='gap-0'
          defaultValue={global.selectedModel || 'gpt-4o-2024-08-06'}
          value={global.selectedModel || 'gpt-4o-2024-08-06'}
          onValueChange={handleModelChange}>
          {commonModelList.map((model, index) => (
            <Button
              key={model.id}
              size='sm'
              variant="ghost"
              className="flex justify-start hover:text-[#8e47f0] w-full"
            >
              <RadioGroupItem
                className="min-w-[15px] max-h-[15px]"
                value={model.id}
                id={`model-${index}`}
              />
              <Label
                className='leading-[2.7] text-left cursor-pointer ml-3 w-full h-full'
                htmlFor={`model-${index}`}
              >
                {model.name}
              </Label>
            </Button>
          ))}
        </RadioGroup>
      </PopoverContent>
    </Popover>
  )
}