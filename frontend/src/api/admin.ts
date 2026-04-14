import client from './client'
import type { AdminStats, User } from '../types'

export const adminApi = {
  getStats: () =>
    client.get<AdminStats>('/admin/stats').then((r) => r.data),

  getUsers: (page = 1, pageSize = 20) =>
    client
      .get<{ items: User[]; totalCount: number; page: number; pageSize: number }>(
        '/admin/users',
        { params: { page, pageSize } }
      )
      .then((r) => r.data),

  updateUserRole: (id: string, role: string) =>
    client.put(`/admin/users/${id}/role`, { role }),

  toggleUserActive: (id: string) =>
    client.put<{ isActive: boolean }>(`/admin/users/${id}/toggle`).then((r) => r.data),

  getAllOrders: (page = 1, pageSize = 20, status?: string) =>
    client
      .get('/admin/orders', { params: { page, pageSize, status } })
      .then((r) => r.data),
}
