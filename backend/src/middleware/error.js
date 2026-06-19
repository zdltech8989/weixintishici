// 错误处理中间件
export const errorHandler = (err, req, res, next) => {
  console.error('错误:', err)

  // Prisma 错误处理
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      error: '数据已存在，请勿重复创建'
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: '记录不存在'
    })
  }

  // JWT 错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: '无效的令牌'
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: '令牌已过期'
    })
  }

  // 默认错误
  res.status(err.status || 500).json({
    success: false,
    error: err.message || '服务器内部错误'
  })
}

// 404处理
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在'
  })
}