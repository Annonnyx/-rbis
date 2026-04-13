"use client"

import { cn } from "@/lib/utils"

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost"
  size?: "sm" | "md" | "lg"
  children: React.ReactNode
}

export function GlassButton({
  children,
  variant = "secondary",
  size = "md",
  className,
  ...props
}: GlassButtonProps) {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
  
  const variants = {
    primary: "btn-primary px-6 py-3",
    secondary: "glass-button px-4 py-2.5 text-foreground",
    ghost: "px-4 py-2.5 hover:bg-accent rounded-xl transition-colors"
  }
  
  const sizes = {
    sm: "text-sm px-3 py-2",
    md: "text-base",
    lg: "text-lg px-8 py-4"
  }

  return (
    <button
      className={cn(baseClasses, variants[variant], size !== "md" && sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
