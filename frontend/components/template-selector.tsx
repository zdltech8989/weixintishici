"use client"

import * as React from "react"
import { Search, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface Template {
  id: string
  title: string
  description?: string
  category?: string
  content: string
}

interface TemplateSelectorProps {
  templates: Template[]
  value?: Template
  onChange: (template: Template) => void
  placeholder?: string
}

export function TemplateSelector({
  templates,
  value,
  onChange,
  placeholder = "选择模板..."
}: TemplateSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredTemplates = React.useMemo(() => {
    if (!searchQuery) return templates
    const query = searchQuery.toLowerCase()
    return templates.filter(
      (t) =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        t.category?.toLowerCase().includes(query)
    )
  }, [templates, searchQuery])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto py-3"
        >
          {value ? (
            <div className="flex items-center gap-2">
              <span className="font-medium">{value.title}</span>
              {value.category && (
                <Badge variant="secondary" className="text-xs">
                  {value.category}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-3">
          <Input
            placeholder="搜索模板..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9"
          />
        </div>
        <ScrollArea className="h-[300px]">
          <div className="p-1">
            {filteredTemplates.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                没有找到匹配的模板
              </div>
            ) : (
              filteredTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    onChange(template)
                    setOpen(false)
                    setSearchQuery("")
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent transition-colors",
                    value?.id === template.id && "bg-accent"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{template.title}</span>
                      {template.category && (
                        <Badge variant="outline" className="text-xs shrink-0">
                          {template.category}
                        </Badge>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {template.description}
                      </p>
                    )}
                  </div>
                  {value?.id === template.id && (
                    <Check className="h-4 w-4 shrink-0" />
                  )}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
