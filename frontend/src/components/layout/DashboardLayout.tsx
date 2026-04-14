import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'

interface DashboardLayoutProps {
  children: ReactNode
  title?: string
  subtitle?: string
  actions?: ReactNode
}

export function DashboardLayout({ children, title, subtitle, actions }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          {(title || actions) && (
            <div className="flex items-start justify-between mb-8 gap-4">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-text-primary tracking-tight">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-sm text-text-muted mt-1">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex-shrink-0">{actions}</div>}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  )
}
