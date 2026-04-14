import { useState, type FormEvent } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { StarRating } from '../ui/StarRating'
import { reviewsApi } from '../../api/reviews'
import type { Order } from '../../types'

interface ReviewOrderModalProps {
  order: Order
  onClose: () => void
  onSuccess: () => void
}

export function ReviewOrderModal({ order, onClose, onSuccess }: ReviewOrderModalProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!comment.trim()) {
      setError('Please write a review before submitting.')
      return
    }

    setLoading(true)
    try {
      await reviewsApi.create({ orderId: order.id, rating, comment })
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } }
      setError(errorResponse?.response?.data?.message ?? 'Failed to submit review.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open onClose={onClose} title="Leave a Review">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl bg-surface-3 p-4">
          <p className="text-sm text-text-muted">Reviewing</p>
          <p className="mt-1 text-base font-semibold text-text-primary">{order.serviceTitle}</p>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-text-secondary">Rating</p>
          <StarRating rating={rating} interactive onChange={setRating} size="lg" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-secondary">Your review</label>
          <textarea
            value={comment}
            onChange={(event) => {
              setComment(event.target.value)
              setError('')
            }}
            placeholder="Share what stood out, what was delivered well, and how the process felt."
            rows={4}
            className="w-full resize-none rounded-md border border-border bg-surface-2 px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-dark focus:outline-none focus:ring-2 focus:ring-brand/60"
          />
        </div>

        {error && <p className="text-xs text-status-error">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth type="button" onClick={onClose}>Cancel</Button>
          <Button fullWidth loading={loading} type="submit">Submit Review</Button>
        </div>
      </form>
    </Modal>
  )
}
