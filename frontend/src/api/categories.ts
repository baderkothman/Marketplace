import client from './client'
import type { Category, CreateCategoryPayload } from '../types'

export const categoriesApi = {
  getAll: () => client.get<Category[]>('/categories').then((r) => r.data),

  getById: (id: number) =>
    client.get<Category>(`/categories/${id}`).then((r) => r.data),

  create: (data: CreateCategoryPayload) =>
    client.post<Category>('/categories', data).then((r) => r.data),

  update: (id: number, data: CreateCategoryPayload) =>
    client.put(`/categories/${id}`, data),

  delete: (id: number) => client.delete(`/categories/${id}`),
}
