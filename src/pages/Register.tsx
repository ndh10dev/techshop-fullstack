import React, { useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { RegisterFormData } from '../types'
import { setToken } from '../utils/auth'

const Register: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Vui lòng điền đầy đủ thông tin!')
      return
    }

    if (formData.password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự!')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp!')
      return
    }

    setIsSubmitting(true)
    setError('')
    
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: formData.name, email: formData.email, password: formData.password })
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
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      })
      navigate('/account')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Đăng ký thất bại. Vui lòng thử lại!')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData])

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h1 className="auth-title">Đăng ký</h1>
        <p className="auth-subtitle">Tạo tài khoản mới</p>
        
        <form onSubmit={handleSubmit} className="auth-form">
          {error && (
            <div className="form-error">
              {error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="name">Họ và tên *</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="Nhập họ và tên"
              required
            />
          </div>
          
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
              placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
              required
              minLength={6}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-control"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Nhập lại mật khẩu"
              required
            />
          </div>
          
          <div className="form-options">
            <label className="checkbox-label">
              <input type="checkbox" required />
              <span>Tôi đồng ý với điều khoản và chính sách</span>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>
            Đã có tài khoản?{' '}
            <Link to="/login" className="auth-link">
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
