import type {
  Order,
  OrderTimelineStep,
  ProductNotification,
  Service,
  ServiceFaq,
  ServicePackage,
  VendorStorefrontData,
} from '../types'

const categoryFeatureMap: Record<string, string[]> = {
  'Web Development': ['Responsive build', 'CMS-ready structure', 'Performance pass', 'Analytics setup'],
  'Mobile Development': ['iOS and Android scope', 'API integration', 'QA checklist', 'Launch support'],
  'UI/UX Design': ['Wireframes and polished UI', 'Clickable prototype', 'Design handoff', 'Component-ready specs'],
  'Branding & Graphic Design': ['Logo and identity system', 'Social kit', 'Brand guidelines', 'Launch-ready exports'],
  'Digital Marketing': ['Channel strategy', 'Keyword map', 'Reporting dashboard', 'Optimization notes'],
  'Video & Animation': ['Storyboard', 'Edit and sound polish', 'Captions', 'Platform exports'],
  'Writing & Translation': ['Tone-of-voice alignment', 'SEO-friendly copy', 'Proofreading', 'Editable docs'],
  'Photography & Content Production': ['Shot planning', 'Retouching', 'Web-ready exports', 'Usage guidance'],
}

const categoryFaqMap: Record<string, ServiceFaq[]> = {
  'Web Development': [
    { question: 'What do you need from me before kickoff?', answer: 'A brief, brand assets, examples you like, and any technical constraints or pages that must be included.' },
    { question: 'Will the final delivery be ready for launch?', answer: 'The packages are scoped for a polished launch-ready delivery with responsive QA and clean handoff files.' },
  ],
  'Digital Marketing': [
    { question: 'Do you work from an existing strategy or build one?', answer: 'Both. If you already have a funnel or offer, the work starts there. Otherwise the first step is clarifying audience, offer, and acquisition angles.' },
    { question: 'What kind of reporting is included?', answer: 'Every package includes a concise performance summary, priorities, and the next optimization opportunities.' },
  ],
}

function hashValue(input: string) {
  return input.split('').reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 10000, 17)
}

export function parseDeliveryDays(deliveryTime?: string) {
  if (!deliveryTime) return null
  const match = deliveryTime.match(/(\d+)/)
  return match ? Number(match[1]) : null
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`
}

export function getServicePackages(service: Service): ServicePackage[] {
  const baseDays = parseDeliveryDays(service.deliveryTime) ?? 7
  const featureSeed = categoryFeatureMap[service.categoryName] ?? ['Clear scope', 'Polished delivery', 'Support notes', 'Professional handoff']

  return [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Best for a focused brief with one primary deliverable.',
      price: service.price,
      deliveryDays: baseDays,
      revisions: 1,
      features: featureSeed.slice(0, 2),
    },
    {
      id: 'standard',
      name: 'Standard',
      description: 'Balanced scope for teams that need more depth and review rounds.',
      price: Math.round(service.price * 1.35),
      deliveryDays: baseDays + 2,
      revisions: 2,
      features: featureSeed.slice(0, 3),
      recommended: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Highest-touch package with expanded deliverables and priority handling.',
      price: Math.round(service.price * 1.75),
      deliveryDays: baseDays + 4,
      revisions: 'Unlimited',
      features: featureSeed,
    },
  ]
}

export function getServiceFaqs(service: Service): ServiceFaq[] {
  const categoryFaqs = categoryFaqMap[service.categoryName] ?? []
  const genericFaqs: ServiceFaq[] = [
    {
      question: 'How quickly will I hear back after ordering?',
      answer: 'Vendors on Serviqo typically send the first scoped response within the first business day, often much sooner for active storefronts.',
    },
    {
      question: 'Can the scope be adjusted after kickoff?',
      answer: 'Yes. The vendor can confirm or expand scope after reviewing your brief. Complex additions are typically handled as a revision or a custom upgrade.',
    },
    {
      question: 'What happens after delivery?',
      answer: 'You will receive the final files, a delivery summary, and space to request refinements if they are covered by the selected package.',
    },
  ]

  return [...categoryFaqs, ...genericFaqs]
}

export function buildVendorStorefront(services: Service[], vendorId: string): VendorStorefrontData | null {
  const vendorServices = services.filter((service) => service.vendorId === vendorId)
  if (vendorServices.length === 0) return null

  const lead = vendorServices[0]
  const totalReviews = vendorServices.reduce((sum, service) => sum + service.totalReviews, 0)
  const weightedRating = totalReviews > 0
    ? vendorServices.reduce((sum, service) => sum + service.averageRating * service.totalReviews, 0) / totalReviews
    : vendorServices.reduce((sum, service) => sum + service.averageRating, 0) / vendorServices.length
  const totalOrders = vendorServices.reduce((sum, service) => sum + service.totalOrders, 0)
  const hash = hashValue(vendorId)
  const completedOrders = Math.max(1, Math.round(totalOrders * (0.86 + (hash % 8) / 100)))
  const specialties = [...new Set(vendorServices.map((service) => service.categoryName))].slice(0, 4)
  const badges = [
    weightedRating >= 4.8 ? 'Top rated' : 'Highly reviewed',
    totalOrders >= 12 ? 'Trusted on-platform' : 'Fast-growing seller',
    'Verified profile',
  ]
  const portfolio = [...new Set(vendorServices.flatMap((service) => service.imageUrls).filter(Boolean))].slice(0, 6)
  const responseHours = 1 + (hash % 5)
  const repeatRate = 24 + (hash % 31)

  return {
    vendorId,
    name: lead.vendorName,
    avatar: lead.vendorAvatar,
    bio: lead.vendorBio
      ?? `${lead.vendorName} helps teams move faster across ${specialties.slice(0, 2).map((specialty) => specialty.toLowerCase()).join(' and ')} with clear communication, thoughtful execution, and a polished final handoff.`,
    headline: `A conversion-focused ${specialties[0]?.toLowerCase() ?? 'service'} partner with a proven delivery rhythm.`,
    averageRating: Number(weightedRating.toFixed(1)),
    totalReviews,
    totalOrders,
    completedOrders,
    responseTime: responseHours === 1 ? 'Usually within 1 hour' : `Usually within ${responseHours} hours`,
    repeatClientRate: `${repeatRate}% repeat clients`,
    specialties,
    badges,
    portfolio,
    featuredServices: vendorServices
      .slice()
      .sort((a, b) => (b.averageRating * 100 + b.totalOrders) - (a.averageRating * 100 + a.totalOrders))
      .slice(0, 6),
  }
}

function getSearchScore(service: Service, search: string) {
  if (!search.trim()) return 0
  const normalized = search.trim().toLowerCase()
  let score = 0

  if (service.title.toLowerCase().includes(normalized)) score += 12
  if (service.categoryName.toLowerCase().includes(normalized)) score += 8
  if (service.vendorName.toLowerCase().includes(normalized)) score += 5
  if (service.description.toLowerCase().includes(normalized)) score += 3

  normalized.split(/\s+/).forEach((token) => {
    if (service.title.toLowerCase().includes(token)) score += 4
    if (service.description.toLowerCase().includes(token)) score += 1
  })

  return score
}

export function sortServices(services: Service[], sortBy: string, search: string) {
  const next = services.slice()

  if (sortBy === 'relevance' && search.trim()) {
    return next.sort((a, b) => {
      const byScore = getSearchScore(b, search) - getSearchScore(a, search)
      if (byScore !== 0) return byScore
      return b.averageRating - a.averageRating
    })
  }

  if (sortBy === 'fastest_delivery') {
    return next.sort((a, b) => (parseDeliveryDays(a.deliveryTime) ?? 999) - (parseDeliveryDays(b.deliveryTime) ?? 999))
  }

  if (sortBy === 'price_asc') return next.sort((a, b) => a.price - b.price)
  if (sortBy === 'price_desc') return next.sort((a, b) => b.price - a.price)
  if (sortBy === 'rating') return next.sort((a, b) => b.averageRating - a.averageRating || b.totalOrders - a.totalOrders)

  return next.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function buildOrderTimeline(order: Order, deliveryTime?: string): OrderTimelineStep[] {
  const deliveryDays = parseDeliveryDays(deliveryTime) ?? 7
  const acceptedAt = new Date(new Date(order.createdAt).getTime() + 6 * 60 * 60 * 1000).toISOString()
  const deliveredAt = new Date(new Date(order.createdAt).getTime() + Math.max(1, deliveryDays - 1) * 24 * 60 * 60 * 1000).toISOString()

  const steps: OrderTimelineStep[] = [
    {
      key: 'placed',
      label: 'Order placed',
      description: 'Your brief is with the vendor and ready for review.',
      status: 'complete',
      timestamp: order.createdAt,
    },
    {
      key: 'accepted',
      label: 'Vendor accepted',
      description: 'Scope has been acknowledged and production is scheduled.',
      status: order.status === 'Pending' ? 'current' : 'complete',
      timestamp: order.status === 'Pending' ? undefined : acceptedAt,
    },
    {
      key: 'progress',
      label: 'Work in progress',
      description: 'Production is underway and major updates should surface here.',
      status: order.status === 'InProgress' ? 'current' : order.status === 'Completed' ? 'complete' : 'upcoming',
      timestamp: order.status === 'Completed' ? acceptedAt : undefined,
    },
    {
      key: 'delivered',
      label: 'Delivery window',
      description: `Estimated handoff within ${pluralize(deliveryDays, 'day')}.`,
      status: order.status === 'Completed' ? 'complete' : 'upcoming',
      timestamp: order.status === 'Completed' ? deliveredAt : undefined,
    },
    {
      key: order.status === 'Cancelled' ? 'cancelled' : 'completed',
      label: order.status === 'Cancelled' ? 'Order cancelled' : 'Order completed',
      description: order.status === 'Cancelled'
        ? 'The order was closed before delivery.'
        : 'Delivery was accepted and the order is ready for review.',
      status: order.status === 'Completed' || order.status === 'Cancelled' ? 'current' : 'upcoming',
      timestamp: order.status === 'Completed' || order.status === 'Cancelled' ? order.updatedAt : undefined,
    },
  ]

  if (order.status === 'Cancelled') {
    return steps.map((step, index) => {
      if (index < 2) return step
      if (step.key === 'cancelled') return { ...step, status: 'current', timestamp: order.updatedAt }
      return { ...step, status: 'upcoming', timestamp: undefined }
    })
  }

  return steps
}

export function buildOrderNotifications(order: Order, deliveryTime?: string): ProductNotification[] {
  const deliveryDays = parseDeliveryDays(deliveryTime) ?? 7
  const notifications: ProductNotification[] = [
    {
      id: `${order.id}-placed`,
      title: 'Order placed',
      body: `The vendor has your brief. Expect the first scoped response within the day.`,
      createdAt: order.createdAt,
      tone: 'success',
      orderId: order.id,
    },
  ]

  if (order.status !== 'Pending') {
    notifications.push({
      id: `${order.id}-accepted`,
      title: 'Vendor accepted the order',
      body: `Production started for ${order.serviceTitle}. Delivery is scoped for roughly ${pluralize(deliveryDays, 'day')}.`,
      createdAt: new Date(new Date(order.createdAt).getTime() + 6 * 60 * 60 * 1000).toISOString(),
      tone: 'info',
      orderId: order.id,
    })
  }

  if (order.status === 'InProgress' || order.status === 'Completed') {
    notifications.push({
      id: `${order.id}-progress`,
      title: order.status === 'Completed' ? 'Work wrapped and ready for handoff' : 'Work is in progress',
      body: order.status === 'Completed'
        ? 'The delivery phase is complete and the order has moved to final review.'
        : 'The vendor is actively working through the brief and milestone updates belong here.',
      createdAt: order.updatedAt,
      tone: order.status === 'Completed' ? 'success' : 'info',
      orderId: order.id,
    })
  }

  if (order.id % 5 === 0 && order.status === 'InProgress') {
    notifications.push({
      id: `${order.id}-revision`,
      title: 'Revision request logged',
      body: 'A lightweight revision event is shown here until dedicated revision tracking is supported by the backend.',
      createdAt: new Date(new Date(order.updatedAt).getTime() - 2 * 60 * 60 * 1000).toISOString(),
      tone: 'warning',
      orderId: order.id,
    })
  }

  if (order.status === 'Completed') {
    notifications.push({
      id: `${order.id}-completed`,
      title: 'Order completed',
      body: order.hasReview
        ? 'This order has been closed out and reviewed.'
        : 'Delivery is complete. Review the outcome and leave feedback when ready.',
      createdAt: order.updatedAt,
      tone: 'success',
      orderId: order.id,
    })
  }

  if (order.status === 'Cancelled') {
    notifications.push({
      id: `${order.id}-cancelled`,
      title: 'Order cancelled',
      body: 'This order was closed before delivery. You can still revisit the service or place a new request later.',
      createdAt: order.updatedAt,
      tone: 'warning',
      orderId: order.id,
    })
  }

  return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
