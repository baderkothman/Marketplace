import { AnimatePresence, motion } from 'framer-motion'
import { Suspense } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { Footer } from './components/layout/Footer'
import { Navbar } from './components/layout/Navbar'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { LoginPage } from './pages/auth/LoginPage'
import { RegisterPage } from './pages/auth/RegisterPage'
import { CustomerDashboard } from './pages/customer/CustomerDashboard'
import { HomePage } from './pages/public/HomePage'
import { SavedServicesPage } from './pages/public/SavedServicesPage'
import { ServiceDetailPage } from './pages/public/ServiceDetailPage'
import { ServicesPage } from './pages/public/ServicesPage'
import { VendorStorefrontPage } from './pages/public/VendorStorefrontPage'
import { VendorDashboard } from './pages/vendor/VendorDashboard'

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

function NotFound() {
  return (
    <div className="min-h-[calc(100dvh-8rem)] flex flex-col items-center justify-center text-center px-4">
      <p className="text-7xl font-extrabold text-text-primary mb-4">404</p>
      <p className="text-xl text-text-muted mb-8">Page not found</p>
      <a href="/" className="px-6 py-3 bg-brand hover:bg-brand-hover text-text-inverse font-semibold rounded-lg transition-colors">
        Go home
      </a>
    </div>
  )
}

export default function App() {
  const location = useLocation()

  // Determine if the current page should show Navbar/Footer
  const isDashboard =
    location.pathname.startsWith('/admin') ||
    location.pathname.startsWith('/vendor') ||
    location.pathname.startsWith('/customer')

  return (
    <div className="min-h-dvh flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Suspense fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
          </div>
        }>
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public */}
              <Route path="/" element={<PageWrapper><HomePage /></PageWrapper>} />
              <Route path="/services" element={<PageWrapper><ServicesPage /></PageWrapper>} />
              <Route path="/services/:id" element={<PageWrapper><ServiceDetailPage /></PageWrapper>} />
              <Route path="/vendors/:vendorId" element={<PageWrapper><VendorStorefrontPage /></PageWrapper>} />
              <Route path="/saved" element={<PageWrapper><SavedServicesPage /></PageWrapper>} />
              <Route path="/login" element={<PageWrapper><LoginPage /></PageWrapper>} />
              <Route path="/register" element={<PageWrapper><RegisterPage /></PageWrapper>} />

              {/* Customer */}
              <Route element={<ProtectedRoute allowedRoles={['Customer']} />}>
                <Route path="/customer/*" element={<PageWrapper><CustomerDashboard /></PageWrapper>} />
              </Route>

              {/* Vendor */}
              <Route element={<ProtectedRoute allowedRoles={['Vendor']} />}>
                <Route path="/vendor/*" element={<PageWrapper><VendorDashboard /></PageWrapper>} />
              </Route>

              {/* Admin */}
              <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                <Route path="/admin/*" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
              </Route>

              {/* Fallback */}
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      {!isDashboard && <Footer />}
    </div>
  )
}
