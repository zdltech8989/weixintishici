# 前端设计

> 创建时间：2025-06-17  
> 框架：Next.js 14 + Tailwind CSS + shadcn/ui  
> 状态管理：React Context / Zustand  
> 表单：React Hook Form + Zod  
> HTTP客户端：Axios  
> Toast：React-Toastify

---

## 📱 页面结构

### 路由设计
```
/                          # 首页 - 模板列表
├── templates/             # 模板管理
│   ├── new                # 创建模板
│   ├── [id]               # 模板详情
│   └── [id]/edit          # 编辑模板
├── categories/            # 分类管理
│   ├── new                # 创建分类
│   └── [id]               # 分类详情
├── memos/                 # Memos配置
│   ├── configs            # 配置列表
│   └── search             # Memos搜索
├── import-export/         # 导入导出
└── settings/              # 设置
```

---

## 🎨 主要页面设计

### 1. 首页（模板列表）
**布局：**
- 顶部导航栏
- 左侧分类导航
- 中间模板卡片网格
- 右侧搜索和筛选

**功能：**
- 显示所有已发布的模板
- 按分类筛选
- 关键字搜索
- 排序（最新、热门、使用次数）
- 快速复制模板
- 查看模板详情

**组件：**
- `Layout` - 主布局
- `Navbar` - 导航栏
- `CategorySidebar` - 分类侧边栏
- `TemplateCard` - 模板卡片
- `SearchBar` - 搜索框
- `FilterBar` - 筛选栏

### 2. 模板详情页
**布局：**
- 面包屑导航
- 模板标题和描述
- 模板内容预览
- 占位符表单
- 生成按钮
- 复制按钮
- 版本历史标签

**功能：**
- 查看模板完整信息
- 填写占位符值
- 实时预览生成结果
- 一键复制到剪贴板
- Toast提示
- 查看历史版本
- 回滚到指定版本

**组件：**
- `TemplateDetail` - 模板详情主容器
- `TemplateContent` - 模板内容展示
- `PlaceholderForm` - 占位符表单
- `PreviewBox` - 预览框
- `CopyButton` - 复制按钮
- `VersionHistory` - 版本历史
- `Toast` - 提示组件

### 3. 创建/编辑模板
**布局：**
- 表单布局（两列）
- 左侧：基本信息
  - 标题
  - 描述
  - 分类选择
  - 关键字输入
  - 发布状态
- 右侧：模板编辑器
  - 模板内容（支持占位符）
  - 占位符管理
  - 实时预览

**功能：**
- 创建新模板
- 编辑现有模板
- 添加/删除占位符
- 设置占位符属性
  - 名称
  - 描述
  - 是否必填
  - 默认值
- 实时预览
- 自动保存草稿
- 版本变更说明

**组件：**
- `TemplateForm` - 模板表单
- `TemplateEditor` - 模板编辑器
- `PlaceholderManager` - 占位符管理器
- `PlaceholderForm` - 占位符表单
- `TagInput` - 标签输入框（关键字）
- `CategorySelect` - 分类选择器
- `DraftIndicator` - 草稿指示器

### 4. 分类管理页
**布局：**
- 分类列表（卡片或表格）
- 创建分类按钮
- 每个分类卡片
  - 名称
  - 描述
  - 颜色标识
  - 模板数量
  - 操作按钮（编辑、删除）

**功能：**
- 查看所有分类
- 创建新分类
- 编辑分类
- 删除分类
- 拖拽排序
- 颜色选择器

**组件：**
- `CategoryList` - 分类列表
- `CategoryCard` - 分类卡片
- `CategoryForm` - 分类表单
- `ColorPicker` - 颜色选择器
- `DraggableList` - 可拖拽列表

### 5. Memos配置页
**布局：**
- 配置列表
- 创建配置按钮
- 每个配置卡片
  - 名称
  - API地址
  - 连接状态
  - 操作按钮（编辑、删除、测试连接）

**功能：**
- 查看所有Memos配置
- 添加新配置
- 编辑配置
- 删除配置
- 测试连接
- 设置默认配置

**组件：**
- `MemosConfigList` - 配置列表
- `MemosConfigCard` - 配置卡片
- `MemosConfigForm` - 配置表单
- `ConnectionStatus` - 连接状态指示器
- `TestConnectionButton` - 测试连接按钮

### 6. Memos搜索页
**布局：**
- 配置选择器
- 搜索框
- Memos列表
  - 内容预览
  - 标签
  - 创建时间
  - 选择框

**功能：**
- 选择Memos配置
- 搜索Memos内容
- 预览Memos
- 选择多个Memos
- 插入到模板

**组件：**
- `MemosSearch` - Memos搜索主容器
- `MemosConfigSelector` - 配置选择器
- `MemosSearchBar` - 搜索框
- `MemosList` - Memos列表
- `MemosCard` - Memos卡片
- `SelectionBar` - 选择操作栏

### 7. 导入导出页
**布局：**
- 两列布局
  - 左侧：导出
  - 右侧：导入

**功能：**
- 导出为JSON
- 导出为CSV
- 导入JSON文件
- 导入CSV文件
- 查看导入预览
- 确认导入
- 导入历史

**组件：**
- `ImportExport` - 主容器
- `ExportSection` - 导出区域
- `ImportSection` - 导入区域
- `FileUpload` - 文件上传
- `ImportPreview` - 导入预览
- `ImportHistory` - 导入历史

### 8. 设置页
**布局：**
- 分组设置
  - 账户设置
  - 界面设置
  - API设置
  - 数据管理

**功能：**
- 修改用户信息
- 修改密码
- 主题切换（深色/浅色）
- 语言切换
- API密钥管理
- 数据备份
- 数据恢复
- 清除缓存

**组件：**
- `Settings` - 主容器
- `AccountSettings` - 账户设置
- `AppearanceSettings` - 界面设置
- `APISettings` - API设置
- `DataSettings` - 数据管理
- `ThemeToggle` - 主题切换
- `LanguageSelect` - 语言选择

---

## 🎨 UI组件库

### 基础组件
- `Button` - 按钮
- `Input` - 输入框
- `Textarea` - 多行输入框
- `Select` - 下拉选择
- `Checkbox` - 复选框
- `Radio` - 单选框
- `Switch` - 开关
- `Slider` - 滑块
- `DatePicker` - 日期选择器

### 布局组件
- `Card` - 卡片
- `Dialog` - 对话框
- `DropdownMenu` - 下拉菜单
- `Tabs` - 标签页
- `Accordion` - 手风琴
- `Tooltip` - 工具提示
- `Popover` - 弹出框

### 反馈组件
- `Toast` - 提示
- `Alert` - 警告
- `Loading` - 加载中
- `Skeleton` - 骨架屏
- `Progress` - 进度条

### 数据展示组件
- `Table` - 表格
- `Badge` - 徽章
- `Avatar` - 头像
- `Tag` - 标签
- `Pagination` - 分页

---

## 🎨 设计规范

### 颜色系统
```css
/* 主色调 */
--primary-500: #3B82F6;
--primary-600: #2563EB;
--primary-700: #1D4ED8;

/* 成功色 */
--success-500: #10B981;
--success-600: #059669;

/* 警告色 */
--warning-500: #F59E0B;
--warning-600: #D97706;

/* 错误色 */
--error-500: #EF4444;
--error-600: #DC2626;

/* 中性色 */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-200: #E5E7EB;
--gray-300: #D1D5DB;
--gray-400: #9CA3AF;
--gray-500: #6B7280;
--gray-600: #4B5563;
--gray-700: #374151;
--gray-800: #1F2937;
--gray-900: #111827;
```

### 间距系统
```css
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
```

### 字体系统
```css
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;   /* 14px */
--font-size-base: 1rem;     /* 16px */
--font-size-lg: 1.125rem;   /* 18px */
--font-size-xl: 1.25rem;    /* 20px */
--font-size-2xl: 1.5rem;    /* 24px */
--font-size-3xl: 1.875rem;  /* 30px */
--font-size-4xl: 2.25rem;   /* 36px */
```

### 圆角系统
```css
--radius-sm: 0.25rem;   /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* 完全圆角 */
```

### 阴影系统
```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
```

---

## 📱 响应式设计

### 断点
```css
/* 移动端 */
--breakpoint-sm: 640px;   /* 小屏手机 */
--breakpoint-md: 768px;   /* 平板 */
--breakpoint-lg: 1024px;  /* 笔记本 */
--breakpoint-xl: 1280px;  /* 桌面 */
--breakpoint-2xl: 1536px; /* 大屏桌面 */
```

### 布局策略
- **移动端**（< 768px）
  - 单列布局
  - 侧边栏折叠成抽屉
  - 模板卡片单列

- **平板**（768px - 1024px）
  - 两列布局
  - 侧边栏可折叠
  - 模板卡片两列

- **桌面**（> 1024px）
  - 三列布局
  - 侧边栏固定
  - 模板卡片三列

---

## ⚡ 性能优化

### 代码分割
```javascript
// 动态导入页面组件
const TemplateDetail = lazy(() => import('@/pages/templates/[id]'))
const TemplateForm = lazy(() => import('@/pages/templates/new'))
```

### 图片优化
- 使用Next.js Image组件
- 懒加载
- 响应式图片

### 缓存策略
- 使用React Query缓存API响应
- 本地存储用户偏好
- Service Worker缓存静态资源

### 加载优化
- 骨架屏
- 进度指示器
- 优先加载关键资源

---

## 🔐 认证流程

### 登录流程
1. 用户输入用户名和密码
2. 调用 `/api/v1/auth/login`
3. 保存Token到localStorage
4. 更新认证状态
5. 重定向到首页

### Token刷新
1. 每次请求携带Token
2. Token过期时自动刷新
3. 刷新失败则跳转登录页

### 权限控制
```javascript
// 路由守卫
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  
  return children
}
```

---

## 🎯 状态管理

### 全局状态
```javascript
// AuthContext
{
  user: User | null,
  token: string | null,
  isAuthenticated: boolean,
  login: (credentials) => Promise<void>,
  logout: () => void,
  refreshToken: () => Promise<void>
}

// AppContext
{
  theme: 'light' | 'dark',
  language: 'zh-CN' | 'en-US',
  toggleTheme: () => void,
  setLanguage: (lang) => void
}
```

### 页面状态
```javascript
// 使用React Query管理数据
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['templates', page, filters],
  queryFn: () => fetchTemplates(page, filters)
})

const { mutate: createTemplate } = useMutation({
  mutationFn: (data) => createTemplate(data),
  onSuccess: () => {
    queryClient.invalidateQueries(['templates'])
    toast.success('创建成功')
  }
})
```

---

## ✅ 下一步

- [ ] 创建Next.js项目
- [ ] 配置Tailwind CSS
- [ ] 安装shadcn/ui
- [ ] 实现认证流程
- [ ] 实现首页和模板列表
- [ ] 实现模板详情和生成功能
- [ ] 实现模板创建和编辑
- [ ] 实现分类管理
- [ ] 实现Memos集成
- [ ] 实现导入导出
- [ ] 实现设置页面
- [ ] 移动端适配
- [ ] 性能优化

---

## 📝 备注

- 使用TypeScript增强类型安全
- 使用ESLint和Prettier保持代码风格
- 使用Jest和Testing Library进行单元测试
- 使用Playwright进行端到端测试
- 使用GitHub Actions进行CI/CD