# 提示词管理系统 - 项目规划

> 创建时间：2025-06-17  
> 状态：需求讨论中

---

## 📋 功能需求

### 1. 提示词模板管理
- ✅ 一个模板对应多个关键字
- ✅ 支持模板占位符（如 `{input}`、`{variable}` 等）
- ✅ 版本控制（支持历史版本查看和回滚）
- 模板分类/标签管理
- 模板搜索和过滤

### 2. Memos集成
- ✅ 通过外部API对接Memos开源笔记系统
- ✅ Memos内容作为提示词的一部分
- 支持关键字检索Memos内容
- 支持选择特定Memos条目
- 📌 **当前状态**：预留接口，Memos服务地址待配置

### 3. 用户界面
- ✅ Web界面
- ✅ 移动端响应式适配
- 直观的模板编辑器
- 关键字管理界面
- Memos内容预览和选择

### 4. 快捷功能
- ✅ 一键复制到剪贴板
- ✅ Toast提示（复制成功/失败）
- ✅ 复制后不关闭界面
- 预览模式
- 快捷键支持

### 5. 数据管理
- ✅ 导入功能（支持JSON/CSV格式）
- ✅ 导出功能（支持JSON/CSV格式）
- 数据备份和恢复
- 批量操作

### 6. API接口
- ✅ 独立RESTful API
- ✅ 方便后期多端原生开发
- API文档（OpenAPI/Swagger）
- 认证和授权机制

---

## 🛠️ 技术栈讨论

### ✅ 最终选择：Node.js全栈

#### 后端
- **Node.js + Express**
  - 部署简单（npm install, npm start）
  - JavaScript/TypeScript生态丰富
  - SQLite/MySQL切换容易
  - API开发快速

- **Prisma ORM**
  - 类型安全
  - 轻松切换数据库（SQLite → MySQL）
  - 自动迁移
  - 优秀的开发者体验

#### 前端
- **Next.js + Tailwind CSS + shadcn/ui**
  - 全栈框架（前后端一体）
  - 移动端响应式设计
  - 内置API路由
  - shadcn/ui提供现代UI组件
  - 支持服务端渲染（SEO友好）

#### 数据库
- **SQLite (当前)**
  - 零配置
  - 单文件存储（便于备份）
  - 轻量级
  - 适合个人/小团队使用

- **MySQL (未来)**
  - 通过Prisma轻松切换
  - 支持更大规模数据
  - 更好的并发性能

#### 部署
- **Docker**
  - 容器化部署
  - 环境隔离
  - 便于迁移和扩展
  - 一键部署

#### 其他
- **剪贴板API**：Clipboard API / navigator.clipboard
- **Toast通知**：React-Toastify / shadcn/ui toast
- **API文档**：Swagger/OpenAPI
- **移动端适配**：Tailwind CSS响应式设计

---

### 备选方案：Python + Vue

#### 后端
- **Python + FastAPI + SQLAlchemy**
  - 部署简单
  - SQLite/MySQL切换容易
  - API开发快速
  - 类型提示增强代码可维护性

#### 前端
- **Vue 3 + Element Plus**
  - 轻量级框架
  - Element Plus提供丰富UI组件
  - 移动端适配良好
  - 学习曲线平缓

#### 数据库
- **SQLite (当前) + SQLAlchemy**
  - 轻松切换到MySQL
  - SQLite文件便于备份
  - 本地存储便于版本控制和备份

---

## 🔄 扩展性设计

### 数据库切换
- 使用ORM抽象层（Prisma/SQLAlchemy）
- 配置化数据库连接
- 提供数据迁移工具

### 多端开发
- 独立API接口
- 移动端适配（响应式设计）
- 预留移动端/桌面端API调用接口
- 考虑未来原生应用开发

### 数据导入导出
- JSON格式（完整数据）
- CSV格式（模板列表）
- 版本化备份
- 增量备份支持

---

## 📦 项目结构建议

```
weixintishici/
├── docs/                  # 文档
│   ├── plan.md           # 项目规划（本文件）
│   ├── api.md            # API文档
│   └── database.md       # 数据库设计
├── backend/              # 后端代码
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── services/     # 业务逻辑
│   │   ├── routes/       # 路由
│   │   └── utils/        # 工具函数
│   ├── prisma/           # Prisma配置
│   └── package.json
├── frontend/             # 前端代码
│   ├── src/
│   │   ├── components/   # 组件
│   │   ├── pages/        # 页面
│   │   ├── api/          # API调用
│   │   └── utils/        # 工具函数
│   └── package.json
└── data/                 # 数据文件
    └── prompts.db        # SQLite数据库
```

---

## ✅ 下一步行动

- [x] 需求讨论
- [x] 确认技术栈（Node.js全栈 + Docker部署）
- [x] 设计数据库Schema
- [x] 设计API接口
- [x] 设计前端页面结构
- [ ] 初始化项目
- [ ] 搭建开发环境
- [ ] 实现后端API
- [ ] 实现前端页面
- [ ] 集成测试
- [ ] 部署上线

---

## 📝 备注

- 部署方案：Docker（可选，简化部署）
- 备份策略：定期导出数据，保留历史版本
- 测试策略：单元测试 + 集成测试
- 性能优化：数据库索引、前端缓存