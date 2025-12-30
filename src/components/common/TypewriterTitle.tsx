import { useRef, useEffect, useState } from 'react'
import { TypewriterEffect } from './TypewriterEffect'

interface TypewriterTitleProps {
  text: string
  speed?: number
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
}

export const TypewriterTitle = ({ 
  text, 
  speed = 30, 
  className = '',
  as: Component = 'h1'
}: TypewriterTitleProps) => {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const [wasShownBefore, setWasShownBefore] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasShownRef = useRef(false)

  useEffect(() => {
    // Verificar se já foi mostrado antes (localStorage)
    const storageKey = `typewriter-${text.substring(0, 30).replace(/\s+/g, '-').toLowerCase()}`
    const wasShown = localStorage.getItem(storageKey)
    
    if (wasShown === 'true') {
      hasShownRef.current = true
      setWasShownBefore(true)
      setShouldAnimate(false)
      return
    }

    const element = containerRef.current
    if (!element || hasShownRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasShownRef.current) {
            setShouldAnimate(true)
            hasShownRef.current = true
            localStorage.setItem(storageKey, 'true')
          }
        })
      },
      {
        threshold: 0.3,
        rootMargin: '0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [text])

  return (
    <div ref={containerRef} className="w-full">
      <Component className={className}>
        {wasShownBefore || (hasShownRef.current && !shouldAnimate) ? (
          text
        ) : shouldAnimate ? (
          <TypewriterEffect text={text} speed={speed} />
        ) : (
          <span>&nbsp;</span>
        )}
      </Component>
    </div>
  )
}

