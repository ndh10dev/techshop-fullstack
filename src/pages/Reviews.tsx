import React, { useState, useCallback, useEffect } from 'react'
import type { Review } from '../types'
import { renderStars, formatDateTime } from '../utils/format'
import { fetchReviews, submitReview } from '../services/reviewsApi'
import { getToken } from '../utils/auth'

const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [formData, setFormData] = useState({
    customerName: '',
    rating: 5,
    comment: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const token = getToken()

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    setIsLoading(true)
    setError('')
    try {
      const data = await fetchReviews()
      setReviews(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải đánh giá')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }))
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName.trim() || !formData.comment.trim()) {
      setError('Vui lòng điền đầy đủ thông tin!')
      return
    }

    if (!token) {
      setError('Bạn cần đăng nhập để gửi đánh giá!')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const created = await submitReview({
        customerName: formData.customerName,
        rating: formData.rating,
        comment: formData.comment
      })

      setReviews(prev => [created, ...prev])

      setFormData({
        customerName: '',
        rating: 5,
        comment: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gửi đánh giá thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, token])

  return (
    <div className="reviews-page">
      <h1 className="section-title">Đánh giá khách hàng</h1>

      <div className="reviews-content">

        {/* LEFT - LIST */}
        <div className="reviews-list-section">
          <h2>Đánh giá từ khách hàng</h2>

          {isLoading && <p>Đang tải...</p>}

          {error && (
            <p style={{ color: 'red', marginTop: '10px' }}>
              {error}
            </p>
          )}

          {!isLoading && reviews.length === 0 && (
            <div className="no-reviews">
              <p>Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
            </div>
          )}

          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-author">
                    <h3>{review.customerName}</h3>
                    <span className="review-date">{formatDateTime(review.createdAt)}</span>
                  </div>
                  <div className="review-rating">
                    {renderStars(review.rating)}
                  </div>
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT - FORM */}
        <div className="review-form-section">
          <h2>Để lại đánh giá</h2>

          <form onSubmit={handleSubmit} className="review-form">

            <div className="form-group">
              <label>Tên của bạn *</label>
              <input
                type="text"
                name="customerName"
                className="form-control"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Nhập tên của bạn"
              />
            </div>

            <div className="form-group">
              <label>Đánh giá *</label>
              <select
                name="rating"
                className="form-control"
                value={formData.rating}
                onChange={handleChange}
              >
                <option value={5}>5 sao - Tuyệt vời</option>
                <option value={4}>4 sao - Tốt</option>
                <option value={3}>3 sao - Bình thường</option>
                <option value={2}>2 sao - Không tốt</option>
                <option value={1}>1 sao - Rất tệ</option>
              </select>
            </div>

            <div className="form-group">
              <label>Nhận xét *</label>
              <textarea
                name="comment"
                className="form-control"
                value={formData.comment}
                onChange={handleChange}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                rows={5}
              />
            </div>

            <button
              type="submit"
              className="submit-review-btn"
              disabled={isSubmitting || !token}
            >
              {!token
                ? 'Đăng nhập để đánh giá'
                : isSubmitting
                ? 'Đang gửi...'
                : 'Gửi đánh giá'}
            </button>

          </form>
        </div>

      </div>
    </div>
  )
}

export default Reviews