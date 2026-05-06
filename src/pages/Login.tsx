import React, { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { LoginFormData } from '../types'
import { setToken } from '../utils/auth'

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin!')
      return
    }

    setIsSubmitting(true)
    setError('')
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      })

      if (!res.ok) {
        let message = `Request failed (${res.status})`
        try {
          const data = (await res.json()) as { message?: string }
          if (data?.message) message = data.message
        } catch {
          // ignore
        }
        throw new Error(message)
      }

      const data = (await res.json()) as { token: string }
      setToken(data.token)
      setFormData({
        email: '',
        password: ''
      })
      navigate('/account')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đăng nhập thất bại. Vui lòng thử lại!')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, navigate])

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Đăng nhập</h1>
        <p className="auth-subtitle">Chào mừng bạn trở lại!</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email *</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              placeholder="Nhập email của bạn"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Mật khẩu *</label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              required
            />
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Ghi nhớ đăng nhập</span>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="auth-link">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
