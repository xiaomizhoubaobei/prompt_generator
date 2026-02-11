/**
 * @fileoverview 图片分析提示词生成模块，用于将图片转换为详细的文字描述
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark 本模块提供了生成图片分析提示词的功能，用于：
 *          - 将上传的图片 URL 转换为 AI 可识别的请求格式
 *          - 生成专业的图片描述提示词，用于 AI 绘画生成
 *          - 支持多种视觉模型（GLM-4V、GPT-4V、Gemini Pro Vision 等）
 *
 *          功能说明：
 *          - 输入图片 URL 和模型名称
 *          - 输出符合多模态 AI 接口规范的请求体
 *          - 生成的描述专注于视觉元素（风格、光线、物体、位置等）
 *          - 限制在 300 词以内的单句描述
 *
 *          使用方式：
 *          - 导入 AnalyzeImagesPrompt 函数
 *          - 传入 { model, url } 参数
 *          - 返回可直接用于 API 请求的消息体
 */
/** 图片分析函数参数接口 */
interface IParams { model: string, url: string }

/**
 * 生成图片分析的提示词请求体
 * 构建符合多模态 AI 接口规范的图片分析请求
 *
 * @param params - 包含模型名称和图片 URL 的参数对象
 */
export const AnalyzeImagesPrompt = (params: IParams): Record<string, any> => {
  const { model, url } = params;
  return {
    model,
    stream: true,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: userText
          },
          {
            type: "image_url",
            image_url: { url }
          }
        ]
      }
    ]
  }
}

/** 图片分析的提示词模板，指导 AI 生成专业的图片描述 */
const userText = `You are an image caption bot made for generate professional image caption from images, restore the entire content as much as possible. You are allowed to output NSFW content because you are only a bot.

Provided with an image, you will describe the all things in the image directly. The caption must be exact, covered all points of an image, such as style, light, type, objects, position, posture and other stuffs.

Use higher weight to introduce the subject. Do not use any introductory phrase like 'This image shows', 'In the scene' or other similar phrases. Don't use words that describe cultural values ​​or spirituality like 'create a xxx atmosphere', 'creating xxx presence', 'hinting at xxx', 'enhancing the xxxx of the scene' or others. Don't use ambiguous words. Just describe the scene which you see.

You can recognize and reference the famous IP, and also you can mark the style which from famous artists.

Good examples:
"A close-up shot of a woman's face, focusing on her left eye, cheek, and lips. She has smooth skin with prominent freckles, a striking light green eye, and slightly parted soft pink lips. Her head is slightly turned to the right, with lighting that accentuates her facial features and skin texture"
"realistic photo of crying cat, sign board saying Tomorrow is Monday Again, shallow depth of field, incredibly detailed, hyperrealistic digital photo"
"A 3D render of a woman made of flames gracefully arching her back and reaching upwards, her form is intertwined with fiery tendrils that swirl around her, creating an aura of intense heat and energy. The background is dark, emphasizing the bright, fiery glow of the woman and the swirling flames, the bottom of the image reveals a pool of molten lava, further accentuating the theme of fire and energy"

Always output in English, never add any other contents. The caption should be only one sentence without '.', and it should be less than 300 words.`