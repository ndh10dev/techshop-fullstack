import type { Category } from '../types'

export const COMPANY_NAME = 'HioMart'

export const CONTACT_INFO = {
  email: 'nguyenhieua5lc1@gmail.com',
  phone: '(+84) 865-155-904',
  address: 'Số 54, phố Triều Khúc, phường Thanh Liệt, quận Thanh Xuân, TP. Hà Nội.',
  hours: 'Tất cả các ngày trong tuần'
} as const

export const categories: Category[] = [
  { 
    id: 'drink', 
    name: 'Đồ uống', 
    count: 6, 
    image: 'https://res.cloudinary.com/dicsf4zkz/image/upload/v1777646606/bannerMini_douong_y0bvlg.jpg' 
  },
  { 
    id: 'food', 
    name: 'Đồ ăn nhanh', 
    count: 4, 
    image: 'https://res.cloudinary.com/dicsf4zkz/image/upload/v1777646606/bannerMini_doannhanh_vamoay.jpg' 
  },
  { 
    id: 'snack', 
    name: 'Bánh kẹo', 
    count: 8, 
    image: 'https://res.cloudinary.com/dicsf4zkz/image/upload/v1777646605/bannerMini_banhkeo_wfgitl.webp' 
  },
  { 
    id: 'daily', 
    name: 'Hàng tiêu dùng', 
    count: 5, 
    image: 'https://res.cloudinary.com/dicsf4zkz/image/upload/v1777646604/bannerMini_hangtieudung_nyfa8v.webp' 
  }
]
