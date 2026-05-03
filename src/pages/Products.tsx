import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories } from '../constants'
import { formatCurrency, renderStars } from '../utils/format'
import type { Product } from '../types'
import { getRoleFromStorage, getToken } from '../utils/auth'

interface ProductsProps {
  addToCart: (product: { id: number; name: string; price: number; image: string }) => void
}

const Products: React.FC<ProductsProps> = ({ addToCart }) => {
  const role = getRoleFromStorage()
  const [searchParams, setSearchParams] = useSearchParams()
  const categoryParam = searchParams.get('category') || 'all'
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam)
  const [items, setItems] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

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
    quantity: 0,
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
    const base = selectedCategory === 'all'
      ? items
      : items.filter(product => product.category === selectedCategory)

    if (role === 'ADMIN') return base
    return base.filter(p => (p.quantity ?? 0) > 0)
  }, [items, role, selectedCategory])

  const handleAddToCart = useCallback((product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image
    })
    alert(`Đã thêm ${product.name} vào giỏ hàng!`)
  }, [addToCart])

  const openCreate = useCallback(() => {
    setEditing(null)
    setForm({
      image: '',
      name: '',
      brand: '',
      description: '',
      rating: 0,
      price: 0,
      quantity: 0,
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
      quantity: Number(product.quantity ?? 0),
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
          quantity: Number(form.quantity),
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
      
      {/* Category Menu Buttons */}
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

      {/* Products Count */}
      <div className="products-count">
        Hiển thị {filteredProducts.length} sản phẩm
        {selectedCategory !== 'all' && (
          <span className="category-name">
            {' '}trong danh mục {categories.find(c => c.id === selectedCategory)?.name}
          </span>
        )}
      </div>

      {/* Products Grid */}
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
            <p>Không có sản phẩm nào trong danh mục này.</p>
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
                {product.brand && <p className="product-brand">Brand: {product.brand}</p>}
                <p className="product-description">{product.description}</p>
                <div className="product-rating">
                  {renderStars(product.rating)}
                </div>
                <div className="product-price">{formatCurrency(product.price)}</div>

                {role === 'USER' && (
                  <button 
                    className="add-to-cart"
                    onClick={() => handleAddToCart(product)}
                  >
                    Thêm vào giỏ hàng
                  </button>
                )}

                {role === 'ADMIN' && (
                  <div className="admin-card-actions">
                    <button className="admin-secondary-btn" onClick={() => openEdit(product)}>
                      Sửa
                    </button>
                    <button className="admin-danger-btn" onClick={() => handleDelete(product.id)}>
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

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
                  <label>Image (URL) *</label>
                  <input
                    className="form-control"
                    value={form.image}
                    onChange={(e) => setForm((p) => ({ ...p, image: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Name *</label>
                  <input
                    className="form-control"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Brand</label>
                  <input
                    className="form-control"
                    value={form.brand}
                    onChange={(e) => setForm((p) => ({ ...p, brand: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label>Category *</label>
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
                  <label>Description *</label>
                  <input
                    className="form-control"
                    value={form.description}
                    onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Rating (0-5)</label>
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
                  <label>Price *</label>
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
                  <label>Quantity *</label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    value={form.quantity}
                    onChange={(e) => setForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
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
