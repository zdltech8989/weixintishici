import { ReactNode } from "react"

interface PageContainerProps {
  children: ReactNode
  className?: string
}

export function PageContainer({ children, className = "" }: PageContainerProps) {
  return (
    <div className={`container py-8 ${className}`}>
      {children}
    </div>
  )
}
