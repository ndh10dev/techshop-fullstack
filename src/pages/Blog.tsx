import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { BlogPost } from '../types'
import { getRoleFromStorage, getToken } from '../utils/auth'

const Blog: React.FC = () => {
  const role = getRoleFromStorage()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    fullContent: '',
    image: '',
    category: '',
    date: '',
    author: '',
    readTime: ''
  })

  const loadPosts = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:5000/api/posts')
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
      const data = (await res.json()) as BlogPost[]
      setPosts(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải bài viết')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadPosts()
  }, [loadPosts])

  const openCreate = useCallback(() => {
    setForm({
      title: '',
      excerpt: '',
      content: '',
      fullContent: '',
      image: '',
      category: 'Tin tức & Sản phẩm',
      date: new Date().toLocaleDateString('vi-VN'),
      author: '',
      readTime: ''
    })
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  const canSubmit = useMemo(() => {
    if (role !== 'ADMIN') return false
    return Boolean(form.title.trim()) && Boolean(form.content.trim())
  }, [form.content, form.title, role])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    try {
      const token = getToken()
      const res = await fetch('http://localhost:5000/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          title: form.title,
          excerpt: form.excerpt || undefined,
          content: form.content,
          fullContent: form.fullContent || undefined,
          image: form.image || undefined,
          category: form.category || undefined,
          date: form.date || undefined,
          author: form.author || undefined,
          readTime: form.readTime || undefined
        })
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

      closeModal()
      await loadPosts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Thêm bài viết thất bại')
    }
  }, [canSubmit, closeModal, form, loadPosts])

  const handleDelete = useCallback(async (postId: number) => {
    const ok = window.confirm('Bạn có chắc muốn xóa bài viết này không?')
    if (!ok) return

    try {
      const token = getToken()
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined
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

      await loadPosts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Xóa bài viết thất bại')
    }
  }, [loadPosts])

  return (
    <div className="blog-page">
      <h1 className="section-title">Khám phá sản phẩm & Tin tức</h1>

      {role === 'ADMIN' && (
        <div className="page-admin-actions">
          <button className="admin-primary-btn" onClick={openCreate}>
            Thêm bài viết
          </button>
        </div>
      )}

      <div className="blog-posts">
        {error && (
          <div className="no-products">
            <p>{error}</p>
          </div>
        )}
        {!error && isLoading ? (
          <div className="no-products">
            <p>Đang tải bài viết...</p>
          </div>
        ) : posts.map((post) => (
          <article key={post.id} className="blog-post">
            <img 
              src={post.image || 'https://via.placeholder.com/800x400?text=TechShop'} 
              alt={post.title}
              className="blog-image"
            />
            <div className="blog-content">
              <span className="blog-category">{post.category || 'Tin tức'}</span>
              <h2 className="blog-title">{post.title}</h2>
              <p className="blog-excerpt">{post.excerpt || post.content}</p>
              <div className="blog-meta">
                <span className="blog-meta-text">
                  {(post.date || '').trim()} {post.readTime ? `• ${post.readTime}` : ''}
                </span>
                <div className="blog-admin-actions">
                  <Link to={`/blog/${post.id}`} className="read-more">
                    Xem thêm →
                  </Link>
                  {role === 'ADMIN' && (
                    <button
                      type="button"
                      className="admin-danger-link"
                      onClick={() => handleDelete(post.id)}
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {role === 'ADMIN' && isModalOpen && (
        <div className="modal-overlay" onClick={closeModal} role="presentation">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="presentation">
            <div className="modal-header">
              <h2 className="modal-title">Thêm bài viết</h2>
              <button type="button" className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Title *</label>
                  <input
                    className="form-control"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Excerpt</label>
                  <input
                    className="form-control"
                    value={form.excerpt}
                    onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Content *</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.content}
                    onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>FullContent (HTML allowed)</label>
                  <textarea
                    className="form-control"
                    rows={6}
                    value={form.fullContent}
                    onChange={(e) => setForm((p) => ({ ...p, fullContent: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Image</label>
                  <input
                    className="form-control"
                    value={form.image}
                    onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <input
                    className="form-control"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    className="form-control"
                    value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Author</label>
                  <input
                    className="form-control"
                    value={form.author}
                    onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Read time</label>
                  <input
                    className="form-control"
                    value={form.readTime}
                    onChange={(e) => setForm((p) => ({ ...p, readTime: e.target.value }))}
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-secondary-btn" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="admin-primary-btn" disabled={!canSubmit}>
                  Tạo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Blog