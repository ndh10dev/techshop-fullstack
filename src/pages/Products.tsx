import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories } from '../constants'
import { formatCurrency, renderStars } from '../utils/format'
import type { Product } from '../types'
import { getRoleFromStorage, getToken } from '../utils/auth'
import { ProductDetailModal } from '../components'
import { getProductStock } from '../utils/stock'

interface ProductsProps {
  addToCart: (product: { id: number; name: string; price: number; image: string; stockQuantity: number }) => Promise<void>
}

const Products: React.FC<ProductsProps> = ({ addToCart }) => {
  const role = getRoleFromStorage()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || 'all'
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [items, setItems] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Product detail modal (user + admin)
  const [detailProduct, setDetailProduct] = useState<Product | null>(null)

  // Admin product modal
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState({
    image: '',
    name: '',
    brand: '',
    description: '',
    rating: 0,
    price: 0,
    stockQuantity: 0,
    category: 'drink'
  })

  useEffect(() => {
    setSelectedCategory(categoryParam)
  }, [categoryParam])

  const loadProducts = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const token = getToken()
      const res = await fetch('http://localhost:5000/api/products', {
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
      const data = (await res.json()) as Product[]
      setItems(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không thể tải sản phẩm')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadProducts()
  }, [loadProducts])

  const filteredProducts = useMemo(() => {
    let base = selectedCategory === 'all'
      ? items
      : items.filter(product => product.category === selectedCategory)

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      base = base.filter(p => 
        p.name.toLowerCase().includes(query) || 
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query))
      )
    }

    if (role === 'ADMIN') return base
    return base.filter((p) => getProductStock(p) > 0)
  }, [items, role, selectedCategory, searchQuery])

  const handleAddToCart = useCallback((product: Product) => {
    void addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      stockQuantity: getProductStock(product)
    }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Không thể thêm vào giỏ hàng'
      alert(message)
    })
  }, [addToCart])

  const openDetail = useCallback((product: Product) => {
    setDetailProduct(product)
  }, [])

  const closeDetail = useCallback(() => {
    setDetailProduct(null)
  }, [])

  const openCreate = useCallback(() => {
    setEditing(null)
    setForm({
      image: '',
      name: '',
      brand: '',
      description: '',
      rating: 0,
      price: 0,
      stockQuantity: 0,
      category: selectedCategory === 'all' ? 'drink' : selectedCategory
    })
    setIsModalOpen(true)
  }, [selectedCategory])

  const openEdit = useCallback((product: Product) => {
    setEditing(product)
    setForm({
      image: product.image ?? '',
      name: product.name ?? '',
      brand: product.brand ?? '',
      description: product.description ?? '',
      rating: product.rating ?? 0,
      price: Number(product.price ?? 0),
      stockQuantity: getProductStock(product),
      category: product.category ?? 'drink'
    })
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setEditing(null)
  }, [])

  const handleDelete = useCallback(async (productId: number) => {
    const ok = window.confirm('Bạn có chắc muốn xóa sản phẩm này không?')
    if (!ok) return

    try {
      const token = getToken()
      const res = await fetch(`http://localhost:5000/api/products/${productId}`, {
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
      await loadProducts()
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Xóa sản phẩm thất bại')
    }
  }, [loadProducts])

  const handleModalSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = getToken()
      const url = editing
        ? `http://localhost:5000/api/products/${editing.id}`
        : 'http://localhost:5000/api/products'
      const method = editing ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          image: form.image,
          name: form.name,
          brand: form.brand || undefined,
          description: form.description,
          rating: Number(form.rating),
          price: Number(form.price),
          stockQuantity: Number(form.stockQuantity),
          category: form.category
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
      await loadProducts()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lưu sản phẩm thất bại')
    }
  }, [closeModal, editing, form, loadProducts])

  const handleCategoryChange = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId)
    if (categoryId === 'all') {
      setSearchParams({})
    } else {
      setSearchParams({ category: categoryId })
    }
  }, [setSearchParams])

  return (
    <div className="products-page">
      <h1 className="section-title">Sản phẩm</h1>

      {role === 'ADMIN' && (
        <div className="page-admin-actions">
          <button className="admin-primary-btn" onClick={openCreate}>
            Thêm sản phẩm
          </button>
        </div>
      )}

      <div className="search-container">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Tìm kiếm sản phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
      </div>
      
      <div className="category-menu">
        <button 
          className={`category-menu-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('all')}
        >
          Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            className={`category-menu-btn ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategoryChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="products-count">
        Hiển thị {filteredProducts.length} sản phẩm
        {selectedCategory !== 'all' && (
          <span className="category-name">
            {' '}trong danh mục {categories.find(c => c.id === selectedCategory)?.name}
          </span>
        )}
      </div>

      <div className="products-grid">
        {error && (
          <div className="no-products">
            <p>{error}</p>
          </div>
        )}

        {!error && isLoading ? (
          <div className="no-products">
            <p>Đang tải sản phẩm...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>Không tìm thấy sản phẩm nào khớp với tìm kiếm của bạn.</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <img 
                src={product.image} 
                alt={product.name}
                className="product-image"
              />
              <div className="product-info">
                <h3 className="product-title">{product.name}</h3>
                {product.brand && <p className="product-brand">Thương hiệu: {product.brand}</p>}
                <p className="product-description">{product.description}</p>
                <div className="product-rating">
                  {renderStars(product.rating)}
                </div>
                <div className="product-price">{formatCurrency(product.price)}</div>

                {role === 'USER' && (
                  <div className="product-actions">
                    <button
                      className="add-to-cart"
                      onClick={() => handleAddToCart(product)}
                      disabled={getProductStock(product) <= 0}
                      title={getProductStock(product) <= 0 ? 'Sản phẩm đã hết hàng' : 'Thêm vào giỏ hàng'}
                    >
                      Thêm vào giỏ hàng
                    </button>
                    <button className="detail-btn" onClick={() => openDetail(product)}>
                      Chi tiết sản phẩm
                    </button>
                  </div>
                )}

                {role === 'ADMIN' && (
                  <div className="admin-card-actions">
                    <button className="product-admin-btn product-admin-btn--detail" onClick={() => openDetail(product)}>
                      Chi tiết sp
                    </button>
                    <button className="product-admin-btn product-admin-btn--edit" onClick={() => openEdit(product)}>
                      Sửa
                    </button>
                    <button className="product-admin-btn product-admin-btn--delete" onClick={() => handleDelete(product.id)}>
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {detailProduct && (
        <ProductDetailModal
          product={detailProduct}
          onClose={closeDetail}
          onAddToCart={(p) => {
            void addToCart({ ...p, stockQuantity: getProductStock(detailProduct) }).catch((error: unknown) => {
              const message = error instanceof Error ? error.message : 'Không thể thêm vào giỏ hàng'
              alert(message)
            })
          }}
        />
      )}

      {role === 'ADMIN' && isModalOpen && (
        <div className="modal-overlay" onClick={closeModal} role="presentation">
          <div className="modal-card" onClick={(e) => e.stopPropagation()} role="presentation">
            <div className="modal-header">
              <h2 className="modal-title">{editing ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
              <button type="button" className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            <form className="modal-form" onSubmit={handleModalSubmit}>
              <div className="modal-grid">
                <div className="form-group">
                  <label>Ảnh (URL) *</label>
                  <input
                    className="form-control"
                    value={form.image}
                    onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tên sản phẩm *</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Thương hiệu</label>
                  <input
                    className="form-control"
                    value={form.brand}
                    onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Danh mục *</label>
                  <select
                    className="form-control"
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Mô tả *</label>
                  <input
                    className="form-control"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Đánh giá (0-5)</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    className="form-control"
                    value={form.rating}
                    onChange={(e) => setForm((p) => ({ ...p, rating: Number(e.target.value) }))}
                  />
                </div>

                <div className="form-group">
                  <label>Giá *</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: Number(e.target.value) }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Tồn kho *</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={form.stockQuantity}
                    onChange={(e) => setForm((p) => ({ ...p, stockQuantity: Number(e.target.value) }))}
                    required
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-secondary-btn" onClick={closeModal}>
                  Hủy
                </button>
                <button type="submit" className="admin-primary-btn">
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
