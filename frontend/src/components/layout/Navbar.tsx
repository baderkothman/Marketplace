import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../hooks/useFavorites'
import { Button } from '../ui/Button'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { favoritesCount } = useFavorites()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const dashboardPath =
    user?.role === 'Admin'
      ? '/admin'
      : user?.role === 'Vendor'
        ? '/vendor'
        : '/customer'

  const handleLogout = () => {
    logout()
    navigate('/')
    setDropdownOpen(false)
  }

  const savedPath = user?.role === 'Customer' ? '/customer/saved' : '/saved'
  const navItems = [
    { to: '/services', label: 'Browse Services' },
    { to: savedPath, label: 'Saved', count: favoritesCount },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface-0/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16 gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 mr-6 flex-shrink-0">
          <div className="w-7 h-7 rounded-md bg-brand flex items-center justify-center">
            <svg className="w-4 h-4 text-text-inverse" fill="currentColor" viewBox="0 0 20 20">
              <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
            </svg>
          </div>
          <span className="text-base font-bold text-text-primary tracking-tight">Serviqo</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 flex-1">
          {navItems.map(({ to, label, count }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                [
                  'inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors',
                  isActive
                    ? 'bg-surface-3 text-text-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-2',
                ].join(' ')
              }
            >
              {label}
              {(count ?? 0) > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-subtle px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                  {count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Auth area */}
        <div className="ml-auto flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-surface-2 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-brand-subtle border border-border-brand flex items-center justify-center text-brand text-xs font-bold">
                  {user!.fullName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-text-primary hidden sm:block">
                  {user!.fullName.split(' ')[0]}
                </span>
                <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                    <motion.div
                      className="absolute right-0 mt-2 w-52 bg-surface-2 border border-border rounded-xl shadow-card-hover z-20 overflow-hidden"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-semibold text-text-primary truncate">{user!.fullName}</p>
                        <p className="text-xs text-text-muted truncate">{user!.email}</p>
                        <span className="inline-flex mt-1 px-2 py-0.5 bg-brand-subtle text-brand text-xs rounded-full font-medium">
                          {user!.role}
                        </span>
                      </div>
                      <div className="py-1">
                        <Link
                          to={dashboardPath}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                          </svg>
                          Dashboard
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-status-error hover:bg-surface-3 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                Sign in
              </Button>
              <Button size="sm" onClick={() => navigate('/register')}>
                Get started
              </Button>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            className="md:hidden p-1.5 text-text-secondary hover:text-text-primary"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden border-t border-border bg-surface-1 px-4 py-3 space-y-1"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <Link
              to="/services"
              onClick={() => setMobileOpen(false)}
              className="block py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              Browse Services
            </Link>
            <Link
              to={savedPath}
              onClick={() => setMobileOpen(false)}
              className="flex items-center justify-between py-2 text-sm text-text-secondary hover:text-text-primary"
            >
              <span>Saved</span>
              {favoritesCount > 0 && (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-brand-subtle px-1.5 py-0.5 text-[11px] font-semibold text-brand">
                  {favoritesCount}
                </span>
              )}
            </Link>
            {isAuthenticated && (
              <Link
                to={dashboardPath}
                onClick={() => setMobileOpen(false)}
                className="block py-2 text-sm text-text-secondary hover:text-text-primary"
              >
                Dashboard
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
