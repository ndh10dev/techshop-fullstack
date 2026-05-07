import type { OrderStatus } from '../types'

export const ORDER_STATUS = {
  pending: 'pending',
  shipping: 'shipping',
  completed: 'completed',
  cancelled: 'cancelled'
} as const satisfies Record<OrderStatus, OrderStatus>

export function parseOrderStatus(raw: unknown): OrderStatus {
  const v = String(raw ?? '').trim()
  const lower = v.toLowerCase()
  if (lower === 'pending' || lower === 'shipping' || lower === 'completed' || lower === 'cancelled') return lower

  // Backward compatibility: DB currently stores uppercase
  const upper = v.toUpperCase()
  if (upper === 'PENDING') return 'pending'
  if (upper === 'SHIPPING') return 'shipping'
  if (upper === 'COMPLETED') return 'completed'
  if (upper === 'CANCELLED') return 'cancelled'

  return 'pending'
}

export function getOrderStatusLabel(status: OrderStatus): string {
  switch (status) {
    case 'pending':
      return 'Chờ xác nhận'
    case 'shipping':
      return 'Đang giao hàng'
    case 'completed':
      return 'Hoàn thành đơn hàng'
    case 'cancelled':
      return 'Đơn hàng đã bị hủy'
  }
}

export function getOrderStatusTone(status: OrderStatus): 'yellow' | 'blue' | 'green' | 'red' {
  switch (status) {
    case 'pending':
      return 'yellow'
    case 'shipping':
      return 'blue'
    case 'completed':
      return 'green'
    case 'cancelled':
      return 'red'
  }
}

