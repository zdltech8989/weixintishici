# API接口设计

> 创建时间：2025-06-17  
> API版本：v1  
> 认证方式：JWT Token  
> 文档：Swagger/OpenAPI

---

## 🔐 认证

### 1. 用户注册
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "user",
  "email": "user@example.com",
  "password": "password123"
}

Response 201:
{
  "success": true,
  "message": "注册成功",
  "data": {
    "user": {
      "id": "clxxx",
      "username": "user",
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. 用户登录
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "user",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clxxx",
      "username": "user"
    }
  }
}
```

### 3. 刷新Token
```http
POST /api/v1/auth/refresh
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 📂 分类管理

### 1. 获取所有分类
```http
GET /api/v1/categories
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "name": "基础提示词",
      "description": "常用的基础提示词模板",
      "color": "#3B82F6",
      "sort": 0,
      "templateCount": 10
    }
  ]
}
```

### 2. 创建分类
```http
POST /api/v1/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "新分类",
  "description": "分类描述",
  "color": "#10B981",
  "sort": 10
}

Response 201:
{
  "success": true,
  "data": {
    "id": "clxxx",
    "name": "新分类",
    "description": "分类描述",
    "color": "#10B981",
    "sort": 10
  }
}
```

### 3. 更新分类
```http
PUT /api/v1/categories/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "更新后的名称",
  "description": "更新后的描述",
  "color": "#F59E0B"
}

Response 200:
{
  "success": true,
  "message": "分类更新成功"
}
```

### 4. 删除分类
```http
DELETE /api/v1/categories/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "分类删除成功"
}
```

---

## 📝 模板管理

### 1. 获取模板列表
```http
GET /api/v1/templates?page=1&limit=20&categoryId=xxx&keyword=xxx&search=xxx
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "clxxx",
        "title": "代码审查助手",
        "description": "帮助审查代码质量",
        "content": "你是一个{{role}}，请帮我审查以下{{language}}代码：\n\n{{code}}",
        "placeholders": [
          {
            "name": "role",
            "description": "角色定义",
            "required": true,
            "default": "代码审查专家"
          },
          {
            "name": "language",
            "description": "编程语言",
            "required": true
          },
          {
            "name": "code",
            "description": "代码内容",
            "required": true
          }
        ],
        "version": 1,
        "isPublished": true,
        "category": {
          "id": "clxxx",
          "name": "代码助手"
        },
        "keywords": ["代码审查", "code review", "review"],
        "user": {
          "id": "clxxx",
          "username": "user"
        },
        "createdAt": "2025-06-17T10:00:00Z",
        "updatedAt": "2025-06-17T10:00:00Z"
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

### 2. 获取单个模板
```http
GET /api/v1/templates/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "id": "clxxx",
    "title": "代码审查助手",
    "description": "帮助审查代码质量",
    "content": "你是一个{{role}}，请帮我审查以下{{language}}代码：\n\n{{code}}",
    "placeholders": [...],
    "version": 1,
    "isPublished": true,
    "category": {...},
    "keywords": ["代码审查", "code review"],
    "user": {...},
    "createdAt": "2025-06-17T10:00:00Z",
    "updatedAt": "2025-06-17T10:00:00Z"
  }
}
```

### 3. 创建模板
```http
POST /api/v1/templates
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "新模板",
  "description": "模板描述",
  "content": "你是一个{{role}}，请帮我{{task}}。",
  "placeholders": [
    {
      "name": "role",
      "description": "角色",
      "required": true,
      "default": "AI助手"
    },
    {
      "name": "task",
      "description": "任务",
      "required": true
    }
  ],
  "categoryId": "clxxx",
  "keywords": ["关键字1", "关键字2"],
  "isPublished": true
}

Response 201:
{
  "success": true,
  "message": "模板创建成功",
  "data": {
    "id": "clxxx",
    "title": "新模板",
    "version": 1,
    ...
  }
}
```

### 4. 更新模板
```http
PUT /api/v1/templates/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "更新后的标题",
  "content": "更新后的内容",
  "reason": "优化了提示词结构"  // 版本变更原因
}

Response 200:
{
  "success": true,
  "message": "模板更新成功",
  "data": {
    "id": "clxxx",
    "version": 2,  // 版本号自动递增
    ...
  }
}
```

### 5. 删除模板
```http
DELETE /api/v1/templates/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "模板删除成功"
}
```

---

## 📜 模板版本历史

### 1. 获取模板历史版本
```http
GET /api/v1/templates/:id/history
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "version": 2,
      "content": "更新后的内容",
      "reason": "优化了提示词结构",
      "createdAt": "2025-06-17T11:00:00Z",
      "user": {
        "id": "clxxx",
        "username": "user"
      }
    },
    {
      "id": "clxxx",
      "version": 1,
      "content": "原始内容",
      "reason": null,
      "createdAt": "2025-06-17T10:00:00Z",
      "user": {
        "id": "clxxx",
        "username": "user"
      }
    }
  ]
}
```

### 2. 查看指定版本
```http
GET /api/v1/templates/:id/history/:version
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "id": "clxxx",
    "version": 1,
    "content": "原始内容",
    "reason": null,
    "createdAt": "2025-06-17T10:00:00Z",
    "user": {...}
  }
}
```

### 3. 回滚到指定版本
```http
POST /api/v1/templates/:id/rollback/:version
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "回滚到稳定版本"
}

Response 200:
{
  "success": true,
  "message": "回滚成功",
  "data": {
    "id": "clxxx",
    "version": 3,  // 创建新版本
    ...
  }
}
```

---

## 🔍 关键字管理

### 1. 根据关键字搜索模板
```http
GET /api/v1/templates/search?keyword=代码审查
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "title": "代码审查助手",
      "keywords": ["代码审查", "code review"],
      ...
    }
  ]
}
```

### 2. 获取所有关键字
```http
GET /api/v1/keywords
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "word": "代码审查",
      "templateCount": 5
    }
  ]
}
```

---

## 🚀 提示词生成

### 1. 生成提示词（替换占位符）
```http
POST /api/v1/templates/:id/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "values": {
    "role": "代码审查专家",
    "language": "JavaScript",
    "code": "function add(a, b) { return a + b; }"
  }
}

Response 200:
{
  "success": true,
  "data": {
    "content": "你是一个代码审查专家，请帮我审查以下JavaScript代码：\n\nfunction add(a, b) { return a + b; }",
    "timestamp": "2025-06-17T12:00:00Z"
  }
}
```

### 2. 预览提示词（不保存）
```http
POST /api/v1/templates/:id/preview
Authorization: Bearer <token>
Content-Type: application/json

{
  "values": {
    "role": "代码审查专家",
    "language": "JavaScript",
    "code": "function add(a, b) { return a + b; }"
  }
}

Response 200:
{
  "success": true,
  "data": {
    "content": "你是一个代码审查专家，请帮我审查以下JavaScript代码：\n\nfunction add(a, b) { return a + b; }"
  }
}
```

---

## 📌 Memos集成

### 1. 配置Memos服务
```http
POST /api/v1/memos/config
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "我的Memos",
  "apiUrl": "https://memos.example.com/api/v1",
  "apiKey": "your-api-key"
}

Response 201:
{
  "success": true,
  "message": "Memos配置成功",
  "data": {
    "id": "clxxx",
    "name": "我的Memos",
    "apiUrl": "https://memos.example.com/api/v1"
  }
}
```

### 2. 获取Memos配置列表
```http
GET /api/v1/memos/configs
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "clxxx",
      "name": "我的Memos",
      "apiUrl": "https://memos.example.com/api/v1",
      "isActive": true
    }
  ]
}
```

### 3. 从Memos搜索内容
```http
GET /api/v1/memos/search?keyword=xxx&configId=xxx
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "memos": [
      {
        "id": "1",
        "content": "Memos内容...",
        "tags": ["tag1", "tag2"],
        "createdAt": "2025-06-17T10:00:00Z"
      }
    ]
  }
}
```

### 4. 将Memos内容插入到模板
```http
POST /api/v1/templates/:id/insert-memos
Authorization: Bearer <token>
Content-Type: application/json

{
  "memoIds": ["1", "2"],
  "placeholder": "memos_content"
}

Response 200:
{
  "success": true,
  "data": {
    "content": "你是一个AI助手，请参考以下内容：\n\n{{memos_content}}\n\n然后帮我完成任务。",
    "memos": [
      {
        "id": "1",
        "content": "Memos内容1"
      },
      {
        "id": "2",
        "content": "Memos内容2"
      }
    ]
  }
}
```

---

## 📦 导入导出

### 1. 导出数据（JSON）
```http
GET /api/v1/export?format=json
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "categories": [...],
    "templates": [...],
    "exportedAt": "2025-06-17T12:00:00Z",
    "version": "1.0.0"
  }
}
```

### 2. 导出数据（CSV）
```http
GET /api/v1/export?format=csv
Authorization: Bearer <token>

Response 200:
Content-Type: text/csv

title,description,content,keywords,category
代码审查助手,帮助审查代码质量,你是一个{{role}}...,"代码审查,code review",代码助手
```

### 3. 导入数据（JSON）
```http
POST /api/v1/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "categories": [...],
  "templates": [...]
}

Response 200:
{
  "success": true,
  "message": "导入成功",
  "data": {
    "importedCategories": 5,
    "importedTemplates": 20,
    "skippedItems": 2
  }
}
```

---

## 📊 统计数据

### 1. 获取统计数据
```http
GET /api/v1/stats
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "totalTemplates": 100,
    "totalCategories": 10,
    "totalKeywords": 50,
    "publishedTemplates": 80,
    "recentActivity": [
      {
        "type": "template_created",
        "message": "创建了新模板：代码审查助手",
        "timestamp": "2025-06-17T12:00:00Z"
      }
    ]
  }
}
```

---

## ❌ 错误响应

所有错误响应统一格式：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": {
      "field": "title",
      "message": "标题不能为空"
    }
  }
}
```

### 常见错误码
- `VALIDATION_ERROR` - 参数验证失败
- `NOT_FOUND` - 资源不存在
- `UNAUTHORIZED` - 未授权
- `FORBIDDEN` - 无权限
- `INTERNAL_ERROR` - 服务器内部错误
- `RATE_LIMIT_EXCEEDED` - 请求频率超限

---

## 🚀 下一步

- [ ] 前端页面结构设计
- [ ] Prisma Schema实现
- [ ] API路由实现
- [ ] 数据验证中间件
- [ ] Swagger文档生成

---

## 📝 备注

- 所有POST/PUT/DELETE请求需要认证
- 分页参数：`page`（从1开始）、`limit`（默认20，最大100）
- 时间格式：ISO 8601 (`2025-06-17T10:00:00Z`)
- 请求频率限制：100次/分钟
- 文件上传限制：最大10MB