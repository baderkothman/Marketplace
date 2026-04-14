import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { categoriesApi } from '../../api/categories'
import { ordersApi } from '../../api/orders'
import { servicesApi } from '../../api/services'
import { vendorApi } from '../../api/vendor'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Badge, orderStatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input, Textarea } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import { StarRating } from '../../components/ui/StarRating'
import type { Category, Order, Service, VendorStats } from '../../types'

// ── Stats Overview ─────────────────────────────────────────────────────────────
function VendorOverview() {
  const [stats, setStats] = useState<VendorStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    vendorApi.getStats().then(setStats).finally(() => setLoading(false))
  }, [])

  const cards = stats
    ? [
        { label: 'Total Services', value: stats.totalServices, sub: `${stats.activeServices} active` },
        { label: 'Total Orders', value: stats.totalOrders, sub: `${stats.pendingOrders} pending` },
        { label: 'Completed', value: stats.completedOrders, sub: 'orders delivered' },
        { label: 'Total Earnings', value: `$${stats.totalEarnings.toFixed(0)}`, sub: 'from completed orders' },
        { label: 'Avg Rating', value: stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—', sub: 'across all services' },
      ]
    : []

  return (
    <DashboardLayout title="Vendor Overview" subtitle="Your performance at a glance">
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-surface-2 border border-border rounded-xl p-4">
              <p className="text-xs text-text-muted">{c.label}</p>
              <p className="text-xl font-bold text-text-primary mt-1">{c.value}</p>
              <p className="text-xs text-text-muted mt-0.5">{c.sub}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-8 grid grid-cols-2 gap-4">
        <Link to="/vendor/services" className="block p-5 bg-surface-2 border border-border rounded-xl hover:border-border-strong transition-colors group">
          <p className="text-xs text-text-muted">Quick action</p>
          <p className="text-sm font-semibold text-text-primary mt-1 group-hover:text-brand transition-colors">Manage Services →</p>
        </Link>
        <Link to="/vendor/orders" className="block p-5 bg-surface-2 border border-border rounded-xl hover:border-border-strong transition-colors group">
          <p className="text-xs text-text-muted">Quick action</p>
          <p className="text-sm font-semibold text-text-primary mt-1 group-hover:text-brand transition-colors">View Orders →</p>
        </Link>
      </div>
    </DashboardLayout>
  )
}

// ── Service Form ───────────────────────────────────────────────────────────────
interface ServiceFormProps {
  initial?: Partial<Service>
  categories: Category[]
  onSave: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  loading: boolean
}

function ServiceForm({ initial, categories, onSave, onCancel, loading }: ServiceFormProps) {
  const [form, setForm] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    price: initial?.price ?? '',
    deliveryTime: initial?.deliveryTime ?? '',
    categoryId: initial?.categoryId ?? '',
    imageUrls: initial?.imageUrls?.join('\n') ?? '',
    isActive: initial?.isActive ?? true,
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description || !form.price || !form.categoryId) {
      setError('Please fill in all required fields.')
      return
    }
    await onSave({
      title: form.title,
      description: form.description,
      price: Number(form.price),
      deliveryTime: form.deliveryTime || undefined,
      categoryId: Number(form.categoryId),
      imageUrls: form.imageUrls.split('\n').map((u) => u.trim()).filter(Boolean),
      isActive: form.isActive,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Title *"
        value={form.title}
        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
        placeholder="e.g. Professional Logo Design"
        required
      />
      <Textarea
        label="Description *"
        value={form.description}
        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
        placeholder="Describe your service in detail..."
        rows={4}
        required
      />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Price ($) *"
          type="number"
          min="0.01"
          step="0.01"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          required
        />
        <Input
          label="Delivery Time"
          value={form.deliveryTime}
          onChange={(e) => setForm((f) => ({ ...f, deliveryTime: e.target.value }))}
          placeholder="e.g. 3 days"
        />
      </div>
      <Select
        label="Category *"
        value={String(form.categoryId)}
        options={categories.map((c) => ({ value: c.id, label: c.name }))}
        placeholder="Select a category"
        onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
        required
      />
      <Textarea
        label="Image URLs (one per line)"
        value={form.imageUrls}
        onChange={(e) => setForm((f) => ({ ...f, imageUrls: e.target.value }))}
        placeholder="https://example.com/image1.jpg"
        rows={3}
      />
      {initial && (
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))}
            className="w-4 h-4 rounded border-border accent-brand"
          />
          <span className="text-sm text-text-secondary">Active (visible to customers)</span>
        </label>
      )}
      {error && <p className="text-xs text-status-error">{error}</p>}
      <div className="flex gap-3 pt-2">
        <Button variant="secondary" fullWidth type="button" onClick={onCancel}>Cancel</Button>
        <Button fullWidth loading={loading} type="submit">
          {initial ? 'Save changes' : 'Create service'}
        </Button>
      </div>
    </form>
  )
}

// ── My Services ────────────────────────────────────────────────────────────────
function VendorServices() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editService, setEditService] = useState<Service | null>(null)
  const [saving, setSaving] = useState(false)

  const fetchAll = () => {
    Promise.all([vendorApi.getMyServices(), categoriesApi.getAll()])
      .then(([svcs, cats]) => { setServices(svcs); setCategories(cats) })
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchAll() }, [])

  const handleCreate = async (data: Record<string, unknown>) => {
    setSaving(true)
    try {
      await servicesApi.create(data as Parameters<typeof servicesApi.create>[0])
      setCreateOpen(false)
      fetchAll()
    } finally { setSaving(false) }
  }

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editService) return
    setSaving(true)
    try {
      await servicesApi.update(editService.id, data as Parameters<typeof servicesApi.update>[1])
      setEditService(null)
      fetchAll()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this service?')) return
    await servicesApi.delete(id)
    fetchAll()
  }

  return (
    <DashboardLayout
      title="My Services"
      subtitle="Manage your service offerings"
      actions={<Button onClick={() => setCreateOpen(true)}>+ New Service</Button>}
    >
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-text-muted text-sm mb-4">No services yet. Create your first one!</p>
          <Button onClick={() => setCreateOpen(true)}>Create Service</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 p-4 bg-surface-2 border border-border rounded-xl hover:border-border-strong transition-colors"
            >
              <div className="w-14 h-14 rounded-lg bg-surface-3 flex-shrink-0 overflow-hidden">
                {s.imageUrls[0] ? (
                  <img src={s.imageUrls[0]} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary truncate">{s.title}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted">{s.categoryName}</span>
                  <span className="text-xs font-bold text-brand">${s.price.toFixed(2)}</span>
                  <StarRating rating={s.averageRating} size="sm" />
                  <span className="text-xs text-text-muted">{s.totalOrders} orders</span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={s.isActive ? 'success' : 'error'}>{s.isActive ? 'Active' : 'Inactive'}</Badge>
                <Button size="sm" variant="secondary" onClick={() => setEditService(s)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(s.id)}>Delete</Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Service" size="lg">
        <ServiceForm
          categories={categories}
          onSave={handleCreate}
          onCancel={() => setCreateOpen(false)}
          loading={saving}
        />
      </Modal>

      <Modal open={!!editService} onClose={() => setEditService(null)} title="Edit Service" size="lg">
        {editService && (
          <ServiceForm
            initial={editService}
            categories={categories}
            onSave={handleUpdate}
            onCancel={() => setEditService(null)}
            loading={saving}
          />
        )}
      </Modal>
    </DashboardLayout>
  )
}

// ── Vendor Orders ──────────────────────────────────────────────────────────────
function VendorOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<number | null>(null)

  const fetchOrders = () => {
    vendorApi.getMyOrders().then(setOrders).finally(() => setLoading(false))
  }
  useEffect(() => { fetchOrders() }, [])

  const handleStatus = async (id: number, status: string) => {
    setUpdating(id)
    try {
      await ordersApi.updateStatus(id, status)
      fetchOrders()
    } finally { setUpdating(null) }
  }

  const nextStatus: Record<string, string | null> = {
    Pending: 'InProgress',
    InProgress: 'Completed',
    Completed: null,
    Cancelled: null,
  }
  const nextLabel: Record<string, string> = {
    Pending: 'Start',
    InProgress: 'Complete',
  }

  return (
    <DashboardLayout title="Incoming Orders" subtitle="Manage customer orders for your services">
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="py-20 text-center text-text-muted text-sm">No orders yet.</div>
      ) : (
        <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
          <div className="divide-y divide-border">
            {orders.map((order) => (
              <div key={order.id} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-3 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{order.serviceTitle}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-xs text-text-muted">{order.customerName}</p>
                    <span className="text-text-muted text-xs">&middot;</span>
                    <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  {order.notes && (
                    <p className="text-xs text-text-muted mt-1 italic">"{order.notes}"</p>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge variant={orderStatusBadge(order.status)}>{order.status}</Badge>
                  <span className="text-sm font-bold text-text-primary">${order.totalPrice.toFixed(2)}</span>
                  {nextStatus[order.status] && (
                    <Button
                      size="sm"
                      loading={updating === order.id}
                      onClick={() => handleStatus(order.id, nextStatus[order.status]!)}
                    >
                      {nextLabel[order.status]}
                    </Button>
                  )}
                  {order.status === 'Pending' && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleStatus(order.id, 'Cancelled')}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}

// ── Router ─────────────────────────────────────────────────────────────────────
export function VendorDashboard() {
  return (
    <Routes>
      <Route index element={<VendorOverview />} />
      <Route path="services" element={<VendorServices />} />
      <Route path="orders" element={<VendorOrders />} />
    </Routes>
  )
}
