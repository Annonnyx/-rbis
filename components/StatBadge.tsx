interface StatBadgeProps {
  label: string
  value: string | number
  className?: string
}

export function StatBadge({ label, value, className = '' }: StatBadgeProps) {
  return (
    <div
      className={`
        inline-flex flex-col items-center px-4 py-2
        backdrop-blur-sm bg-white/5 border border-white/10 rounded-xl
        ${className}
      `}
    >
      <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
      <span className="text-lg font-semibold text-white">{value}</span>
    </div>
  )
}
