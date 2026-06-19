@echo off
chcp 65001 >nul
echo 🚀 启动提示词管理系统...

REM 创建必要的目录
if not exist "data" mkdir data
if not exist "backend\data" mkdir backend\data

REM 启动后端
echo 📦 启动后端服务...
cd backend
if not exist "node_modules" (
    echo 📥 安装后端依赖...
    call npm install
)
start "后端服务" cmd /k "npm run dev"
cd ..

REM 等待后端启动
echo ⏳ 等待后端服务启动...
timeout /t 5 /nobreak >nul

REM 启动前端
echo 🎨 启动前端服务...
cd frontend
if not exist "node_modules" (
    echo 📥 安装前端依赖...
    call npm install
)
start "前端服务" cmd /k "npm run dev"
cd ..

echo.
echo ✅ 服务启动完成！
echo.
echo 📍 访问地址：
echo    前端: http://localhost:3000
echo    后端: http://localhost:3001
echo    API文档: http://localhost:3001/api-docs
echo.
echo 🔑 默认账号：
echo    用户名: admin
echo    密码: admin123
echo.
echo 🛑 关闭此窗口不会停止服务，请分别关闭后端和前端窗口
pause