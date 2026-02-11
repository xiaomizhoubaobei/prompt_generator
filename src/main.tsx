/**
 * @fileoverview 应用入口文件，负责初始化 React 应用并配置全局提供者
 * @author 祁筱欣
 * @date 2026-02-11
 * @since 2026-02-11
 * @contact qixiaoxin@stu.sqxy.edu.cn
 * @LICENSE AGPL-3.0 license
 * @remark 本模块是 React 应用的入口点，负责：
 *          - 创建 React 根节点并渲染应用
 *          - 配置 Redux 状态管理
 *          - 配置 React Router 路由
 *          - 配置 Radix UI 主题
 *          - 加载第三方脚本（ScriptLoader 组件）
 *
 *          技术栈：
 *          - React 18（使用 StrictMode）
 *          - React Router v6（客户端路由）
 *          - Redux（状态管理）
 *          - Radix UI Themes（UI 主题系统）
 *
 *          初始化流程：
 *          1. 获取 DOM 根节点
 *          2. 使用 Provider 包裹应用，提供 Redux store
 *          3. 使用 Theme 包裹应用，提供 UI 主题
 *          4. 渲染 ScriptLoader 组件加载第三方脚本
 *          5. 配置路由并渲染主应用组件
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import store from "./store";
import { Provider } from "react-redux";
import { Theme } from "@radix-ui/themes";

import App from "./App.tsx";
import "./index.css";
import '@radix-ui/themes/styles.css';
import ScriptLoader from "./ScriptLoader.tsx";

// 初始化 React 应用并渲染到 DOM 根节点
// 层次结构：Provider (Redux) -> Theme (Radix UI) -> StrictMode (React) -> ScriptLoader -> Router -> Routes -> App
ReactDOM.createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <Theme>
      <React.StrictMode>
        <ScriptLoader />
        <Router>
          <Routes>
            <Route path="/" element={<App />} />
          </Routes>
        </Router>
      </React.StrictMode>
    </Theme>
  </Provider>
);
