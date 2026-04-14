// ── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  token: string
  userId: string
  email: string
  fullName: string
  role: 'Admin' | 'Vendor' | 'Customer'
  expiresAt: string
}

export interface RegisterPayload {
  fullName: string
  email: string
  password: string
  role: 'Customer' | 'Vendor'
}

export interface LoginPayload {
  email: string
  password: string
}

// ── Category ──────────────────────────────────────────────────────────────────
export interface Category {
  id: number
  name: string
  description?: string
  iconUrl?: string
  serviceCount: number
}

export interface CreateCategoryPayload {
  name: string
  description?: string
  iconUrl?: string
}

// ── Service ───────────────────────────────────────────────────────────────────
export interface Service {
  id: number
  title: string
  description: string
  price: number
  deliveryTime?: string
  isActive: boolean
  createdAt: string
  averageRating: number
  totalReviews: number
  totalOrders: number
  categoryId: number
  categoryName: string
  vendorId: string
  vendorName: string
  vendorAvatar?: string
  vendorBio?: string
  imageUrls: string[]
}

export interface CreateServicePayload {
  title: string
  description: string
  price: number
  deliveryTime?: string
  categoryId: number
  imageUrls: string[]
}

export interface UpdateServicePayload {
  title?: string
  description?: string
  price?: number
  deliveryTime?: string
  categoryId?: number
  isActive?: boolean
  imageUrls?: string[]
}

export interface ServiceQueryParams {
  page?: number
  pageSize?: number
  search?: string
  categoryId?: number
  minPrice?: number
  maxPrice?: number
  sortBy?: 'relevance' | 'newest' | 'price_asc' | 'price_desc' | 'rating' | 'fastest_delivery'
}

// ── Order ─────────────────────────────────────────────────────────────────────
export type OrderStatus = 'Pending' | 'InProgress' | 'Completed' | 'Cancelled'

export interface Order {
  id: number
  status: OrderStatus
  totalPrice: number
  notes?: string
  createdAt: string
  updatedAt: string
  customerId: string
  customerName: string
  customerEmail: string
  serviceId: number
  serviceTitle: string
  serviceImage?: string
  vendorId: string
  vendorName: string
  hasReview: boolean
}

export interface CreateOrderPayload {
  serviceId: number
  notes?: string
}

// ── Review ────────────────────────────────────────────────────────────────────
export interface Review {
  id: number
  rating: number
  comment: string
  createdAt: string
  customerId: string
  customerName: string
  customerAvatar?: string
  serviceId: number
  orderId: number
}

export interface CreateReviewPayload {
  orderId: number
  rating: number
  comment: string
}

// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  fullName: string
  email: string
  avatarUrl?: string
  bio?: string
  role: string
  isActive: boolean
  createdAt: string
}

// ── Pagination ────────────────────────────────────────────────────────────────
export interface PaginatedResult<T> {
  items: T[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// ── Vendor Stats ──────────────────────────────────────────────────────────────
export interface VendorStats {
  totalServices: number
  activeServices: number
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalEarnings: number
  averageRating: number
}

export interface ServicePackage {
  id: 'basic' | 'standard' | 'premium'
  name: string
  description: string
  price: number
  deliveryDays: number
  revisions: number | 'Unlimited'
  features: string[]
  recommended?: boolean
}

export interface ServiceFaq {
  question: string
  answer: string
}

export interface VendorStorefrontData {
  vendorId: string
  name: string
  avatar?: string
  bio: string
  headline: string
  averageRating: number
  totalReviews: number
  totalOrders: number
  completedOrders: number
  responseTime: string
  repeatClientRate: string
  specialties: string[]
  badges: string[]
  portfolio: string[]
  featuredServices: Service[]
}

export interface OrderTimelineStep {
  key: string
  label: string
  description: string
  status: 'complete' | 'current' | 'upcoming'
  timestamp?: string
}

export interface ProductNotification {
  id: string
  title: string
  body: string
  createdAt: string
  tone: 'info' | 'success' | 'warning'
  orderId?: number
}

// ── Admin Stats ───────────────────────────────────────────────────────────────
export interface AdminStats {
  totalUsers: number
  totalServices: number
  totalOrders: number
  totalRevenue: number
  ordersByStatus: { status: string; count: number }[]
  recentOrders: {
    id: number
    status: string
    totalPrice: number
    createdAt: string
    customerName: string
    serviceTitle: string
  }[]
}
