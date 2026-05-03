import React, { useState, useCallback } from 'react'
import type { FormData } from '../types'
import { CONTACT_INFO } from '../constants'
import { submitContact } from '../services/contactApi'

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setErrorMessage('')
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage('')

    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim() || !formData.message.trim()) {
      setSubmitStatus('error')
      setErrorMessage('Vui lòng điền đầy đủ thông tin!')
      return
    }

    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      await submitContact({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim()
      })
      setSubmitStatus('success')
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      })
      // Reset success message after 3 seconds
      setTimeout(() => setSubmitStatus('idle'), 3000)
    } catch (error) {
      setSubmitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Đã xảy ra lỗi. Vui lòng thử lại sau.')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData])

  return (
    <div className="contact-page">
      <h1 className="section-title">Liên hệ với chúng tôi</h1>
      <div className="contact-form">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Tên</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-control"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="subject">Chủ đề</label>
            <input
              type="text"
              id="subject"
              name="subject"
              className="form-control"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Tin nhắn</label>
            <textarea
              id="message"
              name="message"
              className="form-control"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Đang gửi...' : 'Gửi tin nhắn'}
          </button>
          
          {submitStatus === 'success' && (
            <div className="form-success">
              Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="form-error">
              {errorMessage || 'Đã xảy ra lỗi. Vui lòng thử lại sau.'}
            </div>
          )}
        </form>
      </div>
      
      <div className="contact-info">
        <h3>Thông tin liên hệ</h3>
        <p>Email: {CONTACT_INFO.email}</p>
        <p>Điện thoại: {CONTACT_INFO.phone}</p>
        <p>Địa chỉ: {CONTACT_INFO.address}</p>
        <p>Giờ làm việc: {CONTACT_INFO.hours}</p>
      </div>
    </div>
  )
}

export default Contact