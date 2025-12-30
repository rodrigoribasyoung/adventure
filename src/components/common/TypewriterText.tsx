import { useState, useEffect } from 'react'

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

