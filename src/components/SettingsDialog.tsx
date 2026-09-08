/**
 * @fileoverview SettingsDialog 组件 - 设置对话框，用于配置 API Key 和模型
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE MPL-2.0 license
 * @remark
 * 该组件提供了一个设置对话框，用于配置：
 * - API Key（仅保存于会话期内存，不落 localStorage，避免明文/伪加密持久化泄露）
 * - API URL
 * - 模型名称
 *
 * 支持的功能：
 * - 将 API Key 写入运行时内存（getApiKey/setApiKey）
 * - 将非敏感配置（apiUrl / modelName）持久化到 localStorage
 * - 显示配置状态
 *
 * 安全说明：纯前端 SPA 无法在浏览器内提供真正安全的密钥加密，此前用硬编码密钥
 * AES-GCM 加密后写入 localStorage 的写法（js/clear-text-storage-of-sensitive-data）
 * 实质等同明文落盘。故此处 API Key 仅在本次会话内存中有效，刷新页面后需重新填写，
 * 或回退到部署者注入的构建环境变量 VITE_APP_API_KEY。
 *
 * 使用方式：
 * ```tsx
 * <SettingsDialog />
 * ```
 */

import { useState } from "react"
import { LANGUAGE_LIBRARY, commonModelList } from "../lib/Language"
import { getApiKey, setApiKey } from "../lib/apiKeyStore"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { useAppDispatch, useAppSelector } from "../store/hooks"
import { selectGlobal, setGlobalState } from "../store/globalSlice"
import { IoSettingsOutline } from "react-icons/io5"

interface SettingsData {
  apiKey: string
  apiUrl: string
  modelName: string
}

/**
 * 从 localStorage 读取非敏感配置（apiUrl / modelName）
 * 注意：API Key 不再从 localStorage 解密，仅由内存或环境变量提供。
 *
 * @returns 包含 apiUrl 与 modelName 的非敏感配置对象
 */
function loadNonSensitivePrefs(): Pick<SettingsData, 'apiUrl' | 'modelName'> {
  const fallback = {
    apiUrl: import.meta.env.VITE_APP_API_URL || 'https://api.302.ai',
    modelName: import.meta.env.VITE_APP_MODEL_NAME || 'gpt-4o-2024-08-06'
  }
  try {
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      return {
        apiUrl: parsed.apiUrl || fallback.apiUrl,
        modelName: parsed.modelName || fallback.modelName
      }
    }
  } catch (e) {
    console.error('Failed to parse settings:', e)
  }
  return fallback
}

/**
 * SettingsDialog 组件
 * 提供设置对话框，用于配置 API Key 和模型
 *
 * @returns 返回一个设置对话框组件
 */
export function SettingsDialog() {
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal)

  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<SettingsData>(() => ({
    // API Key 初始值取自会话期内存（未填时回退到构建环境变量）
    apiKey: getApiKey(),
    ...loadNonSensitivePrefs()
  }))

  const handleSave = () => {
    // API Key 仅写入会话期内存，绝不持久化到 localStorage
    setApiKey(settings.apiKey)

    // 仅将非敏感配置持久化到 localStorage，避免任何敏感凭据落盘
    const prefsToSave = {
      apiUrl: settings.apiUrl,
      modelName: settings.modelName
    }
    localStorage.setItem('appSettings', JSON.stringify(prefsToSave))

    // 更新全局状态
    dispatch(setGlobalState({ selectedModel: settings.modelName }))

    setIsOpen(false)
  }

  const handleCancel = () => {
    // 取消时回退到当前生效配置（内存 API Key + 持久化非敏感项）
    setSettings({
      apiKey: getApiKey(),
      ...loadNonSensitivePrefs()
    })
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
            {LANGUAGE_LIBRARY[global.language]["配置 API Key 和模型"] || "配置您的 API Key 和选择使用的模型"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiKey" className="text-right">
              API Key
            </Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              className="col-span-3"
              value={settings.apiKey}
              onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })}
            />
          </div>
          <p className="col-start-2 col-span-3 -mt-2 text-xs text-muted-foreground">
            {LANGUAGE_LIBRARY[global.language]["API Key 仅本次会话有效，刷新页面后需重新填写"] ||
              "API Key 仅本次会话有效，刷新页面后需重新填写"}
          </p>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="apiUrl" className="text-right">
              API URL
            </Label>
            <Input
              id="apiUrl"
              placeholder="https://api.302.ai"
              className="col-span-3"
              value={settings.apiUrl}
              onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="model" className="text-right mt-2">
              {LANGUAGE_LIBRARY[global.language]["AI模型"] || "AI 模型"}
            </Label>
            <div className="col-span-3 space-y-2 max-h-[200px] overflow-y-auto border rounded-md p-2">
              <RadioGroup
                value={settings.modelName}
                onValueChange={(value) => setSettings({ ...settings, modelName: value })}
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
