import type { ReactNode } from 'react'

type BadgeVariant =
  | 'default'
  | 'brand'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'pending'
  | 'completed'
  | 'cancelled'
  | 'inprogress'

interface BadgeProps {
  variant?: BadgeVariant
  children: ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-3 text-text-secondary border-border',
  brand: 'bg-brand-subtle text-brand border-border-brand',
  success: 'bg-green-500/10 text-status-success border-green-500/20',
  warning: 'bg-yellow-500/10 text-status-warning border-yellow-500/20',
  error: 'bg-red-500/10 text-status-error border-red-500/20',
  info: 'bg-blue-500/10 text-status-info border-blue-500/20',
  pending: 'bg-yellow-500/10 text-status-warning border-yellow-500/20',
  completed: 'bg-green-500/10 text-status-success border-green-500/20',
  cancelled: 'bg-red-500/10 text-status-error border-red-500/20',
  inprogress: 'bg-blue-500/10 text-status-info border-blue-500/20',
}

export function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantStyles[variant],
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

export function orderStatusBadge(status: string) {
  const map: Record<string, BadgeVariant> = {
    Pending: 'pending',
    InProgress: 'inprogress',
    Completed: 'completed',
    Cancelled: 'cancelled',
  }
  return map[status] ?? 'default'
}
