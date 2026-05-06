import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, Link, Navigate } from 'react-router-dom'
import type { BlogPost as BlogPostType } from '../types'

const BlogPost: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [post, setPost] = useState<BlogPostType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const postId = useMemo(() => {
    if (!id) return null
    const n = Number.parseInt(id, 10)
    return Number.isFinite(n) ? n : null
  }, [id])

  const load = useCallback(async () => {
    if (postId == null) return
    setIsLoading(true)
    setError('')
    try {
      const res = await fetch(`http://localhost:5000/api/posts/${postId}`)
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
      const data = (await res.json()) as BlogPostType
      setPost(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải bài viết')
      setPost(null)
    } finally {
      setIsLoading(false)
    }
  }, [postId])

  useEffect(() => {
    void load()
  }, [load])

  if (!id || postId == null) {
    return <Navigate to="/blog" replace />
  }

  if (error) {
    return (
      <div className="blog-post-page">
        <div className="error-message">
          <h2>{error}</h2>
          <Link to="/blog" className="back-to-blog">
            ← Quay lại Blog
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading || !post) {
    return (
      <div className="blog-post-page">
        <div className="error-message">
          <h2>Đang tải...</h2>
          <Link to="/blog" className="back-to-blog">
            ← Quay lại Blog
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-post-page">
      <div className="blog-post-header">
        <span className="blog-post-category">{post.category}</span>
        <h1 className="blog-post-title">{post.title}</h1>
        <div className="blog-post-meta">
          <span>Tác giả: {post.author}</span>
          <span>Ngày: {post.date}</span>
          <span>Thời gian đọc: {post.readTime}</span>
        </div>
      </div>
      
      <img 
        src={post.image || 'https://via.placeholder.com/1200x600?text=TechShop'} 
        alt={post.title}
        className="blog-post-image"
      />
      
      <div className="blog-post-content">
        <p>{post.content}</p>
        <div dangerouslySetInnerHTML={{ __html: post.fullContent || '' }} />
      </div>
      
      <Link to="/blog" className="back-to-blog">
        ← Quay lại
      </Link>
    </div>
  )
}

export default BlogPost 