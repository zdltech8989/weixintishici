import prisma from '../database.js'

// 获取标签列表
export const getTags = async (req, res, next) => {
  try {
    const userId = req.user.id

    const tags = await prisma.tag.findMany({
      where: { userId },
      include: {
        _count: {
          select: { templates: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    res.json({
      success: true,
      data: tags
    })
  } catch (error) {
    next(error)
  }
}

// 创建标签
export const createTag = async (req, res, next) => {
  try {
    const { name, color } = req.body
    const userId = req.user.id

    const tag = await prisma.tag.create({
      data: {
        name,
        color: color || '#3B82F6',
        userId
      }
    })

    res.status(201).json({
      success: true,
      message: '创建成功',
      data: tag
    })
  } catch (error) {
    next(error)
  }
}

// 更新标签
export const updateTag = async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, color } = req.body
    const userId = req.user.id

    // 检查标签是否属于当前用户
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    })

    if (!existingTag) {
      return res.status(404).json({
        success: false,
        error: '标签不存在'
      })
    }

    if (existingTag.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: '无权修改此标签'
      })
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: { name, color }
    })

    res.json({
      success: true,
      message: '更新成功',
      data: tag
    })
  } catch (error) {
    next(error)
  }
}

// 删除标签
export const deleteTag = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // 检查标签是否属于当前用户
    const existingTag = await prisma.tag.findUnique({
      where: { id }
    })

    if (!existingTag) {
      return res.status(404).json({
        success: false,
        error: '标签不存在'
      })
    }

    if (existingTag.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: '无权删除此标签'
      })
    }

    await prisma.tag.delete({
      where: { id }
    })

    res.json({
      success: true,
      message: '删除成功'
    })
  } catch (error) {
    next(error)
  }
}