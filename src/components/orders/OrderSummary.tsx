import React, { useMemo } from 'react'
import { formatCurrency } from '../../utils/format'
import type { PosLineItem } from './ProductSelector'

type Props = {
  items: PosLineItem[]
}

const OrderSummary: React.FC<Props> = ({ items }) => {
  const { totalQty, subtotal } = useMemo(() => {
    const qty = items.reduce((s, li) => s + li.quantity, 0)
    const money = items.reduce((s, li) => s + li.product.price * li.quantity, 0)
    return { totalQty: qty, subtotal: money }
  }, [items])

  return (
    <div className="pos-summary">
      <h4 className="pos-section-title">Tóm tắt đơn hàng</h4>
      <div className="pos-summary-rows">
        <div className="pos-summary-row">
          <span className="pos-summary-label">Subtotal</span>
          <span className="pos-summary-value">{formatCurrency(subtotal)}</span>
        </div>
        <div className="pos-summary-row">
          <span className="pos-summary-label">Tổng số lượng</span>
          <span className="pos-summary-value">{totalQty}</span>
        </div>
        <div className="pos-summary-row pos-summary-row--total">
          <span className="pos-summary-label">Tổng tiền</span>
          <span className="pos-summary-total">{formatCurrency(subtotal)}</span>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary

