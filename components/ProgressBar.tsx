// ============================================
// components/ProgressBar.tsx
// Barre de progression réutilisable
// ============================================

interface ProgressBarProps {
  current: number
  max: number
  className?: string
}

export function ProgressBar({ current, max, className }: ProgressBarProps) {
  const percentage = Math.min(100, (current / max) * 100)
  
  return (
    <div className={`h-2 bg-white/10 rounded-full overflow-hidden ${className}`}>
      <div 
        className="h-full bg-violet-500 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
