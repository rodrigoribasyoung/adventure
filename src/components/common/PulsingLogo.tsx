import { useEffect, useState } from 'react'
import { Logo } from '@/components/layout/Logo'

interface PulsingLogoProps {
  variant?: 'dark' | 'white' | 'light' | 'light-2' | 'light-3' | 'black'
  size?: 'sm' | 'md' | 'lg'
}

export const PulsingLogo = ({ variant = 'white', size = 'lg' }: PulsingLogoProps) => {
  const [time, setTime] = useState(0)

  useEffect(() => {
    let animationFrame: number
    const animate = (currentTime: number) => {
      setTime(currentTime)
      animationFrame = requestAnimationFrame(animate)
    }
    animationFrame = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  // Animações suaves e fluidas
  const pulse1 = Math.sin(time * 0.001) * 0.5 + 0.5
  const pulse2 = Math.sin(time * 0.0015 + Math.PI / 3) * 0.5 + 0.5
  const scale = 1 + Math.sin(time * 0.0008) * 0.02

  return (
    <div
      className="relative inline-block"
      style={{
        transform: `scale(${scale})`,
        transition: 'none',
      }}
    >
      {/* Glow externo suave */}
      <div
        className="absolute inset-0 rounded-lg blur-3xl"
        style={{
          background: `radial-gradient(circle, rgba(218, 0, 40, ${pulse1 * 0.2}) 0%, rgba(4, 42, 161, ${pulse2 * 0.2}) 50%, transparent 70%)`,
          opacity: 0.6,
          transform: 'scale(2)',
          animation: 'pulse 4s ease-in-out infinite',
        }}
      />
      {/* Glow interno mais intenso */}
      <div
        className="absolute inset-0 rounded-lg blur-2xl"
        style={{
          background: `radial-gradient(circle, rgba(255, 255, 255, ${pulse1 * 0.15}) 0%, transparent 60%)`,
          opacity: 0.8,
          transform: 'scale(1.3)',
        }}
      />
      <div className="relative z-10 drop-shadow-2xl">
        <Logo variant={variant} size={size} />
      </div>
    </div>
  )
}
