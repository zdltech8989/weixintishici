import express from 'express'
import {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  rollbackVersion
} from '../controllers/templateController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// 所有路由都需要认证
router.use(authMiddleware)

router.get('/', getTemplates)
router.get('/:id', getTemplate)
router.post('/', createTemplate)
router.put('/:id', updateTemplate)
router.delete('/:id', deleteTemplate)
router.post('/:id/rollback/:version', rollbackVersion)

export default router