import type { ReactNode } from 'react'

interface StatePanelProps {
  title: string
  description: string
  icon?: ReactNode
  action?: ReactNode
  tone?: 'default' | 'error' | 'success'
  compact?: boolean
}

const toneClasses = {
  default: 'border-border bg-surface-2',
  error: 'border-red-500/20 bg-red-500/5',
  success: 'border-green-500/20 bg-green-500/5',
}

export function StatePanel({
  title,
  description,
  icon,
  action,
  tone = 'default',
  compact = false,
}: StatePanelProps) {
  return (
    <div className={[
      'rounded-2xl border text-center',
      toneClasses[tone],
      compact ? 'px-5 py-6' : 'px-6 py-10',
    ].join(' ')}>
      {icon && (
        <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center mx-auto mb-4 text-text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
      <p className="text-sm text-text-muted max-w-md mx-auto mt-2 leading-relaxed">{description}</p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}
