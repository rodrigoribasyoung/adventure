import { useState, useEffect } from 'react'
import { soundEffects } from '@/lib/utils/soundEffects'

interface TypewriterTextProps {
  text: string
  speed?: number
  onComplete?: () => void
}

export const TypewriterText = ({ text, speed = 20, onComplete }: TypewriterTextProps) => {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)

  // Reset quando o texto mudar
  useEffect(() => {
    setDisplayedText('')
    setCurrentIndex(0)
  }, [text])

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText(text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
        
        // Som sutil a cada caractere (apenas alguns para não ser excessivo)
        if (currentIndex % 3 === 0) {
          soundEffects.particle()
        }
      }, speed)

      return () => clearTimeout(timeout)
    } else if (onComplete && currentIndex === text.length) {
      const timeout = setTimeout(() => {
        onComplete()
      }, 500) // Pequeno delay após completar
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, speed, onComplete])

  return <span>{displayedText}</span>
}

