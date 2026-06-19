import prisma from '../database.js'

// 获取模板列表
export const getTemplates = async (req, res, next) => {
  try {
    const { keyword, category, tag, page = 1, pageSize = 10 } = req.query
    const userId = req.user.id

    const skip = (page - 1) * pageSize
    const take = parseInt(pageSize)

    // 构建查询条件
    const where = { userId }

    if (category) {
      where.category = category
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword } },
        { description: { contains: keyword } },
        { content: { contains: keyword } },
        { keywords: { some: { keyword: { contains: keyword } } } }
      ]
    }

    if (tag) {
      where.tags = {
        some: {
          tag: { name: tag }
        }
      }
    }

    // 查询模板
    const [templates, total] = await Promise.all([
      prisma.template.findMany({
        where,
        skip,
        take,
        include: {
          keywords: true,
          tags: {
            include: { tag: true }
          }
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.template.count({ where })
    ])

    res.json({
      success: true,
      data: {
        templates,
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

// 获取单个模板
export const getTemplate = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const template = await prisma.template.findFirst({
      where: { id, userId },
      include: {
        keywords: true,
        tags: {
          include: { tag: true }
        },
        versions: {
          take: 10,
          orderBy: { version: 'desc' }
        }
      }
    })

    if (!template) {
      return res.status(404).json({
        success: false,
        error: '模板不存在'
      })
    }

    res.json({
      success: true,
      data: template
    })
  } catch (error) {
    next(error)
  }
}

// 创建模板
export const createTemplate = async (req, res, next) => {
  try {
    const { title, description, content, category, keywords, tags } = req.body
    const userId = req.user.id

    // 创建模板
    const template = await prisma.template.create({
      data: {
        title,
        description,
        content,
        category,
        userId,
        keywords: {
          create: (keywords || []).map(keyword => ({ keyword }))
        },
        tags: {
          create: (tags || []).map(tag => ({
            tag: {
              connectOrCreate: {
                where: { name: tag },
                create: { name: tag, userId }
              }
            }
          }))
        }
      },
      include: {
        keywords: true,
        tags: {
          include: { tag: true }
        }
      }
    })

    // 创建初始版本
    await prisma.templateVersion.create({
      data: {
        templateId: template.id,
        version: 1,
        content: template.content,
        userId,
        comment: '初始版本'
      }
    })

    res.status(201).json({
      success: true,
      message: '创建成功',
      data: template
    })
  } catch (error) {
    next(error)
  }
}

// 更新模板
export const updateTemplate = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, description, content, category, keywords, tags } = req.body
    const userId = req.user.id

    // 获取当前版本号
    const currentVersion = await prisma.templateVersion.count({
      where: { templateId: id }
    })

    // 更新模板
    const template = await prisma.template.update({
      where: { id },
      data: {
        title,
        description,
        content,
        category,
        keywords: {
          deleteMany: {},
          create: (keywords || []).map(keyword => ({ keyword }))
        },
        tags: {
          deleteMany: {},
          create: (tags || []).map(tag => ({
            tag: {
              connectOrCreate: {
                where: { name: tag },
                create: { name: tag, userId }
              }
            }
          }))
        }
      },
      include: {
        keywords: true,
        tags: {
          include: { tag: true }
        }
      }
    })

    // 创建新版本
    await prisma.templateVersion.create({
      data: {
        templateId: id,
        version: currentVersion + 1,
        content: template.content,
        userId,
        comment: '更新版本'
      }
    })

    res.json({
      success: true,
      message: '更新成功',
      data: template
    })
  } catch (error) {
    next(error)
  }
}

// 删除模板
export const deleteTemplate = async (req, res, next) => {
  try {
    const { id } = req.params

    await prisma.template.delete({
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

// 回滚到历史版本
export const rollbackVersion = async (req, res, next) => {
  try {
    const { id, version } = req.params
    const userId = req.user.id

    // 获取历史版本
    const versionRecord = await prisma.templateVersion.findFirst({
      where: {
        templateId: id,
        version: parseInt(version)
      }
    })

    if (!versionRecord) {
      return res.status(404).json({
        success: false,
        error: '版本不存在'
      })
    }

    // 获取当前版本号
    const currentVersion = await prisma.templateVersion.count({
      where: { templateId: id }
    })

    // 更新模板内容
    const template = await prisma.template.update({
      where: { id },
      data: { content: versionRecord.content }
    })

    // 创建新版本
    await prisma.templateVersion.create({
      data: {
        templateId: id,
        version: currentVersion + 1,
        content: versionRecord.content,
        userId,
        comment: `回滚到版本 ${version}`
      }
    })

    res.json({
      success: true,
      message: '回滚成功',
      data: template
    })
  } catch (error) {
    next(error)
  }
}