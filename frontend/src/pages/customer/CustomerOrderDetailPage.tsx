import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ordersApi } from '../../api/orders'
import { servicesApi } from '../../api/services'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Badge, orderStatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatePanel } from '../../components/marketplace/StatePanel'
import { OrderTimeline } from '../../components/marketplace/OrderTimeline'
import { ReviewOrderModal } from '../../components/marketplace/ReviewOrderModal'
import { buildOrderNotifications, buildOrderTimeline, formatShortDate } from '../../lib/marketplace'
import type { Order, ProductNotification, Service } from '../../types'

function NotificationCard({ notification }: { notification: ProductNotification }) {
  const toneClasses = {
    info: 'border-blue-500/20 bg-blue-500/5',
    success: 'border-green-500/20 bg-green-500/5',
    warning: 'border-yellow-500/20 bg-yellow-500/5',
  }

  return (
    <div className={`rounded-2xl border p-4 ${toneClasses[notification.tone]}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-text-primary">{notification.title}</p>
        <span className="text-xs text-text-muted">{formatShortDate(notification.createdAt)}</span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{notification.body}</p>
    </div>
  )
}

export function CustomerOrderDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewOpen, setReviewOpen] = useState(false)

  const loadOrder = () => {
    if (!id) return
    setLoading(true)
    setError('')

    ordersApi
      .getById(Number(id))
      .then(async (nextOrder) => {
        setOrder(nextOrder)
        const nextService = await servicesApi.getById(nextOrder.serviceId)
        setService(nextService)
      })
      .catch(() => setError('We could not load this order right now.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadOrder()
  }, [id])

  const timeline = order ? buildOrderTimeline(order, service?.deliveryTime) : []
  const notifications = order ? buildOrderNotifications(order, service?.deliveryTime) : []

  if (loading) {
    return (
      <DashboardLayout title="Order detail" subtitle="Loading the latest delivery information.">
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Skeleton className="h-80 rounded-2xl" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !order) {
    return (
      <DashboardLayout title="Order detail" subtitle="A closer look at delivery progress and updates.">
        <StatePanel
          tone="error"
          title="Order detail unavailable"
          description={error || 'This order could not be found.'}
          action={<Button onClick={loadOrder}>Try again</Button>}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={order.serviceTitle}
      subtitle={`Order #${order.id} - placed ${formatShortDate(order.createdAt)}`}
      actions={
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate('/customer')}>Back to orders</Button>
          {order.status === 'Completed' && !order.hasReview && (
            <Button onClick={() => setReviewOpen(true)}>Leave review</Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-border bg-surface-2 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={orderStatusBadge(order.status)}>{order.status}</Badge>
              <span className="text-sm text-text-muted">Vendor: {order.vendorName}</span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-surface-1 p-4">
                <p className="text-xs uppercase tracking-wider text-text-muted">Current total</p>
                <p className="mt-2 text-2xl font-bold text-text-primary">${order.totalPrice.toFixed(2)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-1 p-4">
                <p className="text-xs uppercase tracking-wider text-text-muted">Expected delivery</p>
                <p className="mt-2 text-base font-semibold text-text-primary">{service?.deliveryTime ?? 'Custom timeline'}</p>
              </div>
              <div className="rounded-2xl border border-border bg-surface-1 p-4">
                <p className="text-xs uppercase tracking-wider text-text-muted">Last update</p>
                <p className="mt-2 text-base font-semibold text-text-primary">{formatShortDate(order.updatedAt)}</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface-1 p-5">
              <p className="text-xs uppercase tracking-wider text-text-muted">Brief and expectations</p>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">
                {order.notes || 'No extra notes were attached to this order. The vendor will work from the selected service scope and timeline.'}
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface-2 p-6">
            <p className="text-xs uppercase tracking-wider text-text-muted">Recent notifications</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-text-primary">What changed on this order</h2>
            <div className="mt-5 space-y-3">
              {notifications.map((notification) => (
                <NotificationCard key={notification.id} notification={notification} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-3xl border border-border bg-surface-2 p-6">
            <p className="text-xs uppercase tracking-wider text-text-muted">Delivery timeline</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-text-primary">Status progression</h2>
            <div className="mt-6">
              <OrderTimeline steps={timeline} />
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-surface-2 p-6">
            <p className="text-xs uppercase tracking-wider text-text-muted">Service context</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-text-primary">Ordered from the storefront</h2>
            <div className="mt-5 flex gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-2xl bg-surface-3 flex-shrink-0">
                {order.serviceImage ? (
                  <img src={order.serviceImage} alt={order.serviceTitle} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-text-muted">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="text-lg font-semibold text-text-primary">{order.serviceTitle}</p>
                <p className="mt-2 text-sm text-text-muted leading-relaxed">
                  {service?.description ?? 'Open the service again to review the package scope, storefront trust signals, and FAQs.'}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to={`/services/${order.serviceId}`}>
                    <Button variant="secondary">View service</Button>
                  </Link>
                  <Link to={`/vendors/${order.vendorId}`}>
                    <Button variant="ghost">Open storefront</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {reviewOpen && (
        <ReviewOrderModal
          order={order}
          onClose={() => setReviewOpen(false)}
          onSuccess={loadOrder}
        />
      )}
    </DashboardLayout>
  )
}
