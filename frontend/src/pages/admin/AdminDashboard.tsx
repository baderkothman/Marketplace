import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { adminApi } from '../../api/admin'
import { categoriesApi } from '../../api/categories'
import { DashboardLayout } from '../../components/layout/DashboardLayout'
import { Badge, orderStatusBadge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { Select } from '../../components/ui/Select'
import { Skeleton } from '../../components/ui/Skeleton'
import type { AdminStats, Category, User } from '../../types'

// ── Overview ───────────────────────────────────────────────────────────────────
function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getStats().then(setStats).finally(() => setLoading(false))
  }, [])

  const cards = stats
    ? [
        { label: 'Total Users', value: stats.totalUsers },
        { label: 'Total Services', value: stats.totalServices },
        { label: 'Total Orders', value: stats.totalOrders },
        { label: 'Revenue', value: `$${stats.totalRevenue.toFixed(0)}` },
      ]
    : []

  return (
    <DashboardLayout title="Admin Dashboard" subtitle="Platform overview and management">
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {cards.map((c) => (
              <div key={c.label} className="bg-surface-2 border border-border rounded-xl p-5">
                <p className="text-xs text-text-muted">{c.label}</p>
                <p className="text-2xl font-bold text-text-primary mt-1">{c.value}</p>
              </div>
            ))}
          </div>

          {/* Order status breakdown */}
          {stats?.ordersByStatus && stats.ordersByStatus.length > 0 && (
            <div className="bg-surface-2 border border-border rounded-xl p-5 mb-6">
              <h3 className="text-sm font-semibold text-text-primary mb-4">Orders by Status</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.ordersByStatus.map((s) => (
                  <div key={s.status} className="text-center p-3 bg-surface-3 rounded-lg">
                    <Badge variant={orderStatusBadge(s.status)}>{s.status}</Badge>
                    <p className="text-xl font-bold text-text-primary mt-2">{s.count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent orders */}
          {stats?.recentOrders && stats.recentOrders.length > 0 && (
            <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-text-primary">Recent Orders</h3>
              </div>
              <div className="divide-y divide-border">
                {stats.recentOrders.map((o) => (
                  <div key={o.id} className="flex items-center gap-4 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{o.serviceTitle}</p>
                      <p className="text-xs text-text-muted">{o.customerName}</p>
                    </div>
                    <Badge variant={orderStatusBadge(o.status)}>{o.status}</Badge>
                    <p className="text-sm font-bold text-text-primary">${o.totalPrice.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  )
}

// ── Users ──────────────────────────────────────────────────────────────────────
function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState<User | null>(null)
  const [newRole, setNewRole] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchUsers = () => {
    adminApi.getUsers().then((r) => setUsers(r.items)).finally(() => setLoading(false))
  }
  useEffect(() => { fetchUsers() }, [])

  const handleRoleUpdate = async () => {
    if (!editUser || !newRole) return
    setSaving(true)
    try {
      await adminApi.updateUserRole(editUser.id, newRole)
      setEditUser(null)
      fetchUsers()
    } finally { setSaving(false) }
  }

  const handleToggle = async (id: string) => {
    await adminApi.toggleUserActive(id)
    fetchUsers()
  }

  return (
    <DashboardLayout title="Manage Users" subtitle="View and manage all registered users">
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-surface-2 border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-text-muted">Joined</th>
                <th className="px-5 py-3 text-right text-xs font-semibold text-text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((u) => (
                <motion.tr
                  key={u.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-surface-3 transition-colors"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-brand-subtle flex items-center justify-center text-brand text-xs font-bold">
                        {u.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{u.fullName}</p>
                        <p className="text-xs text-text-muted">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant="brand">{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3">
                    <Badge variant={u.isActive ? 'success' : 'error'}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-5 py-3 text-xs text-text-muted">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => { setEditUser(u); setNewRole(u.role) }}
                      >
                        Edit Role
                      </Button>
                      <Button
                        size="sm"
                        variant={u.isActive ? 'danger' : 'ghost'}
                        onClick={() => handleToggle(u.id)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={!!editUser} onClose={() => setEditUser(null)} title="Change User Role" size="sm">
        {editUser && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Changing role for <strong className="text-text-primary">{editUser.fullName}</strong>
            </p>
            <Select
              label="Role"
              value={newRole}
              options={[
                { value: 'Customer', label: 'Customer' },
                { value: 'Vendor', label: 'Vendor' },
                { value: 'Admin', label: 'Admin' },
              ]}
              onChange={(e) => setNewRole(e.target.value)}
            />
            <div className="flex gap-3 pt-2">
              <Button variant="secondary" fullWidth onClick={() => setEditUser(null)}>Cancel</Button>
              <Button fullWidth loading={saving} onClick={handleRoleUpdate}>Save</Button>
            </div>
          </div>
        )}
      </Modal>
    </DashboardLayout>
  )
}

// ── All Orders ─────────────────────────────────────────────────────────────────
function AdminOrders() {
  const [orders, setOrders] = useState<{ items: {
    id: number; status: string; totalPrice: number; createdAt: string
    customerName: string; customerEmail: string; serviceTitle: string; vendorName: string
  }[]; totalCount: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')

  const fetchOrders = () => {
    adminApi.getAllOrders(1, 50, statusFilter || undefined)
      .then(setOrders)
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchOrders() }, [statusFilter])

  return (
    <DashboardLayout title="All Orders" subtitle="Platform-wide order management">
      <div className="flex items-center gap-3 mb-5">
        <Select
          value={statusFilter}
          options={[
            { value: '', label: 'All Statuses' },
            { value: 'Pending', label: 'Pending' },
            { value: 'InProgress', label: 'In Progress' },
            { value: 'Completed', label: 'Completed' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-44"
        />
        {orders && <span className="text-xs text-text-muted">{orders.totalCount} total</span>}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 rounded-xl" />)}
        </div>
      ) : (
        <div className="bg-surface-2 border border-border rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                {['ID', 'Service', 'Customer', 'Vendor', 'Status', 'Amount', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders?.items.map((o) => (
                <tr key={o.id} className="hover:bg-surface-3 transition-colors">
                  <td className="px-4 py-3 text-text-muted">#{o.id}</td>
                  <td className="px-4 py-3">
                    <p className="text-text-primary font-medium truncate max-w-[160px]">{o.serviceTitle}</p>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{o.customerName}</td>
                  <td className="px-4 py-3 text-text-secondary">{o.vendorName}</td>
                  <td className="px-4 py-3">
                    <Badge variant={orderStatusBadge(o.status)}>{o.status}</Badge>
                  </td>
                  <td className="px-4 py-3 font-bold text-text-primary">${o.totalPrice.toFixed(2)}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  )
}

// ── Categories ─────────────────────────────────────────────────────────────────
function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', iconUrl: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCategories = () => {
    categoriesApi.getAll().then(setCategories).finally(() => setLoading(false))
  }
  useEffect(() => { fetchCategories() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Name is required.'); return }
    setSaving(true)
    try {
      await categoriesApi.create(form)
      setCreateOpen(false)
      setForm({ name: '', description: '', iconUrl: '' })
      fetchCategories()
    } finally { setSaving(false) }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this category?')) return
    await categoriesApi.delete(id)
    fetchCategories()
  }

  return (
    <DashboardLayout
      title="Categories"
      subtitle="Manage service categories"
      actions={<Button onClick={() => setCreateOpen(true)}>+ Add Category</Button>}
    >
      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 bg-surface-2 border border-border rounded-xl">
              <div>
                <p className="font-semibold text-sm text-text-primary">{c.name}</p>
                <p className="text-xs text-text-muted mt-0.5">{c.serviceCount} services</p>
                {c.description && <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{c.description}</p>}
              </div>
              <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Add Category" size="sm">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Name *"
            value={form.name}
            onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setError('') }}
            required
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Input
            label="Icon URL"
            value={form.iconUrl}
            onChange={(e) => setForm((f) => ({ ...f, iconUrl: e.target.value }))}
            placeholder="https://..."
          />
          {error && <p className="text-xs text-status-error">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" fullWidth type="button" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button fullWidth loading={saving} type="submit">Create</Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}

// ── Router ─────────────────────────────────────────────────────────────────────
export function AdminDashboard() {
  return (
    <Routes>
      <Route index element={<AdminOverview />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="orders" element={<AdminOrders />} />
      <Route path="categories" element={<AdminCategories />} />
    </Routes>
  )
}
