#!/bin/bash

# 提示词管理系统 - 单体 Docker 部署脚本

set -e

echo "=== 提示词管理系统 - 单体 Docker 部署 ==="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

# 创建必要的目录
echo "创建必要的目录..."
mkdir -p data logs

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "创建 .env 文件..."
    cat > .env << ENVFILE
# 数据库配置
DATABASE_URL=file:./data/prompts.db

# JWT配置
JWT_SECRET=weixintishici-secret-key-$(openssl rand -hex 16)
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
ENVFILE
    echo ".env 文件已创建"
fi

# 构建并启动服务
echo "构建并启动服务..."
if docker compose version &> /dev/null; then
    docker compose -f docker-compose.standalone.yml up -d --build
else
    docker-compose -f docker-compose.standalone.yml up -d --build
fi

# 等待服务启动
echo "等待服务启动..."
sleep 10

# 检查服务状态
echo ""
echo "=== 检查服务状态 ==="
if docker compose version &> /dev/null; then
    docker compose -f docker-compose.standalone.yml ps
else
    docker-compose -f docker-compose.standalone.yml ps
fi

echo ""
echo "=== 部署完成 ==="
echo ""
echo "访问地址："
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:3001"
echo "  健康检查: http://localhost:3001/health"
echo ""
echo "默认账号："
echo "  用户名: admin"
echo "  密码: admin123"
echo ""
echo "查看日志:"
if docker compose version &> /dev/null; then
    echo "  docker compose -f docker-compose.standalone.yml logs -f"
else
    echo "  docker-compose -f docker-compose.standalone.yml logs -f"
fi
echo ""
echo "停止服务:"
if docker compose version &> /dev/null; then
    echo "  docker compose -f docker-compose.standalone.yml down"
else
    echo "  docker-compose -f docker-compose.standalone.yml down"
fi
echo ""
echo "重启服务:"
if docker compose version &> /dev/null; then
    echo "  docker compose -f docker-compose.standalone.yml restart"
else
    echo "  docker-compose -f docker-compose.standalone.yml restart"
fi
