import client from './client'
import type { CreateReviewPayload, Review } from '../types'

export const reviewsApi = {
  create: (data: CreateReviewPayload) =>
    client.post<{ id: number; message: string }>('/reviews', data).then((r) => r.data),

  getByService: (serviceId: number) =>
    client.get<Review[]>(`/reviews/service/${serviceId}`).then((r) => r.data),
}
