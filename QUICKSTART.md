# 提示词管理系统 - 快速开始

## 📦 项目结构

```
weixintishici/
├── backend/          # 后端API服务
├── frontend/         # 前端Web应用
├── data/            # 数据库文件
└── docs/            # 项目文档
```

## 🚀 快速启动

### 1. 启动后端服务

```bash
cd backend
npm install
npm run dev
```

后端将在 http://localhost:3001 启动

API文档：http://localhost:3001/api-docs

### 2. 启动前端服务

```bash
cd frontend
npm install
npm run dev
```

前端将在 http://localhost:3000 启动

## 🔑 默认账号

- 用户名：`admin`
- 密码：`admin123`

## 📝 主要功能

- ✅ 提示词模板管理
- ✅ 关键字搜索
- ✅ 标签分类
- ✅ 版本控制
- ✅ 一键复制
- ✅ Memos集成（待配置）

## 🛠️ 技术栈

- **后端**：Node.js + Express + Prisma + SQLite
- **前端**：Next.js 14 + React + TypeScript + Tailwind CSS
- **数据库**：SQLite

## 📚 详细文档

详见 [docs](./docs) 目录