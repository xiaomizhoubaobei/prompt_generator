/**
 * @fileoverview SettingsDialog 组件 - 设置对话框，用于配置 API Key 和模型
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件提供了一个设置对话框，用于配置：
 * - API Key
 * - API URL
 * - 模型名称
 * 
 * 支持的功能：
 * - 保存配置到 localStorage
 * - 加载配置从 localStorage
 * - 显示配置状态
 * 使用方式：
 * ```tsx
 * <SettingsDialog />
 * ```
 */

import { useState, useEffect } from "react"
import { LANGUAGE_LIBRARY, commonModelList } from "../lib/Language"
import { encrypt, decrypt } from "../lib/security"
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
 * SettingsDialog 组件
 * 提供设置对话框，用于配置 API Key 和模型
 *
 * @returns 返回一个设置对话框组件
 */
export function SettingsDialog() {
  const dispatch = useAppDispatch()
  const global = useAppSelector(selectGlobal)
  
  const [isOpen, setIsOpen] = useState(false)
  const [settings, setSettings] = useState<SettingsData>({
    apiKey: import.meta.env.VITE_APP_API_KEY || '',
    apiUrl: import.meta.env.VITE_APP_API_URL || 'https://api.302.ai',
    modelName: import.meta.env.VITE_APP_MODEL_NAME || 'gpt-4o-2024-08-06'
  })

  useEffect(() => {
    // 从 localStorage 加载设置
    const loadSettings = async () => {
      const savedSettings = localStorage.getItem('appSettings')
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings)
          const decryptedApiKey = await decrypt(parsed.apiKey)
          setSettings({
            apiKey: decryptedApiKey || import.meta.env.VITE_APP_API_KEY || '',
            apiUrl: parsed.apiUrl || import.meta.env.VITE_APP_API_URL || 'https://api.302.ai',
            modelName: parsed.modelName || import.meta.env.VITE_APP_MODEL_NAME || 'gpt-4o-2024-08-06'
          })
        } catch (e) {
          console.error('Failed to parse settings:', e)
        }
      }
    }
    loadSettings()
  }, [])

  const handleSave = async () => {
    // 保存设置到 localStorage（加密 API Key）
    const encryptedApiKey = await encrypt(settings.apiKey)
    const settingsToSave = {
      apiKey: encryptedApiKey,
      apiUrl: settings.apiUrl,
      modelName: settings.modelName
    }
    localStorage.setItem('appSettings', JSON.stringify(settingsToSave))
    
    // 更新全局状态
    dispatch(setGlobalState({ selectedModel: settings.modelName }))
    
    setIsOpen(false)
  }

  const handleCancel = async () => {
    // 恢复原始设置
    const savedSettings = localStorage.getItem('appSettings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        const decryptedApiKey = await decrypt(parsed.apiKey)
        setSettings({
          apiKey: decryptedApiKey || import.meta.env.VITE_APP_API_KEY || '',
          apiUrl: parsed.apiUrl || import.meta.env.VITE_APP_API_URL || 'https://api.302.ai',
          modelName: parsed.modelName || import.meta.env.VITE_APP_MODEL_NAME || 'gpt-4o-2024-08-06'
        })
      } catch (e) {
        console.error('Failed to parse settings:', e)
      }
    }
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