import React from 'react'
import type { Order } from '../../types'
import { formatCurrency, formatDateTime } from '../../utils/format'

interface OrderDetailModalProps {
  order: Order
  onClose: () => void
  onExportInvoice: (order: Order) => void
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, onClose, onExportInvoice }) => {
  const customerName = order.customerName || order.User?.username || 'Khách chưa đăng nhập'
  const customerEmail = order.User?.email || 'N/A'
  const customerPhone = order.phone || 'N/A'
  const customerAddress = order.address || 'N/A'
  const customerNotes = order.note?.trim() || 'Khách hàng không để lại ghi chú'

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card order-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Chi tiết đơn hàng #{order.id}</h3>
          <button className="modal-close" onClick={onClose} aria-label="Đóng chi tiết đơn hàng">
            ✕
          </button>
        </div>

        <div className="modal-form order-detail-body">
          <div className="order-info-grid">
            <div className="order-info-item">
              <span className="order-info-label">Khách hàng</span>
              <span className="order-info-value">{customerName}</span>
            </div>
            <div className="order-info-item">
              <span className="order-info-label">Email</span>
              <span className="order-info-value">{customerEmail}</span>
            </div>
            <div className="order-info-item">
              <span className="order-info-label">SĐT</span>
              <span className="order-info-value">{customerPhone}</span>
            </div>
            <div className="order-info-item">
              <span className="order-info-label">Địa chỉ</span>
              <span className="order-info-value">{customerAddress}</span>
            </div>
            <div className="order-info-item">
              <span className="order-info-label">Ngày đặt</span>
              <span className="order-info-value">{formatDateTime(order.createdAt)}</span>
            </div>
          </div>

          <div className="order-products">
            <h4>Danh sách sản phẩm</h4>
            <div className="order-products-list">
              {order.items.map((item) => {
                const productInfo = item.Product as { name?: string; image?: string } | undefined
                return (
                  <div className="order-product-row" key={item.id}>
                    <img
                      className="order-product-thumb"
                      src={productInfo?.image || 'https://via.placeholder.com/56x56?text=No+Img'}
                      alt={productInfo?.name || 'Sản phẩm'}
                    />
                    <div className="order-product-main">
                      <p className="order-product-name">{productInfo?.name || 'Sản phẩm không xác định'}</p>
                      <p className="order-product-meta">
                        SL: {item.quantity} x {formatCurrency(item.price)}
                      </p>
                    </div>
                    <div className="order-product-total">{formatCurrency(item.price * item.quantity)}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="order-note">
            <span className="order-info-label">Ghi chú khách hàng</span>
            <p>{customerNotes}</p>
          </div>

          <div className="order-total-box">
            Tổng tiền: <strong>{formatCurrency(order.totalPrice)}</strong>
          </div>
        </div>

        <div className="modal-actions order-detail-actions order-detail-footer">
          <button className="order-detail-back-btn" onClick={onClose}>
            Quay lại
          </button>
          <button className="order-detail-export-btn" onClick={() => onExportInvoice(order)}>
            Xuất hóa đơn
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderDetailModal

