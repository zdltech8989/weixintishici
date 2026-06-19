#!/bin/bash

# 提示词管理系统 - Docker 部署脚本

set -e

echo "=== 提示词管理系统 - Docker 部署 ==="

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo "错误: Docker 未安装，请先安装 Docker"
    exit 1
fi

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "错误: Docker Compose 未安装，请先安装 Docker Compose"
    exit 1
fi

# 创建必要的目录
echo "创建必要的目录..."
mkdir -p data logs nginx/ssl

# 检查环境变量文件
if [ ! -f .env ]; then
    echo "创建 .env 文件..."
    cp .env.example .env
    echo "警告: 请修改 .env 文件中的 JWT_SECRET"
fi

# 初始化数据库
echo "初始化数据库..."
if [ ! -f data/prompts.db ]; then
    docker-compose run --rm backend npx prisma db push
    docker-compose run --rm backend npm run seed
    echo "数据库初始化完成"
fi

# 构建并启动服务
echo "构建并启动服务..."
if docker compose version &> /dev/null; then
    docker compose up -d --build
else
    docker-compose up -d --build
fi

echo ""
echo "=== 部署完成 ==="
echo ""
echo "访问地址："
echo "  前端: http://localhost:3000"
echo "  后端: http://localhost:3001"
echo "  API文档: http://localhost:3001/api-docs"
echo ""
echo "默认账号："
echo "  用户名: admin"
echo "  密码: admin123"
echo ""
echo "查看日志:"
if docker compose version &> /dev/null; then
    echo "  docker compose logs -f"
else
    echo "  docker-compose logs -f"
fi
echo ""
echo "停止服务:"
if docker compose version &> /dev/null; then
    echo "  docker compose down"
else
    echo "  docker-compose down"
fi
