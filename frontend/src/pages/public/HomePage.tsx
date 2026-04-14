import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categoriesApi } from '../../api/categories'
import { servicesApi } from '../../api/services'
import { MarketplaceServiceCard } from '../../components/marketplace/MarketplaceServiceCard'
import { StatePanel } from '../../components/marketplace/StatePanel'
import { ServiceCardSkeleton } from '../../components/ui/Skeleton'
import type { Category, Service } from '../../types'

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

export function HomePage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [topServices, setTopServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadHighlights = () => {
    setLoading(true)
    setError('')

    Promise.all([
      categoriesApi.getAll(),
      servicesApi.getAll({ pageSize: 8, sortBy: 'rating' }),
    ])
      .then(([cats, svc]) => {
        setCategories(cats.slice(0, 6))
        setTopServices(svc.items)
      })
      .catch(() => setError('The marketplace highlights are taking longer than expected to load.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadHighlights()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) navigate(`/services?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-0">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand/3 rounded-full blur-2xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-subtle border border-border-brand rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span className="text-xs font-medium text-brand">2,000+ verified services</span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-text-primary tracking-tight leading-[1.05]"
            >
              Find the service
              <br />
              <span className="text-brand">that moves you</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="mt-6 text-lg text-text-secondary max-w-xl leading-relaxed"
            >
              Connect with skilled vendors across design, development, marketing, and more.
              Quality work, transparent pricing.
            </motion.p>

            <motion.form variants={fadeUp} onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-lg">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search services..."
                  className="w-full pl-10 pr-4 py-3 bg-surface-2 border border-border rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand transition-colors"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-brand hover:bg-brand-hover text-text-inverse font-semibold text-sm rounded-lg transition-colors shadow-glow-sm hover:shadow-glow-brand"
              >
                Search
              </button>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Browse by category</h2>
            <p className="text-sm text-text-muted mt-1">Find the expertise you need</p>
          </div>
          <Link to="/services" className="text-sm text-brand hover:text-brand-hover transition-colors font-medium">
            View all →
          </Link>
        </div>

        {error ? (
          <StatePanel
            compact
            tone="error"
            title="Marketplace categories are unavailable"
            description={error}
            action={<button onClick={loadHighlights} className="text-sm font-medium text-brand hover:text-brand-hover">Retry</button>}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.35 }}
              >
                <Link
                  to={`/services?categoryId=${cat.id}`}
                  className="group flex flex-col items-center gap-2.5 p-4 bg-surface-2 border border-border rounded-xl hover:border-brand/40 hover:bg-surface-3 transition-all duration-200 text-center"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5 text-brand" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-text-primary leading-tight">{cat.name}</p>
                    <p className="text-xs text-text-muted mt-0.5">{cat.serviceCount} services</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Top Services */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex items-baseline justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Top-rated services</h2>
            <p className="text-sm text-text-muted mt-1">Trusted by hundreds of customers</p>
          </div>
          <Link to="/services?sortBy=rating" className="text-sm text-brand hover:text-brand-hover font-medium transition-colors">
            See all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => <ServiceCardSkeleton key={i} />)}
          </div>
        ) : error ? (
          <StatePanel
            tone="error"
            title="Top services could not be loaded"
            description="Refresh the highlights to continue comparing top-rated offers and storefronts."
            action={<button onClick={loadHighlights} className="text-sm font-medium text-brand hover:text-brand-hover">Refresh highlights</button>}
          />
        ) : topServices.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <p>No services available yet. Check back soon!</p>
          </div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            {topServices.map((s) => (
              <motion.div key={s.id} variants={fadeUp}>
                <MarketplaceServiceCard service={s} compact />
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="border-t border-border bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-bold text-text-primary mb-4 tracking-tight">
            Ready to offer your services?
          </h2>
          <p className="text-text-secondary mb-8 max-w-md mx-auto">
            Join thousands of vendors and start earning today. Free to get started.
          </p>
          <Link
            to="/register?role=Vendor"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand hover:bg-brand-hover text-text-inverse font-semibold rounded-lg transition-colors shadow-glow-sm hover:shadow-glow-brand"
          >
            Become a Vendor
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
