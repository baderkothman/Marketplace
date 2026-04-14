import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { categoriesApi } from '../../api/categories'
import { servicesApi } from '../../api/services'
import { MarketplaceServiceCard } from '../../components/marketplace/MarketplaceServiceCard'
import { StatePanel } from '../../components/marketplace/StatePanel'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Pagination } from '../../components/ui/Pagination'
import { Select } from '../../components/ui/Select'
import { ServiceCardSkeleton } from '../../components/ui/Skeleton'
import { useFavorites } from '../../hooks/useFavorites'
import { parseDeliveryDays, sortServices } from '../../lib/marketplace'
import { Link, useSearchParams } from 'react-router-dom'
import type { Category, Service, ServiceQueryParams } from '../../types'

const sortOptions: { value: string; label: string }[] = [
  { value: 'relevance', label: 'Best Match' },
  { value: 'newest', label: 'Newest First' },
  { value: 'rating', label: 'Best Rated' },
  { value: 'fastest_delivery', label: 'Fastest Delivery' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
] as const

const ratingOptions = [
  { value: '', label: 'Any rating' },
  { value: '4', label: '4.0+' },
  { value: '4.5', label: '4.5+' },
]

const deliveryOptions = [
  { value: '', label: 'Any timeline' },
  { value: '3', label: 'Up to 3 days' },
  { value: '7', label: 'Up to 7 days' },
  { value: '14', label: 'Up to 14 days' },
]

export function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { favoriteIds } = useFavorites()
  const [categories, setCategories] = useState<Category[]>([])
  const [allServices, setAllServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)

  const search = searchParams.get('search') ?? ''
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : undefined
  const maxDeliveryDays = searchParams.get('maxDeliveryDays') ? Number(searchParams.get('maxDeliveryDays')) : undefined
  const savedOnly = searchParams.get('saved') === '1'
  const sortBy = (searchParams.get('sortBy') ?? (search ? 'relevance' : 'newest')) as NonNullable<ServiceQueryParams['sortBy']>
  const page = Number(searchParams.get('page') ?? 1)
  const [searchInput, setSearchInput] = useState(search)

  useEffect(() => {
    setSearchInput(search)
  }, [search])

  const loadDiscovery = () => {
    setLoading(true)
    setError('')

    Promise.all([
      categoriesApi.getAll(),
      servicesApi.getAll({ page: 1, pageSize: 120, sortBy: 'newest' }),
    ])
      .then(([nextCategories, servicesResult]) => {
        setCategories(nextCategories)
        setAllServices(servicesResult.items)
      })
      .catch(() => setError('The service catalogue could not be loaded right now.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadDiscovery()
  }, [])

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const clearFilters = () => {
    setSearchParams(search ? new URLSearchParams({ search }) : new URLSearchParams())
  }

  const matchesSearch = (service: Service) => {
    if (!search.trim()) return true
    const normalized = search.trim().toLowerCase()
    return [
      service.title,
      service.description,
      service.categoryName,
      service.vendorName,
    ].some((field) => field.toLowerCase().includes(normalized))
  }

  const filtered = allServices.filter((service) => {
    if (!matchesSearch(service)) return false
    if (categoryId && service.categoryId !== categoryId) return false
    if (typeof minPrice === 'number' && service.price < minPrice) return false
    if (typeof maxPrice === 'number' && service.price > maxPrice) return false
    if (typeof minRating === 'number' && service.averageRating < minRating) return false
    if (typeof maxDeliveryDays === 'number') {
      const deliveryDays = parseDeliveryDays(service.deliveryTime)
      if (!deliveryDays || deliveryDays > maxDeliveryDays) return false
    }
    if (savedOnly && !favoriteIds.includes(service.id)) return false
    return true
  })

  const sorted = sortServices(filtered, sortBy, search)
  const pageSize = 12
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const activePage = Math.min(page, totalPages)
  const items = sorted.slice((activePage - 1) * pageSize, activePage * pageSize)
  const activeCategory = categories.find((category) => category.id === categoryId)
  const activeFilters = [
    search ? `Search: ${search}` : '',
    activeCategory ? activeCategory.name : '',
    minRating ? `${minRating.toFixed(1)}+ rated` : '',
    maxDeliveryDays ? `Up to ${maxDeliveryDays} days` : '',
    savedOnly ? 'Saved only' : '',
    minPrice ? `From $${minPrice}` : '',
    maxPrice ? `Up to $${maxPrice}` : '',
  ].filter(Boolean)

  const renderFilters = (mobile = false) => (
    <div className={`space-y-6 ${mobile ? '' : 'lg:sticky lg:top-24'}`}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          updateParam('search', searchInput || undefined)
          if (mobile) setFiltersOpen(false)
        }}
      >
        <Input
          placeholder="Search by service, vendor, or category"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </form>

      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted">Category</p>
        <div className="space-y-1">
          <button
            onClick={() => updateParam('categoryId', undefined)}
            className={[
              'w-full rounded-lg px-3 py-2 text-left text-sm transition-colors',
              !categoryId ? 'bg-brand-subtle text-brand font-medium' : 'text-text-secondary hover:bg-surface-3 hover:text-text-primary',
            ].join(' ')}
          >
            All categories
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => updateParam('categoryId', String(category.id))}
              className={[
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors',
                categoryId === category.id
                  ? 'bg-brand-subtle text-brand font-medium'
                  : 'text-text-secondary hover:bg-surface-3 hover:text-text-primary',
              ].join(' ')}
            >
              <span>{category.name}</span>
              <span className="text-xs text-text-muted">{category.serviceCount}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          type="number"
          label="Min price"
          placeholder="0"
          value={minPrice ?? ''}
          onChange={(event) => updateParam('minPrice', event.target.value || undefined)}
        />
        <Input
          type="number"
          label="Max price"
          placeholder="5000"
          value={maxPrice ?? ''}
          onChange={(event) => updateParam('maxPrice', event.target.value || undefined)}
        />
      </div>

      <Select
        label="Minimum rating"
        value={minRating ? String(minRating) : ''}
        options={ratingOptions}
        onChange={(event) => updateParam('minRating', event.target.value || undefined)}
      />

      <Select
        label="Delivery window"
        value={maxDeliveryDays ? String(maxDeliveryDays) : ''}
        options={deliveryOptions}
        onChange={(event) => updateParam('maxDeliveryDays', event.target.value || undefined)}
      />

      <button
        type="button"
        onClick={() => updateParam('saved', savedOnly ? undefined : '1')}
        className={[
          'flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm transition-colors',
          savedOnly ? 'border-border-brand bg-brand-subtle text-brand' : 'border-border bg-surface-2 text-text-secondary hover:text-text-primary',
        ].join(' ')}
      >
        <span>Saved services only</span>
        <span className="text-xs">{favoriteIds.length}</span>
      </button>

      <div className="flex gap-3">
        <Button variant="secondary" fullWidth onClick={clearFilters}>Reset filters</Button>
        {mobile && (
          <Button
            fullWidth
            onClick={() => {
              updateParam('search', searchInput || undefined)
              setFiltersOpen(false)
            }}
          >
            Apply
          </Button>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary">Browse Services</h1>
          <p className="mt-1 text-sm text-text-muted">
            Compare storefront quality, package fit, delivery speed, and trust signals before you order.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
            Filters
          </Button>
          <Select
            value={sortBy}
            options={sortOptions}
            onChange={(event) => updateParam('sortBy', event.target.value)}
            className="w-52"
          />
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {activeFilters.map((filterLabel) => (
            <span key={filterLabel} className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-text-secondary">
              {filterLabel}
            </span>
          ))}
          <button onClick={clearFilters} className="text-sm font-medium text-brand hover:text-brand-hover">
            Clear all
          </button>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0">
          {renderFilters()}
        </aside>

        <div className="flex-1 min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-text-muted">
              {loading ? 'Loading services...' : `${sorted.length.toLocaleString()} services found`}
            </p>
            {savedOnly && favoriteIds.length === 0 && (
              <Link to="/saved" className="text-sm font-medium text-brand hover:text-brand-hover">
                View saved list
              </Link>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 9 }).map((_, index) => <ServiceCardSkeleton key={index} />)}
            </div>
          ) : error ? (
            <StatePanel
              tone="error"
              title="Discovery is unavailable"
              description={error}
              action={<Button onClick={loadDiscovery}>Reload services</Button>}
            />
          ) : items.length === 0 ? (
            <StatePanel
              title="No services match these filters"
              description="Try widening the delivery window, clearing saved-only mode, or resetting filters to reopen the catalogue."
              action={<Button onClick={clearFilters}>Reset filters</Button>}
            />
          ) : (
            <>
              <motion.div
                className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {items.map((service) => (
                  <MarketplaceServiceCard key={service.id} service={service} />
                ))}
              </motion.div>

              <div className="mt-10 flex justify-center">
                <Pagination
                  page={activePage}
                  totalPages={totalPages}
                  onPageChange={(nextPage) => {
                    const next = new URLSearchParams(searchParams)
                    next.set('page', String(nextPage))
                    setSearchParams(next)
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters" size="md">
        {renderFilters(true)}
      </Modal>
    </div>
  )
}
