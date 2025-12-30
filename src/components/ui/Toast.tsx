import { useEffect } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error' | 'info' | 'warning'
  isVisible: boolean
  onClose: () => void
  duration?: number
}

export const Toast = ({
  message,
  type = 'info',
  isVisible,
  onClose,
  duration = 5000,
}: ToastProps) => {
  // Tocar som de notificação quando o toast aparecer
  useEffect(() => {
    if (isVisible) {
      try {
        const audio = new Audio('/assets/brand/sound effects/notification.mp3')
        audio.volume = 0.5
        audio.play().catch(error => {
          console.log('Erro ao tocar som de notificação:', error)
        })
      } catch (error) {
        console.log('Erro ao tocar som de notificação:', error)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      
      return () => clearTimeout(timer)
    }
  }, [isVisible, duration, onClose])

  if (!isVisible) return null

  const typeStyles = {
    success: 'bg-blue-500/20 border-blue-500 text-blue-400',
    error: 'bg-red-500/20 border-red-500 text-red-400',
    info: 'bg-blue-500/20 border-blue-500 text-blue-400',
    warning: 'bg-purple-500/20 border-purple-500 text-purple-400',
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-in">
      <div
        className={`
          px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg
          ${typeStyles[type]}
          min-w-[300px] max-w-md
        `}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">{message}</p>
          <button
            onClick={onClose}
            className="ml-4 text-current opacity-70 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

