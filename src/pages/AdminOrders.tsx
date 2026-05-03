import React, { useEffect, useState } from 'react'
import { Order } from '../types'
import { getToken } from '../utils/auth'
import { formatCurrency } from '../utils/format'

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = getToken()
        if (!token) {
          setError('Vui lòng đăng nhập với quyền Admin')
          setLoading(false)
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

        const data = await res.json()
        setOrders(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

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
              <div><strong>Ngày:</strong> ${new Date(order.createdAt).toLocaleDateString('vi-VN')}</div>
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
                      <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                      <td>
                        <button 
                          onClick={() => handleExportInvoice(order)}
                          className="export-btn"
                        >
                          Xuất hóa đơn
                        </button>
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
