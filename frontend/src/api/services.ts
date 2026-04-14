import client from './client'
import type {
  CreateServicePayload,
  PaginatedResult,
  Review,
  Service,
  ServiceQueryParams,
  UpdateServicePayload,
} from '../types'

export const servicesApi = {
  getAll: (params?: ServiceQueryParams) =>
    client
      .get<PaginatedResult<Service>>('/services', { params })
      .then((r) => r.data),

  getById: (id: number) =>
    client.get<Service>(`/services/${id}`).then((r) => r.data),

  create: (data: CreateServicePayload) =>
    client.post<{ id: number }>('/services', data).then((r) => r.data),

  update: (id: number, data: UpdateServicePayload) =>
    client.put(`/services/${id}`, data),

  delete: (id: number) => client.delete(`/services/${id}`),

  getReviews: (id: number) =>
    client.get<Review[]>(`/services/${id}/reviews`).then((r) => r.data),
}
