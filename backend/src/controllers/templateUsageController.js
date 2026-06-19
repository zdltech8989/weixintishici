import prisma from '../database.js'

// 保存模板使用记录
export const saveUsageController = async (req, res, next) => {
  try {
    const { templateId, templateTitle, replacements, result } = req.body
    const userId = req.user.id

    const usage = await prisma.templateUsage.create({
      data: {
        templateId,
        templateTitle,
        replacements: JSON.stringify(replacements),
        result,
        userId
      }
    })

    res.json({
      success: true,
      message: '保存成功',
      data: usage
    })
  } catch (error) {
    next(error)
  }
}

// 获取用户的使用记录
export const getUsageHistoryController = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { page = 1, pageSize = 10, templateId } = req.query

    const skip = (page - 1) * pageSize
    const take = parseInt(pageSize)

    const where = { userId }
    if (templateId) {
      where.templateId = templateId
    }

    const [records, total] = await Promise.all([
      prisma.templateUsage.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.templateUsage.count({ where })
    ])

    // 解析 replacements JSON
    const recordsWithParsed = records.map(record => ({
      ...record,
      replacements: JSON.parse(record.replacements)
    }))

    res.json({
      success: true,
      data: {
        records: recordsWithParsed,
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

// 获取单条使用记录
export const getUsageByIdController = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    const record = await prisma.templateUsage.findFirst({
      where: { id, userId }
    })

    if (!record) {
      return res.status(404).json({
        success: false,
        error: '记录不存在'
      })
    }

    res.json({
      success: true,
      data: {
        ...record,
        replacements: JSON.parse(record.replacements)
      }
    })
  } catch (error) {
    next(error)
  }
}

// 删除使用记录
export const deleteUsageController = async (req, res, next) => {
  try {
    const { id } = req.params
    const userId = req.user.id

    // 检查记录是否存在且属于当前用户
    const record = await prisma.templateUsage.findFirst({
      where: { id, userId }
    })

    if (!record) {
      return res.status(404).json({
        success: false,
        error: '记录不存在'
      })
    }

    // 删除记录
    await prisma.templateUsage.delete({
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
