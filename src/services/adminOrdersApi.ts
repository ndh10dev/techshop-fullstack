import type { Order } from '../types'
import { getToken } from '../utils/auth'

function getRequiredAuthHeader(): Record<string, string> {
  const token = getToken()
  if (!token) throw new Error('Vui long dang nhap voi quyen Admin')
  return { Authorization: `Bearer ${token}` }
}

async function assertOk(res: Response, fallbackMessage: string): Promise<void> {
  if (res.ok) return
  let message = fallbackMessage
  try {
    const data = (await res.json()) as { message?: string }
    if (data?.message) message = data.message
  } catch {
    // ignore parse errors
  }
  throw new Error(message)
}

export async function fetchAdminOrders(): Promise<Order[]> {
  const res = await fetch('http://localhost:5000/api/orders/admin', {
    headers: getRequiredAuthHeader()
  })
  await assertOk(res, 'Khong the tai danh sach don hang')
  return (await res.json()) as Order[]
}

export async function confirmAdminOrder(orderId: number): Promise<void> {
  const res = await fetch(`http://localhost:5000/api/orders/admin/${orderId}/confirm`, {
    method: 'PATCH',
    headers: getRequiredAuthHeader()
  })
  await assertOk(res, 'Xac nhan don hang that bai')
}

export async function cancelAdminOrder(orderId: number): Promise<void> {
  const res = await fetch(`http://localhost:5000/api/orders/admin/${orderId}/cancel`, {
    method: 'PATCH',
    headers: getRequiredAuthHeader()
  })
  await assertOk(res, 'Huy don hang that bai')
}

export async function deleteAdminOrder(orderId: number): Promise<void> {
  const res = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
    method: 'DELETE',
    headers: getRequiredAuthHeader()
  })
  await assertOk(res, 'Xoa don hang that bai')
}
