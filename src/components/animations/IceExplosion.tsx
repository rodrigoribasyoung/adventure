import { useEffect, useState, useRef } from 'react'

interface IceExplosionProps {
  onComplete: () => void
}

export const IceExplosion = ({ onComplete }: IceExplosionProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number; angle: number; distance: number }>>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Aguardar um pouco para garantir que o botão está renderizado
    const findButton = () => {
      const loseButton = document.getElementById('lose-button')
      if (!loseButton) {
        // Tentar novamente após um pequeno delay
        timeoutRef.current = setTimeout(findButton, 50)
        return
      }

      const rect = loseButton.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Criar partículas de gelo
      const newParticles = Array.from({ length: 30 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 30 + Math.random() * 0.5
        const distance = 50 + Math.random() * 100
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
      }, 1000)
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
            className="absolute w-2 h-2 rounded-full"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              background: 'radial-gradient(circle, rgba(96, 165, 250, 0.9) 0%, rgba(147, 197, 253, 0.7) 50%, rgba(191, 219, 254, 0.5) 100%)',
              animation: `ice-explode-${particle.id} 1s ease-out forwards`,
              animationDelay: `${particle.delay}s`,
              boxShadow: '0 0 8px rgba(96, 165, 250, 0.8), 0 0 4px rgba(191, 219, 254, 0.6)',
            }}
          />
        )
      })}
      <style>{`
        ${particles.map((p) => {
          const endX = Math.cos(p.angle) * p.distance
          const endY = Math.sin(p.angle) * p.distance
          return `
            @keyframes ice-explode-${p.id} {
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
