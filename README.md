# 提示词管理系统

> 一个强大的提示词模板管理工具，支持多关键字检索、版本控制、Memos集成和一键复制功能。

---

## 📋 项目概述

### 核心功能
- ✅ 提示词模板管理（多关键字、占位符、版本控制）
- ✅ Memos API集成
- ✅ Web界面 + 移动端适配
- ✅ 一键复制 + Toast提示
- ✅ 导入导出功能
- ✅ 独立API接口

### 技术栈
- **后端**：Node.js + Express + Prisma ORM
- **前端**：Next.js 14 + Tailwind CSS + shadcn/ui
- **数据库**：SQLite（当前）→ MySQL（未来）
- **部署**：Docker容器化部署

---

## 📚 文档

- **[项目规划](./docs/plan.md)** - 需求分析、技术选型、项目结构
- **[数据库设计](./docs/database.md)** - 数据模型、关系设计、迁移方案
- **[API接口设计](./docs/api.md)** - RESTful API设计、认证、错误处理
- **[前端设计](./docs/frontend.md)** - 页面结构、UI组件、响应式设计

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.x
- Docker >= 20.x
- Docker Compose >= 2.x

### 安装步骤

1. **克隆仓库**
```bash
git clone <repository-url>
cd weixintishici
```

2. **安装依赖**
```bash
# 后端
cd backend
npm install

# 前端
cd ../frontend
npm install
```

3. **配置环境变量**
```bash
# 后端
cd backend
cp .env.example .env
# 编辑 .env 文件，配置数据库和其他环境变量

# 前端
cd ../frontend
cp .env.example .env.local
# 编辑 .env.local 文件，配置API地址
```

4. **初始化数据库**
```bash
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **启动开发服务器**
```bash
# 启动后端
cd backend
npm run dev

# 启动前端（新终端）
cd frontend
npm run dev
```

6. **访问应用**
- 前端：http://localhost:3000
- 后端API：http://localhost:3001
- API文档：http://localhost:3001/api-docs

---

## 🐳 Docker部署

### 使用Docker Compose

1. **构建镜像**
```bash
docker-compose build
```

2. **启动服务**
```bash
docker-compose up -d
```

3. **查看日志**
```bash
docker-compose logs -f
```

4. **停止服务**
```bash
docker-compose down
```

### 环境变量配置

```env
# 数据库配置
DATABASE_URL="file:./data/prompts.db"

# JWT密钥
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Memos配置（可选）
MEMOS_API_URL="https://memos.example.com/api/v1"
MEMOS_API_KEY="your-api-key"

# 服务端口
PORT=3001
FRONTEND_PORT=3000
```

---

## 📁 项目结构

```
weixintishici/
├── docs/                  # 文档
│   ├── plan.md           # 项目规划
│   ├── database.md       # 数据库设计
│   ├── api.md            # API接口设计
│   └── frontend.md       # 前端设计
├── backend/              # 后端代码
│   ├── src/
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── services/     # 业务逻辑
│   │   ├── routes/       # 路由
│   │   ├── middleware/   # 中间件
│   │   └── utils/        # 工具函数
│   ├── prisma/           # Prisma配置
│   │   └── schema.prisma
│   ├── data/             # 数据文件
│   │   └── prompts.db    # SQLite数据库
│   ├── package.json
│   └── Dockerfile
├── frontend/             # 前端代码
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # React组件
│   │   ├── lib/          # 工具库
│   │   └── styles/       # 样式文件
│   ├── public/           # 静态资源
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml    # Docker编排配置
├── .env.example          # 环境变量示例
└── README.md             # 项目说明
```

---

## 🔧 开发指南

### 后端开发

**创建新API路由**
```javascript
// src/routes/your-route.js
import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { yourController } from '../controllers/your-controller.js'

const router = express.Router()

router.get('/', authMiddleware, yourController.getAll)
router.post('/', authMiddleware, yourController.create)

export default router
```

**创建新控制器**
```javascript
// src/controllers/your-controller.js
export const yourController = {
  getAll: async (req, res) => {
    try {
      const data = await yourService.getAll()
      res.json({ success: true, data })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  },
  
  create: async (req, res) => {
    try {
      const data = await yourService.create(req.body)
      res.status(201).json({ success: true, message: '创建成功', data })
    } catch (error) {
      res.status(500).json({ success: false, error: error.message })
    }
  }
}
```

### 前端开发

**创建新页面**
```javascript
// src/app/your-page/page.js
export default function YourPage() {
  return (
    <div>
      <h1>你的页面</h1>
      {/* 页面内容 */}
    </div>
  )
}
```

**使用React Query获取数据**
```javascript
import { useQuery } from '@tanstack/react-query'
import { fetchTemplates } from '@/lib/api/templates'

export default function TemplateList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['templates'],
    queryFn: fetchTemplates
  })

  if (isLoading) return <div>加载中...</div>
  if (error) return <div>加载失败</div>

  return (
    <div>
      {data.map(template => (
        <TemplateCard key={template.id} template={template} />
      ))}
    </div>
  )
}
```

---

## 🧪 测试

### 后端测试
```bash
cd backend
npm test
```

### 前端测试
```bash
cd frontend
npm test
```

### E2E测试
```bash
npm run test:e2e
```

---

## 📊 API文档

完整的API文档请查看：[API接口设计](./docs/api.md)

在线Swagger文档（启动服务后访问）：http://localhost:3001/api-docs

---

## 🔐 安全

- JWT Token认证
- 密码加密存储（bcrypt）
- 请求频率限制
- CORS配置
- SQL注入防护（Prisma ORM）
- XSS防护

---

## 📈 性能优化

- 数据库索引优化
- API响应缓存
- 前端代码分割
- 图片懒加载
- CDN加速（可选）

---

## 🔄 数据迁移

### SQLite → MySQL

1. **导出SQLite数据**
```bash
cd backend
npx prisma db pull
```

2. **修改数据库配置**
```env
# .env
DATABASE_URL="mysql://user:password@localhost:3306/prompts"
```

3. **推送到MySQL**
```bash
npx prisma db push
npx prisma db seed
```

---

## 🤝 贡献

欢迎提交Issue和Pull Request！

---

## 📝 许可证

MIT License

---

## 📞 联系

如有问题，请提交Issue或联系维护者。

---

## 🎉 致谢

感谢所有贡献者的支持！

---

**最后更新**：2025-06-17