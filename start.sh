#!/bin/bash

echo "🚀 启动提示词管理系统..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js >= 18.x"
    exit 1
fi

# 创建必要的目录
mkdir -p data backend/data

# 启动后端
echo "📦 启动后端服务..."
cd backend
if [ ! -d "node_modules" ]; then
    echo "📥 安装后端依赖..."
    npm install
fi
npm run dev &
BACKEND_PID=$!
cd ..

# 等待后端启动
echo "⏳ 等待后端服务启动..."
sleep 5

# 启动前端
echo "🎨 启动前端服务..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "📥 安装前端依赖..."
    npm install
fi
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ 服务启动完成！"
echo ""
echo "📍 访问地址："
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:3001"
echo "   API文档: http://localhost:3001/api-docs"
echo ""
echo "🔑 默认账号："
echo "   用户名: admin"
echo "   密码: admin123"
echo ""
echo "🛑 按 Ctrl+C 停止所有服务"

# 等待信号
wait $BACKEND_PID $FRONTEND_PID