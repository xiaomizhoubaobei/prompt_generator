/**
 * @fileoverview SettingsDialog 组件 - 设置对话框（AI 模型选择）
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE MPL-2.0 license
 * @remark
 * 该组件提供设置对话框。安全架构升级后，API Key 与上游网关地址完全交由服务端
 * （BFF）持有与管理，浏览器内不再存在任何密钥输入与存储，故本设置框仅保留
 * 「AI 模型」等非敏感偏好，并仅持久化到 localStorage（不涉及任何凭据）。
 *
 * 历史说明：此前版本允许用户在前端输入 API Key（虽仅存会话内存，但本质仍是
 * 浏览器持有密钥、前端直连外部 AI 网关）。现改为服务端代理托管密钥，彻底移除
 * 前端 Key 录入，规避 CWE-312 / CWE-798 等敏感凭据暴露风险。
 *
 * 使用方式：
 * ```tsx
 * <SettingsDialog />
 * ```
 */

import { useState } from "react"
import { toast } from "react-toastify"
import { LANGUAGE_LIBRARY, commonModelList } from "../lib/Language"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { selectGlobal, setGlobalState } from "../store/globalSlice"
import { IoSettingsOutline } from "react-icons/io5"

/**
 * 读取本地持久化的非敏感配置（AI 模型名）
 *
 * @returns {string} 保存的模型名；无保存则返回默认模型
 */
function loadSavedModel(): string {
  const fallback = import.meta.env.VITE_APP_MODEL_NAME || 'gpt-4o-2024-08-06'
  try {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      if (parsed && typeof parsed.modelName === 'string' && parsed.modelName) {
        return parsed.modelName
      }
    }
  } catch (e) {
    console.error('Failed to parse settings:', e)
  }
  return fallback
}

/**
 * SettingsDialog 组件
 * 提供设置对话框，用于选择 AI 模型（不含任何密钥配置）
 *
 * @returns 返回一个设置对话框组件
 */
export function SettingsDialog() {
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal)

  const [isOpen, setIsOpen] = useState(false)
  const [modelName, setModelName] = useState<string>(() => loadSavedModel())

  const handleSave = () => {
    // 仅持久化非敏感配置（模型名），API Key 由服务端托管，前端零密钥
    const prefsToSave = { modelName }
    localStorage.setItem('appSettings', JSON.stringify(prefsToSave))

    // 更新全局状态
    dispatch(setGlobalState({ selectedModel: modelName }))
    toast.success(LANGUAGE_LIBRARY[global.language]["设置已保存"] || "设置已保存")
    setIsOpen(false)
  }

  const handleCancel = () => {
    setModelName(loadSavedModel())
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <IoSettingsOutline className="text-[20px] cursor-pointer hover:text-[#7E4AFF]" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{LANGUAGE_LIBRARY[global.language]["设置"] || "设置"}</DialogTitle>
          <DialogDescription>
            {LANGUAGE_LIBRARY[global.language]["选择 AI 模型"]}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <p className="col-start-1 col-span-4 -mt-2 text-xs text-muted-foreground">
            {LANGUAGE_LIBRARY[global.language]["API Key 已交由服务端安全托管"]}
          </p>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="model" className="text-right mt-2">
              {LANGUAGE_LIBRARY[global.language]["AI模型"] || "AI 模型"}
            </Label>
            <div className="col-span-3 space-y-2 max-h-[240px] overflow-y-auto border rounded-md p-2">
              <RadioGroup
                value={modelName}
                onValueChange={(value) => setModelName(value)}
              >
                {commonModelList.map((model, index) => (
                  <div key={model.id} className="flex items-center space-x-2 py-1">
                    <RadioGroupItem value={model.id} id={`model-${index}`} />
                    <Label htmlFor={`model-${index}`} className="cursor-pointer font-normal">
                      {model.name}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            {LANGUAGE_LIBRARY[global.language]["取消"] || "取消"}
          </Button>
          <Button onClick={handleSave}>
            {LANGUAGE_LIBRARY[global.language]["保存"] || "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
