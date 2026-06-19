import bcrypt from 'bcryptjs'
import prisma from '../src/database.js'

async function main() {
  console.log('🌱 开始播种数据...')

  // 创建默认用户 (管理员)
  const hashedPassword = await bcrypt.hash('a123456', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'zhangdl' },
    update: { role: 'admin' },
    create: {
      username: 'zhangdl',
      password: hashedPassword,
      email: 'zhangdl@example.com',
      role: 'admin'
    }
  })

  console.log('✅ 创建用户:', admin.username, '(角色:', admin.role + ')')

  // 创建备用管理员账号
  const adminPassword = await bcrypt.hash('admin123', 10)
  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { role: 'admin' },
    create: {
      username: 'admin',
      password: adminPassword,
      email: 'admin@example.com',
      role: 'admin'
    }
  })

  console.log('✅ 创建备用管理员:', adminUser.username)

  // 创建示例标签
  const tagWriting = await prisma.tag.upsert({
    where: { name: '写作' },
    update: {},
    create: {
      name: '写作',
      color: '#EF4444',
      userId: admin.id
    }
  })

  const tagCoding = await prisma.tag.upsert({
    where: { name: '编程' },
    update: {},
    create: {
      name: '编程',
      color: '#3B82F6',
      userId: admin.id
    }
  })

  const tagTranslation = await prisma.tag.upsert({
    where: { name: '翻译' },
    update: {},
    create: {
      name: '翻译',
      color: '#10B981',
      userId: admin.id
    }
  })

  console.log('✅ 创建标签:', [tagWriting.name, tagCoding.name, tagTranslation.name].join(', '))

  // 创建示例模板1
  const template1 = await prisma.template.create({
    data: {
      title: 'AI写作助手',
      description: '帮助生成高质量的文章内容',
      content: '你是一个专业的{角色}，擅长{技能}。请根据以下主题：{主题}，写一篇{字数}字的文章。\n\n要求：\n1. 内容要{要求1}\n2. 结构要{要求2}\n3. 风格要{风格}',
      category: '写作',
      userId: admin.id,
      keywords: {
        create: [
          { keyword: '写作' },
          { keyword: 'AI' },
          { keyword: '文章' }
        ]
      },
      tags: {
        create: [
          { tag: { connect: { id: tagWriting.id } } }
        ]
      }
    }
  })

  await prisma.templateVersion.create({
    data: {
      templateId: template1.id,
      version: 1,
      content: template1.content,
      userId: admin.id,
      comment: '初始版本'
    }
  })

  console.log('✅ 创建模板:', template1.title)

  // 创建示例模板2
  const template2 = await prisma.template.create({
    data: {
      title: '代码生成器',
      description: '根据需求自动生成代码',
      content: '作为一名{语言}专家，请实现以下功能：{功能描述}。\n\n技术栈：{技术栈}\n\n要求：\n- 代码要符合最佳实践\n- 添加必要的注释\n- 处理边界情况',
      category: '编程',
      userId: admin.id,
      keywords: {
        create: [
          { keyword: '代码' },
          { keyword: '生成' },
          { keyword: '编程' }
        ]
      },
      tags: {
        create: [
          { tag: { connect: { id: tagCoding.id } } }
        ]
      }
    }
  })

  await prisma.templateVersion.create({
    data: {
      templateId: template2.id,
      version: 1,
      content: template2.content,
      userId: admin.id,
      comment: '初始版本'
    }
  })

  console.log('✅ 创建模板:', template2.title)

  console.log('🎉 数据播种完成！')
  console.log('\n默认账号：')
  console.log('用户名: zhangdl / admin')
  console.log('密码: a123456 / admin123')
}

main()
  .catch((e) => {
    console.error('❌ 播种失败:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })