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
        // 这里改写为函数形式，从模块 id 中精确提取包名并按命名空间归集分包
        // （相比原对象配置覆盖了同族包，并将 react-router-dom 纳入 react-vendor）
        manualChunks(id) {
          // 仅处理 node_modules 中的依赖模块，避免对业务源码误分包
          if (!id.includes('node_modules')) return undefined;
          // 从模块 id 中精确解析包名，避免对路径子串的误匹配
          // 例：/path/node_modules/@radix-ui/react-dialog/... -> @radix-ui/react-dialog
          //     /path/node_modules/react-dom/...                 -> react-dom
          const after = id.split('node_modules/').pop()!;
          const pkg = after.startsWith('@')
            ? after.split('/').slice(0, 2).join('/')
            : after.split('/')[0];
          // 将 React 核心库单独打包
          if (['react', 'react-dom', 'react-icons', 'react-router-dom'].includes(pkg)) {
            return 'react-vendor';
          }
          // 将 Radix UI 组件库单独打包（按命名空间精确匹配，避免 react 子路径误入 react-vendor）
          if (pkg.startsWith('@radix-ui')) {
            return 'radix-ui';
          }
          // 将 CodeMirror 编辑器核心单独打包（精确匹配 @codemirror 命名空间，避免 @uiw/react-codemirror 等被误纳入）
          if (pkg.startsWith('@codemirror') || pkg === 'codemirror') {
            return 'codemirror-core';
          }
          // 将其他大型依赖单独打包
          if (['@reduxjs/toolkit', 'react-redux', 'class-variance-authority'].includes(pkg)) {
            return 'vendor';
          }
          // 其余依赖不强制分包，交由默认逻辑处理
          return undefined;
        }
      }
    }
  }
});
