import { useEffect, RefObject } from 'react'

/**
 * Hook para prevenir navegação do browser ao pressionar Backspace em campos de texto vazios
 * Use este hook em textareas e outros elementos editáveis
 */
export const usePreventBackspace = (ref: RefObject<HTMLTextAreaElement | HTMLInputElement>) => {
  useEffect(() => {
    const element = ref.current
    if (!element) return

    const handleKeyDown = (e: Event) => {
      const keyboardEvent = e as KeyboardEvent
      // Prevenir navegação do browser quando Backspace é pressionado em campo de texto vazio
      if (keyboardEvent.key === 'Backspace') {
        const target = e.target as HTMLTextAreaElement | HTMLInputElement
        // Prevenir navegação apenas se o campo está completamente vazio
        // Isso permite que o backspace funcione normalmente para apagar texto
        if (target.value.length === 0) {
          keyboardEvent.preventDefault()
          keyboardEvent.stopPropagation()
          return
        }
      }
    }

    element.addEventListener('keydown', handleKeyDown)
    return () => {
      element.removeEventListener('keydown', handleKeyDown)
    }
  }, [ref])
}
