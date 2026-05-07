import React, { useEffect, useMemo } from 'react'
import type { Product } from '../../types'
import { formatCurrency } from '../../utils/format'
import { getRoleFromStorage } from '../../utils/auth'

type Props = {
  product: Product
  onClose: () => void
  onAddToCart: (product: { id: number; name: string; price: number; image: string }) => void
}

function getStockStatus(quantity: number | undefined): { label: string; tone: 'green' | 'yellow' | 'red' } {
  const q = Number(quantity ?? 0)
  if (q <= 0) return { label: 'Hết hàng', tone: 'red' }
  if (q <= 10) return { label: 'Sắp hết hàng', tone: 'yellow' }
  return { label: 'Còn hàng', tone: 'green' }
}

const ProductDetailModal: React.FC<Props> = ({ product, onClose, onAddToCart }) => {
  const role = getRoleFromStorage()

  const stockQty = Number(product.stockQuantity ?? product.quantity ?? 0)
  const stock = useMemo(() => getStockStatus(stockQty), [stockQty])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  const canAdd = role === 'USER' && stockQty > 0

  return (
    <div className="modal-overlay product-detail-overlay" onClick={onClose} role="presentation">
      <div className="modal-card product-detail-modal" onClick={(e) => e.stopPropagation()} role="presentation">
        <div className="modal-header">
          <h2 className="modal-title">Chi tiết sản phẩm</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Đóng">
            ✕
          </button>
        </div>

        <div className="modal-form product-detail-body">
          <div className="product-detail-grid">
            <div className="product-detail-left">
              <img className="product-detail-image" src={product.image} alt={product.name} />
            </div>

            <div className="product-detail-right">
              <h3 className="product-detail-name">{product.name}</h3>
              {product.brand && <div className="product-detail-brand">Thương hiệu: <strong>{product.brand}</strong></div>}
              <div className="product-detail-price">{formatCurrency(product.price)}</div>

              <div className={`stock-badge stock-badge--${stock.tone}`}>{stock.label}</div>

              <div className="product-detail-section">
                <div className="product-detail-section-title">Mô tả</div>
                <div className="product-detail-text">{product.description}</div>
              </div>

              <div className="product-detail-section">
                <div className="product-detail-section-title">Mô tả chi tiết</div>
                <div className="product-detail-text">
                  {product.detailedDescription?.trim() || 'Đang cập nhật'}
                </div>
              </div>

              <div className="product-detail-section">
                <div className="product-detail-section-title">Hướng dẫn sử dụng</div>
                <div className="product-detail-text">
                  {product.usageInstructions?.trim() || 'Đang cập nhật'}
                </div>
              </div>

              <div className="product-detail-section">
                <div className="product-detail-section-title">Hướng dẫn bảo quản</div>
                <div className="product-detail-text">
                  {product.storageInstructions?.trim() || 'Đang cập nhật'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="product-detail-footer">
          <div className="product-detail-actions">
          <button type="button" className="product-modal-btn product-modal-btn--secondary" onClick={onClose}>
            Quay lại
          </button>
          {role === 'USER' && (
            <button
              type="button"
              className="product-modal-btn product-modal-btn--primary"
              onClick={() => onAddToCart({ id: product.id, name: product.name, price: product.price, image: product.image })}
              disabled={!canAdd}
              title={!canAdd ? 'Sản phẩm đã hết hàng' : 'Thêm vào giỏ hàng'}
            >
              Thêm vào giỏ hàng
            </button>
          )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailModal

