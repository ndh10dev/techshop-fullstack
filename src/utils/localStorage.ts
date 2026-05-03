import type { CartItem } from '../types'

const CART_STORAGE_KEY = 'cart'

/**
 * Lấy hàng trong giỏ hàng từ localStorage một cách an toàn.
 */
export const getCartFromStorage = (): CartItem[] => {
  try {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY)
    if (!savedCart) return []
    
    const parsed = JSON.parse(savedCart)
    // Xác thực xem đó có phải là một mảng hay không.
    if (Array.isArray(parsed)) {
      return parsed
    }
    return []
  } catch {
    return []
  }
}

/**
 * Lưu trữ các mặt hàng trong giỏ hàng vào localStorage
 */
export const saveCartToStorage = (cartItems: CartItem[]): void => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  } catch {
    // ignore
  }
}
