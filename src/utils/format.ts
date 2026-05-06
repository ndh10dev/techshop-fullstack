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

/**
 * Định dạng ngày tháng Tiếng Việt (UTC+7)
 * Ví dụ: 03/05/2026 - 20:51
 */
export const formatDateTime = (dateString: string | undefined): string => {
  if (!dateString) return ''
  const date = new Date(dateString)
  
  // Sử dụng Intl.DateTimeFormat để định dạng chuẩn Tiếng Việt với múi giờ Asia/Ho_Chi_Minh
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh'
  }).format(date).replace(',', ' -')
}
