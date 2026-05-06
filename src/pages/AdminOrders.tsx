import React, { useEffect, useState, useCallback, useRef } from 'react'
import { Order } from '../types'
import { getToken } from '../utils/auth'
import { formatCurrency, formatDateTime } from '../utils/format'

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
  const [notifications, setNotifications] = useState<Notification[]>([])
  
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

      const res = await fetch('http://localhost:5000/api/orders/admin', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Không thể tải danh sách đơn hàng')
      }

      const data = await res.json() as Order[]
      
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
    } catch (err: any) {
      if (!isSilent) setError(err.message)
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
      const token = getToken()
      const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (!res.ok) {
        throw new Error('Xóa đơn hàng thất bại')
      }

      // Remove from UI instantly
      setOrders(prev => prev.filter(o => o.id !== orderId))
      alert('Đã xóa đơn hàng thành công!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  useEffect(() => {
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        removeNotification(notifications[0].id)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [notifications])

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
        <h1 className="admin-title">Quản lý Đơn hàng</h1>
        
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
                    <th>Sản phẩm</th>
                    <th>Tổng tiền</th>
                    <th>Ngày đặt</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>
                        <div className="customer-cell">
                          <span className="customer-name">{order.User?.username}</span>
                          <span className="customer-email">{order.User?.email}</span>
                        </div>
                      </td>
                      <td>
                        <div className="items-cell">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="item-row">
                              {item.Product?.name} x {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="total-cell">{formatCurrency(order.totalPrice)}</td>
                      <td>{formatDateTime(order.createdAt)}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            onClick={() => handleExportInvoice(order)}
                            className="export-btn"
                          >
                            Xuất hóa đơn
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .admin-orders-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 20px;
          min-height: 80vh;
        }

        .admin-title {
          margin-bottom: 2rem;
          color: #333;
          font-size: 2rem;
        }

        .admin-table-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          background: #f8f9fa;
          padding: 1.2rem 1rem;
          font-weight: 600;
          color: #555;
          border-bottom: 2px solid #eee;
        }

        .admin-table td {
          padding: 1.2rem 1rem;
          border-bottom: 1px solid #eee;
          vertical-align: top;
        }

        .customer-cell {
          display: flex;
          flex-direction: column;
        }

        .customer-name {
          font-weight: 600;
          color: #333;
        }

        .customer-email {
          font-size: 0.85rem;
          color: #666;
        }

        .items-cell {
          font-size: 0.9rem;
          color: #555;
        }

        .item-row {
          margin-bottom: 0.2rem;
        }

        .total-cell {
          font-weight: 700;
          color: var(--primary-color);
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }

        .export-btn {
          background: var(--primary-gradient);
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: var(--transition-speed);
          white-space: nowrap;
        }

        .export-btn:hover {
          filter: var(--hover-filter);
          transform: translateY(-2px);
          box-shadow: var(--primary-shadow);
        }

        .delete-order-btn {
          background: #ff4757;
          color: white;
          border: none;
          padding: 0.6rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: var(--transition-speed);
        }

        .delete-order-btn:hover:not(:disabled) {
          background: #d62828;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(214, 40, 40, 0.2);
        }

        .delete-order-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Notifications */
        .notifications-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
        }

        .notification-toast {
          pointer-events: auto;
          background: white;
          width: 280px;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-left: 5px solid var(--primary-color);
        }

        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .notification-content {
          padding: 15px;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          color: var(--primary-color);
        }

        .close-notif {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
          color: #999;
        }

        .notification-body p {
          margin: 0;
          font-size: 0.9rem;
          color: #555;
          line-height: 1.4;
        }

        .progress-bar {
          height: 4px;
          background: var(--primary-gradient);
          width: 100%;
          animation: progress 4s linear forwards;
        }

        @keyframes progress {
          from { width: 100%; }
          to { width: 0%; }
        }

        .loading, .error-message, .no-orders {
          text-align: center;
          padding: 4rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          font-size: 1.2rem;
          color: #666;
        }

        .error-message {
          color: #d62828;
        }

        @media (max-width: 968px) {
          .admin-table-container {
            overflow-x: auto;
          }
          
          .admin-table {
            min-width: 800px;
          }
        }
      `}</style>
    </div>
  )
}

export default AdminOrders
