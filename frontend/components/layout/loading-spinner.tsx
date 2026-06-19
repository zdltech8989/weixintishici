import { Loader2 } from "lucide-react"

export function LoadingSpinner({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const sizeClasses = {
    small: "h-4 w-4",
    default: "h-8 w-8",
    large: "h-12 w-12"
  }

  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
    </div>
  )
}

export function FullPageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-12 w-12 animate-spin" />
    </div>
  )
}
