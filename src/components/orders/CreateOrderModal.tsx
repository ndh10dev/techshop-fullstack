import React, { useEffect, useMemo, useState } from 'react'
import type { Product } from '../../types'
import { getToken } from '../../utils/auth'
import { getProductStock } from '../../utils/stock'
import ProductSelector, { PosLineItem } from './ProductSelector'
import OrderSummary from './OrderSummary'

export type PaymentMethod = 'CASH' | 'BANK_TRANSFER' | 'EWALLET'

type Props = {
  onClose: () => void
  onCreated: () => void
}

type CustomerForm = {
  customerName: string
  phone: string
  address: string
  note: string
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'string') return e
  return 'Đã có lỗi xảy ra'
}

const CreateOrderModal: React.FC<Props> = ({ onClose, onCreated }) => {
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<PosLineItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [customer, setCustomer] = useState<CustomerForm>({
    customerName: '',
    phone: '',
    address: '',
    note: ''
  })

  useEffect(() => {
    let mounted = true
    ;(async () => {
      setLoadingProducts(true)
      setError(null)
      try {
        const token = getToken()
        const res = await fetch('http://localhost:5000/api/products', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        })
        if (!res.ok) throw new Error('Không thể tải danh sách sản phẩm')
        const data = (await res.json()) as Product[]
        if (mounted) setProducts(data)
      } catch (e: unknown) {
        if (mounted) setError(getErrorMessage(e))
      } finally {
        if (mounted) setLoadingProducts(false)
      }
    })()

    return () => {
      mounted = false
    }
  }, [])

  const canSubmit = useMemo(() => {
    if (submitting) return false
    if (selected.length === 0) return false
    if (!customer.phone.trim()) return false
    return true
  }, [customer.phone, selected.length, submitting])

  const handleAdd = (p: Product) => {
    const stock = getProductStock(p)
    if (stock <= 0) return
    setSelected((prev) => {
      const existing = prev.find((li) => li.product.id === p.id)
      if (!existing) return [...prev, { product: p, quantity: 1 }]
      if (existing.quantity >= stock) return prev
      return prev.map((li) => (li.product.id === p.id ? { ...li, quantity: li.quantity + 1 } : li))
    })
  }

  const handleRemove = (productId: number) => {
    setSelected((prev) => prev.filter((li) => li.product.id !== productId))
  }

  const handleSetQuantity = (productId: number, nextQty: number) => {
    setSelected((prev) => {
      const line = prev.find((li) => li.product.id === productId)
      if (!line) return prev
      const stock = getProductStock(line.product)
      const safe = Math.max(1, Math.min(nextQty, Math.max(0, stock)))
      return prev.map((li) => (li.product.id === productId ? { ...li, quantity: safe } : li))
    })
  }

  const handleSubmit = async () => {
    setError(null)

    const phone = customer.phone.trim()
    if (!phone) {
      setError('Vui lòng nhập số điện thoại')
      return
    }
    if (selected.length === 0) {
      setError('Vui lòng chọn ít nhất 1 sản phẩm')
      return
    }

    // Client-side stock guard (backend vẫn validate + rollback)
    for (const li of selected) {
      const stock = getProductStock(li.product)
      if (stock <= 0 || li.quantity > stock) {
        setError(`Sản phẩm "${li.product.name}" không đủ tồn kho`)
        return
      }
    }

    setSubmitting(true)
    try {
      const token = getToken()
      const res = await fetch('http://localhost:5000/api/orders/pos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          items: selected.map((li) => ({ productId: li.product.id, quantity: li.quantity })),
          customerName: customer.customerName.trim() || null,
          phone,
          address: customer.address.trim() || null,
          note: customer.note.trim() || null,
          paymentMethod
        })
      })

      if (!res.ok) {
        const maybe = await res.json().catch(() => null)
        const msg = maybe?.message || 'Tạo đơn hàng thất bại'
        throw new Error(msg)
      }

      onCreated()
      onClose()
    } catch (e: unknown) {
      setError(getErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card pos-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Tạo đơn hàng tại quầy</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng tạo đơn hàng">
            ✕
          </button>
        </div>

        <div className="modal-form pos-modal-body">
          {error && <div className="pos-error">{error}</div>}

          {loadingProducts ? (
            <div className="pos-loading">Đang tải danh sách sản phẩm…</div>
          ) : (
            <ProductSelector
              products={products}
              query={query}
              onQueryChange={setQuery}
              selected={selected}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onSetQuantity={handleSetQuantity}
            />
          )}

          <div className="pos-bottom-grid">
            <div className="pos-panel">
              <h4 className="pos-section-title">Thông tin khách hàng</h4>
              <div className="pos-form">
                <div className="pos-field">
                  <label className="pos-label">Tên khách hàng</label>
                  <input
                    className="pos-input"
                    value={customer.customerName}
                    onChange={(e) => setCustomer((p) => ({ ...p, customerName: e.target.value }))}
                    placeholder="Tên khách hàng"
                  />
                </div>
                <div className="pos-field">
                  <label className="pos-label">
                    Số điện thoại <span className="pos-required">*</span>
                  </label>
                  <input
                    className="pos-input"
                    value={customer.phone}
                    onChange={(e) => setCustomer((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="Nhập số điện thoại"
                  />
                </div>
                <div className="pos-field">
                  <label className="pos-label">Địa chỉ</label>
                  <input
                    className="pos-input"
                    value={customer.address}
                    onChange={(e) => setCustomer((p) => ({ ...p, address: e.target.value }))}
                    placeholder="Có thể bỏ trống cho mua tại quầy"
                  />
                </div>
                <div className="pos-field">
                  <label className="pos-label">Ghi chú</label>
                  <textarea
                    className="pos-textarea"
                    value={customer.note}
                    onChange={(e) => setCustomer((p) => ({ ...p, note: e.target.value }))}
                    placeholder="Ghi chú thêm (nếu có)"
                  />
                </div>
              </div>
            </div>

            <div className="pos-panel">
              <h4 className="pos-section-title">Phương thức thanh toán</h4>
              <div className="pos-payments">
                <button
                  type="button"
                  className={`pos-payment-card ${paymentMethod === 'CASH' ? 'is-active' : ''}`}
                  onClick={() => setPaymentMethod('CASH')}
                >
                  <div className="pos-payment-title">Tiền mặt</div>
                  <div className="pos-payment-sub">Thanh toán trực tiếp</div>
                </button>
                <button
                  type="button"
                  className={`pos-payment-card ${paymentMethod === 'BANK_TRANSFER' ? 'is-active' : ''}`}
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                >
                  <div className="pos-payment-title">Chuyển khoản</div>
                  <div className="pos-payment-sub">Ngân hàng</div>
                </button>
                <button
                  type="button"
                  className={`pos-payment-card ${paymentMethod === 'EWALLET' ? 'is-active' : ''}`}
                  onClick={() => setPaymentMethod('EWALLET')}
                >
                  <div className="pos-payment-title">Ví điện tử</div>
                  <div className="pos-payment-sub">Momo/ZaloPay…</div>
                </button>
              </div>

              <OrderSummary items={selected} />
            </div>
          </div>
        </div>

        <div className="modal-actions pos-footer">
          <button className="admin-secondary-btn" onClick={onClose} disabled={submitting}>
            Hủy
          </button>
          <button className="pos-create-btn" onClick={handleSubmit} disabled={!canSubmit}>
            {submitting ? 'Đang tạo…' : 'Tạo đơn'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateOrderModal

