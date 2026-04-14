import { Link } from 'react-router-dom'
import { FavoriteButton } from './FavoriteButton'
import { StarRating } from '../ui/StarRating'
import type { Service } from '../../types'

interface MarketplaceServiceCardProps {
  service: Service
  compact?: boolean
}

export function MarketplaceServiceCard({ service, compact = false }: MarketplaceServiceCardProps) {
  return (
    <article className="group flex flex-col rounded-2xl border border-border bg-surface-2 overflow-hidden transition-all duration-200 hover:border-border-strong hover:shadow-card-hover">
      <div className="relative">
        <Link to={`/services/${service.id}`} className={`block bg-surface-3 overflow-hidden ${compact ? 'h-40' : 'h-48'}`}>
          {service.imageUrls[0] ? (
            <img
              src={service.imageUrls[0]}
              alt={service.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-text-muted">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </Link>

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full border border-border bg-surface-0/85 px-2.5 py-1 text-[11px] font-medium text-text-secondary backdrop-blur-sm">
            {service.categoryName}
          </span>
          <FavoriteButton serviceId={service.id} />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <Link to={`/services/${service.id}`} className="block">
          <h3 className="text-base font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-brand transition-colors">
            {service.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2 text-xs text-text-muted">
          <Link to={`/vendors/${service.vendorId}`} className="font-medium text-text-secondary hover:text-text-primary transition-colors">
            {service.vendorName}
          </Link>
          <span className="text-text-muted/70">•</span>
          <span>{service.totalOrders} orders</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <StarRating rating={service.averageRating} size="sm" />
          <span className="text-xs text-text-muted">
            {service.averageRating > 0
              ? `${service.averageRating.toFixed(1)} (${service.totalReviews})`
              : 'New storefront'}
          </span>
        </div>

        <p className="mt-3 text-sm text-text-muted line-clamp-2">{service.description}</p>

        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between border-t border-border pt-4">
            <div>
              <p className="text-xs text-text-muted">Starting at</p>
              <p className="text-lg font-bold text-brand">${service.price.toFixed(2)}</p>
            </div>

            <div className="text-right">
              <p className="text-xs text-text-muted">Delivery</p>
              <p className="text-sm font-medium text-text-primary">{service.deliveryTime ?? 'Custom timeline'}</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <Link
              to={`/services/${service.id}`}
              className="inline-flex flex-1 items-center justify-center rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-text-inverse transition-colors hover:bg-brand-hover"
            >
              View service
            </Link>
            <Link
              to={`/vendors/${service.vendorId}`}
              className="inline-flex items-center justify-center rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-3 hover:text-text-primary"
            >
              Storefront
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
