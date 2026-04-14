import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { servicesApi } from '../../api/services'
import { MarketplaceServiceCard } from '../../components/marketplace/MarketplaceServiceCard'
import { StatePanel } from '../../components/marketplace/StatePanel'
import { Button } from '../../components/ui/Button'
import { ServiceCardSkeleton } from '../../components/ui/Skeleton'
import { buildVendorStorefront } from '../../lib/marketplace'
import { Badge } from '../../components/ui/Badge'
import { StarRating } from '../../components/ui/StarRating'
import type { Service } from '../../types'

function metricCard(label: string, value: string, description: string) {
  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-4">
      <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p className="mt-2 text-2xl font-bold text-text-primary">{value}</p>
      <p className="mt-1 text-sm text-text-muted">{description}</p>
    </div>
  )
}

export function VendorStorefrontPage() {
  const { vendorId } = useParams<{ vendorId: string }>()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadStorefront = () => {
    setLoading(true)
    setError('')

    servicesApi
      .getAll({ page: 1, pageSize: 120, sortBy: 'rating' })
      .then((result) => setServices(result.items))
      .catch(() => setError('This storefront could not be loaded right now.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadStorefront()
  }, [vendorId])

  const storefront = vendorId ? buildVendorStorefront(services, vendorId) : null

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8">
          <div className="rounded-3xl border border-border bg-surface-2 p-8">
            <div className="h-10 w-2/3 animate-shimmer rounded-md bg-surface-3" />
            <div className="mt-4 h-5 w-full animate-shimmer rounded-md bg-surface-3" />
            <div className="mt-2 h-5 w-5/6 animate-shimmer rounded-md bg-surface-3" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-2xl bg-surface-2 animate-shimmer" />
            ))}
          </div>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <ServiceCardSkeleton key={index} />)}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <StatePanel
          tone="error"
          title="Storefront unavailable"
          description={error}
          action={<Button onClick={loadStorefront}>Try again</Button>}
        />
      </div>
    )
  }

  if (!storefront) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <StatePanel
          title="We couldn't find that storefront"
          description="The vendor may have paused their public services or the storefront link is no longer active."
          action={
            <Link to="/services">
              <Button>Browse services</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="relative overflow-hidden rounded-[2rem] border border-border bg-surface-1 p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-brand/10 to-transparent pointer-events-none" />

          <div className="relative">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border-brand bg-brand-subtle text-xl font-bold text-brand">
                {storefront.avatar ? (
                  <img src={storefront.avatar} alt={storefront.name} className="h-full w-full rounded-2xl object-cover" />
                ) : storefront.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight text-text-primary">{storefront.name}</h1>
                  <Badge variant="brand">Verified storefront</Badge>
                </div>
                <p className="mt-1 text-sm text-text-muted">{storefront.headline}</p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {storefront.badges.map((badge) => (
                <Badge key={badge} variant="default" className="bg-surface-3">{badge}</Badge>
              ))}
            </div>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-text-secondary">
              {storefront.bio}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-text-muted">
              <div className="flex items-center gap-2">
                <StarRating rating={storefront.averageRating} size="sm" />
                <span>{storefront.averageRating.toFixed(1)} rating</span>
              </div>
              <span>•</span>
              <span>{storefront.totalReviews} public reviews</span>
              <span>•</span>
              <span>{storefront.totalOrders} orders handled</span>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={storefront.featuredServices[0] ? `/services/${storefront.featuredServices[0].id}` : '/services'}>
                <Button>Order a featured service</Button>
              </Link>
              <Link to="/services">
                <Button variant="secondary">Keep browsing</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {metricCard('Rating', storefront.averageRating.toFixed(1), `${storefront.totalReviews} client reviews`)}
          {metricCard('Response', storefront.responseTime.replace('Usually within ', ''), storefront.responseTime)}
          {metricCard('Completed', `${storefront.completedOrders}`, 'Estimated completed engagements')}
          {metricCard('Repeat clients', storefront.repeatClientRate, 'Returning buyers across services')}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-3xl border border-border bg-surface-2 p-6">
          <p className="text-xs uppercase tracking-wider text-text-muted">Why teams hire this vendor</p>
          <div className="mt-4 space-y-4">
            {storefront.specialties.map((specialty) => (
              <div key={specialty} className="rounded-2xl border border-border bg-surface-1 p-4">
                <p className="text-sm font-semibold text-text-primary">{specialty}</p>
                <p className="mt-1 text-sm text-text-muted">
                  Scoped delivery, clear communication, and a final handoff that is ready for launch or review.
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-border bg-surface-2 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-text-muted">Portfolio highlights</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Proof through shipped work</h2>
            </div>
            <span className="text-sm text-text-muted">{storefront.portfolio.length} recent visuals</span>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
            {storefront.portfolio.map((imageUrl, index) => (
              <div key={imageUrl} className={`overflow-hidden rounded-2xl bg-surface-3 ${index === 0 ? 'md:col-span-2 md:row-span-2 min-h-[280px]' : 'min-h-[132px]'}`}>
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-text-muted">Featured offers</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-text-primary">Services available from this storefront</h2>
          </div>
          <p className="text-sm text-text-muted">Conversion-oriented packages with clear scopes and delivery windows.</p>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {storefront.featuredServices.map((service) => (
            <MarketplaceServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>
    </div>
  )
}
