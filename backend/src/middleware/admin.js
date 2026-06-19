// 管理员权限检查中间件
export const adminMiddleware = (req, res, next) => {
  try {
    // 检查用户是否已认证（在 authMiddleware 之后）
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: '未登录'
      })
    }

    // 检查用户是否是管理员
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '需要管理员权限'
      })
    }

    next()
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '权限检查失败'
    })
  }
}
