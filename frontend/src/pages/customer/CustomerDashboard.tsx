import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ordersApi } from '../../api/orders'
import { reviewsApi } from '../../api/reviews'
import { Badge, orderStatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { StarRating } from '../../components/ui/StarRating'
import { useAuth } from '../../context/AuthContext'
import type { Order } from '../../types'

function ReviewModal({
  order,
  onClose,
  onSuccess,
}: {
  order: Order
  onClose: () => void
  onSuccess: () => void
}) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) { setError('Please write a review.'); return }
    setLoading(true)
    try {
      await reviewsApi.create({ orderId: order.id, rating, comment })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } }
      setError(e?.response?.data?.message ?? 'Failed to submit review.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Leave a Review">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-surface-3 rounded-lg">
          <p className="text-sm text-text-secondary">{order.serviceTitle}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-text-secondary mb-2">Rating</p>
          <StarRating rating={rating} interactive onChange={setRating} size="lg" />
        </div>
        <div>
          <label className="text-sm font-medium text-text-secondary block mb-1.5">Your review</label>
          <textarea
            value={comment}
            onChange={(e) => { setComment(e.target.value); setError('') }}
            placeholder="Share your experience..."
            rows={4}
            className="w-full bg-surface-2 border border-border rounded-md px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand-dark transition-colors resize-none"
          />
        </div>
        {error && <p className="text-xs text-status-error">{error}</p>}
        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={onClose} type="button">Cancel</Button>
          <Button fullWidth loading={loading} type="submit">Submit Review</Button>
        </div>
      </form>
    </Modal>
  )
}

export function CustomerDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null)

  const fetchOrders = () => {
    ordersApi.getAll().then(setOrders).finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const stats = {
    total: orders.length,
    active: orders.filter((o) => o.status === 'Pending' || o.status === 'InProgress').length,
    completed: orders.filter((o) => o.status === 'Completed').length,
  }

  return (
    <DashboardLayout
      title={`Welcome, ${user?.fullName.split(' ')[0]}`}
      subtitle="Track and manage your service orders"
    >
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Orders', value: stats.total, color: 'text-text-primary' },
          { label: 'Active', value: stats.active, color: 'text-status-info' },
          { label: 'Completed', value: stats.completed, color: 'text-status-success' },
        ].map((s) => (
          <div key={s.label} className="bg-surface-2 border border-border rounded-xl p-4">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">My Orders</h2>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-surface-3 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-text-muted">No orders yet. Browse the marketplace to get started!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center gap-4 px-5 py-4 hover:bg-surface-3 transition-colors"
              >
                {/* Service image */}
                <div className="w-12 h-12 rounded-lg bg-surface-3 flex-shrink-0 overflow-hidden">
                  {order.serviceImage ? (
                    <img src={order.serviceImage} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{order.serviceTitle}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-text-muted">by {order.vendorName}</p>
                    <span className="text-text-muted text-xs">&middot;</span>
                    <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Status & price */}
                <div className="flex items-center gap-4 flex-shrink-0">
                  <Badge variant={orderStatusBadge(order.status)}>{order.status}</Badge>
                  <p className="text-sm font-bold text-text-primary w-20 text-right">
                    ${order.totalPrice.toFixed(2)}
                  </p>

                  {/* Review button */}
                  {order.status === 'Completed' && !order.hasReview && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReviewOrder(order)}
                    >
                      Review
                    </Button>
                  )}
                  {order.status === 'Completed' && order.hasReview && (
                    <span className="text-xs text-status-success">Reviewed</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {reviewOrder && (
        <ReviewModal
          order={reviewOrder}
          onClose={() => setReviewOrder(null)}
          onSuccess={fetchOrders}
        />
      )}
    </DashboardLayout>
  )
}
