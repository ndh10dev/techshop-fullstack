import type { Product } from '../types'

export function getProductStock(product: Product): number {
  if (typeof product.stockQuantity === 'number') return Math.max(0, product.stockQuantity)
  if (typeof product.quantity === 'number') return Math.max(0, product.quantity)
  return 0
}
