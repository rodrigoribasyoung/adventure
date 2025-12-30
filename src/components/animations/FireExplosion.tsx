import { useEffect, useState, useRef } from 'react'

interface FireExplosionProps {
  onComplete: () => void
}

export const FireExplosion = ({ onComplete }: FireExplosionProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; angle: number; distance: number }>>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Aguardar um pouco para garantir que o botão está renderizado
    const findButton = () => {
      const winButton = document.getElementById('win-button')
      if (!winButton) {
        // Tentar novamente após um pequeno delay
        timeoutRef.current = setTimeout(findButton, 50)
        return
      }

      const rect = winButton.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Criar partículas de fogo
      const newParticles = Array.from({ length: 40 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 40 + Math.random() * 0.5
        const distance = 60 + Math.random() * 120
        return {
          id: i,
          x: centerX,
          y: centerY,
          delay: Math.random() * 0.2,
          angle,
          distance,
        }
      })
      setParticles(newParticles)

      // Chamar onComplete após animação
      timeoutRef.current = setTimeout(() => {
        onComplete()
      }, 1200)
    }
    
    findButton()

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [onComplete])

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 pointer-events-none">
      {particles.map((particle) => {
        return (
          <div
            key={particle.id}
            className="absolute w-2.5 h-2.5 rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              background: `radial-gradient(circle, #FF6B35 0%, #F7931E 50%, #FFD700 100%)`,
              animation: `fire-explode-${particle.id} 1.2s ease-out forwards`,
              animationDelay: `${particle.delay}s`,
              boxShadow: '0 0 12px rgba(255, 107, 53, 0.9), 0 0 6px rgba(255, 215, 0, 0.6)',
            }}
          />
        )
      })}
      <style>{`
        ${particles.map((p) => {
          const endX = Math.cos(p.angle) * p.distance
          const endY = Math.sin(p.angle) * p.distance
          return `
            @keyframes fire-explode-${p.id} {
              0% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
              100% {
                transform: translate(${endX}px, ${endY}px) scale(0);
                opacity: 0;
              }
            }
          `
        }).join('')}
      `}</style>
    </div>
  )
}
