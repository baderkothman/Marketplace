import client from './client'
import type { CreateOrderPayload, Order } from '../types'

export const ordersApi = {
  getAll: () => client.get<Order[]>('/orders').then((r) => r.data),

  getById: (id: number) =>
    client.get<Order>(`/orders/${id}`).then((r) => r.data),

  create: (data: CreateOrderPayload) =>
    client.post<{ id: number }>('/orders', data).then((r) => r.data),

  updateStatus: (id: number, status: string) =>
    client.put(`/orders/${id}/status`, { status }),
}
