import { useEffect, useState, useRef } from 'react'

interface LoadingBarProps {
  onComplete?: () => void
  duration?: number
}

export const LoadingBar = ({ onComplete, duration = 800 }: LoadingBarProps) => {
  const [progress, setProgress] = useState(0)
  const [showOneMoreSecond, setShowOneMoreSecond] = useState(false)
  const completedRef = useRef(false)

  useEffect(() => {
    const startTime = Date.now()
    let timeoutId: number | null = null
    
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min((elapsed / duration) * 100, 99) // Para em 99%
      setProgress(newProgress)

      // Quando chegar em 99%, mostrar "ONE MORE SECOND..."
      if (newProgress >= 99 && !showOneMoreSecond && !completedRef.current) {
        setShowOneMoreSecond(true)
        completedRef.current = true
        // Aguardar 1 segundo antes de completar
        timeoutId = window.setTimeout(() => {
          if (onComplete) {
            onComplete()
          }
        }, 1000)
      }
    }, 16) // ~60fps

    return () => {
      clearInterval(interval)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [duration, onComplete, showOneMoreSecond])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <span 
          className="text-white/80 text-sm font-light tracking-wider"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {showOneMoreSecond ? 'ONE MORE SECOND...' : 'LOADING...'}
        </span>
        <span 
          className="text-white/60 text-xs font-light"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {showOneMoreSecond ? '99%' : `${Math.round(progress)}%`}
        </span>
      </div>
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-75 ease-out"
          style={{
            width: showOneMoreSecond ? '99%' : `${progress}%`,
            background: 'linear-gradient(90deg, #DA0028 0%, #042AA1 50%, #DA0028 100%)',
            backgroundSize: '200% 100%',
            animation: showOneMoreSecond ? 'none' : 'shimmer 1.5s infinite linear',
          }}
        />
      </div>
      <style>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  )
}

