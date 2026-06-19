'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Copy, Eye, Trash2, Search, Calendar, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/layout/header"
import { PageContainer } from "@/components/layout/page-container"
import { LoadingSpinner } from "@/components/layout/loading-spinner"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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

interface TemplateUsage {
  id: string
  templateId: string
  templateTitle: string
  replacements: Record<string, string>
  result: string
  createdAt: string
}

interface PaginatedResponse {
  records: TemplateUsage[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function UsageHistoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [records, setRecords] = React.useState<TemplateUsage[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedTemplate, setSelectedTemplate] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)

  // 查看详情对话框
  const [viewDialog, setViewDialog] = React.useState<{
    open: boolean
    record: TemplateUsage | null
  }>({ open: false, record: null })

  // 新增记录对话框
  const [addDialog, setAddDialog] = React.useState<{
    open: boolean
  }>({ open: false })
  const [addForm, setAddForm] = React.useState({
    templateTitle: '',
    replacements: '',
    result: ''
  })

  // 获取使用记录
  const fetchRecords = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const params = new URLSearchParams()
      params.append('page', currentPage.toString())
      params.append('pageSize', '10')
      if (searchQuery) params.append('search', searchQuery)
      if (selectedTemplate) params.append('templateId', selectedTemplate)

      const response = await fetch(`/api/template-usage?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        setRecords(data.data.records)
        setTotalPages(data.data.pagination.totalPages)
        setTotal(data.data.pagination.total)
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载使用记录",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery, selectedTemplate, router, toast])

  React.useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  // 复制内容
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
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

  // 查看详情
  const handleView = (record: TemplateUsage) => {
    setViewDialog({ open: true, record })
  }

  // 删除记录
  const handleDelete = async (record: TemplateUsage) => {
    if (!confirm(`确定要删除这条记录吗？`)) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/template-usage/${record.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "删除成功",
          description: "使用记录已删除",
        })
        fetchRecords()
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

  // 打开新增对话框
  const handleAddOpen = () => {
    setAddForm({ templateTitle: '', replacements: '', result: '' })
    setAddDialog({ open: true })
  }

  // 提交新增记录
  const handleAddSubmit = async () => {
    try {
      const token = localStorage.getItem('token')

      // 解析 replacements
      let replacements: Record<string, string> = {}
      try {
        const lines = addForm.replacements.split('\n').filter(line => line.trim())
        lines.forEach(line => {
          const match = line.match(/^(\w+)\s*=\s*(.+)$/)
          if (match) {
            replacements[match[1]] = match[2]
          }
        })
      } catch (e) {
        toast({
          title: "格式错误",
          description: "关键字替换格式不正确，请使用：key=value 格式，每行一个",
          variant: "destructive",
        })
        return
      }

      const response = await fetch('/api/template-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          templateId: 'manual',
          templateTitle: addForm.templateTitle || '手动添加',
          replacements,
          result: addForm.result
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "添加成功",
          description: "使用记录已添加",
        })
        setAddDialog({ open: false })
        fetchRecords()
      } else {
        toast({
          title: "添加失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "添加失败",
        description: "网络错误",
        variant: "destructive",
      })
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showNewButton={false} title="使用记录" />

      <PageContainer>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 搜索和筛选 */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="搜索模板名称..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={selectedTemplate}
                  onValueChange={(value) => {
                    setSelectedTemplate(value)
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-full sm:w-[200px]">
                    <SelectValue placeholder="全部模板" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">全部模板</SelectItem>
                    {/* 动态加载模板选项 */}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddOpen}>
                  <Plus className="mr-2 h-4 w-4" />
                  新增记录
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>共 {total} 条记录</span>
            </div>
          </div>

          {/* 记录列表 */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <Skeleton className="h-5 w-1/3" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : records.length === 0 ? (
            <Card>
              <CardContent className="pt-12">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-2">暂无使用记录</p>
                  <Button
                    variant="outline"
                    onClick={() => router.push('/use-template')}
                  >
                    去使用模板
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {records.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge>{record.templateTitle}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(record.createdAt)}
                          </span>
                        </div>

                        <div className="mb-3">
                          <p className="text-sm text-muted-foreground mb-1">
                            关键字替换：
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(record.replacements).map(([key, value]) => (
                              <Badge key={key} variant="outline" className="text-xs">
                                {'{' + key + '}'} = {value}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {record.result}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleView(record)}>
                            <Eye className="mr-2 h-4 w-4" />
                            查看详情
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopy(record.result)}>
                            <Copy className="mr-2 h-4 w-4" />
                            复制内容
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(record)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            删除记录
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              <span className="text-sm text-muted-foreground">
                第 {currentPage} / {totalPages} 页
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </div>
      </PageContainer>

      {/* 查看详情对话框 */}
      <Dialog open={viewDialog.open} onOpenChange={(open) => setViewDialog({ open, record: null })}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {viewDialog.record && (
            <>
              <DialogHeader>
                <DialogTitle>{viewDialog.record.templateTitle}</DialogTitle>
                <DialogDescription>
                  {formatDate(viewDialog.record.createdAt)}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">关键字替换</h4>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(viewDialog.record.replacements).map(([key, value]) => (
                      <Badge key={key} variant="outline">
                        {'{' + key + '}'} = {value}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium mb-2">替换结果</h4>
                  <Textarea
                    value={viewDialog.record.result}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => handleCopy(viewDialog.record!.result)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    复制内容
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 新增记录对话框 */}
      <Dialog open={addDialog.open} onOpenChange={(open) => setAddDialog({ open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增使用记录</DialogTitle>
            <DialogDescription>
              手动添加一条使用记录，用于保存已生成的内容
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="templateTitle">模板标题</Label>
              <Input
                id="templateTitle"
                value={addForm.templateTitle}
                onChange={(e) => setAddForm({ ...addForm, templateTitle: e.target.value })}
                placeholder="例如：AI写作助手"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="replacements">关键字替换</Label>
              <Textarea
                id="replacements"
                value={addForm.replacements}
                onChange={(e) => setAddForm({ ...addForm, replacements: e.target.value })}
                placeholder="每行一个，格式：key=value&#10;角色=写作专家&#10;主题=人工智能"
                rows={4}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                使用 key=value 格式，每行一个
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result">替换结果</Label>
              <Textarea
                id="result"
                value={addForm.result}
                onChange={(e) => setAddForm({ ...addForm, result: e.target.value })}
                placeholder="输入生成的内容..."
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialog({ open: false })}
            >
              取消
            </Button>
            <Button onClick={handleAddSubmit}>
              添加记录
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
