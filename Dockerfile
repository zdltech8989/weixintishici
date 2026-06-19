# 单体 Docker 镜像 - 包含前后端
FROM node:18-alpine AS builder

# 安装构建依赖
RUN apk add --no-cache openssl python3 make g++

WORKDIR /app

# ============ 后端构建 ============
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

RUN cd backend && npm ci --only=production
RUN cd backend && npx prisma generate

COPY backend/src ./backend/src/

# ============ 前端构建 ============
COPY frontend/package*.json ./frontend/
COPY frontend/next.config.js ./frontend/
COPY frontend/tailwind.config.ts ./frontend/
COPY frontend/postcss.config.js ./frontend/

RUN cd frontend && npm ci

# 复制前端源代码
COPY frontend/app ./frontend/app/
COPY frontend/components ./frontend/components/
COPY frontend/lib ./frontend/lib/
COPY frontend/public ./frontend/public/

# 构建前端
RUN cd frontend && npm run build

# ============ 生产镜像 ============
FROM node:18-alpine

# 安装运行时依赖
RUN apk add --no-cache openssl curl wget

WORKDIR /app

# 创建必要的目录
RUN mkdir -p /app/data /app/logs /app/config

# 从 builder 复制后端
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/src ./backend/src
COPY --from=builder /app/backend/prisma ./backend/prisma
COPY --from=builder /app/backend/package*.json ./backend/

# 从 builder 复制前端构建产物
COPY --from=builder /app/frontend/.next/standalone ./frontend/
COPY --from=builder /app/frontend/.next/static ./.next/static/
COPY --from=builder /app/frontend/public ./frontend/public
COPY --from=builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=builder /app/frontend/package*.json ./frontend/

# 安装 PM2 进程管理器
RUN npm install -g pm2

# 创建 PM2 配置文件
RUN cat > /app/ecosystem.config.json << 'PM2EOF'
{
  "apps": [
    {
      "name": "backend",
      "script": "/app/backend/src/server.js",
      "instances": 1,
      "exec_mode": "fork",
      "env": {
        "NODE_ENV": "production"
      },
      "error_file": "/app/logs/backend-error.log",
      "out_file": "/app/logs/backend-out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z"
    },
    {
      "name": "frontend",
      "script": "/app/frontend/server.js",
      "instances": 1,
      "exec_mode": "fork",
      "env": {
        "NODE_ENV": "production",
        "PORT": "3000"
      },
      "error_file": "/app/logs/frontend-error.log",
      "out_file": "/app/logs/frontend-out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss Z"
    }
  ]
}
PM2EOF

# 创建启动脚本
RUN cat > /app/docker-entrypoint.sh << 'SCRIPTEOF'
#!/bin/sh
set -e

echo "=== 提示词管理系统启动脚本 ==="

# 设置环境变量默认值
export PORT=${PORT:-3001}
export FRONTEND_PORT=${FRONTEND_PORT:-3000}
export NODE_ENV=${NODE_ENV:-production}
export DATABASE_URL=${DATABASE_URL:-file:./data/prompts.db}
export JWT_SECRET=${JWT_SECRET:-weixintishici-secret-key-2024}
export JWT_EXPIRES_IN=${JWT_EXPIRES_IN:-7d}
export CORS_ORIGIN=${CORS_ORIGIN:-*}

# 确保目录存在
mkdir -p /app/data /app/logs /app/config

# 初始化数据库（如果不存在）
if [ ! -f /app/data/prompts.db ]; then
    echo "初始化数据库..."
    cd /app/backend
    node -e "
const prisma = require('./src/database.js');
(async () => {
  await prisma.\$connect();
  console.log('Database connection successful');
  await prisma.\$disconnect();
})();
    " && \
    node prisma/seed.js && \
    echo "数据库初始化完成"
fi

# 更新 PM2 配置中的环境变量
node -e "
const config = require('/app/ecosystem.config.json');
config.apps[0].env.PORT = process.env.PORT;
config.apps[0].env.DATABASE_URL = process.env.DATABASE_URL;
config.apps[0].env.JWT_SECRET = process.env.JWT_SECRET;
config.apps[0].env.CORS_ORIGIN = process.env.CORS_ORIGIN;
require('fs').writeFileSync('/app/ecosystem.config.json', JSON.stringify(config, null, 2));
"

echo "启动服务..."
echo "后端端口: $PORT"
echo "前端端口: $FRONTEND_PORT"

# 使用 PM2 启动服务
exec pm2-runtime /app/ecosystem.config.json
SCRIPTEOF

RUN chmod +x /app/docker-entrypoint.sh

# 暴露端口
EXPOSE 3000 3001

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1

# 设置入口点
ENTRYPOINT ["/app/docker-entrypoint.sh"]
