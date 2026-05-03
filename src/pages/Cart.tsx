import React, { useState, useCallback, useMemo } from 'react'
import { Link } from 'react-router-dom'
import type { CartItem, CheckoutFormData } from '../types'
import { formatCurrency } from '../utils/format'

interface CartProps {
  cartItems: CartItem[]
  onRemoveFromCart: (id: number) => void
  onUpdateQuantity: (id: number, quantity: number) => void
  onCheckout: (formData: CheckoutFormData) => Promise<void>
}

const Cart: React.FC<CartProps> = ({
  cartItems,
  onRemoveFromCart,
  onUpdateQuantity,
  onCheckout
}) => {
  const [formData, setFormData] = useState<CheckoutFormData>({
    phone: '',
    shippingAddress: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    [cartItems]
  )

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (cartItems.length === 0) {
      alert('Giỏ hàng của bạn đang trống!')
      return
    }

    if (!formData.phone.trim() || !formData.shippingAddress.trim()) {
      alert('Vui lòng điền đầy đủ thông tin số điện thoại và địa chỉ giao hàng!')
      return
    }

    setIsSubmitting(true)
    setSubmitError('')
    try {
      await onCheckout(formData)
      setFormData({
        phone: '',
        shippingAddress: '',
        notes: ''
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại!'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }, [cartItems, formData, onCheckout])

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="section-title">Giỏ hàng</h1>
        <div className="empty-cart-page">
          <p>Giỏ hàng của bạn đang trống</p>
          <Link to="/" className="cta-button">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1 className="section-title">Giỏ hàng của bạn</h1>
      
      <div className="cart-page-content">
        <div className="cart-items-section">
          <h2>Sản phẩm trong giỏ hàng</h2>
          <div className="cart-items-list">
            {cartItems.map((item) => (
              <div key={item.id} className="cart-item-card">
                <img 
                  src={item.image} 
                  alt={item.name}
                  className="cart-item-image"
                />
                <div className="cart-item-details">
                  <h3>{item.name}</h3>
                  <p className="cart-item-price">{formatCurrency(item.price)}</p>
                  <div className="cart-item-quantity-controls">
                    <button 
                      className="quantity-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="quantity-display">{item.quantity}</span>
                    <button 
                      className="quantity-btn"
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                    <button 
                      className="remove-btn"
                      onClick={() => onRemoveFromCart(item.id)}
                    >
                      Xóa
                    </button>
                  </div>
                  <p className="cart-item-subtotal">
                    Tổng: {formatCurrency(item.price * item.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <div className="summary-row">
              <span>Tổng cộng:</span>
              <span className="total-price">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>

        <div className="checkout-form-section">
          <h2>Thông tin giao hàng</h2>
          <form onSubmit={handleSubmit} className="checkout-form">
            {submitError && (
              <div className="form-error" style={{ marginTop: 0, marginBottom: '1rem' }}>
                {submitError}
              </div>
            )}
            <div className="form-group">
              <label htmlFor="phone">Số điện thoại *</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className="form-control"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Nhập số điện thoại"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="shippingAddress">Địa chỉ giao hàng *</label>
              <input
                type="text"
                id="shippingAddress"
                name="shippingAddress"
                className="form-control"
                value={formData.shippingAddress}
                onChange={handleChange}
                placeholder="Nhập địa chỉ giao hàng"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="notes">Ghi chú (tùy chọn)</label>
              <textarea
                id="notes"
                name="notes"
                className="form-control"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Ghi chú thêm cho đơn hàng..."
                rows={4}
              />
            </div>
            
            <button 
              type="submit" 
              className="checkout-submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Đang xử lý...' : 'Mua'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Cart
