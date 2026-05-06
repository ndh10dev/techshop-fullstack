import React, { useRef, useMemo, useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../constants'
import { formatCurrency, renderStars, formatDateTime } from '../utils/format'
import type { Product, BlogPost } from '../types'
import { getRoleFromStorage } from '../utils/auth'

interface HomeProps {
  addToCart: (product: { id: number; name: string; price: number; image: string }) => void
}

const Home: React.FC<HomeProps> = ({ addToCart }) => {
  const role = getRoleFromStorage()
  const productsSectionRef = useRef<HTMLDivElement>(null)

  const [items, setItems] = useState<Product[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [loadingPosts, setLoadingPosts] = useState(false)

  const [error, setError] = useState('')
  const [postError, setPostError] = useState('')

  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides = [
    'https://res.cloudinary.com/dicsf4zkz/image/upload/v1777646473/banner_h94yki.webp',
    'https://res.cloudinary.com/dicsf4zkz/image/upload/v1778070130/banner_2_r7eppl.jpg',
    'https://res.cloudinary.com/dicsf4zkz/image/upload/v1778070130/banner_4_mgfxh2.jpg',
    'https://res.cloudinary.com/dicsf4zkz/image/upload/v1778070130/banner_3_g9rx6c.jpg'
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  // 🔥 LOAD PRODUCTS
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true)
      setError('')
      try {
        const res = await fetch('http://localhost:5000/api/products')
        if (!res.ok) throw new Error('Không thể tải sản phẩm')
        const data = await res.json()
        setItems(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Lỗi tải sản phẩm')
        setItems([])
      } finally {
        setIsLoading(false)
      }
    }

    loadProducts()
  }, [])

  // 🔥 LOAD POSTS
  useEffect(() => {
    const loadPosts = async () => {
      setLoadingPosts(true)
      setPostError('')
      try {
        const res = await fetch('http://localhost:5000/api/posts')
        if (!res.ok) throw new Error('Không thể tải bài viết')
        const data = await res.json()

        const sorted = data.sort(
          (a: BlogPost, b: BlogPost) =>
            new Date(b.createdAt || b.date).getTime() -
            new Date(a.createdAt || a.date).getTime()
        )

        setPosts(sorted.slice(0, 2))
      } catch (e) {
        setPostError(e instanceof Error ? e.message : 'Lỗi tải bài viết')
        setPosts([])
      } finally {
        setLoadingPosts(false)
      }
    }

    loadPosts()
  }, [])

  // 🔥 FEATURED PRODUCTS
  const featuredProducts = useMemo(() => {
    const order = ['drink', 'food', 'snack', 'daily']
    const map = new Map<string, Product[]>()

    items.forEach(p => {
      const arr = map.get(p.category) ?? []
      arr.push(p)
      map.set(p.category, arr)
    })

    const result: Product[] = []

    order.forEach(cat => {
      const list = (map.get(cat) ?? [])
        .filter(p => (p.quantity ?? 0) > 0)
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 2)

      result.push(...list)
    })

    return result
  }, [items])

  const handleShopNow = useCallback(() => {
    productsSectionRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const handleAddToCart = useCallback((product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    })
    alert(`Đã thêm ${product.name} vào giỏ hàng!`)
  }, [addToCart])

  return (
    <div>

      {/* HERO */}
      <section className="hero">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${slide})` }}
          />
        ))}
        <div className="hero-content">
          <h1 className="animate-fade-up">Chào mừng đến với HioMart</h1>
          <p className="animate-fade-up delay-1">Mua sắm tiện lợi mỗi ngày – đa dạng sản phẩm từ đồ ăn, thức uống đến nhu yếu phẩm.</p>
          <button className="cta-button animate-fade-up delay-2" onClick={handleShopNow}>
            Mua sắm ngay
          </button>
        </div>
      </section>

      {/* CATEGORY */}
      <section className="categories-section">
        <h2 className="section-title">Mua sắm theo danh mục</h2>
        <div className="category-grid">
          {categories.map((category) => (
            <Link key={category.id} to="/products" className="category-card">
              <img src={category.image} alt={category.name} className="category-image" />
              <div className="category-info">
                <h3 className="category-title">{category.name}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="products-section" ref={productsSectionRef}>
        <div className="section-header">
          <h2 className="section-title">Sản phẩm nổi bật</h2>
          <Link to="/products" className="view-all-link">
            Xem tất cả →
          </Link>
        </div>

        <div className="products-grid">
          {error && <p>{error}</p>}

          {!error && isLoading ? (
            <p>Đang tải sản phẩm...</p>
          ) : featuredProducts.length === 0 ? (
            <p>Chưa có sản phẩm</p>
          ) : (
            featuredProducts.map(product => (
              <div key={product.id} className="product-card">
                <img src={product.image} alt={product.name} className="product-image" />

                <div className="product-info">
                  <h3 className="product-title">{product.name}</h3>

                  {product.brand && (
                    <p className="product-brand">Brand: {product.brand}</p>
                  )}

                  <p className="product-description">{product.description}</p>

                  <div className="product-rating">
                    {renderStars(product.rating)}
                  </div>

                  <div className="product-price">
                    {formatCurrency(product.price)}
                  </div>

                  {role === 'USER' && (
                    <button
                      className="add-to-cart"
                      onClick={() => handleAddToCart(product)}
                    >
                      Thêm vào giỏ hàng
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* 🔥 BLOG SECTION FIX CHUẨN */}
      <section className="products-section">
        <div className="section-header">
          <h2 className="section-title">Tin tức & Bài viết</h2>
          <Link to="/blog" className="view-all-link">
            Xem tất cả →
          </Link>
        </div>

        {postError && <p>{postError}</p>}

        {loadingPosts ? (
          <p>Đang tải bài viết...</p>
        ) : posts.length === 0 ? (
          <p>Chưa có bài viết</p>
        ) : (
          <div className="products-grid">
            {posts.map(post => (
              <div key={post.id} className="product-card">
                <img src={post.image} alt={post.title} className="product-image" />

                <div className="product-info">
                  <p className="product-brand">{post.category}</p>

                  <h3 className="product-title">{post.title}</h3>

                  <p className="product-description">{post.excerpt}</p>

                  <p style={{ fontSize: 12, color: '#888' }}>
                    {formatDateTime(post.createdAt || post.date)} • {post.readTime}
                  </p>

                  <Link to={`/blog/${post.id}`} className="view-all-link">
                    Đọc thêm →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  )
}

export default Home