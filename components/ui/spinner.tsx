import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  color?: "primary" | "white" | "current"
}

export function Spinner({ className, size = "md", color = "current" }: SpinnerProps) {
  const sizeClasses = {
    xs: "h-3 w-3 border-[1.5px]",
    sm: "h-4 w-4 border-2", 
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-2",
    xl: "h-12 w-12 border-3"
  }

  const colorClasses = {
    primary: "border-primary border-r-transparent",
    white: "border-white border-r-transparent", 
    current: "border-current border-r-transparent"
  }

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-solid align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  )
}

// Page-level loading component - just shows spinner, no text
export function PageSpinner({ message }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Spinner size="xl" color="primary" />
    </div>
  )
}
