/**
 * @fileoverview 动态加载第三方脚本的 React 组件
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark 本模块实现了基于视口宽度的第三方脚本动态加载功能，负责管理应用程序的跟踪脚本加载。
 *          该组件提供了条件加载功能，确保：
 *          - 响应式加载：仅在屏幕宽度大于 768px 时加载脚本
 *          - 可配置性：通过 showBrand 标志控制脚本加载
 *          - 性能优化：避免在移动端加载不必要的第三方脚本
 *
 *          加载的脚本：
 *          - SalesMartly 跟踪脚本（https://assets.salesmartly.com/js/project_177_61_1649762323.js）
 *
 *          使用方式：
 *          - 在应用根组件中引入并使用该组件
 *          - 组件会在挂载时自动执行加载逻辑
 *          - 返回 null，不渲染任何可见内容
 */
import { useEffect } from 'react';

/**
 * ScriptLoader 组件
 * 动态加载第三方脚本的 React 组件，根据视口宽度和配置条件加载 SalesMartly 跟踪脚本
 * 不渲染任何可见内容
 */
const ScriptLoader = (): React.JSX.Element | null => {
  useEffect(() => {
    const showBrand = false;
    const width = document.body.clientWidth;
    if (width > 768 && showBrand) {
      const script = document.createElement('script');
      script.src =
        'https://assets.salesmartly.com/js/project_177_61_1649762323.js';
      document.body.appendChild(script);
    }
  }, []);

  return null;
};

export default ScriptLoader;