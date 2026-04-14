import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { ordersApi } from '../../api/orders'
import { reviewsApi } from '../../api/reviews'
import { servicesApi } from '../../api/services'
import { FavoriteButton } from '../../components/marketplace/FavoriteButton'
import { MarketplaceServiceCard } from '../../components/marketplace/MarketplaceServiceCard'
import { StatePanel } from '../../components/marketplace/StatePanel'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { Skeleton } from '../../components/ui/Skeleton'
import { StarRating } from '../../components/ui/StarRating'
import { useAuth } from '../../context/AuthContext'
import { buildVendorStorefront, getServiceFaqs, getServicePackages } from '../../lib/marketplace'
import type { Review, Service } from '../../types'

export function ServiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, isAuthenticated } = useAuth()

  const [service, setService] = useState<Service | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [catalog, setCatalog] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedPackageId, setSelectedPackageId] = useState<'basic' | 'standard' | 'premium'>('standard')
  const [orderModal, setOrderModal] = useState(false)
  const [orderNote, setOrderNote] = useState('')
  const [ordering, setOrdering] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState('')
  const [orderError, setOrderError] = useState('')

  const loadService = () => {
    if (!id) return

    setLoading(true)
    setError('')

    Promise.all([
      servicesApi.getById(Number(id)),
      reviewsApi.getByService(Number(id)),
      servicesApi.getAll({ page: 1, pageSize: 120, sortBy: 'rating' }),
    ])
      .then(([nextService, nextReviews, servicesResult]) => {
        setService(nextService)
        setReviews(nextReviews)
        setCatalog(servicesResult.items)
        setSelectedImage(0)
      })
      .catch(() => setError('This service could not be loaded right now.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadService()
  }, [id])

  const packages = service ? getServicePackages(service) : []
  const selectedPackage = packages.find((pkg) => pkg.id === selectedPackageId) ?? packages[0]
  const vendorStorefront = service ? buildVendorStorefront(catalog, service.vendorId) : null
  const relatedServices = service
    ? catalog.filter((entry) => entry.vendorId === service.vendorId && entry.id !== service.id).slice(0, 3)
    : []
  const faqs = service ? getServiceFaqs(service) : []
  const canPlaceOrder = !isAuthenticated || user?.role === 'Customer'
  const orderActionLabel = !isAuthenticated
    ? 'Sign in to order'
    : user?.role === 'Customer'
      ? `Request ${selectedPackage?.name}`
      : user?.role === 'Vendor'
        ? 'Switch to a customer account to order'
        : 'Admins cannot place orders'
  const orderHint = !isAuthenticated
    ? 'Sign in with a customer account to place an order and track delivery updates.'
    : user?.role === 'Customer'
      ? 'Package prices and revision scope are currently captured in the order brief until dedicated backend package pricing support is added.'
      : 'Ordering is currently limited to customer accounts. Sign out and continue with a customer account to submit a brief.'

  const handleOrder = async () => {
    if (!service || !selectedPackage) return

    if (!isAuthenticated) {
      navigate('/login', { state: { from: location } })
      return
    }

    if (user?.role !== 'Customer') {
      setOrderError('Only customers can place orders.')
      return
    }

    setOrdering(true)
    try {
      const packageNote = [
        `Requested package: ${selectedPackage.name}`,
        `Package guidance price: $${selectedPackage.price.toFixed(2)}`,
        `Delivery target: ${selectedPackage.deliveryDays} days`,
        `Revisions: ${selectedPackage.revisions}`,
      ].join('\n')

      await ordersApi.create({
        serviceId: Number(id),
        notes: [packageNote, orderNote.trim()].filter(Boolean).join('\n\n'),
      })

      setOrderSuccess(`${selectedPackage.name} package requested successfully. Track updates from your dashboard.`)
      setOrderModal(false)
      setOrderNote('')
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } }
      setOrderError(errorResponse?.response?.data?.message ?? 'Failed to place order.')
    } finally {
      setOrdering(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <Skeleton className="h-[420px] rounded-3xl" />
            <div className="grid grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-2xl" />)}
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-20 rounded-2xl" />
            <Skeleton className="h-40 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !service) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <StatePanel
          tone="error"
          title="Service unavailable"
          description={error || 'The service could not be found.'}
          action={<Button onClick={loadService}>Try again</Button>}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back
      </button>

      {orderSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-green-500/20 bg-green-500/10 px-5 py-4 text-sm text-status-success"
        >
          {orderSuccess}
        </motion.div>
      )}

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-2">
            {service.imageUrls[selectedImage] ? (
              <img src={service.imageUrls[selectedImage]} alt={service.title} className="h-[420px] w-full object-cover" />
            ) : (
              <div className="flex h-[420px] items-center justify-center text-text-muted">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}

            <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
              <Badge variant="default" className="bg-surface-0/85 backdrop-blur-sm">{service.categoryName}</Badge>
              <FavoriteButton serviceId={service.id} showLabel />
            </div>
          </div>

          {service.imageUrls.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {service.imageUrls.map((imageUrl, index) => (
                <button
                  key={`${imageUrl}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  className={[
                    'overflow-hidden rounded-2xl border-2 bg-surface-2 transition-all',
                    selectedImage === index ? 'border-brand' : 'border-border opacity-70 hover:opacity-100',
                  ].join(' ')}
                >
                  <img src={imageUrl} alt="" className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="rounded-[2rem] border border-border bg-surface-2 p-6">
            <div className="flex flex-wrap items-center gap-2">
              {vendorStorefront?.badges.slice(0, 2).map((badge) => (
                <Badge key={badge} variant="brand">{badge}</Badge>
              ))}
              {!service.isActive && <Badge variant="error">Unavailable</Badge>}
            </div>

            <h1 className="mt-4 text-3xl font-bold tracking-tight text-text-primary">{service.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-text-secondary">{service.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <StarRating rating={service.averageRating} size="sm" />
                <span>
                  {service.averageRating > 0
                    ? `${service.averageRating.toFixed(1)} (${service.totalReviews} reviews)`
                    : 'New listing'}
                </span>
              </div>
              <span>•</span>
              <span>{service.totalOrders} completed orders</span>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface-1 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border-brand bg-brand-subtle text-lg font-bold text-brand">
                  {service.vendorAvatar ? (
                    <img src={service.vendorAvatar} alt={service.vendorName} className="h-full w-full rounded-2xl object-cover" />
                  ) : service.vendorName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-text-muted">Offered by</p>
                  <p className="text-lg font-semibold text-text-primary">{service.vendorName}</p>
                  <p className="text-sm text-text-muted">
                    {vendorStorefront?.responseTime ?? 'Typically replies quickly'}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-text-muted">
                {service.vendorBio ?? vendorStorefront?.bio}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-border bg-surface-2 p-4">
                  <p className="text-xs uppercase tracking-wider text-text-muted">Rating</p>
                  <p className="mt-2 text-xl font-bold text-text-primary">{vendorStorefront?.averageRating.toFixed(1) ?? service.averageRating.toFixed(1)}</p>
                  <p className="text-xs text-text-muted">{vendorStorefront?.totalReviews ?? service.totalReviews} public reviews</p>
                </div>
                <div className="rounded-2xl border border-border bg-surface-2 p-4">
                  <p className="text-xs uppercase tracking-wider text-text-muted">Orders</p>
                  <p className="mt-2 text-xl font-bold text-text-primary">{vendorStorefront?.completedOrders ?? service.totalOrders}</p>
                  <p className="text-xs text-text-muted">{vendorStorefront?.repeatClientRate ?? 'Trusted repeat buyers'}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link to={`/vendors/${service.vendorId}`}>
                  <Button variant="secondary">View storefront</Button>
                </Link>
                <Link to={`/services?categoryId=${service.categoryId}`}>
                  <Button variant="ghost">Explore similar services</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border bg-surface-2 p-6">
            <p className="text-xs uppercase tracking-wider text-text-muted">Selected package</p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-3xl font-extrabold text-brand">${selectedPackage?.price.toFixed(2)}</p>
                <p className="text-sm text-text-muted">{selectedPackage?.deliveryDays} day delivery · {selectedPackage?.revisions} revisions</p>
              </div>
              <Badge variant="default">{selectedPackage?.name}</Badge>
            </div>

            {orderError && <p className="mt-4 text-sm text-status-error">{orderError}</p>}

            {service.isActive ? (
              <Button
                fullWidth
                size="lg"
                className="mt-5"
                disabled={isAuthenticated && !canPlaceOrder}
                onClick={() => {
                  setOrderError('')
                  if (!isAuthenticated) {
                    navigate('/login', { state: { from: location } })
                    return
                  }
                  if (!canPlaceOrder) {
                    setOrderError('Ordering is available only for customer accounts.')
                    return
                  }
                  setOrderModal(true)
                }}
              >
                {orderActionLabel}
              </Button>
            ) : (
              <Button fullWidth size="lg" className="mt-5" disabled>Unavailable</Button>
            )}

            <p className="mt-3 text-xs leading-relaxed text-text-muted">
              {orderHint}
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-border bg-surface-2 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-text-muted">Packages</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Pick the delivery depth that fits your brief</h2>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {packages.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedPackageId(pkg.id)}
                className={[
                  'rounded-3xl border p-5 text-left transition-all',
                  selectedPackageId === pkg.id
                    ? 'border-border-brand bg-brand-subtle'
                    : 'border-border bg-surface-1 hover:border-border-strong',
                ].join(' ')}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold text-text-primary">{pkg.name}</p>
                  {pkg.recommended && <Badge variant="brand">Recommended</Badge>}
                </div>
                <p className="mt-2 text-3xl font-bold text-text-primary">${pkg.price.toFixed(0)}</p>
                <p className="mt-1 text-sm text-text-muted">{pkg.deliveryDays} days · {pkg.revisions} revisions</p>
                <p className="mt-4 text-sm leading-relaxed text-text-muted">{pkg.description}</p>
                <ul className="mt-4 space-y-2">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                      <span className="h-1.5 w-1.5 rounded-full bg-brand" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-surface-2 p-6">
          <p className="text-xs uppercase tracking-wider text-text-muted">Common questions</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">FAQs before you place the order</h2>
          <div className="mt-6 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="rounded-2xl border border-border bg-surface-1 p-4">
                <p className="text-sm font-semibold text-text-primary">{faq.question}</p>
                <p className="mt-2 text-sm leading-relaxed text-text-muted">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[2rem] border border-border bg-surface-2 p-6">
          <p className="text-xs uppercase tracking-wider text-text-muted">Reviews</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">What buyers said about this service</h2>

          {reviews.length === 0 ? (
            <div className="mt-6">
              <StatePanel
                compact
                title="No reviews yet"
                description="This service is new on the marketplace. The vendor storefront metrics and packages can still help you judge fit."
              />
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-border bg-surface-1 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-3 text-xs font-bold text-text-secondary">
                        {review.customerName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-text-primary">{review.customerName}</p>
                        <p className="text-xs text-text-muted">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-text-secondary">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {vendorStorefront && vendorStorefront.portfolio.length > 0 && (
            <div className="rounded-[2rem] border border-border bg-surface-2 p-6">
              <p className="text-xs uppercase tracking-wider text-text-muted">Storefront proof</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Recent work from this vendor</h2>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {vendorStorefront.portfolio.slice(0, 4).map((imageUrl, index) => (
                  <div key={imageUrl} className={`overflow-hidden rounded-2xl bg-surface-3 ${index === 0 ? 'col-span-2 min-h-[220px]' : 'min-h-[150px]'}`}>
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-[2rem] border border-border bg-surface-2 p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-text-muted">Same storefront</p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">More services from {service.vendorName}</h2>
              </div>
              {relatedServices.length > 0 && (
                <Link to={`/vendors/${service.vendorId}`} className="text-sm font-medium text-brand hover:text-brand-hover">
                  Open storefront
                </Link>
              )}
            </div>

            {relatedServices.length === 0 ? (
              <div className="mt-6">
                <StatePanel
                  compact
                  title="This is the lead offer right now"
                  description="The storefront currently has no additional public services, so this listing carries the main conversion path."
                />
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-5">
                {relatedServices.map((relatedService) => (
                  <MarketplaceServiceCard key={relatedService.id} service={relatedService} compact />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <Modal open={orderModal} onClose={() => setOrderModal(false)} title="Confirm Order">
        <div className="space-y-4">
          <div className="rounded-2xl bg-surface-3 p-4">
            <p className="text-sm text-text-muted">{service.title}</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">{selectedPackage?.name} package</p>
            <p className="mt-1 text-xl font-bold text-brand">${selectedPackage?.price.toFixed(2)}</p>
            <p className="mt-1 text-sm text-text-muted">{selectedPackage?.deliveryDays} day delivery · {selectedPackage?.revisions} revisions</p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-text-secondary">Notes for vendor</label>
            <textarea
              value={orderNote}
              onChange={(event) => setOrderNote(event.target.value)}
              placeholder="Describe your goals, deadlines, references, or any package-specific expectations."
              rows={4}
              className="w-full resize-none rounded-md border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand/60"
            />
          </div>

          <p className="text-xs leading-relaxed text-text-muted">
            The selected package details are attached to the order note for now. Dedicated backend pricing and revision tracking are still pending.
          </p>

          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth onClick={() => setOrderModal(false)}>Cancel</Button>
            <Button fullWidth loading={ordering} onClick={handleOrder}>Confirm order</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
