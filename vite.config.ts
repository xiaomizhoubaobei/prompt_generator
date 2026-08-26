import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: "window",
  },
  server: {
    host: '0.0.0.0'
  },
  build: {
    rollupOptions: {
      output: {
        // rolldown-vite（vite 8）不再支持对象形式的 manualChunks，仅接受函数形式
        // 这里改写为函数形式，依据模块 id 中的包名进行分包，保持与原对象配置一致的分包逻辑
        manualChunks(id) {
          // 仅处理 node_modules 中的依赖模块，避免对业务源码误分包
          if (!id.includes('node_modules')) return undefined;
          // 将 React 核心库单独打包
          if (id.includes('/react') || id.includes('react-dom') || id.includes('react-icons') || id.includes('react-router')) {
            return 'react-vendor';
          }
          // 将 Radix UI 组件库单独打包
          if (id.includes('@radix-ui')) {
            return 'radix-ui';
          }
          // 将 CodeMirror 编辑器核心单独打包
          if (id.includes('@codemirror') || id.includes('codemirror')) {
            return 'codemirror-core';
          }
          // 将其他大型依赖单独打包
          if (id.includes('@reduxjs/toolkit') || id.includes('react-redux') || id.includes('class-variance-authority')) {
            return 'vendor';
          }
          // 其余依赖不强制分包，交由默认逻辑处理
          return undefined;
        }
      }
    }
  }
});
