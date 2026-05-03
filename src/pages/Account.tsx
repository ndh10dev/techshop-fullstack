import React, { useMemo, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clearToken, decodeJwtPayload, getToken, isTokenExpired } from '../utils/auth'

const Account: React.FC = () => {
  const navigate = useNavigate()

  const token = getToken()
  const payload = useMemo(() => (token ? decodeJwtPayload(token) : null), [token])
  const isLoggedIn = Boolean(token && payload && !isTokenExpired(payload) && payload.email && payload.username && payload.role)

  const handleLogout = useCallback(() => {
    clearToken()
    navigate('/')
  }, [navigate])

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Tài khoản</h1>
        <p className="auth-subtitle">
          {isLoggedIn ? 'Thông tin tài khoản của bạn' : 'Vui lòng đăng nhập hoặc đăng ký'}
        </p>

        {!isLoggedIn ? (
          <div className="account-actions">
            <Link to="/login" className="auth-submit-btn account-btn">
              Đăng nhập
            </Link>
            <Link to="/register" className="auth-submit-btn account-btn account-btn-secondary">
              Đăng ký
            </Link>
          </div>
        ) : (
          <div className="account-info">
            {payload?.role === 'ADMIN' && <div className="account-badge">Admin Account</div>}

            <div className="account-row">
              <span className="account-label">Username</span>
              <span className="account-value">{payload?.username}</span>
            </div>
            <div className="account-row">
              <span className="account-label">Email</span>
              <span className="account-value">{payload?.email}</span>
            </div>
            <div className="account-row">
              <span className="account-label">Role</span>
              <span className="account-value">{payload?.role}</span>
            </div>

            <button type="button" className="auth-submit-btn account-logout" onClick={handleLogout}>
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Account

