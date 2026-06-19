'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { User, Mail, Calendar, Shield, Lock, Save, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/layout/header"
import { PageContainer } from "@/components/layout/page-container"
import { LoadingSpinner } from "@/components/layout/loading-spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface UserProfile {
  id: string
  username: string
  email: string | null
  role: string
  createdAt: string
  _count: {
    templates: number
    tags: number
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [profile, setProfile] = React.useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  // 更新资料表单
  const [updateForm, setUpdateForm] = React.useState({
    email: ''
  })

  // 修改密码对话框
  const [passwordDialog, setPasswordDialog] = React.useState(false)
  const [passwordForm, setPasswordForm] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isUpdating, setIsUpdating] = React.useState(false)
  const [isChangingPassword, setIsChangingPassword] = React.useState(false)

  // 获取用户资料
  const fetchProfile = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/user/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
        setUpdateForm({ email: data.data.email || '' })
        
        // 更新本地存储的用户信息
        const userStr = localStorage.getItem('user')
        if (userStr) {
          const userData = JSON.parse(userStr)
          userData.email = data.data.email
          userData.role = data.data.role
          localStorage.setItem('user', JSON.stringify(userData))
        }
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载用户资料",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [router, toast])

  React.useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // 更新资料
  const handleUpdate = async () => {
    setIsUpdating(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: updateForm.email })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "更新成功",
          description: "用户资料已更新",
        })
        fetchProfile()
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
    } finally {
      setIsUpdating(false)
    }
  }

  // 修改密码
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "密码不一致",
        description: "新密码和确认密码不一致",
        variant: "destructive",
      })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "密码太短",
        description: "新密码至少需要6个字符",
        variant: "destructive",
      })
      return
    }

    setIsChangingPassword(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "密码修改成功",
          description: "请使用新密码重新登录",
        })
        setPasswordDialog(false)
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
        // 退出登录
        setTimeout(() => {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          router.push('/login')
        }, 1500)
      } else {
        toast({
          title: "密码修改失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "密码修改失败",
        description: "网络错误",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header showNewButton={false} title="用户资料" />
        <PageContainer>
          <LoadingSpinner />
        </PageContainer>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header showNewButton={false} title="用户资料" />
        <PageContainer>
          <Card>
            <CardContent className="pt-12">
              <div className="text-center text-muted-foreground">
                无法加载用户资料
              </div>
            </CardContent>
          </Card>
        </PageContainer>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header showNewButton={false} title="用户资料" />

      <PageContainer>
        <div className="max-w-2xl mx-auto space-y-6">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            onClick={() => router.push('/use-template')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>

          {/* 用户基本信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                用户信息
              </CardTitle>
              <CardDescription>查看和编辑您的个人资料</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    用户名
                  </Label>
                  <Input value={profile.username} disabled className="bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    角色
                  </Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                      {profile.role === 'admin' ? '管理员' : '普通用户'}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    邮箱
                  </Label>
                  <Input
                    type="email"
                    value={updateForm.email}
                    onChange={(e) => setUpdateForm({ ...updateForm, email: e.target.value })}
                    placeholder="请输入邮箱"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    注册时间
                  </Label>
                  <Input value={formatDate(profile.createdAt)} disabled className="bg-muted" />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button onClick={handleUpdate} disabled={isUpdating}>
                  {isUpdating ? '更新中...' : '保存更改'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <Card>
            <CardHeader>
              <CardTitle>使用统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{profile._count.templates}</div>
                  <div className="text-sm text-muted-foreground">模板数量</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{profile._count.tags}</div>
                  <div className="text-sm text-muted-foreground">标签数量</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 安全设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                安全设置
              </CardTitle>
              <CardDescription>管理您的账户安全</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                onClick={() => setPasswordDialog(true)}
                className="w-full md:w-auto"
              >
                <Lock className="mr-2 h-4 w-4" />
                修改密码
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>

      {/* 修改密码对话框 */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>修改密码</DialogTitle>
            <DialogDescription>
              请输入当前密码和新密码
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">当前密码</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="请输入当前密码"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">新密码</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="请输入新密码（至少6个字符）"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">确认密码</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="请再次输入新密码"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setPasswordDialog(false)
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
              }}
            >
              取消
            </Button>
            <Button onClick={handleChangePassword} disabled={isChangingPassword}>
              {isChangingPassword ? '修改中...' : '确认修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
