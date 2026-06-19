"use client"

import { useState, useEffect } from "react"
import { Moon, Sun, LogOut, Plus, User, Menu, FileText, Play, History, Tag, Settings, Users } from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"

interface HeaderProps {
  showNewButton?: boolean
  title?: string
}

export function Header({ showNewButton = true, title = "提示词管理系统" }: HeaderProps) {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [user, setUser] = useState<{ username: string; role?: string } | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const userStr = localStorage.getItem("user")
    if (userStr) {
      setUser(JSON.parse(userStr))
    }
  }, [])

  // 避免服务端渲染不匹配
  if (!mounted) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    router.push("/login")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-4">
          <h1
            className="text-xl font-bold cursor-pointer hover:text-primary transition-colors"
            onClick={() => router.push("/use-template")}
          >
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* 导航菜单 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Menu className="mr-2 h-4 w-4" />
                菜单
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/use-template")}>
                <Play className="mr-2 h-4 w-4" />
                首页
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/usage-history")}>
                <History className="mr-2 h-4 w-4" />
                使用记录
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/templates")}>
                <FileText className="mr-2 h-4 w-4" />
                模板列表
              </DropdownMenuItem>
              {user?.role === 'admin' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/tag-management")}>
                    <Tag className="mr-2 h-4 w-4" />
                    标签管理
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/users")}>
                    <Users className="mr-2 h-4 w-4" />
                    用户管理
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {showNewButton && (
            <Button onClick={() => router.push("/templates/new")} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              新建
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">切换主题</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.username || "用户"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <Settings className="mr-2 h-4 w-4" />
                个人资料
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
