import React, { useState, useEffect, useCallback } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Footer, Header, ScrollToTop } from './components'
import Home from './pages/Home'
import Products from './pages/Products'
import Blog from './pages/Blog'
import BlogPost from './pages/BlogPost'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import Reviews from './pages/Reviews'
import Login from './pages/Login'
import Register from './pages/Register'
import Account from './pages/Account'
import AdminOrders from './pages/AdminOrders'
import ChatWidget from './pages/ChatWidget'
import type { CartItem, CheckoutFormData } from './types'
import { getCartFromStorage, saveCartToStorage } from './utils/localStorage'
import { getToken } from './utils/auth'

interface ProductInput {
  id: number
  name: string
  price: number
  image: string
}

const App: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>(getCartFromStorage)

  useEffect(() => {
    saveCartToStorage(cartItems)
  }, [cartItems])

  const addToCart = useCallback((product: ProductInput) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id)
      
      if (existingItem) {
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prevItems, { ...product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((id: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id))
  }, [])

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id)
      return
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    )
  }, [removeFromCart])

  const handleCheckout = useCallback(async (formData: CheckoutFormData) => {
    if (cartItems.length === 0) {
      throw new Error('Giỏ hàng của bạn đang trống!')
    }

    const token = getToken()
    if (!token) {
      throw new Error('Vui lòng đăng nhập để mua hàng.')
    }

    const res = await fetch('http://localhost:5000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        items: cartItems.map((i) => ({ productId: i.id, quantity: i.quantity })),
        phone: formData.phone,
        address: formData.shippingAddress,
        note: formData.notes
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

    setCartItems([])
    alert(
      'Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại HioMart! \n\nThông tin đơn hàng:\n- SĐT: ' +
        formData.phone +
        '\n- Địa chỉ: ' +
        formData.shippingAddress +
        (formData.notes ? '\n- Ghi chú: ' + formData.notes : '')
    )
  }, [cartItems])

  return (
    <div className="app">
      <Header 
        cartItems={cartItems}
      />
      <main>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Home addToCart={addToCart} />} />
          <Route path="/products" element={<Products addToCart={addToCart} />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:id" element={<BlogPost />} />
          <Route path="/contact" element={<Contact />} />
          <Route 
            path="/cart" 
            element={
              <Cart 
                cartItems={cartItems}
                onRemoveFromCart={removeFromCart}
                onUpdateQuantity={updateQuantity}
                onCheckout={handleCheckout}
              />
            } 
          />
          <Route path="/reviews" element={<Reviews />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin/orders" element={<AdminOrders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  )
}

export default App