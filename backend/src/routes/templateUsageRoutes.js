import express from 'express'
import { authMiddleware } from '../middleware/auth.js'
import { saveUsageController, getUsageHistoryController, getUsageByIdController, deleteUsageController } from '../controllers/templateUsageController.js'

const router = express.Router()

// 保存模板使用记录
router.post('/', authMiddleware, saveUsageController)

// 获取用户的使用记录
router.get('/', authMiddleware, getUsageHistoryController)

// 获取单条使用记录
router.get('/:id', authMiddleware, getUsageByIdController)

// 删除使用记录
router.delete('/:id', authMiddleware, deleteUsageController)

export default router
