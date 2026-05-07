import React, { useMemo } from 'react'
import type { Product } from '../../types'
import { formatCurrency } from '../../utils/format'
import { getProductStock } from '../../utils/stock'

export type PosLineItem = {
  product: Product
  quantity: number
}

type Props = {
  products: Product[]
  query: string
  onQueryChange: (value: string) => void
  selected: PosLineItem[]
  onAdd: (product: Product) => void
  onRemove: (productId: number) => void
  onSetQuantity: (productId: number, nextQty: number) => void
}

function clampQty(nextQty: number, max: number) {
  if (Number.isNaN(nextQty)) return 1
  return Math.max(1, Math.min(max, nextQty))
}

const ProductSelector: React.FC<Props> = ({
  products,
  query,
  onQueryChange,
  selected,
  onAdd,
  onRemove,
  onSetQuantity
}) => {
  const selectedById = useMemo(() => {
    return new Map(selected.map((li) => [li.product.id, li]))
  }, [selected])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => p.name.toLowerCase().includes(q))
  }, [products, query])

  return (
    <div className="pos-grid">
      <div className="pos-panel">
        <div className="pos-panel-header">
          <h4 className="pos-panel-title">Chọn sản phẩm</h4>
          <div className="pos-search">
            <span className="pos-search-icon">⌕</span>
            <input
              className="pos-search-input"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Tìm theo tên sản phẩm…"
              aria-label="Tìm sản phẩm"
            />
            {query.trim() && (
              <button className="pos-search-clear" onClick={() => onQueryChange('')} aria-label="Xóa tìm kiếm">
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="pos-products">
          {filtered.length === 0 ? (
            <div className="pos-empty">Không tìm thấy sản phẩm phù hợp.</div>
          ) : (
            filtered.map((p) => {
              const stock = getProductStock(p)
              const picked = selectedById.get(p.id)
              const isOut = stock <= 0
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`pos-product-card ${picked ? 'is-picked' : ''}`}
                  onClick={() => onAdd(p)}
                  disabled={isOut}
                  title={isOut ? 'Hết hàng' : 'Thêm vào đơn'}
                >
                  <img className="pos-product-thumb" src={p.image} alt={p.name} />
                  <div className="pos-product-main">
                    <div className="pos-product-name-row">
                      <span className="pos-product-name">{p.name}</span>
                      {isOut && <span className="pos-badge pos-badge--out">Hết hàng</span>}
                    </div>
                    <div className="pos-product-meta">
                      <span className="pos-product-price">{formatCurrency(p.price)}</span>
                      <span className="pos-product-stock">Tồn: {stock}</span>
                    </div>
                  </div>
                  <div className="pos-product-add">{picked ? `+${picked.quantity}` : '+'}</div>
                </button>
              )
            })
          )}
        </div>
      </div>

      <div className="pos-panel">
        <div className="pos-panel-header">
          <h4 className="pos-panel-title">Sản phẩm trong đơn</h4>
          <span className="pos-panel-subtitle">{selected.length} dòng</span>
        </div>

        {selected.length === 0 ? (
          <div className="pos-empty">Chưa chọn sản phẩm nào.</div>
        ) : (
          <div className="pos-lines">
            {selected.map((li) => {
              const stock = getProductStock(li.product)
              const max = Math.max(0, stock)
              return (
                <div key={li.product.id} className="pos-line">
                  <img className="pos-line-thumb" src={li.product.image} alt={li.product.name} />
                  <div className="pos-line-main">
                    <div className="pos-line-name">{li.product.name}</div>
                    <div className="pos-line-sub">
                      <span>{formatCurrency(li.product.price)}</span>
                      <span className="pos-dot">•</span>
                      <span>Tồn: {stock}</span>
                    </div>
                  </div>
                  <div className="pos-line-controls">
                    <button
                      type="button"
                      className="pos-qty-btn"
                      onClick={() => onSetQuantity(li.product.id, clampQty(li.quantity - 1, max))}
                      disabled={li.quantity <= 1}
                      aria-label="Giảm số lượng"
                    >
                      −
                    </button>
                    <input
                      className="pos-qty-input"
                      value={li.quantity}
                      inputMode="numeric"
                      onChange={(e) => {
                        const next = clampQty(Number(e.target.value), max)
                        onSetQuantity(li.product.id, next)
                      }}
                      aria-label="Số lượng"
                    />
                    <button
                      type="button"
                      className="pos-qty-btn"
                      onClick={() => onSetQuantity(li.product.id, clampQty(li.quantity + 1, max))}
                      disabled={max > 0 ? li.quantity >= max : true}
                      aria-label="Tăng số lượng"
                    >
                      +
                    </button>
                  </div>
                  <div className="pos-line-total">{formatCurrency(li.product.price * li.quantity)}</div>
                  <button
                    type="button"
                    className="pos-remove-btn"
                    onClick={() => onRemove(li.product.id)}
                    aria-label="Xóa sản phẩm"
                    title="Xóa"
                  >
                    ✕
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductSelector

