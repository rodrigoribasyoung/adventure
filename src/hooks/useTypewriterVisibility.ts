import { useState, useEffect, useRef } from 'react'

interface UseTypewriterVisibilityOptions {
  threshold?: number
  rootMargin?: string
}

export const useTypewriterVisibility = (options: UseTypewriterVisibilityOptions = {}) => {
  const { threshold = 0.3, rootMargin = '0px' } = options
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = elementRef.current
    if (!element || hasShown) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasShown) {
            setIsVisible(true)
            setHasShown(true)
          }
        })
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin, hasShown])

  return { elementRef, isVisible }
}

