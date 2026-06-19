'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { Copy, Save, Eye, EyeOff, Clock, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { PageContainer } from "@/components/layout/page-container"
import { LoadingSpinner } from "@/components/layout/loading-spinner"
import { TemplateSelector } from "@/components/template-selector"
import { KeywordInput } from "@/components/keyword-input"
import { useToast } from "@/components/ui/use-toast"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Template {
  id: string
  title: string
  description?: string
  category?: string
  content: string
}

interface TemplateUsage {
  id: string
  templateId: string
  templateTitle: string
  replacements: Record<string, string>
  result: string
  createdAt: string
}

export default function UseTemplatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [templates, setTemplates] = React.useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = React.useState<Template | undefined>()
  const [keywords, setKeywords] = React.useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = React.useState(true)
  const [usageHistory, setUsageHistory] = React.useState<TemplateUsage[]>([])
  const [isLoadingHistory, setIsLoadingHistory] = React.useState(false)

  // 获取模板列表
  React.useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch('/api/templates', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTemplates(data.data.templates)
        }
      })
      .catch(err => console.error('Failed to fetch templates', err))

    // 加载使用历史
    fetchUsageHistory(token)
  }, [router])

  const fetchUsageHistory = (token: string) => {
    setIsLoadingHistory(true)
    fetch('/api/template-usage?pageSize=5', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUsageHistory(data.data.records)
        }
      })
      .catch(err => console.error('Failed to fetch usage history', err))
      .finally(() => {
        setIsLoadingHistory(false)
      })
  }

  // 替换模板内容
  const replaceContent = React.useCallback((content: string, replacements: Record<string, string>) => {
    let result = content
    for (const [key, value] of Object.entries(replacements)) {
      result = result.replaceAll(`{${key}}`, value)
    }
    return result
  }, [])

  // 获取替换后的结果
  const getResult = React.useCallback(() => {
    if (!selectedTemplate) return ''
    return replaceContent(selectedTemplate.content, keywords)
  }, [selectedTemplate, keywords, replaceContent])

  // 一键复制
  const handleCopy = async () => {
    const result = getResult()
    if (!result) {
      toast({
        title: "无法复制",
        description: "请先选择模板",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(result)
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

  // 保存使用记录
  const handleSaveUsage = async () => {
    if (!selectedTemplate) {
      toast({
        title: "无法保存",
        description: "请先选择模板",
        variant: "destructive",
      })
      return
    }

    const result = getResult()
    const token = localStorage.getItem('token')

    try {
      const response = await fetch('/api/template-usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          templateTitle: selectedTemplate.title,
          replacements: keywords,
          result
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "保存成功",
          description: "使用记录已保存",
        })
        // 刷新历史记录
        if (token) fetchUsageHistory(token)
      } else {
        toast({
          title: "保存失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "保存失败",
        description: "网络错误",
        variant: "destructive",
      })
    }
  }

  // 从历史记录加载
  const loadFromHistory = (usage: TemplateUsage) => {
    const template = templates.find(t => t.id === usage.templateId)
    if (template) {
      setSelectedTemplate(template)
      setKeywords(usage.replacements)
      toast({
        title: "加载成功",
        description: `已加载模板 "${template.title}"`,
      })
    } else {
      // 如果找不到模板（例如手动添加的记录或模板已删除）
      if (usage.templateId === 'manual') {
        toast({
          title: "手动添加的记录",
          description: "这是一条手动添加的记录，无法加载到模板选择器",
          variant: "destructive",
        })
      } else {
        toast({
          title: "模板不存在",
          description: "该记录对应的模板已被删除",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showNewButton={false} title="首页" />

      <PageContainer>
        <div className="max-w-5xl mx-auto space-y-6">
          {/* 第一步：选择模板 */}
          <Card>
            <CardHeader>
              <CardTitle>第一步：选择模板</CardTitle>
              <CardDescription>从模板库中选择要使用的模板</CardDescription>
            </CardHeader>
            <CardContent>
              <TemplateSelector
                templates={templates}
                value={selectedTemplate}
                onChange={setSelectedTemplate}
                placeholder="搜索并选择模板..."
              />
            </CardContent>
          </Card>

          {/* 第二步：填写关键字 */}
          {selectedTemplate && (
            <KeywordInput
              templateContent={selectedTemplate.content}
              value={keywords}
              onChange={setKeywords}
            />
          )}

          {/* 预览和操作 */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>预览结果</CardTitle>
                    <CardDescription>替换占位符后的最终内容</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">实时预览</span>
                    <Switch
                      checked={showPreview}
                      onCheckedChange={setShowPreview}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <Textarea
                    value={getResult()}
                    readOnly
                    rows={15}
                    className="font-mono text-sm"
                  />
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    预览已关闭，点击上方开关开启实时预览
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 操作按钮 */}
          {selectedTemplate && (
            <div className="flex gap-4">
              <Button onClick={handleCopy} className="flex-1" size="lg">
                <Copy className="mr-2 h-5 w-5" />
                一键复制内容
              </Button>
              <Button onClick={handleSaveUsage} variant="outline" size="lg">
                <Save className="mr-2 h-5 w-5" />
                保存记录
              </Button>
            </div>
          )}

          <Separator />

          {/* 使用历史 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                最近使用记录
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingHistory ? (
                <LoadingSpinner />
              ) : usageHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  暂无使用记录
                </div>
              ) : (
                <div className="space-y-3">
                  {usageHistory.map((usage) => (
                    <div
                      key={usage.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => loadFromHistory(usage)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{usage.templateTitle}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(usage.createdAt).toLocaleString('zh-CN')}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground truncate mt-1">
                          {Object.keys(usage.replacements).length} 个关键字
                        </div>
                      </div>
                      <History className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </div>
  )
}
