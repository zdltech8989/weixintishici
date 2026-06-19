# 数据库设计

> 创建时间：2025-06-17  
> 数据库：SQLite（当前） → MySQL（未来）  
> ORM：Prisma

---

## 📊 核心数据表

### 1. 用户表 (User)
```prisma
model User {
  id        String   @id @default(cuid())
  username  String   @unique
  email     String?  @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // 关系
  templates     Template[]
  templateHistories TemplateHistory[]
}
```

### 2. 分类表 (Category)
```prisma
model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  description String?
  color       String?  // 颜色标识
  sort        Int      @default(0) // 排序
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // 关系
  templates Template[]
}
```

### 3. 提示词模板表 (Template)
```prisma
model Template {
  id          String   @id @default(cuid())
  title       String
  description String?
  content     String   // 模板内容（包含占位符）
  placeholders Json?    // 占位符定义 [{name, description, required}]
  version     Int      @default(1)
  isPublished Boolean  @default(false)
  
  // 关联
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])

  // 多对多关系
  keywords    Keyword[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([categoryId])
  @@index([userId])
  @@index([isPublished])
}
```

### 4. 关键字表 (Keyword)
```prisma
model Keyword {
  id        String   @id @default(cuid())
  word      String   @unique
  
  // 多对多关系
  templates Template[]
  
  createdAt DateTime @default(now())
}
```

### 5. 模板历史版本表 (TemplateHistory)
```prisma
model TemplateHistory {
  id        String   @id @default(cuid())
  version   Int
  content   String
  reason    String?  // 版本变更原因
  
  // 关联
  templateId String
  template   Template @relation(fields: [templateId], references: [id], onDelete: Cascade)
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  
  createdAt  DateTime @default(now())

  @@index([templateId])
  @@index([version])
}
```

### 6. Memos配置表 (MemosConfig)
```prisma
model MemosConfig {
  id              String   @id @default(cuid())
  name            String
  apiUrl          String   // Memos API地址
  apiKey          String?  // API密钥
  isActive        Boolean  @default(false)
  
  // 用户配置（可选）
  userId          String?
  user            User?    @relation(fields: [userId], references: [id])
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### 7. 快捷动作表 (QuickAction)
```prisma
model QuickAction {
  id          String   @id @default(cuid())
  name        String
  description String?
  config      Json     // 动作配置
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

---

## 🔗 关系说明

### 多对多关系：Template ↔ Keyword
- 一个模板可以有多个关键字
- 一个关键字可以被多个模板使用

### 一对多关系：Category ↔ Template
- 一个分类可以包含多个模板
- 一个模板属于一个分类

### 一对多关系：User ↔ Template
- 一个用户可以创建多个模板
- 一个模板属于一个用户

### 一对多关系：Template ↔ TemplateHistory
- 一个模板可以有多个历史版本
- 一个历史版本属于一个模板

---

## 📝 占位符格式

模板中的占位符使用 `{{variable}}` 格式，例如：

```text
你是一个{{role}}，请帮我{{task}}。
输入内容：{{input}}
```

占位符定义存储在 `placeholders` 字段（JSON格式）：

```json
[
  {
    "name": "role",
    "description": "角色定义",
    "required": true,
    "default": "AI助手"
  },
  {
    "name": "task",
    "description": "任务描述",
    "required": true
  },
  {
    "name": "input",
    "description": "输入内容",
    "required": true
  }
]
```

---

## 🔍 索引设计

- `Template.categoryId` - 按分类查询
- `Template.userId` - 按用户查询
- `Template.isPublished` - 按发布状态查询
- `TemplateHistory.templateId` - 按模板查询历史
- `TemplateHistory.version` - 按版本号查询
- `Keyword.word` - 关键字唯一索引

---

## 🔄 数据迁移

### SQLite → MySQL 迁移步骤

1. 导出SQLite数据
```bash
npx prisma db pull  # 从SQLite导出
npx prisma db seed  # 生成种子数据
```

2. 修改 `.env` 配置
```env
DATABASE_URL="mysql://user:password@localhost:3306/prompts"
```

3. 重新生成MySQL数据库
```bash
npx prisma db push  # 推送到MySQL
npx prisma db seed  # 导入数据
```

---

## 📦 初始数据

### 默认分类
1. 基础提示词
2. 代码助手
3. 创意写作
4. 学习助手
5. 工作效率

### 示例模板
1. **代码审查助手**
   - 关键字：代码审查, code review, review
   - 占位符：{{code}}, {{language}}

2. **文章摘要**
   - 关键字：摘要, summary, 总结
   - 占位符：{{text}}, {{length}}

3. **翻译助手**
   - 关键字：翻译, translate, translation
   - 占位符：{{text}}, {{from}}, {{to}}

---

## 🚀 Prisma配置示例

### prisma/schema.prisma
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // 当前：sqlite，未来：mysql
  url      = env("DATABASE_URL")
}

// ... models ...
```

### .env (SQLite)
```env
DATABASE_URL="file:./data/prompts.db"
```

### .env (MySQL)
```env
DATABASE_URL="mysql://user:password@localhost:3306/prompts"
```

---

## ✅ 下一步

- [ ] API接口设计
- [ ] 前端页面结构设计
- [ ] 数据库初始化脚本
- [ ] 示例数据导入脚本

---

## 📝 备注

- 数据库文件位置：`data/prompts.db`
- 定期备份：导出为 `.db` 文件
- 版本控制：`TemplateHistory` 表记录所有变更
- Memos集成：通过 `MemosConfig` 表配置多个Memos服务