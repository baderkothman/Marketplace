import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { categoriesApi } from '../../api/categories'
import { servicesApi } from '../../api/services'
import { Input } from '../../components/ui/Input'
import { Pagination } from '../../components/ui/Pagination'
import { Select } from '../../components/ui/Select'
import { ServiceCardSkeleton } from '../../components/ui/Skeleton'
import { StarRating } from '../../components/ui/StarRating'
import type { Category, PaginatedResult, Service, ServiceQueryParams } from '../../types'

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top Rated' },
]

function ServiceCard({ service }: { service: Service }) {
  return (
    <Link
      to={`/services/${service.id}`}
      className="group flex flex-col bg-surface-2 border border-border rounded-xl overflow-hidden hover:border-border-strong hover:shadow-card-hover transition-all duration-200"
    >
      <div className="relative h-44 bg-surface-3 overflow-hidden">
        {service.imageUrls[0] ? (
          <img
            src={service.imageUrls[0]}
            alt={service.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 bg-surface-0/80 backdrop-blur-sm text-xs text-text-secondary rounded-full border border-border">
          {service.categoryName}
        </span>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-text-primary text-sm leading-snug line-clamp-2 group-hover:text-brand transition-colors">
          {service.title}
        </h3>
        <p className="text-xs text-text-muted mt-1">{service.vendorName}</p>
        <div className="flex items-center gap-1.5 mt-2">
          <StarRating rating={service.averageRating} size="sm" />
          <span className="text-xs text-text-muted">
            {service.averageRating > 0
              ? `${service.averageRating.toFixed(1)} (${service.totalReviews})`
              : 'New'}
          </span>
        </div>
        <div className="mt-auto pt-3 border-t border-border mt-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-muted">Starting at</p>
            <p className="text-sm font-bold text-brand">${service.price.toFixed(2)}</p>
          </div>
          {service.deliveryTime && (
            <span className="text-xs text-text-muted">{service.deliveryTime}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export function ServicesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [result, setResult] = useState<PaginatedResult<Service> | null>(null)
  const [loading, setLoading] = useState(true)

  const search = searchParams.get('search') ?? ''
  const categoryId = searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : undefined
  const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined
  const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined
  const sortBy = (searchParams.get('sortBy') ?? 'newest') as ServiceQueryParams['sortBy']
  const page = Number(searchParams.get('page') ?? 1)

  useEffect(() => {
    categoriesApi.getAll().then(setCategories)
  }, [])

  useEffect(() => {
    setLoading(true)
    servicesApi
      .getAll({ search, categoryId, minPrice, maxPrice, sortBy, page, pageSize: 12 })
      .then(setResult)
      .finally(() => setLoading(false))
  }, [search, categoryId, minPrice, maxPrice, sortBy, page])

  const updateParam = (key: string, value: string | undefined) => {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    setSearchParams(next)
  }

  const [searchInput, setSearchInput] = useState(search)
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    updateParam('search', searchInput || undefined)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Browse Services</h1>
        <p className="text-text-muted text-sm mt-1">
          {result ? `${result.totalCount.toLocaleString()} services available` : 'Discover skilled professionals'}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <aside className="lg:w-56 flex-shrink-0 space-y-6">
          {/* Search */}
          <form onSubmit={handleSearch}>
            <Input
              placeholder="Search services..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
            />
          </form>

          {/* Categories */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Category</p>
            <div className="space-y-1">
              <button
                onClick={() => updateParam('categoryId', undefined)}
                className={[
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                  !categoryId ? 'bg-brand-subtle text-brand font-medium' : 'text-text-secondary hover:text-text-primary hover:bg-surface-3',
                ].join(' ')}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => updateParam('categoryId', String(c.id))}
                  className={[
                    'w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-between',
                    categoryId === c.id
                      ? 'bg-brand-subtle text-brand font-medium'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-3',
                  ].join(' ')}
                >
                  <span>{c.name}</span>
                  <span className="text-xs text-text-muted">{c.serviceCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">Price Range</p>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Min price"
                value={minPrice ?? ''}
                onChange={(e) => updateParam('minPrice', e.target.value || undefined)}
              />
              <Input
                type="number"
                placeholder="Max price"
                value={maxPrice ?? ''}
                onChange={(e) => updateParam('maxPrice', e.target.value || undefined)}
              />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Sort */}
          <div className="flex items-center justify-end mb-5">
            <Select
              value={sortBy}
              options={sortOptions}
              onChange={(e) => updateParam('sortBy', e.target.value)}
              className="w-48"
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {Array.from({ length: 9 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
            </div>
          ) : !result || result.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-surface-3 flex items-center justify-center">
                <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-text-primary">No services found</p>
                <p className="text-sm text-text-muted mt-1">Try adjusting your filters</p>
              </div>
            </div>
          ) : (
            <>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.25 }}
              >
                {result.items.map((s) => (
                  <ServiceCard key={s.id} service={s} />
                ))}
              </motion.div>

              {result.totalPages > 1 && (
                <div className="flex justify-center mt-10">
                  <Pagination
                    page={result.page}
                    totalPages={result.totalPages}
                    onPageChange={(p) => {
                      const next = new URLSearchParams(searchParams)
                      next.set('page', String(p))
                      setSearchParams(next)
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
