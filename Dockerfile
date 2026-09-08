# 基础镜像（构建阶段）
FROM node:lts-alpine AS base

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# 安装 pnpm 并设置国内镜像源
RUN npm install -g pnpm@11.21.0 && pnpm config set registry 'https://registry.npmmirror.com/'

# 安装依赖（包含 devDependencies 用于构建）
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 设置构建时环境变量（可根据需要修改；均为非敏感项，真实 API Key 由运行时服务端注入）
ARG VITE_APP_SHOW_BRAND="false"
ARG VITE_APP_MODEL_NAME="gpt-4o"
ARG VITE_APP_REGION="0"
ARG VITE_APP_LOCALE="zh"
ARG VITE_APP_API_URL="https://api.302.ai"
ARG VITE_APP_OFFICIAL_WEBSITE_URL_CHINA="https://302ai.cn/"
ARG VITE_APP_OFFICIAL_WEBSITE_URL_GLOBAL="https://302.ai/"
ARG VITE_APP_UPLOAD_API_URL="https://dash-api.302.ai/gpt/api/upload/gpt/image"

# 设置环境变量
ENV VITE_APP_SHOW_BRAND=${VITE_APP_SHOW_BRAND}
ENV VITE_APP_MODEL_NAME=${VITE_APP_MODEL_NAME}
ENV VITE_APP_REGION=${VITE_APP_REGION}
ENV VITE_APP_LOCALE=${VITE_APP_LOCALE}
ENV VITE_APP_API_URL=${VITE_APP_API_URL}
ENV VITE_APP_OFFICIAL_WEBSITE_URL_CHINA=${VITE_APP_OFFICIAL_WEBSITE_URL_CHINA}
ENV VITE_APP_OFFICIAL_WEBSITE_URL_GLOBAL=${VITE_APP_OFFICIAL_WEBSITE_URL_GLOBAL}
ENV VITE_APP_UPLOAD_API_URL=${VITE_APP_UPLOAD_API_URL}

# 构建应用
RUN pnpm build

# 生产镜像 - nginx 提供静态资源，Node BFF 提供会话与上游代理
# 选择同时包含 nginx 与 node 的运行镜像，保证单容器即可承载前后端
FROM nginx:alpine AS production

# 安装 Node.js 运行时（BFF 为纯 Node 内置模块实现，无需安装额外 npm 依赖）
RUN apk add --no-cache nodejs

# 生产环境模式：会话 Cookie 默认走 Secure（仅 HTTPS），并让 BFF 相关运行时
# 逻辑按生产语义执行；NODE_ENV 必须显式注入，杜绝依赖缺失的隐式安全降级。
ENV NODE_ENV=production

# 删除默认 nginx 配置，替换为自定义配置（/api 反向代理到本机 BFF）
RUN rm -rf /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 复制前端构建产物
COPY --from=base /app/dist /usr/share/nginx/html

# 复制服务端 BFF 代码与启动脚本
COPY server /app/server
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 暴露端口
EXPOSE 80

# 健康检查：探测 nginx 静态页
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 启动脚本：先后台启动 Node BFF，再前台运行 nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
