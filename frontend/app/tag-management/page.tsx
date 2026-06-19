'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Palette, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { PageContainer } from "@/components/layout/page-container"
import { LoadingSpinner } from "@/components/layout/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface Tag {
  id: string
  name: string
  color: string
}

// 预定义颜色选项
const COLOR_OPTIONS = [
  "#3B82F6", // 蓝色
  "#10B981", // 绿色
  "#F59E0B", // 橙色
  "#EF4444", // 红色
  "#8B5CF6", // 紫色
  "#EC4899", // 粉色
  "#06B6D4", // 青色
  "#84CC16", // 黄绿色
  "#64748B", // 灰色
  "#1E293B", // 深蓝灰色
]

export default function TagManagementPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [tags, setTags] = React.useState<Tag[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [userRole, setUserRole] = React.useState<string | null>(null)

  // 创建/编辑对话框
  const [dialog, setDialog] = React.useState<{
    open: boolean
    mode: 'create' | 'edit'
    tag: Tag | null
  }>({ open: false, mode: 'create', tag: null })

  const [formData, setFormData] = React.useState({
    name: '',
    color: COLOR_OPTIONS[0]
  })

  // 获取用户信息
  React.useEffect(() => {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setUserRole(user.role || 'user')
    }
  }, [])

  // 检查权限
  React.useEffect(() => {
    if (userRole && userRole !== 'admin') {
      toast({
        title: "权限不足",
        description: "只有管理员才能管理标签",
        variant: "destructive",
      })
      router.push('/use-template')
    }
  }, [userRole, router, toast])

  // 获取标签列表
  const fetchTags = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tags', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        setTags(data.data)
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载标签列表",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  React.useEffect(() => {
    if (userRole === 'admin') {
      fetchTags()
    }
  }, [userRole, fetchTags])

  // 打开创建对话框
  const handleCreate = () => {
    setFormData({ name: '', color: COLOR_OPTIONS[0] })
    setDialog({ open: true, mode: 'create', tag: null })
  }

  // 打开编辑对话框
  const handleEdit = (tag: Tag) => {
    setFormData({ name: tag.name, color: tag.color })
    setDialog({ open: true, mode: 'edit', tag })
  }

  // 创建标签
  const handleCreateSubmit = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "创建成功",
          description: `标签 "${formData.name}" 已创建`,
        })
        setDialog({ open: false, mode: 'create', tag: null })
        fetchTags()
      } else {
        toast({
          title: "创建失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "创建失败",
        description: "网络错误",
        variant: "destructive",
      })
    }
  }

  // 更新标签
  const handleEditSubmit = async () => {
    if (!dialog.tag) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tags/${dialog.tag.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "更新成功",
          description: `标签 "${formData.name}" 已更新`,
        })
        setDialog({ open: false, mode: 'edit', tag: null })
        fetchTags()
      } else {
        toast({
          title: "更新失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "更新失败",
        description: "网络错误",
        variant: "destructive",
      })
    }
  }

  // 删除标签
  const handleDelete = async (tag: Tag) => {
    if (!confirm(`确定要删除标签 "${tag.name}" 吗？`)) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/tags/${tag.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "删除成功",
          description: `标签 "${tag.name}" 已删除`,
        })
        fetchTags()
      } else {
        toast({
          title: "删除失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "网络错误",
        variant: "destructive",
      })
    }
  }

  if (userRole !== 'admin') {
    return <LoadingSpinner />
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showNewButton={false} title="标签管理" />
        <PageContainer>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </PageContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showNewButton={false} title="标签管理" />

      <PageContainer>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 头部 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>标签管理</CardTitle>
                  <CardDescription>
                    管理系统中可用的标签，用于分类和组织模板
                  </CardDescription>
                </div>
                <Button onClick={handleCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  新建标签
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* 标签列表 */}
          <div className="space-y-3">
            {tags.length === 0 ? (
              <Card>
                <CardContent className="pt-12">
                  <div className="text-center text-muted-foreground">
                    <p className="text-lg mb-4">暂无标签</p>
                    <Button onClick={handleCreate} variant="outline">
                      创建第一个标签
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              tags.map((tag) => (
                <Card key={tag.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge
                          style={{
                            backgroundColor: `${tag.color}20`,
                            color: tag.color,
                            border: `1px solid ${tag.color}40`,
                          }}
                          className="text-sm px-3 py-1"
                        >
                          {tag.name}
                        </Badge>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div
                            className="w-6 h-6 rounded border"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span>{tag.color}</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(tag)}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDelete(tag)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </PageContainer>

      {/* 创建/编辑对话框 */}
      <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialog.mode === 'create' ? '新建标签' : '编辑标签'}
            </DialogTitle>
            <DialogDescription>
              {dialog.mode === 'create' ? '创建一个新标签用于分类模板' : '修改标签信息'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">标签名称</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：常用、草稿、正式"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="color">标签颜色</Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color"
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-20 h-10"
                />
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded border-2 transition-all ${
                        formData.color === color
                          ? 'border-gray-900 scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* 预览 */}
            <div className="space-y-2">
              <Label>预览</Label>
              <div className="flex items-center gap-2">
                <Badge
                  style={{
                    backgroundColor: `${formData.color}20`,
                    color: formData.color,
                    border: `1px solid ${formData.color}40`,
                  }}
                >
                  {formData.name || '标签名称'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setDialog({ ...dialog, open: false })}
            >
              取消
            </Button>
            <Button onClick={dialog.mode === 'create' ? handleCreateSubmit : handleEditSubmit}>
              {dialog.mode === 'create' ? '创建' : '保存'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
