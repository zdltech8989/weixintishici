'use client'

import * as React from "react"
import { useRouter } from "next/navigation"
import { UserPlus, Edit, Trash2, Shield, Key, Search, ArrowLeft, User } from "lucide-react"
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"

interface UserData {
  id: string
  username: string
  email: string | null
  role: string
  createdAt: string
  updatedAt: string
  _count: {
    templates: number
    tags: number
  }
}

interface PaginatedResponse {
  users: UserData[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export default function UsersPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [users, setUsers] = React.useState<UserData[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [currentPage, setCurrentPage] = React.useState(1)
  const [totalPages, setTotalPages] = React.useState(1)
  const [total, setTotal] = React.useState(0)
  const [searchQuery, setSearchQuery] = React.useState("")

  // 创建/编辑用户对话框
  const [userDialog, setUserDialog] = React.useState<{
    open: boolean
    mode: 'create' | 'edit'
    user: UserData | null
  }>({ open: false, mode: 'create', user: null })

  const [userForm, setUserForm] = React.useState({
    username: '',
    email: '',
    password: '',
    role: 'user'
  })

  // 重置密码对话框
  const [passwordDialog, setPasswordDialog] = React.useState<{
    open: boolean
    userId: string
    username: string
  }>({ open: false, userId: '', username: '' })

  const [passwordForm, setPasswordForm] = React.useState({
    newPassword: '',
    confirmPassword: ''
  })

  // 获取用户列表
  const fetchUsers = React.useCallback(async () => {
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

      const response = await fetch(`/api/user/users?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        setUsers(data.data.users)
        setTotalPages(data.data.pagination.totalPages)
        setTotal(data.data.pagination.total)
      } else {
        if (data.error === '无权访问') {
          toast({
            title: "权限不足",
            description: "只有管理员才能访问此页面",
            variant: "destructive",
          })
          router.push('/use-template')
        }
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载用户列表",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchQuery, router, toast])

  React.useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // 打开创建对话框
  const handleCreate = () => {
    setUserForm({ username: '', email: '', password: '', role: 'user' })
    setUserDialog({ open: true, mode: 'create', user: null })
  }

  // 打开编辑对话框
  const handleEdit = (user: UserData) => {
    setUserForm({
      username: user.username,
      email: user.email || '',
      password: '',
      role: user.role
    })
    setUserDialog({ open: true, mode: 'edit', user })
  }

  // 创建用户
  const handleCreateSubmit = async () => {
    if (!userForm.username || !userForm.password) {
      toast({
        title: "验证失败",
        description: "用户名和密码不能为空",
        variant: "destructive",
      })
      return
    }

    if (userForm.password.length < 6) {
      toast({
        title: "验证失败",
        description: "密码至少需要6个字符",
        variant: "destructive",
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/user/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: userForm.username,
          password: userForm.password,
          email: userForm.email || null,
          role: userForm.role
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "创建成功",
          description: `用户 "${userForm.username}" 已创建`,
        })
        setUserDialog({ open: false, mode: 'create', user: null })
        fetchUsers()
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

  // 更新用户
  const handleEditSubmit = async () => {
    if (!userDialog.user) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/user/users/${userDialog.user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: userForm.username,
          email: userForm.email || null,
          role: userForm.role
        })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "更新成功",
          description: `用户 "${userForm.username}" 已更新`,
        })
        setUserDialog({ open: false, mode: 'edit', user: null })
        fetchUsers()
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

  // 删除用户
  const handleDelete = async (user: UserData) => {
    if (!confirm(`确定要删除用户 "${user.username}" 吗？`)) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/user/users/${user.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "删除成功",
          description: `用户 "${user.username}" 已删除`,
        })
        fetchUsers()
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

  // 打开重置密码对话框
  const handleResetPassword = (user: UserData) => {
    setPasswordForm({ newPassword: '', confirmPassword: '' })
    setPasswordDialog({ open: true, userId: user.id, username: user.username })
  }

  // 重置密码
  const handleResetPasswordSubmit = async () => {
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

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/user/users/${passwordDialog.userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword: passwordForm.newPassword })
      })

      const data = await response.json()
      if (data.success) {
        toast({
          title: "密码重置成功",
          description: `用户 "${passwordDialog.username}" 的密码已重置`,
        })
        setPasswordDialog({ open: false, userId: '', username: '' })
        setPasswordForm({ newPassword: '', confirmPassword: '' })
      } else {
        toast({
          title: "重置失败",
          description: data.error || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "重置失败",
        description: "网络错误",
        variant: "destructive",
      })
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

  return (
    <div className="min-h-screen bg-background">
      <Header showNewButton={false} title="用户管理" />

      <PageContainer>
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            onClick={() => router.push('/use-template')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回首页
          </Button>

          {/* 头部 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>用户管理</CardTitle>
                  <CardDescription>
                    管理系统用户和角色权限
                  </CardDescription>
                </div>
                <Button onClick={handleCreate}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  新建用户
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* 搜索 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="搜索用户名或邮箱..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <div className="text-sm text-muted-foreground">
            共 {total} 个用户
          </div>

          {/* 用户列表 */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="pt-12">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg mb-4">暂无用户</p>
                  <Button onClick={handleCreate} variant="outline">
                    创建第一个用户
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{user.username}</span>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                {user.role === 'admin' ? '管理员' : '普通用户'}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email || '未设置邮箱'}
                            </div>
                          </div>
                        </div>

                        <div className="text-sm text-muted-foreground">
                          注册于 {formatDate(user.createdAt)}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{user._count.templates} 个模板</span>
                          <span>{user._count.tags} 个标签</span>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(user)}>
                            <Edit className="mr-2 h-4 w-4" />
                            编辑
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                            <Key className="mr-2 h-4 w-4" />
                            重置密码
                          </DropdownMenuItem>
                          {user.role !== 'admin' && (
                            <DropdownMenuItem
                              onClick={() => handleDelete(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              删除
                            </DropdownMenuItem>
                          )}
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

      {/* 创建/编辑用户对话框 */}
      <Dialog open={userDialog.open} onOpenChange={(open) => setUserDialog({ ...userDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {userDialog.mode === 'create' ? '新建用户' : '编辑用户'}
            </DialogTitle>
            <DialogDescription>
              {userDialog.mode === 'create' ? '创建一个新用户' : '修改用户信息'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                value={userForm.username}
                onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                placeholder="请输入用户名"
                disabled={userDialog.mode === 'edit'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="请输入邮箱（可选）"
              />
            </div>

            {userDialog.mode === 'create' && (
              <div className="space-y-2">
                <Label htmlFor="password">密码</Label>
                <Input
                  id="password"
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                  placeholder="请输入密码（至少6个字符）"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="role">角色</Label>
              <Select
                value={userForm.role}
                onValueChange={(value) => setUserForm({ ...userForm, role: value })}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">普通用户</SelectItem>
                  <SelectItem value="admin">管理员</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUserDialog({ ...userDialog, open: false })}
            >
              取消
            </Button>
            <Button onClick={userDialog.mode === 'create' ? handleCreateSubmit : handleEditSubmit}>
              {userDialog.mode === 'create' ? '创建' : '保存'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 重置密码对话框 */}
      <Dialog open={passwordDialog.open} onOpenChange={(open) => setPasswordDialog({ ...passwordDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>重置密码</DialogTitle>
            <DialogDescription>
              为用户 &ldquo;{passwordDialog.username}&rdquo; 设置新密码
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
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
              onClick={() => setPasswordDialog({ ...passwordDialog, open: false })}
            >
              取消
            </Button>
            <Button onClick={handleResetPasswordSubmit}>
              确认重置
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
