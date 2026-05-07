import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Order } from '../types'
import { getToken } from '../utils/auth'
import { formatCurrency, formatDateTime } from '../utils/format'
import { CreateOrderModal, OrderDetailModal } from '../components'
import { getOrderStatusLabel, getOrderStatusTone, parseOrderStatus } from '../utils/orderStatus'
import { cancelAdminOrder, confirmAdminOrder, deleteAdminOrder, fetchAdminOrders } from '../services/adminOrdersApi'

interface Notification {
  id: string
  orderId: number
  customerName: string
  totalPrice: number
  timestamp: number
}

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [posToast, setPosToast] = useState<string | null>(null)
  
  const viewedOrdersRef = useRef<Set<number>>(new Set())
  const initialLoadRef = useRef(true)

  // Load viewed orders from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('viewed_order_ids')
    if (saved) {
      try {
        const ids = JSON.parse(saved)
        viewedOrdersRef.current = new Set(ids)
      } catch (e) {
        console.error('Failed to parse viewed orders', e)
      }
    }
  }, [])

  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true)
    try {
      const token = getToken()
      if (!token) {
        setError('Vui lòng đăng nhập với quyền Admin')
        if (!isSilent) setLoading(false)
        return
      }
      const data = await fetchAdminOrders()
      
      if (!initialLoadRef.current) {
        const newOrders = data.filter(order => !viewedOrdersRef.current.has(order.id))
        if (newOrders.length > 0) {
          const newNotifications: Notification[] = newOrders.map(order => ({
            id: Math.random().toString(36).substr(2, 9),
            orderId: order.id,
            customerName: order.User?.username || 'Khách vãng lai',
            totalPrice: order.totalPrice,
            timestamp: Date.now()
          }))
          setNotifications(prev => [...prev, ...newNotifications])
          
          const updatedViewed = new Set(viewedOrdersRef.current)
          newOrders.forEach(o => updatedViewed.add(o.id))
          viewedOrdersRef.current = updatedViewed
          localStorage.setItem('viewed_order_ids', JSON.stringify(Array.from(updatedViewed)))
        }
      } else {
        const currentIds = new Set(data.map(o => o.id))
        viewedOrdersRef.current = currentIds
        localStorage.setItem('viewed_order_ids', JSON.stringify(Array.from(currentIds)))
        initialLoadRef.current = false
      }

      setOrders(data)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Không thể tải danh sách đơn hàng'
      if (!isSilent) setError(msg)
    } finally {
      if (!isSilent) setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    
    const interval = setInterval(() => {
      fetchOrders(true)
    }, 10000)
    
    return () => clearInterval(interval)
  }, [fetchOrders])

  const handleDeleteOrder = async (orderId: number) => {
    const ok = window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này vĩnh viễn không?')
    if (!ok) return

    setDeletingId(orderId)
    try {
      await deleteAdminOrder(orderId)

      // Remove from UI instantly
      setOrders(prev => prev.filter(o => o.id !== orderId))
      alert('Đã xóa đơn hàng thành công!')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Xóa đơn hàng thất bại'
      alert(msg)
    } finally {
      setDeletingId(null)
    }
  }

  const handleConfirm = useCallback(async (orderId: number) => {
    try {
      await confirmAdminOrder(orderId)
      await fetchOrders()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xác nhận đơn hàng thất bại')
    }
  }, [fetchOrders])

  const handleCancel = useCallback(async (orderId: number) => {
    const ok = window.confirm('Bạn có chắc muốn hủy đơn hàng này không?')
    if (!ok) return

    try {
      await cancelAdminOrder(orderId)
      await fetchOrders()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Hủy đơn hàng thất bại')
    }
  }, [fetchOrders])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const handleOpenOrderDetail = (order: Order) => {
    setSelectedOrder(order)
  }

  const handleCloseOrderDetail = () => {
    setSelectedOrder(null)
  }

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [notifications])

  useEffect(() => {
    if (!posToast) return
    const timer = setTimeout(() => setPosToast(null), 3500)
    return () => clearTimeout(timer)
  }, [posToast])

  const handleExportInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const invoiceHtml = `
      <html>
        <head>
          <title>Hóa đơn #${order.id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; color: #d62828; }
            .invoice-info { text-align: right; }
            .customer-info { margin-bottom: 30px; }
            .customer-info h3 { margin-bottom: 10px; color: #555; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8f9fa; text-align: left; padding: 12px; border-bottom: 2px solid #dee2e6; }
            td { padding: 12px; border-bottom: 1px solid #eee; }
            .total { text-align: right; font-size: 20px; font-weight: bold; color: #d62828; }
            .footer { margin-top: 50px; text-align: center; color: #888; font-size: 14px; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">HioMart</div>
            <div class="invoice-info">
              <div><strong>Hóa đơn:</strong> #${order.id}</div>
              <div><strong>Ngày:</strong> ${formatDateTime(order.createdAt)}</div>
            </div>
          </div>

          <div class="customer-info">
            <h3>Thông tin khách hàng</h3>
            <div><strong>Tên:</strong> ${order.User?.username || 'Khách vãng lai'}</div>
            <div><strong>Email:</strong> ${order.User?.email || 'N/A'}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.Product?.name || 'Sản phẩm không xác định'}</td>
                  <td>${item.quantity}</td>
                  <td>${formatCurrency(item.price)}</td>
                  <td>${formatCurrency(item.price * item.quantity)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total">
            Tổng cộng: ${formatCurrency(order.totalPrice)}
          </div>

          <div class="footer">
            Cảm ơn bạn đã mua sắm tại HioMart!
          </div>

          <script>
            window.onload = () => {
              window.print();
              window.onafterprint = () => window.close();
            }
          </script>
        </body>
      </html>
    `

    printWindow.document.write(invoiceHtml)
    printWindow.document.close()
  }

  if (loading) return <div className="admin-orders-page"><div className="loading">Đang tải...</div></div>
  if (error) return <div className="admin-orders-page"><div className="error-message">{error}</div></div>

  return (
    <div className="admin-orders-page">
      <div className="admin-container">
        <div className="admin-orders-header">
          <h1 className="admin-title">Quản lý Đơn hàng</h1>
          <div className="admin-dashboard-actions">
            <Link className="admin-secondary-btn" to="/admin/dashboard">Dashboard</Link>
            <button className="pos-add-order-btn" onClick={() => setShowCreateModal(true)}>
              <span className="pos-add-order-icon">＋</span>
              <span>Thêm đơn hàng</span>
            </button>
          </div>
        </div>
        
        <div className="notifications-container">
          {notifications.map((n) => (
            <div key={n.id} className="notification-toast">
              <div className="notification-content">
                <div className="notification-header">
                  <strong>Đơn hàng mới!</strong>
                  <button className="close-notif" onClick={() => removeNotification(n.id)}>✕</button>
                </div>
                <div className="notification-body">
                  <p>Mới từ: {n.customerName}</p>
                  <p>Tổng: {formatCurrency(n.totalPrice)}</p>
                </div>
              </div>
              <div className="progress-bar"></div>
            </div>
          ))}
          {posToast && (
            <div className="notification-toast pos-success-toast">
              <div className="notification-content">
                <div className="notification-header">
                  <strong>Thành công</strong>
                  <button className="close-notif" onClick={() => setPosToast(null)}>
                    ✕
                  </button>
                </div>
                <div className="notification-body">
                  <p>{posToast}</p>
                </div>
              </div>
              <div className="progress-bar"></div>
            </div>
          )}
        </div>

        <div className="orders-list">
          {orders.length === 0 ? (
            <div className="no-orders">Chưa có đơn hàng nào.</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Ngày đặt</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    (() => {
                      const status = parseOrderStatus(order.status)
                      const tone = getOrderStatusTone(status)
                      const canConfirm = status === 'pending'
                      const canCancel = status !== 'completed' && status !== 'cancelled'
                      return (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <div className="customer-cell">
                          <span className="customer-name">{order.customerName || order.User?.username || 'Khách vãng lai'}</span>
                          {order.User?.email && (
                            <span className="customer-email">{order.User.email}</span>
                          )}
                        </div>
                      </td>
                      <td className="total-cell">{formatCurrency(order.totalPrice)}</td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>
                        <span className={`status-badge status-badge--${tone}`}>
                          {getOrderStatusLabel(status)}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleConfirm(order.id)}
                            className="admin-primary-btn"
                            disabled={!canConfirm}
                            title={!canConfirm ? 'Chỉ có thể xác nhận đơn đang chờ' : 'Xác nhận đơn'}
                          >
                            Xác nhận
                          </button>
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="admin-danger-btn"
                            disabled={!canCancel}
                            title={!canCancel ? 'Không thể hủy đơn đã hoàn thành/đã hủy' : 'Hủy đơn'}
                          >
                            Hủy đơn
                          </button>
                          <button 
                            onClick={() => handleOpenOrderDetail(order)}
                            className="export-btn"
                          >
                            Chi tiết đơn hàng
                          </button>
                          <button 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="delete-order-btn"
                            disabled={deletingId === order.id}
                          >
                            {deletingId === order.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                      )
                    })()
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={handleCloseOrderDetail}
          onExportInvoice={handleExportInvoice}
        />
      )}
      {showCreateModal && (
        <CreateOrderModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setPosToast('Tạo đơn hàng thành công')
            fetchOrders()
          }}
        />
      )}
    </div>
  )
}

export default AdminOrders
