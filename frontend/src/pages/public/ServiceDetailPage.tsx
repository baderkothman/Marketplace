import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ordersApi } from '../../api/orders'
import { reviewsApi } from '../../api/reviews'
import { servicesApi } from '../../api/services'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { StarRating } from '../../components/ui/StarRating'
import { useAuth } from '../../context/AuthContext'
import type { Review, Service } from '../../types'

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()

  const [service, setService] = useState<Service | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [orderModal, setOrderModal] = useState(false)
  const [orderNote, setOrderNote] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) return
    Promise.all([
      servicesApi.getById(Number(id)),
      reviewsApi.getByService(Number(id)),
    ]).then(([svc, rvs]) => {
      setService(svc)
      setReviews(rvs)
    }).finally(() => setLoading(false))
  }, [id])

  const handleOrder = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }
    if (user?.role !== 'Customer') { setError('Only customers can place orders.'); return }
    setOrdering(true)
    try {
      await ordersApi.create({ serviceId: Number(id), notes: orderNote })
      setOrderSuccess(true)
      setOrderModal(false)
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      setError(err?.response?.data?.message ?? 'Failed to place order.')
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-72 rounded-xl" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="text-center py-32 text-text-muted">
        <p>Service not found.</p>
        <Button variant="ghost" onClick={() => navigate('/services')} className="mt-4">
          Back to services
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      {orderSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-status-success text-sm"
        >
          Order placed successfully! Check your dashboard for updates.
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Image gallery */}
          <div>
            <div className="relative h-72 sm:h-80 bg-surface-2 rounded-xl overflow-hidden border border-border">
              {service.imageUrls[selectedImage] ? (
                <img
                  src={service.imageUrls[selectedImage]}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            {service.imageUrls.length > 1 && (
              <div className="flex gap-2 mt-2">
                {service.imageUrls.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={[
                      'w-16 h-16 rounded-lg overflow-hidden border-2 transition-all',
                      i === selectedImage ? 'border-brand' : 'border-border opacity-60 hover:opacity-100',
                    ].join(' ')}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Title & meta */}
          <div>
            <div className="flex items-start gap-3 flex-wrap">
              <Badge variant="default">{service.categoryName}</Badge>
              {!service.isActive && <Badge variant="error">Unavailable</Badge>}
            </div>
            <h1 className="text-2xl font-bold text-text-primary mt-3 tracking-tight">{service.title}</h1>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <StarRating rating={service.averageRating} size="sm" />
                <span className="text-sm text-text-muted">
                  {service.averageRating > 0
                    ? `${service.averageRating.toFixed(1)} (${service.totalReviews} reviews)`
                    : 'No reviews yet'}
                </span>
              </div>
              <span className="text-text-muted text-sm">&middot;</span>
              <span className="text-sm text-text-muted">{service.totalOrders} orders</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-3">About this service</h2>
            <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
              {service.description}
            </p>
          </div>

          {/* Vendor */}
          <div className="p-5 bg-surface-2 border border-border rounded-xl">
            <h2 className="text-base font-semibold text-text-primary mb-4">About the vendor</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-brand-subtle border border-border-brand flex items-center justify-center text-brand text-lg font-bold flex-shrink-0">
                {service.vendorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-text-primary">{service.vendorName}</p>
                <p className="text-xs text-text-muted mt-0.5">Verified vendor</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <div>
            <h2 className="text-base font-semibold text-text-primary mb-4">
              Reviews ({reviews.length})
            </h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-text-muted py-6 text-center bg-surface-2 rounded-xl border border-border">
                No reviews yet. Be the first to order and review!
              </p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="p-4 bg-surface-2 border border-border rounded-xl">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-3 flex items-center justify-center text-xs font-bold text-text-secondary flex-shrink-0">
                          {r.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">{r.customerName}</p>
                          <p className="text-xs text-text-muted">{new Date(r.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <StarRating rating={r.rating} size="sm" />
                    </div>
                    <p className="text-sm text-text-secondary mt-3 leading-relaxed">{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: order card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="bg-surface-2 border border-border rounded-xl p-5 space-y-5">
              <div>
                <p className="text-xs text-text-muted">Starting at</p>
                <p className="text-3xl font-extrabold text-brand">${service.price.toFixed(2)}</p>
              </div>

              {service.deliveryTime && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {service.deliveryTime}
                </div>
              )}

              {error && (
                <p className="text-xs text-status-error">{error}</p>
              )}

              {service.isActive ? (
                <Button
                  fullWidth
                  size="lg"
                  onClick={() => {
                    setError('')
                    if (!isAuthenticated) {
                      navigate('/login', { state: { from: location } })
                      return
                    }
                    else setOrderModal(true)
                  }}
                >
                  Order Now
                </Button>
              ) : (
                <Button fullWidth size="lg" disabled>
                  Unavailable
                </Button>
              )}

              {!isAuthenticated && (
                <p className="text-xs text-text-muted text-center">
                  Sign in to place an order
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order modal */}
      <Modal open={orderModal} onClose={() => setOrderModal(false)} title="Confirm Order">
        <div className="space-y-4">
          <div className="p-4 bg-surface-3 rounded-lg">
            <p className="text-sm font-medium text-text-primary">{service.title}</p>
            <p className="text-lg font-bold text-brand mt-1">${service.price.toFixed(2)}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary block mb-1.5">
              Notes for vendor (optional)
            </label>
            <textarea
              value={orderNote}
              onChange={(e) => setOrderNote(e.target.value)}
              placeholder="Describe your requirements..."
              rows={3}
              className="w-full bg-surface-2 border border-border rounded-md px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/60 focus:border-brand-dark transition-colors resize-none"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setOrderModal(false)}>
              Cancel
            </Button>
            <Button fullWidth loading={ordering} onClick={handleOrder}>
              Confirm Order
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
