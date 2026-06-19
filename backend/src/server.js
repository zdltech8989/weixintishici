import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { testConnection } from './database.js'
import { errorHandler, notFoundHandler } from './middleware/error.js'

// 路由
import userRoutes from './routes/userRoutes.js'
import templateRoutes from './routes/templateRoutes.js'
import tagRoutes from './routes/tagRoutes.js'
import templateUsageRoutes from './routes/templateUsageRoutes.js'

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(helmet())
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100 // 每个IP限制100个请求
})
app.use('/api/', limiter)

// Swagger配置
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '提示词管理系统 API',
      version: '1.0.0',
      description: '提示词模板管理系统的API文档'
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: '开发服务器'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: ['./src/routes/*.js']
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// API路由
app.use('/api/user', userRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/template-usage', templateUsageRoutes)

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 错误处理
app.use(notFoundHandler)
app.use(errorHandler)

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection()

    app.listen(PORT, () => {
      console.log(`🚀 服务器运行在 http://localhost:${PORT}`)
      console.log(`📚 API文档: http://localhost:${PORT}/api-docs`)
      console.log(`💚 健康检查: http://localhost:${PORT}/health`)
    })
  } catch (error) {
    console.error('❌ 服务器启动失败:', error)
    process.exit(1)
  }
}

startServer()