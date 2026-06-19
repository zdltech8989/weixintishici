# 提示词管理系统 - Docker 独立部署指南

## 概述

本项目提供了一个单体 Docker 镜像配置，将前端和后端打包在一个容器中，便于快速部署。

## 系统要求

- Docker 20.10 或更高版本
- Docker Compose 2.0 或更高版本
- 至少 1GB 可用内存
- 至少 2GB 可用磁盘空间

## 快速开始

### 1. 一键部署

```bash
chmod +x deploy-standalone.sh
./deploy-standalone.sh
```

该脚本会自动：
- 创建必要的目录（config, data, logs）
- 生成环境配置文件
- 构建 Docker 镜像
- 启动服务

### 2. 手动部署

#### 步骤 1: 创建目录结构

```bash
mkdir -p config data logs
```

#### 步骤 2: 创建环境配置文件

创建 `.env` 文件：

```bash
# 数据库配置
DATABASE_URL=file:./data/prompts.db

# JWT配置
JWT_SECRET=your-secret-key-change-this
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3001
FRONTEND_PORT=3000
NODE_ENV=production

# Memos配置（可选）
MEMOS_API_URL=
MEMOS_API_KEY=

# CORS配置
CORS_ORIGIN=*
```

#### 步骤 3: 构建并启动

```bash
docker compose -f docker-compose.standalone.yml up -d --build
```

## 访问地址

部署成功后，可以通过以下地址访问：

- **前端界面**: http://localhost:3000
- **后端 API**: http://localhost:3001
- **API 文档**: http://localhost:3001/api-docs
- **健康检查**: http://localhost:3001/health

## 默认账号

```
用户名: admin
密码: admin123
```

**重要**: 首次登录后请立即修改默认密码！

## 配置说明

### 端口配置

可以在 `docker-compose.standalone.yml` 中修改端口映射：

```yaml
ports:
  - "3000:3000"   # 前端（主机端口:容器端口）
  - "3001:3001"   # 后端 API
```

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 后端服务端口 | 3001 |
| `FRONTEND_PORT` | 前端服务端口 | 3000 |
| `DATABASE_URL` | 数据库路径 | file:./data/prompts.db |
| `JWT_SECRET` | JWT 密钥 | weixintishici-secret-key-2024 |
| `JWT_EXPIRES_IN` | Token 过期时间 | 7d |
| `CORS_ORIGIN` | CORS 允许来源 | * |
| `MEMOS_API_URL` | Memos API 地址（可选） | - |
| `MEMOS_API_KEY` | Memos API 密钥（可选） | - |

### 数据持久化

以下目录会被挂载到宿主机：

- `./data` - 数据库文件
- `./logs` - 应用日志
- `./config` - 配置文件（只读）

## 常用命令

### 查看日志

```bash
# 查看所有日志
docker compose -f docker-compose.standalone.yml logs -f

# 查看前端日志
docker compose -f docker-compose.standalone.yml logs app | grep frontend

# 查看后端日志
docker compose -f docker-compose.standalone.yml logs app | grep backend

# 查看 PM2 日志
docker exec -it weixintishici-app pm2 logs
```

### 停止服务

```bash
docker compose -f docker-compose.standalone.yml down
```

### 重启服务

```bash
docker compose -f docker-compose.standalone.yml restart
```

### 更新并重新部署

```bash
docker compose -f docker-compose.standalone.yml up -d --build
```

### 进入容器

```bash
docker exec -it weixintishici-app sh
```

### 备份数据库

```bash
cp data/prompts.db data/prompts.db.backup.$(date +%Y%m%d_%H%M%S)
```

### 恢复数据库

```bash
cp data/prompts.db.backup.YYYYMMDD_HHMMSS data/prompts.db
docker compose -f docker-compose.standalone.yml restart
```

## 生产环境建议

### 1. 安全加固

- 修改默认 JWT_SECRET 为强密码
- 修改默认管理员密码
- 配置 HTTPS（使用 Nginx 反向代理）
- 限制 CORS_ORIGIN 为具体域名

### 2. 性能优化

- 使用外部数据库（PostgreSQL/MySQL）替代 SQLite
- 配置 Redis 缓存
- 启用 CDN 加速静态资源

### 3. 监控

```bash
# 查看 PM2 进程状态
docker exec -it weixintishici-app pm2 list

# 查看资源使用情况
docker stats weixintishici-app
```

### 4. 日志管理

配置日志轮转，避免磁盘空间耗尽：

```bash
# 在宿主机设置日志轮转
cat > /etc/logrotate.d/weixintishici << EOF
/home/zhangdl/Desktop/weixintishici/logs/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 644 root root
}
EOF
```

## 故障排查

### 容器无法启动

```bash
# 查看详细日志
docker compose -f docker-compose.standalone.yml logs app
```

### 数据库连接失败

```bash
# 检查数据库文件权限
ls -la data/prompts.db

# 重新初始化数据库
docker exec -it weixintishici-app sh -c "cd /app/backend && node prisma/seed.js"
```

### 前端无法访问后端 API

检查 `next.config.js` 中的 API 代理配置是否正确。

### 健康检查失败

```bash
# 手动执行健康检查
docker exec -it weixintishici-app wget -O- http://localhost:3001/health
```

## 卸载

```bash
# 停止并删除容器
docker compose -f docker-compose.standalone.yml down

# 删除镜像
docker rmi weixintishici-standalone:latest

# 删除数据（谨慎操作！）
rm -rf data logs config
```

## 技术支持

如遇问题，请检查：
1. Docker 版本是否符合要求
2. 端口是否被占用
3. 磁盘空间是否充足
4. 日志文件中的错误信息
