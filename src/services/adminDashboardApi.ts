import { getAuthHeaders } from '../utils/auth'

export type AdminDashboardData = {
  todayRevenue: number
  todayOrders: number
  pendingCount: number
  shippingCount: number
  totalProducts: number
  topProducts: Array<{
    productId: number
    soldQty: number
    product: { id: number; name: string; image: string; price: number }
  }>
  revenue7Days: Array<{ day: string; revenue: number }>
}

export async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const res = await fetch('http://localhost:5000/api/admin/dashboard', {
    headers: getAuthHeaders()
  })

  if (!res.ok) {
    let message = 'Khong the tai dashboard'
    try {
      const data = (await res.json()) as { message?: string }
      if (data?.message) message = data.message
    } catch {
      // ignore parse errors
    }
    throw new Error(message)
  }

  return (await res.json()) as AdminDashboardData
}
