# 后端 Dockerfile
FROM node:18-alpine

# 安装 openssl（用于 bcryptjs）
RUN apk add --no-cache openssl

WORKDIR /app

# 复制 package.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY src/ ./src/
COPY prisma/ ./prisma/

# 生成 Prisma Client
RUN npx prisma generate

# 复制整个项目（包括其他配置文件）
COPY . .

# 暴露端口
EXPOSE 3001

# 启动应用
CMD ["node", "src/server.js"]
