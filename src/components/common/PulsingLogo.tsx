import { useEffect, useState } from 'react'
import { Logo } from '@/components/layout/Logo'

export const PulsingLogo = () => {
  const [pulse, setPulse] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse((prev) => (prev + 1) % 100)
    }, 50)

    return () => clearInterval(interval)
  }, [])

  const glowIntensity = Math.sin((pulse / 100) * Math.PI * 2) * 0.5 + 0.5
  const scale = 1 + Math.sin((pulse / 100) * Math.PI * 2) * 0.05

  return (
    <div
      className="relative inline-block"
      style={{
        transform: `scale(${scale})`,
        transition: 'transform 0.1s ease-out',
      }}
    >
      <div
        className="absolute inset-0 rounded-lg blur-xl"
        style={{
          background: `radial-gradient(circle, rgba(218, 0, 40, ${glowIntensity * 0.6}) 0%, rgba(4, 42, 161, ${glowIntensity * 0.6}) 50%, transparent 70%)`,
          opacity: glowIntensity * 0.8,
          transform: 'scale(1.5)',
        }}
      />
      <div className="relative z-10">
        <Logo variant="white" size="lg" />
      </div>
    </div>
  )
}

