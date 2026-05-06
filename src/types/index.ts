export interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: number
  image: string
  category: string
  brand?: string
  rating: number
  quantity?: number
}

export interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  fullContent: string
  image: string
  category: string
  date: string
  author: string
  readTime: string
  createdAt?: string
}

export interface Category {
  id: string
  name: string
  count: number
  image: string
}

export interface FormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface CheckoutFormData {
  phone: string
  shippingAddress: string
  notes: string
}

export interface Review {
  id: number
  customerName: string
  rating: number
  comment: string
  createdAt: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface OrderItem {
  id: number
  productId: number
  quantity: number
  price: number
  Product?: {
    name: string
    image?: string
  }
}

export interface Order {
  id: number
  userId: number
  customerName?: string
  phone?: string
  address?: string
  note?: string
  paymentMethod?: string
  totalPrice: number
  status: string
  createdAt: string
  items: OrderItem[]
  User?: {
    username: string
    email: string
  }
}
