# Docker 部署指南

本文档介绍如何使用 Docker 部署提示词管理系统。

## 前置要求

- Docker 20.10+
- Docker Compose 2.0+

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd weixintishici
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，修改 JWT_SECRET 等配置
```

### 3. 一键部署

```bash
chmod +x deploy.sh
./deploy.sh
```

### 4. 访问应用

- 前端: http://localhost:3000
- 后端: http://localhost:3001
- API文档: http://localhost:3001/api-docs

默认账号:
- 用户名: `admin`
- 密码: `admin123`

## Docker Compose 命令

### 启动服务

```bash
# 生产环境
docker compose up -d

# 开发环境（支持热重载）
docker compose -f docker-compose.dev.yml up -d
```

### 查看日志

```bash
# 查看所有服务日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend
```

### 停止服务

```bash
docker compose down
```

### 重新构建

```bash
docker compose up -d --build
```

### 重启服务

```bash
docker compose restart
```

## 配置说明

### 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `NODE_ENV` | 运行环境 | `production` |
| `PORT` | 后端端口 | `3001` |
| `DATABASE_URL` | 数据库路径 | `file:./data/prompts.db` |
| `JWT_SECRET` | JWT 密钥 | `weixintishici-secret-key-2024` |
| `JWT_EXPIRES_IN` | JWT 过期时间 | `7d` |
| `CORS_ORIGIN` | CORS 允许来源 | `*` |
| `MEMOS_API_URL` | Memos API 地址 | 空 |
| `MEMOS_API_KEY` | Memos API 密钥 | 空 |

### 卷挂载

- `./data:/app/data` - 数据库持久化
- `./logs:/app/logs` - 日志持久化

### 端口映射

- `3000:3000` - 前端
- `3001:3001` - 后端
- `80:80` - Nginx（可选）
- `443:443` - HTTPS（可选）

## 使用 Nginx 反向代理

启用 Nginx 反向代理：

```bash
docker compose --profile with-nginx up -d
```

Nginx 配置文件位于 `nginx/nginx.conf`，可根据需要修改。

### SSL 证书

将证书文件放置在 `nginx/ssl/` 目录：

```
nginx/ssl/
  ├── cert.pem
  └── key.pem
```

然后取消 nginx.conf 中 HTTPS 配置的注释。

## 数据库管理

### 初始化数据库

```bash
docker compose run --rm backend npx prisma db push
docker compose run --rm backend npm run seed
```

### 重置数据库

```bash
# 停止服务
docker compose down

# 删除数据库
rm -f data/prompts.db

# 重新启动（会自动初始化）
./deploy.sh
```

### Prisma Studio

```bash
docker compose run --rm backend npx prisma studio
```

## 生产环境建议

### 1. 修改 JWT_SECRET

在生产环境中，务必使用强密钥：

```bash
# 生成随机密钥
openssl rand -base64 32
```

### 2. 配置 CORS

限制允许的来源：

```env
CORS_ORIGIN="https://your-domain.com"
```

### 3. 启用 HTTPS

使用 Nginx 反向代理并配置 SSL 证书。

### 4. 数据备份

定期备份数据库：

```bash
# 备份
cp data/prompts.db data/prompts.db.backup.$(date +%Y%m%d)

# 恢复
cp data/prompts.db.YYYYMMDD data/prompts.db
```

### 5. 日志管理

配置日志轮转，避免日志文件过大。

## 故障排除

### 容器无法启动

```bash
# 查看详细日志
docker compose logs backend
docker compose logs frontend

# 检查容器状态
docker compose ps
```

### 数据库连接失败

```bash
# 检查数据库文件权限
ls -la data/

# 重新初始化数据库
docker compose run --rm backend npx prisma db push
```

### 端口冲突

修改 docker-compose.yml 中的端口映射：

```yaml
ports:
  - "3001:3001"  # 改为 "8081:3001"
```

## 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker compose up -d --build
```
