import client from './client'
import type { Order, Service, VendorStats } from '../types'

export const vendorApi = {
  getMyServices: () =>
    client.get<Service[]>('/vendor/services').then((r) => r.data),

  getMyOrders: () =>
    client.get<Order[]>('/vendor/orders').then((r) => r.data),

  getStats: () =>
    client.get<VendorStats>('/vendor/stats').then((r) => r.data),
}
