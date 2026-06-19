import express from 'express'
import {
  register, login, getProfile, changePassword, updateProfile,
  getUsers, getUserById, createUser, updateUser, deleteUser, resetUserPassword
} from '../controllers/userController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// 公开路由
router.post('/register', register)
router.post('/login', login)

// 需要认证的路由
router.get('/profile', authMiddleware, getProfile)
router.put('/profile', authMiddleware, updateProfile)
router.put('/change-password', authMiddleware, changePassword)

// 用户管理路由 (需要管理员权限)
router.get('/users', authMiddleware, getUsers)
router.get('/users/:id', authMiddleware, getUserById)
router.post('/users', authMiddleware, createUser)
router.put('/users/:id', authMiddleware, updateUser)
router.delete('/users/:id', authMiddleware, deleteUser)
router.put('/users/:id/password', authMiddleware, resetUserPassword)

export default router