import React, { useCallback, useEffect, useMemo, useState } from 'react'
import type { Order } from '../types'
import { getToken } from '../utils/auth'
import { formatCurrency, formatDateTime } from '../utils/format'
import { getOrderStatusLabel, getOrderStatusTone, parseOrderStatus } from '../utils/orderStatus'

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const token = getToken()

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (!token) {
        setError('Vui lòng đăng nhập để xem lịch sử đơn hàng')
        setOrders([])
        return
      }

      const res = await fetch('http://localhost:5000/api/orders/mine', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Không thể tải lịch sử đơn hàng')

      const data = (await res.json()) as Order[]
      setOrders(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải lịch sử đơn hàng')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void fetchOrders()
  }, [fetchOrders])

  const handleReceived = useCallback(async (orderId: number) => {
    if (!token) return
    setUpdatingId(orderId)
    try {
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}/received`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) throw new Error('Cập nhật trạng thái thất bại')
      await fetchOrders()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Cập nhật trạng thái thất bại')
    } finally {
      setUpdatingId(null)
    }
  }, [fetchOrders, token])

  const normalized = useMemo(() => {
    return orders.map((o) => ({ ...o, status: parseOrderStatus(o.status) }))
  }, [orders])

  if (loading) {
    return (
      <div className="page-shell">
        <h1 className="section-title">Lịch sử đơn hàng</h1>
        <div className="loading">Đang tải...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell">
        <h1 className="section-title">Lịch sử đơn hàng</h1>
        <div className="error-message">{error}</div>
      </div>
    )
  }

  return (
    <div className="page-shell">
      <h1 className="section-title">Lịch sử đơn hàng</h1>

      {normalized.length === 0 ? (
        <div className="no-orders">Bạn chưa có đơn hàng nào.</div>
      ) : (
        <div className="order-history-list">
          {normalized.map((order) => {
            const status = parseOrderStatus(order.status)
            const tone = getOrderStatusTone(status)

            return (
              <div key={order.id} className="order-history-card">
                <div className="order-history-head">
                  <div className="order-history-meta">
                    <div className="order-history-id">Mã đơn: <strong>#{order.id}</strong></div>
                    <div className="order-history-date">Ngày đặt: {formatDateTime(order.createdAt)}</div>
                  </div>
                  <div className={`status-badge status-badge--${tone}`}>
                    {getOrderStatusLabel(status)}
                  </div>
                </div>

                <div className="order-history-items">
                  {order.items.map((it) => (
                    <div key={it.id} className="order-history-item">
                      <img
                        className="order-history-thumb"
                        src={it.Product?.image || 'https://via.placeholder.com/56x56?text=No+Img'}
                        alt={it.Product?.name || 'Sản phẩm'}
                      />
                      <div className="order-history-item-main">
                        <div className="order-history-item-name">{it.Product?.name || `Sản phẩm #${it.productId}`}</div>
                        <div className="order-history-item-sub">
                          SL: {it.quantity} × {formatCurrency(it.price)}
                        </div>
                      </div>
                      <div className="order-history-item-total">
                        {formatCurrency(it.price * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-history-foot">
                  <div className="order-history-total">
                    Tổng tiền: <strong>{formatCurrency(order.totalPrice)}</strong>
                  </div>

                  {status === 'shipping' && (
                    <button
                      type="button"
                      className="admin-primary-btn"
                      onClick={() => handleReceived(order.id)}
                      disabled={updatingId === order.id}
                    >
                      {updatingId === order.id ? 'Đang cập nhật...' : 'Đã nhận được hàng'}
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrderHistory

