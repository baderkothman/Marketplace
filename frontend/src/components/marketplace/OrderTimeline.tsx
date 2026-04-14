import type { OrderTimelineStep } from '../../types'
import { formatShortDate } from '../../lib/marketplace'

interface OrderTimelineProps {
  steps: OrderTimelineStep[]
}

const statusClasses = {
  complete: 'bg-brand border-border-brand text-brand',
  current: 'bg-blue-500/10 border-blue-500/30 text-status-info',
  upcoming: 'bg-surface-3 border-border text-text-muted',
}

export function OrderTimeline({ steps }: OrderTimelineProps) {
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={step.key} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className={`flex h-9 w-9 items-center justify-center rounded-full border text-xs font-semibold ${statusClasses[step.status]}`}>
              {index + 1}
            </div>
            {index < steps.length - 1 && <div className="mt-2 h-full w-px bg-border" />}
          </div>
          <div className="pb-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-text-primary">{step.label}</p>
              {step.timestamp && (
                <span className="text-xs text-text-muted">{formatShortDate(step.timestamp)}</span>
              )}
            </div>
            <p className="mt-1 text-sm text-text-muted leading-relaxed">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
