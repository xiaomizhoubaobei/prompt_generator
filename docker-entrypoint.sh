#!/bin/sh
# 启动入口：先后台运行 Node BFF，再前台运行 nginx
set -e

# 会话/上游密钥相关服务端环境变量在 docker-compose / run 时注入，
# 此处仅启动，绝不把任何密钥写入文件。

echo "[entrypoint] starting Node BFF (server/index.js) ..."
node /app/server/index.js &
BFF_PID=$!
echo "[entrypoint] Node BFF started (pid ${BFF_PID})"

# 保证 BFF 就绪后再启动 nginx，避免启动时序竞争
sleep 1

echo "[entrypoint] starting nginx ..."
exec nginx -g "daemon off;"
