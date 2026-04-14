import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-1 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-brand flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-text-inverse" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3z" />
                </svg>
              </div>
              <span className="font-bold text-text-primary">Serviqo</span>
            </div>
            <p className="text-sm text-text-muted max-w-xs leading-relaxed">
              The premium marketplace connecting talented vendors with customers who value quality.
            </p>
          </div>

          {[
            {
              title: 'Marketplace',
              links: [
                { to: '/services', label: 'Browse Services' },
                { to: '/register?role=Vendor', label: 'Become a Vendor' },
              ],
            },
            {
              title: 'Account',
              links: [
                { to: '/login', label: 'Sign In' },
                { to: '/register', label: 'Create Account' },
              ],
            },
          ].map((group) => (
            <div key={group.title}>
              <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-text-muted">
            &copy; {new Date().getFullYear()} Serviqo. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
