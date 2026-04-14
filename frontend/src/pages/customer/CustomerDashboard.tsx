import { useEffect, useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import { ordersApi } from '../../api/orders'
import { CustomerOrderDetailPage } from './CustomerOrderDetailPage'
import { CustomerSavedPage } from './CustomerSavedPage'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { ReviewOrderModal } from '../../components/marketplace/ReviewOrderModal'
import { StatePanel } from '../../components/marketplace/StatePanel'
import { Badge, orderStatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../hooks/useFavorites'
import { buildOrderNotifications, formatShortDate } from '../../lib/marketplace'
import type { Order } from '../../types'

function CustomerOrdersPage() {
  const { user } = useAuth()
  const { favoritesCount } = useFavorites()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null)

  const loadOrders = () => {
    setLoading(true)
    setError('')

    ordersApi
      .getAll()
      .then(setOrders)
      .catch(() => setError('Your order list could not be loaded right now.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const notifications = orders
    .flatMap((order) => buildOrderNotifications(order))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  const stats = {
    total: orders.length,
    active: orders.filter((order) => order.status === 'Pending' || order.status === 'InProgress').length,
    completed: orders.filter((order) => order.status === 'Completed').length,
    saved: favoritesCount,
  }

  return (
    <DashboardLayout
      title={`Welcome, ${user?.fullName.split(' ')[0]}`}
      subtitle="Track delivery progress, recent updates, and the next services on your shortlist."
    >
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 mb-8">
        {[
          { label: 'Total orders', value: stats.total, description: 'All marketplace orders' },
          { label: 'In flight', value: stats.active, description: 'Pending or in progress' },
          { label: 'Completed', value: stats.completed, description: 'Ready for review or archived' },
          { label: 'Saved services', value: stats.saved, description: 'Shortlisted for later' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-surface-2 p-4">
            <p className="text-xs uppercase tracking-wider text-text-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-bold text-text-primary">{stat.value}</p>
            <p className="mt-1 text-xs text-text-muted">{stat.description}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-3xl border border-border bg-surface-2 p-5">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-text-muted">Orders</p>
              <h2 className="mt-2 text-xl font-bold tracking-tight text-text-primary">Current work and recent deliveries</h2>
            </div>
            <Link to="/services">
              <Button variant="ghost">Browse services</Button>
            </Link>
          </div>

          {loading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-32 rounded-2xl" />
              ))}
            </div>
          ) : error ? (
            <div className="mt-5">
              <StatePanel
                compact
                tone="error"
                title="Orders unavailable"
                description={error}
                action={<Button onClick={loadOrders}>Try again</Button>}
              />
            </div>
          ) : orders.length === 0 ? (
            <div className="mt-5">
              <StatePanel
                title="No orders yet"
                description="Browse the marketplace, save strong options, and place your first order when the scope feels right."
                action={
                  <Link to="/services">
                    <Button>Explore services</Button>
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {orders.map((order) => (
                <article key={order.id} className="rounded-2xl border border-border bg-surface-1 p-4">
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div className="flex gap-4 min-w-0">
                      <div className="h-16 w-16 overflow-hidden rounded-2xl bg-surface-3 flex-shrink-0">
                        {order.serviceImage ? (
                          <img src={order.serviceImage} alt={order.serviceTitle} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-text-muted">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-semibold text-text-primary">{order.serviceTitle}</p>
                          <Badge variant={orderStatusBadge(order.status)}>{order.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-text-muted">
                          by {order.vendorName} · placed {formatShortDate(order.createdAt)}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                          {order.notes || 'No additional brief notes were attached to this order.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3">
                      <p className="text-lg font-bold text-text-primary">${order.totalPrice.toFixed(2)}</p>
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/customer/orders/${order.id}`}>
                          <Button variant="secondary" size="sm">View timeline</Button>
                        </Link>
                        {order.status === 'Completed' && !order.hasReview && (
                          <Button size="sm" onClick={() => setReviewOrder(order)}>Leave review</Button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-border bg-surface-2 p-5">
          <div className="border-b border-border pb-4">
            <p className="text-xs uppercase tracking-wider text-text-muted">Notifications</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-text-primary">Important order updates</h2>
          </div>

          {loading ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-24 rounded-2xl" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="mt-5">
              <StatePanel
                compact
                title="No updates yet"
                description="When order activity starts, status changes and delivery alerts will be summarized here."
              />
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {notifications.map((notification) => (
                <div key={notification.id} className="rounded-2xl border border-border bg-surface-1 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-text-primary">{notification.title}</p>
                    <span className="text-xs text-text-muted">{formatShortDate(notification.createdAt)}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-text-muted">{notification.body}</p>
                  {notification.orderId && (
                    <Link to={`/customer/orders/${notification.orderId}`} className="mt-3 inline-flex text-sm font-medium text-brand hover:text-brand-hover">
                      Open order
                    </Link>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {reviewOrder && (
        <ReviewOrderModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSuccess={loadOrders}
        />
      )}
    </DashboardLayout>
  )
}

export function CustomerDashboard() {
  return (
    <Routes>
      <Route index element={<CustomerOrdersPage />} />
      <Route path="saved" element={<CustomerSavedPage />} />
      <Route path="orders/:id" element={<CustomerOrderDetailPage />} />
    </Routes>
  )
}
