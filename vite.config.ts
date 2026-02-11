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
        manualChunks: {
          // 将 React 核心库单独打包
          'react-vendor': ['react', 'react-dom', 'react-icons'],
          // 将 Radix UI 组件库单独打包
          'radix-ui': ['@radix-ui/react-slot', '@radix-ui/react-label', '@radix-ui/react-switch', '@radix-ui/react-slider', '@radix-ui/react-radio-group', '@radix-ui/react-popover', '@radix-ui/react-dialog', '@radix-ui/react-checkbox', '@radix-ui/react-icons'],
          // 将 CodeMirror 编辑器核心单独打包
          'codemirror-core': ['@codemirror/state', '@codemirror/view', '@codemirror/language', '@codemirror/commands', '@codemirror/search', '@codemirror/lint'],
          // 将其他大型依赖单独打包
          'vendor': ['@reduxjs/toolkit', 'react-redux', 'class-variance-authority'],
        }
      }
    }
  }
});
