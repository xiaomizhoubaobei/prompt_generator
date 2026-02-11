/**
 * @fileoverview Header 组件 - 应用头部组件，显示标题和品牌图标
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark
 * 该组件显示应用的标题，可选显示品牌图标。
 * 支持的功能：
 * - 根据语言显示对应的标题
 * - 可选显示品牌图标（通过 showBrand 控制）
 * - 响应式布局
 * 使用方式：
 * ```tsx
 * <Header language="chinese" />
 * ```
 */

import { HEADER_TITLE } from "../lib/Language";
import { cn } from "../utils";

/**
 * Header 组件
 * 显示应用的标题，可选显示品牌图标
 *
 * @param language - 语言类型：'chinese' | 'english' | 'japanese'
 * @returns 返回包含标题和可选品牌图标的 JSX 元素
 */
export default function Header({ language }: { language: 'chinese' | 'english' | 'japanese' }) {
  const showBrand = false;
  return (
    <div className="relative flex justify-center items-center my-8 gap-1">
      {showBrand &&
        <img
          src="https://file.302.ai/gpt/imgs/5b36b96aaa052387fb3ccec2a063fe1e.png"
          className={cn(
            "app-icon object-contain"
          )}
          alt="302"
          height={60}
          width={60}
        />
      }
      <div className={cn("app-title")}>{HEADER_TITLE[language]}</div>
    </div>
  );
}
