import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/jwt.js'
import prisma from '../database.js'

// 用户注册
export const register = async (req, res, next) => {
  try {
    const { username, password, email } = req.body

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '用户名已存在'
      })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true
      }
    })

    res.status(201).json({
      success: true,
      message: '注册成功',
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// 用户登录
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { username }
    })

    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      })
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '用户名或密码错误'
      })
    }

    // 生成token
    const token = generateToken(user.id)

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

// 获取用户信息
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: {
            templates: true,
            tags: true
          }
        }
      }
    })

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// 修改密码
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      })
    }

    // 验证当前密码
    const isValidPassword = await bcrypt.compare(currentPassword, user.password)
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: '当前密码错误'
      })
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 更新密码
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    })

    res.json({
      success: true,
      message: '密码修改成功'
    })
  } catch (error) {
    next(error)
  }
}

// 更新用户资料
export const updateProfile = async (req, res, next) => {
  try {
    const { email } = req.body
    const userId = req.user.id

    // 更新用户资料
    const user = await prisma.user.update({
      where: { id: userId },
      data: { email },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.json({
      success: true,
      message: '资料更新成功',
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// ========== 用户管理 API (仅管理员) ==========

// 获取所有用户列表
export const getUsers = async (req, res, next) => {
  try {
    const { page = 1, pageSize = 10, search } = req.query
    const skip = (page - 1) * pageSize
    const take = parseInt(pageSize)

    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权访问'
      })
    }

    const where = search
      ? {
          OR: [
            { username: { contains: search } },
            { email: { contains: search } }
          ]
        }
      : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              templates: true,
              tags: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ])

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          pageSize: take,
          total,
          totalPages: Math.ceil(total / take)
        }
      }
    })
  } catch (error) {
    next(error)
  }
}

// 获取单个用户信息
export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params

    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权访问'
      })
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            templates: true,
            tags: true
          }
        }
      }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// 创建用户
export const createUser = async (req, res, next) => {
  try {
    const { username, password, email, role = 'user' } = req.body

    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权创建用户'
      })
    }

    // 检查用户名是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: '用户名已存在'
      })
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        email,
        role
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    res.status(201).json({
      success: true,
      message: '用户创建成功',
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// 更新用户
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params
    const { username, email, role } = req.body

    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权更新用户'
      })
    }

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      })
    }

    // 如果要修改用户名，检查是否重复
    if (username && username !== existingUser.username) {
      const duplicateUser = await prisma.user.findUnique({
        where: { username }
      })

      if (duplicateUser) {
        return res.status(400).json({
          success: false,
          error: '用户名已存在'
        })
      }
    }

    // 防止管理员修改自己的角色为普通用户
    if (id === req.user.id && role !== existingUser.role) {
      return res.status(400).json({
        success: false,
        error: '不能修改自己的角色'
      })
    }

    // 更新用户
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(username && { username }),
        ...(email !== undefined && { email }),
        ...(role && { role })
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    })

    res.json({
      success: true,
      message: '用户更新成功',
      data: user
    })
  } catch (error) {
    next(error)
  }
}

// 删除用户
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params

    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权删除用户'
      })
    }

    // 防止管理员删除自己
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: '不能删除自己'
      })
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      })
    }

    // 删除用户（会级联删除相关数据）
    await prisma.user.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '用户删除成功'
    })
  } catch (error) {
    next(error)
  }
}

// 重置用户密码
export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    // 检查管理员权限
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '无权重置密码'
      })
    }

    // 检查用户是否存在
    const user = await prisma.user.findUnique({
      where: { id }
    })

    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      })
    }

    // 加密新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // 更新密码
    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })

    res.json({
      success: true,
      message: '密码重置成功'
    })
  } catch (error) {
    next(error)
  }
}