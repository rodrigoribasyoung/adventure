import { TextareaHTMLAttributes, forwardRef, useRef, useEffect } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = '', onKeyDown, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement>(null)
    const textareaRef = (ref || internalRef) as React.RefObject<HTMLTextAreaElement>

    // Prevenir navegação do browser quando Backspace é pressionado em campo vazio
    useEffect(() => {
      const element = textareaRef.current
      if (!element) return

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Backspace') {
          const target = e.target as HTMLTextAreaElement
          // Prevenir navegação apenas se o campo está completamente vazio
          if (target.value.length === 0) {
            e.preventDefault()
            e.stopPropagation()
            return
          }
        }
      }

      element.addEventListener('keydown', handleKeyDown)
      return () => {
        element.removeEventListener('keydown', handleKeyDown)
      }
    }, [textareaRef])

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Prevenir navegação do browser quando Backspace é pressionado em campo de texto vazio
      if (e.key === 'Backspace') {
        const target = e.target as HTMLTextAreaElement
        // Prevenir navegação apenas se o campo está completamente vazio
        if (target.value.length === 0) {
          e.preventDefault()
          e.stopPropagation()
          return
        }
      }
      // Chamar handler original se fornecido
      if (onKeyDown) {
        onKeyDown(e)
      }
    }

    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs text-white/70 mb-1.5">
            {label}
          </label>
        )}
        <textarea
          ref={textareaRef}
          className={`
            w-full px-4 py-2.5
            bg-white/5 border border-white/10 
            rounded-lg 
            text-white placeholder:text-white/40
            focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50
            transition-all duration-200 resize-none
            ${error ? 'border-red-500/50 focus:ring-red-500/30' : ''}
            ${className}
          `}
          onKeyDown={handleKeyDown}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-400/80">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
