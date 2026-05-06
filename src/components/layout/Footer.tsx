import React from 'react'
import { Link } from 'react-router-dom'
import { COMPANY_NAME, CONTACT_INFO } from '../../constants'

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Giới thiệu về {COMPANY_NAME}</h3>
          <p>
            Chuỗi cửa hàng tiện lợi cung cấp đầy đủ đồ ăn nhanh, đồ uống và nhu yếu phẩm thiết yếu cho cuộc sống hằng
            ngày, phục vụ nhanh chóng và tiện lợi 24/7.
          </p>
        </div>
        <div className="footer-section">
          <h3>Liên kết nhanh</h3>
          <div className="footer-links">
            <Link to="/">Trang chủ</Link>
            <span className="footer-separator">|</span>
            <Link to="/products">Sản phẩm</Link>
            <span className="footer-separator">|</span>
            <Link to="/blog">Khám phá</Link>
            <span className="footer-separator">|</span>
            <Link to="/reviews">Đánh giá</Link>
          </div>
        </div>
        <div className="footer-section">
          <h3>Thông tin liên hệ</h3>
          <p>Email: {CONTACT_INFO.email}</p>
          <p>Điện thoại: {CONTACT_INFO.phone}</p>
          <p>Địa chỉ: {CONTACT_INFO.address}</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 {COMPANY_NAME}. Bảo lưu mọi quyền.</p>
        <Link to="/contact" className="footer-contact-button">
          Liên hệ ngay
        </Link>
      </div>
    </footer>
  )
}

export default Footer

