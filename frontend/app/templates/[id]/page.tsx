'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Copy, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { PageContainer } from "@/components/layout/page-container"
import { LoadingSpinner } from "@/components/layout/loading-spinner"
import { useToast } from "@/components/ui/use-toast"

interface Tag {
  id: string
  name: string
  color: string
}

export default function TemplateEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const isNew = params.id === 'new'
  const [isLoading, setIsLoading] = React.useState(!isNew)
  const [isSaving, setIsSaving] = React.useState(false)
  const [tags, setTags] = React.useState<Tag[]>([])

  const [formData, setFormData] = React.useState({
    title: '',
    description: '',
    content: '',
    category: '',
    keywords: '',
    tags: [] as string[]
  })

  React.useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    if (!isNew) {
      fetchTemplate()
    }
    fetchTags()
  }, [router, isNew, params.id])

  const fetchTemplate = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/templates/${params.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        const template = data.data
        setFormData({
          title: template.title,
          description: template.description || '',
          content: template.content,
          category: template.category || '',
          keywords: template.keywords.map((k: { keyword: string }) => k.keyword).join(', '),
          tags: template.tags.map((t: { tag: { name: string } }) => t.tag.name)
        })
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载模板数据",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTags = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tags', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch tags')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const token = localStorage.getItem('token')
      const payload = {
        title: formData.title,
        description: formData.description,
        content: formData.content,
        category: formData.category,
        keywords: formData.keywords.split(',').map(k => k.trim()).filter(k => k),
        tags: formData.tags
      }

      const url = isNew
        ? '/api/templates'
        : `/api/templates/${params.id}`

      const response = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: isNew ? "创建成功" : "更新成功",
          description: `模板"${formData.title}"已保存`,
        })
        router.push('/templates')
      } else {
        toast({
          title: "保存失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "网络错误",
        description: "无法保存模板",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formData.content)
      toast({
        title: "复制成功",
        description: "内容已复制到剪贴板",
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      })
    }
  }

  const toggleTag = (tagName: string) => {
    if (formData.tags.includes(tagName)) {
      setFormData({
        ...formData,
        tags: formData.tags.filter(t => t !== tagName)
      })
    } else {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagName]
      })
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push('/templates')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </Button>
          <h1 className="text-xl font-semibold">
            {isNew ? '新建模板' : '编辑模板'}
          </h1>
          <div className="w-[80px]"></div>
        </div>
      </header>

      <PageContainer>
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          {/* 基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>填写模板的基本信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">标题 *</Label>
                <Input
                  id="title"
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="请输入模板标题"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="请输入模板描述"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">分类</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="请选择分类" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">请选择分类</SelectItem>
                      <SelectItem value="写作">写作</SelectItem>
                      <SelectItem value="编程">编程</SelectItem>
                      <SelectItem value="翻译">翻译</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">关键字</Label>
                  <Input
                    id="keywords"
                    type="text"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                    placeholder="例如：AI, 写作, 文章"
                  />
                  <p className="text-xs text-muted-foreground">用逗号分隔多个关键字</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 标签选择 */}
          <Card>
            <CardHeader>
              <CardTitle>标签</CardTitle>
              <CardDescription>选择模板的标签</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => {
                  const isSelected = formData.tags.includes(tag.name)
                  return (
                    <Badge
                      key={tag.id}
                      variant={isSelected ? "default" : "outline"}
                      className={`cursor-pointer transition-all ${
                        isSelected
                          ? ""
                          : "hover:bg-accent hover:text-accent-foreground"
                      }`}
                      style={
                        isSelected
                          ? { backgroundColor: tag.color, color: "white", border: "none" }
                          : { borderColor: tag.color, color: tag.color }
                      }
                      onClick={() => toggleTag(tag.name)}
                    >
                      {tag.name}
                    </Badge>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 模板内容 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>提示词内容</CardTitle>
                  <CardDescription>输入模板的提示词内容</CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  复制
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                id="content"
                required
                rows={15}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="请输入提示词内容，支持占位符如 {输入}, {主题} 等"
                className="font-mono text-sm"
              />
              <p className="mt-2 text-sm text-muted-foreground">
                💡 提示：可以使用 {"{变量名}"} 作为占位符，例如 {"{主题}"}, {"{字数}"} 等
              </p>
            </CardContent>
          </Card>

          <Separator />

          {/* 操作按钮 */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSaving}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  保存中...
                </>
              ) : (
                "保存"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/templates')}
              className="flex-1"
            >
              取消
            </Button>
          </div>
        </form>
      </PageContainer>
    </div>
  )
}