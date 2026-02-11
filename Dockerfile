# 基础镜像
FROM node:lts-alpine AS base

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY package.json yarn.lock ./

# 设置国内镜像源
RUN yarn config set registry 'https://registry.npmmirror.com/'

# 安装生产依赖
RUN yarn install --frozen-lockfile --production=false

# 复制源代码
COPY . .

# 设置构建时环境变量（可根据需要修改）
ARG VITE_APP_API_KEY=""
ARG VITE_APP_SHOW_BRAND="false"
ARG VITE_APP_MODEL_NAME="gpt-4o"
ARG VITE_APP_REGION="0"
ARG VITE_APP_LOCALE="zh"
ARG VITE_APP_API_URL="https://api.302.ai"
ARG VITE_APP_OFFICIAL_WEBSITE_URL_CHINA="https://302ai.cn/"
ARG VITE_APP_OFFICIAL_WEBSITE_URL_GLOBAL="https://302.ai/"
ARG VITE_APP_UPLOAD_API_URL="https://dash-api.302.ai/gpt/api/upload/gpt/image"

# 设置环境变量
ENV VITE_APP_API_KEY=${VITE_APP_API_KEY}
ENV VITE_APP_SHOW_BRAND=${VITE_APP_SHOW_BRAND}
ENV VITE_APP_MODEL_NAME=${VITE_APP_MODEL_NAME}
ENV VITE_APP_REGION=${VITE_APP_REGION}
ENV VITE_APP_LOCALE=${VITE_APP_LOCALE}
ENV VITE_APP_API_URL=${VITE_APP_API_URL}
ENV VITE_APP_OFFICIAL_WEBSITE_URL_CHINA=${VITE_APP_OFFICIAL_WEBSITE_URL_CHINA}
ENV VITE_APP_OFFICIAL_WEBSITE_URL_GLOBAL=${VITE_APP_OFFICIAL_WEBSITE_URL_GLOBAL}
ENV VITE_APP_UPLOAD_API_URL=${VITE_APP_UPLOAD_API_URL}

# 构建应用
RUN yarn build

# 生产镜像 - 使用 nginx
FROM nginx:alpine AS production

# 删除默认的 nginx 配置
RUN rm -rf /etc/nginx/conf.d/default.conf

# 复制自定义 nginx 配置
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制构建产物
COPY --from=base /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# 启动 nginx
CMD ["nginx", "-g", "daemon off;"]