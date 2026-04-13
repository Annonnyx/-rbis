"use client"

import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  liquid?: boolean
  onClick?: () => void
}

export function GlassCard({ children, className, hover = true, liquid = false, onClick }: GlassCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        liquid ? "liquid-glass" : "glass-card",
        hover && !liquid && "hover:scale-[1.01]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  )
}
