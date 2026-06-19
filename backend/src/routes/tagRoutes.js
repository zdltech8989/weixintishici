import express from 'express'
import { getTags, createTag, updateTag, deleteTag } from '../controllers/tagController.js'
import { authMiddleware } from '../middleware/auth.js'
import { adminMiddleware } from '../middleware/admin.js'

const router = express.Router()

// 所有路由都需要认证
router.use(authMiddleware)

// 获取标签 - 所有认证用户都可以
router.get('/', getTags)

// 创建、更新、删除标签 - 需要管理员权限
router.post('/', adminMiddleware, createTag)
router.put('/:id', adminMiddleware, updateTag)
router.delete('/:id', adminMiddleware, deleteTag)

export default router