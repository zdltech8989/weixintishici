'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Search, Copy, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Header } from "@/components/layout/header"
import { PageContainer } from "@/components/layout/page-container"
import { LoadingSpinner } from "@/components/layout/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Template {
  id: string
  title: string
  description: string
  content: string
  category: string
  keywords: Array<{ keyword: string }>
  tags: Array<{ tag: { name: string; color: string } }>
  createdAt: string
  updatedAt: string
}

export default function TemplatesPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('')

  React.useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchTemplates()
  }, [router])

  React.useEffect(() => {
    if (!isLoading) {
      const timeoutId = setTimeout(() => {
        fetchTemplates()
      }, 300)
      return () => clearTimeout(timeoutId)
    }
  }, [searchQuery, selectedCategory])

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (searchQuery) params.append('keyword', searchQuery)
      if (selectedCategory) params.append('category', selectedCategory)

      const response = await fetch(`/api/templates?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (data.success) {
        setTemplates(data.data.templates)
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载模板列表",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async (content: string, title: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast({
        title: "复制成功",
        description: `${title} 已复制到剪贴板`,
      })
    } catch (error) {
      toast({
        title: "复制失败",
        description: "无法复制到剪贴板",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <PageContainer>
        {/* 搜索和筛选 */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="搜索模板、关键字..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            value={selectedCategory}
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="全部分类" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">全部分类</SelectItem>
              <SelectItem value="写作">写作</SelectItem>
              <SelectItem value="编程">编程</SelectItem>
              <SelectItem value="翻译">翻译</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 模板列表 */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-[240px]">
                <CardHeader>
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-full mt-2" />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-lg mb-4">暂无模板</p>
              <Button
                onClick={() => router.push('/templates/new')}
                variant="outline"
              >
                创建第一个模板 →
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="hover:shadow-lg transition-shadow cursor-pointer group"
              >
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {template.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {template.description || '暂无描述'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map(({ tag }) => (
                      <Badge
                        key={tag.name}
                        variant="secondary"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          border: `1px solid ${tag.color}40`,
                        }}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.keywords.map((kw) => (
                      <Badge key={kw.keyword} variant="outline">
                        {kw.keyword}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleCopy(template.content, template.title)}
                      size="sm"
                      className="flex-1"
                    >
                      <Copy className="mr-2 h-3 w-3" />
                      复制
                    </Button>
                    <Button
                      onClick={() => router.push(`/templates/${template.id}`)}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      <Edit className="mr-2 h-3 w-3" />
                      编辑
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </PageContainer>
    </div>
  )
}