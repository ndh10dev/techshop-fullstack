import React, { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { categories } from '../constants'
import type { CartItem } from '../types'
import { getRoleFromStorage } from '../utils/auth'

interface HeaderProps {
  cartItems: CartItem[]
}

const Header: React.FC<HeaderProps> = ({ 
  cartItems
}) => {
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false)
  const role = getRoleFromStorage()

  const totalItems = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  )

  const handleDropdownClose = useCallback(() => {
    setIsProductsDropdownOpen(false)
  }, [])

  return (
    <header className="header">
      <nav className="nav-container">
        <Link to="/" className="logo">
          HioMart
        </Link>
        <ul className="nav-links">
          <li><Link to="/">Trang chủ</Link></li>
          <li 
            className="products-dropdown-container"
            onMouseEnter={() => setIsProductsDropdownOpen(true)}
            onMouseLeave={handleDropdownClose}
          >
            <Link to="/products" className="products-dropdown-trigger">
              Sản phẩm ▾
            </Link>
            {isProductsDropdownOpen && (
              <div 
                className="products-dropdown-menu"
                onMouseEnter={() => setIsProductsDropdownOpen(true)}
                onMouseLeave={handleDropdownClose}
              >
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
            )}
          </li>
          <li><Link to="/blog">Khám phá & Tin tức</Link></li>
          <li><Link to="/reviews">Đánh giá</Link></li>
          {role === 'ADMIN' && (
            <li><Link to="/admin/orders">Quản lý Đơn hàng</Link></li>
          )}
          <li>
            <Link to="/account" className="nav-link-auth">Tài khoản</Link>
          </li>
          <li className="cart-icon">
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