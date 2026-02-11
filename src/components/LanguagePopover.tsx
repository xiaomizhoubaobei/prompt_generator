/**
 * @fileoverview LanguagePopover 组件 - 语言选择弹出框组件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了一个语言选择弹出框，用户可以在中文、英文、日文之间切换。
 * 支持的功能：
 * - 显示语言切换图标
 * - 点击图标弹出语言选择菜单
 * - 支持中文、英文、日文三种语言
 * - 语言切换后自动保存到 localStorage
 * - 语言切换后自动更新页面标题
 * - 语言切换后更新全局状态
 * 使用方式：
 * ```tsx
 * <LanguagePopover />
 * ```
 */

import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { IoLanguage } from "react-icons/io5";
import { HEADER_TITLE } from "../lib/Language";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { selectGlobal, setGlobalState } from "../store/globalSlice"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"

/**
 * LanguagePopover 组件
 * 提供语言选择弹出框，用户可以在中文、英文、日文之间切换
 *
 * @returns 返回一个语言选择弹出框组件
 */
export function LanguagePopover() {
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal)
  return (
    <Popover>
      <PopoverTrigger>
        <IoLanguage className="text-[20px] cursor-pointer" />
      </PopoverTrigger>
      <PopoverContent className="w-full p-1">
        <RadioGroup
          className='gap-0'
          defaultValue={global.language}
          value={global.language}
          onValueChange={(value: "chinese"| "english"| "japanese") => {
            localStorage.setItem('lang', value)
            dispatch(setGlobalState({ language: value }))
            document.title = HEADER_TITLE[value]
          }}>
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem className="min-w-[15px] max-h-[15px]" value="chinese" id="r1" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-3 w-full h-full' htmlFor="r1">中文</Label>
          </Button>
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem className="min-w-[15px] max-h-[15px]" value="english" id="r2" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-3 w-full h-full' htmlFor="r2">English</Label>
          </Button>
          <Button size='sm' variant="ghost" className="flex justify-start hover:text-[#8e47f0] w-full" >
            <RadioGroupItem className="min-w-[15px] max-h-[15px]" value="japanese" id="r3" />
            <Label className='leading-[2.7] text-left cursor-pointer ml-3 w-full h-full' htmlFor="r3">日本語</Label>
          </Button>
        </RadioGroup>
      </PopoverContent>
    </Popover>
  )
}
