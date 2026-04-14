import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
}

function SidebarLink({ to, label, icon }: NavItem) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
          isActive
            ? 'bg-brand-subtle text-brand border border-border-brand'
            : 'text-text-secondary hover:text-text-primary hover:bg-surface-3',
        ].join(' ')
      }
    >
      <span className="flex-shrink-0">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

const icons = {
  dashboard: (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  services: (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  orders: (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  users: (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  categories: (
    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
}

const customerLinks: NavItem[] = [
  { to: '/customer', label: 'My Orders', icon: icons.orders },
]

const vendorLinks: NavItem[] = [
  { to: '/vendor', label: 'Overview', icon: icons.dashboard },
  { to: '/vendor/services', label: 'My Services', icon: icons.services },
  { to: '/vendor/orders', label: 'Orders', icon: icons.orders },
]

const adminLinks: NavItem[] = [
  { to: '/admin', label: 'Overview', icon: icons.dashboard },
  { to: '/admin/users', label: 'Users', icon: icons.users },
  { to: '/admin/orders', label: 'All Orders', icon: icons.orders },
  { to: '/admin/categories', label: 'Categories', icon: icons.categories },
]

export function Sidebar() {
  const { user } = useAuth()

  const links =
    user?.role === 'Admin'
      ? adminLinks
      : user?.role === 'Vendor'
        ? vendorLinks
        : customerLinks

  return (
    <aside className="w-56 flex-shrink-0 hidden lg:flex flex-col gap-1 px-2 py-4 border-r border-border min-h-[calc(100vh-4rem)] bg-surface-1">
      <div className="px-3 mb-3">
        <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
          {user?.role} Menu
        </p>
      </div>
      {links.map((link) => (
        <SidebarLink key={link.to} {...link} />
      ))}

      <div className="mt-auto">
        <NavLink
          to="/services"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-surface-3 transition-colors"
        >
          <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Browse Marketplace
        </NavLink>
      </div>
    </aside>
  )
}
