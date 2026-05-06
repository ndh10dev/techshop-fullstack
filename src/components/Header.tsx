import React, { useMemo, useCallback } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { categories } from '../constants'
import type { CartItem } from '../types'
import { getRoleFromStorage } from '../utils/auth'

interface HeaderProps {
  cartItems: CartItem[]
}

const Header: React.FC<HeaderProps> = ({ 
  cartItems
}) => {
  const role = getRoleFromStorage()
  const location = useLocation()

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const handleDropdownClose = useCallback(() => {
    // Dropdown is now handled by CSS :hover
  }, [])

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  return (
    <header className="header">
      <nav className="nav-container">
        <Link to="/" className="logo">
          <span className="logo-icon">🏪</span>
          HioMart
        </Link>
        <ul className="nav-links">
          <li>
            <Link to="/" className={isActive('/') ? 'active' : ''}>Trang chủ</Link>
          </li>
          <li 
            className={`products-dropdown-container ${isActive('/products') ? 'active' : ''}`}
          >
            <Link to="/products" className="products-dropdown-trigger">
              Sản phẩm ▾
            </Link>
            <div className="products-dropdown-menu">
              <Link 
                to="/products"
                className="dropdown-item"
                onClick={handleDropdownClose}
              >
                Tất cả sản phẩm
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="dropdown-item"
                  onClick={handleDropdownClose}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </li>
          <li>
            <Link to="/blog" className={isActive('/blog') ? 'active' : ''}>Tin tức</Link>
          </li>
          <li>
            <Link to="/reviews" className={isActive('/reviews') ? 'active' : ''}>Đánh giá</Link>
          </li>
          {role === 'ADMIN' && (
            <li>
              <Link to="/admin/orders" className={isActive('/admin') ? 'active' : ''}>Quản lý</Link>
            </li>
          )}
          <li>
            <Link to="/account" className={isActive('/account') ? 'active' : ''}>Tài khoản</Link>
          </li>
          <li className={`cart-icon ${isActive('/cart') ? 'active' : ''}`}>
            <Link to="/cart" className="cart-link">
              🛒  
              {totalItems > 0 && (
                <span className="cart-count">{totalItems}</span>
              )}
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  )
}

export default Header