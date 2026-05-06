import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

type Option = {
  label: string
  value: string
}

type Message = {
  id: number
  sender: 'bot' | 'user'
  text: string
}

const MAIN_OPTIONS: Option[] = [
  { label: '🏪 Cửa hàng', value: 'about' },
  { label: '🍔 Đồ ăn nhanh', value: 'food' },
  { label: '🥤 Đồ uống', value: 'drink' },
  { label: '🍪 Snack', value: 'snack' },
  { label: '🧴 Đồ dùng', value: 'daily' },
  { label: '✨ Khác', value: 'other' }
]

const OTHER_OPTIONS: Option[] = [
  { label: '🛍️ Sản phẩm', value: 'products' },
  { label: '⭐ Đánh giá', value: 'reviews' },
  { label: '📞 Liên hệ ngay', value: 'contact' }
]

const INITIAL_BOT_MESSAGES = [
  '👋 Xin chào, tôi là trợ lý HioMart.',
  'Tôi có thể giúp gì cho bạn?'
]

const ChatWidget: React.FC = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentOptions, setCurrentOptions] = useState<Option[]>(MAIN_OPTIONS)
  const [isBotTyping, setIsBotTyping] = useState(false)
  const messageIdRef = useRef(0)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)

  const optionGroups = useMemo(
    () => ({
      main: MAIN_OPTIONS,
      other: OTHER_OPTIONS
    }),
    []
  )

  const pushMessage = (sender: 'bot' | 'user', text: string) => {
    messageIdRef.current += 1
    setMessages(prev => [...prev, { id: messageIdRef.current, sender, text }])
  }

  const sendBotMessage = (text: string, delay = 2200) => {
    setIsBotTyping(true)
    window.setTimeout(() => {
      pushMessage('bot', text)
      setIsBotTyping(false)
    }, delay)
  }

  const handleOpenChat = () => {
    setIsOpen(prev => {
      const willOpen = !prev
      if (willOpen && messages.length === 0) {
        setCurrentOptions(optionGroups.main)
        sendBotMessage(INITIAL_BOT_MESSAGES[0], 450)
        sendBotMessage(INITIAL_BOT_MESSAGES[1], 1000)
      }
      return willOpen
    })
  }

  const handleMainAction = (value: string) => {
    if (value === 'about') navigate('/blog')
    if (value === 'food') navigate('/products?category=food')
    if (value === 'drink') navigate('/products?category=drink')
    if (value === 'snack') navigate('/products?category=snack')
    if (value === 'daily') navigate('/products?category=daily')
  }

  const handleOtherAction = (value: string) => {
    if (value === 'products') navigate('/products')
    if (value === 'reviews') navigate('/reviews')
    if (value === 'contact') navigate('/contact')
  }

  const handleOptionClick = (option: Option) => {
    pushMessage('user', option.label)

    if (option.value === 'other') {
      setCurrentOptions(optionGroups.other)
      sendBotMessage('Bạn muốn hỗ trợ thêm mục nào?', 500)
      return
    }

    if (currentOptions === optionGroups.main) {
      sendBotMessage('Đang chuyển bạn đến trang phù hợp...', 450)
      window.setTimeout(() => {
        handleMainAction(option.value)
      }, 900)
      return
    }

    sendBotMessage('Đang chuyển bạn đến trang bạn chọn...', 450)
    window.setTimeout(() => {
      handleOtherAction(option.value)
    }, 900)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, isBotTyping, isOpen])

  return (
    <div className="chat-widget">
      {isOpen && (
        <div className="chat-widget__panel">
          <div className="chat-widget__header">
            <h3>HioMart Assistant</h3>
            <button
              className="chat-widget__close"
              aria-label="Đóng khung chat"
              onClick={handleOpenChat}
            >
              ×
            </button>
          </div>

          <div className="chat-widget__messages">
            {messages.map(message => (
              <div
                key={message.id}
                className={`chat-widget__bubble chat-widget__bubble--${message.sender}`}
              >
                {message.text}
              </div>
            ))}

            {isBotTyping && (
              <div className="chat-widget__typing">
                <span />
                <span />
                <span />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-widget__options">
            {currentOptions.map(option => (
              <button
                key={option.value}
                className="chat-widget__option-btn"
                onClick={() => handleOptionClick(option)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        className={`chat-widget__toggle ${isOpen ? 'is-open' : ''}`}
        aria-label={isOpen ? 'Đóng chatbot' : 'Mở chatbot'}
        onClick={handleOpenChat}
      >
        {isOpen ? '✕' : '💬'}
      </button>
    </div>
  )
}

export default ChatWidget
