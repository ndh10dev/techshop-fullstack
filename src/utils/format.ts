/**
 * Định dạng tiền Việt
 */
export const formatCurrency = (amount: number | string): string => {
  const n = typeof amount === 'string' ? Number(amount) : amount
  if (Number.isNaN(n)) return `0vnd`
  return `${n.toLocaleString('vi-VN')}vnd`
}

/**
 * Hiển thị xếp hạng sao dưới dạng chuỗi
 */
export const renderStars = (rating: number): string => {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
