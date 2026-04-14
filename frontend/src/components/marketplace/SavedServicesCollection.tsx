import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { servicesApi } from '../../api/services'
import { useFavorites } from '../../hooks/useFavorites'
import { MarketplaceServiceCard } from './MarketplaceServiceCard'
import { StatePanel } from './StatePanel'
import { Button } from '../ui/Button'
import { ServiceCardSkeleton } from '../ui/Skeleton'
import type { Service } from '../../types'

export function SavedServicesCollection() {
  const { favoriteIds, clearFavorites } = useFavorites()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadServices = () => {
    setLoading(true)
    setError('')

    servicesApi
      .getAll({ page: 1, pageSize: 120, sortBy: 'newest' })
      .then((result) => setServices(result.items))
      .catch(() => setError('We could not load your saved services right now.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadServices()
  }, [])

  const savedServices = services.filter((service) => favoriteIds.includes(service.id))

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => <ServiceCardSkeleton key={index} />)}
      </div>
    )
  }

  if (error) {
    return (
      <StatePanel
        tone="error"
        title="Saved services are unavailable"
        description={error}
        action={<Button onClick={loadServices}>Try again</Button>}
      />
    )
  }

  if (favoriteIds.length === 0) {
    return (
      <StatePanel
        title="Start building your shortlist"
        description="Save standout services as you browse so you can compare storefronts, packages, and delivery options in one place."
        action={
          <Link to="/services">
            <Button>Browse services</Button>
          </Link>
        }
      />
    )
  }

  if (savedServices.length === 0) {
    return (
      <StatePanel
        title="Your saved list needs a refresh"
        description="Some previously saved services are no longer available. Clear the list and build a fresh shortlist."
        action={<Button variant="secondary" onClick={clearFavorites}>Clear saved services</Button>}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-text-primary">{savedServices.length} saved services</p>
          <p className="text-sm text-text-muted">Compare offers, revisit strong storefronts, and move when you are ready.</p>
        </div>
        <Button variant="ghost" onClick={clearFavorites}>Clear all</Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {savedServices.map((service) => (
          <MarketplaceServiceCard key={service.id} service={service} />
        ))}
      </div>
    </div>
  )
}
