import { verifyToken } from '../utils/jwt.js'
import prisma from '../database.js'

// 认证中间件
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: '未提供认证令牌'
      })
    }

    const token = authHeader.substring(7)
    const decoded = verifyToken(token)

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: '无效的认证令牌'
      })
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, username: true, email: true, role: true }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在'
      })
    }

    // 将用户信息附加到请求对象
    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: '认证失败'
    })
  }
}