import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts'
import { getToken } from '../utils/auth'
import { formatCurrency } from '../utils/format'
import { fetchAdminDashboard, type AdminDashboardData } from '../services/adminDashboardApi'

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const token = getToken()
      if (!token) {
        setError('Vui lòng đăng nhập với quyền Admin')
        setData(null)
        return
      }
      setData(await fetchAdminDashboard())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải dashboard')
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void fetchDashboard()
  }, [fetchDashboard])

  const chartData = useMemo(() => (data?.revenue7Days ?? []).map((d) => ({
    day: d.day.slice(5), // MM-DD
    revenue: d.revenue
  })), [data])

  if (loading) {
    return <div className="admin-orders-page"><div className="loading">Đang tải...</div></div>
  }

  if (error) {
    return <div className="admin-orders-page"><div className="error-message">{error}</div></div>
  }

  if (!data) return null

  return (
    <div className="admin-orders-page admin-dashboard">
      <div className="admin-container">
        <div className="admin-orders-header">
          <h1 className="admin-title">Admin Dashboard</h1>
          <div className="admin-dashboard-actions">
            <button className="admin-secondary-btn" onClick={fetchDashboard}>Làm mới</button>
            <Link className="admin-primary-btn" to="/admin/orders">Quản lý đơn hàng</Link>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <div className="dashboard-card-label">Doanh thu hôm nay</div>
            <div className="dashboard-card-value">{formatCurrency(data.todayRevenue)}</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-label">Đơn hàng hôm nay</div>
            <div className="dashboard-card-value">{data.todayOrders}</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-label">Đơn chờ xác nhận</div>
            <div className="dashboard-card-value">{data.pendingCount}</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-label">Đơn đang giao</div>
            <div className="dashboard-card-value">{data.shippingCount}</div>
          </div>
          <div className="dashboard-card">
            <div className="dashboard-card-label">Tổng sản phẩm</div>
            <div className="dashboard-card-value">{data.totalProducts}</div>
          </div>
        </div>

        <div className="dashboard-panels">
          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h3 className="dashboard-panel-title">Doanh thu 7 ngày gần nhất</h3>
              <div className="dashboard-panel-sub">Chỉ tính đơn completed</div>
            </div>
            <div className="dashboard-chart">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData} margin={{ top: 12, right: 24, bottom: 6, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                  <Line type="monotone" dataKey="revenue" stroke="#d62828" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-head">
              <h3 className="dashboard-panel-title">Top sản phẩm bán chạy</h3>
              <div className="dashboard-panel-sub">Theo số lượng bán</div>
            </div>
            <div className="dashboard-top-list">
              {data.topProducts.length === 0 ? (
                <div className="no-orders">Chưa có dữ liệu</div>
              ) : (
                data.topProducts.map((p) => (
                  <div key={p.productId} className="dashboard-top-item">
                    <img className="dashboard-top-thumb" src={p.product.image} alt={p.product.name} />
                    <div className="dashboard-top-main">
                      <div className="dashboard-top-name">{p.product.name}</div>
                      <div className="dashboard-top-sub">
                        Đã bán: <strong>{p.soldQty}</strong> • Giá: {formatCurrency(p.product.price)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard

