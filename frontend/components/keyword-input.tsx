"use client"

import * as React from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface KeywordInputProps {
  templateContent: string
  value: Record<string, string>
  onChange: (keywords: Record<string, string>) => void
}

// 从模板内容中提取占位符
function extractPlaceholders(content: string): string[] {
  const regex = /\{([^}]+)\}/g
  const placeholders = new Set<string>()
  let match

  while ((match = regex.exec(content)) !== null) {
    placeholders.add(match[1])
  }

  return Array.from(placeholders)
}

export function KeywordInput({ templateContent, value, onChange }: KeywordInputProps) {
  const [manualKey, setManualKey] = React.useState("")
  const [manualValue, setManualValue] = React.useState("")

  // 自动识别的占位符
  const autoPlaceholders = React.useMemo(() => {
    return extractPlaceholders(templateContent || "")
  }, [templateContent])

  // 手动添加的键（不在自动占位符列表中的）
  const manualKeys = Object.keys(value).filter(k => !autoPlaceholders.includes(k))

  const updateValue = (key: string, val: string) => {
    onChange({
      ...value,
      [key]: val
    })
  }

  const removeKey = (key: string) => {
    const newValue = { ...value }
    delete newValue[key]
    onChange(newValue)
  }

  const addManualKeyword = () => {
    if (manualKey.trim() && !value[manualKey]) {
      updateValue(manualKey.trim(), manualValue)
      setManualKey("")
      setManualValue("")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">填写关键字</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 自动识别的占位符 */}
        {autoPlaceholders.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-muted-foreground">
                自动识别的占位符 ({autoPlaceholders.length})
              </Label>
              <Badge variant="outline" className="text-xs">
                从模板中提取
              </Badge>
            </div>
            <ScrollArea className="max-h-[200px]">
              <div className="space-y-2 pr-4">
                {autoPlaceholders.map((placeholder) => (
                  <div key={placeholder} className="flex items-center gap-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="secondary">{'{' + placeholder + '}'}</Badge>
                      <span className="text-sm text-muted-foreground">=</span>
                      <Input
                        value={value[placeholder] || ""}
                        onChange={(e) => updateValue(placeholder, e.target.value)}
                        placeholder={`请输入 ${placeholder} 的值`}
                        className="flex-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* 手动添加的关键字 */}
        <div className="space-y-3">
          <Label className="text-sm text-muted-foreground">
            手动添加关键字 {manualKeys.length > 0 && `(${manualKeys.length})`}
          </Label>

          {/* 已添加的手动关键字 */}
          {manualKeys.length > 0 && (
            <div className="space-y-2">
              {manualKeys.map((key) => (
                <div key={key} className="flex items-center gap-2">
                  <Badge variant="outline">{'{' + key + '}'}</Badge>
                  <span className="text-sm text-muted-foreground">=</span>
                  <Input
                    value={value[key] || ""}
                    onChange={(e) => updateValue(key, e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeKey(key)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 添加新关键字 */}
          <div className="flex items-center gap-2">
            <Input
              value={manualKey}
              onChange={(e) => setManualKey(e.target.value)}
              placeholder="新关键字名"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addManualKeyword()
                }
              }}
            />
            <span className="text-sm text-muted-foreground">=</span>
            <Input
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              placeholder="值"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addManualKeyword()
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addManualKeyword}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
