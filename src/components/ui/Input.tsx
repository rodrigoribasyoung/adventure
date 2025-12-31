import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', onKeyDown, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Prevenir navegação do browser quando Backspace é pressionado em campo de texto vazio
      if (e.key === 'Backspace') {
        const target = e.target as HTMLInputElement
        // Prevenir navegação apenas se o campo está completamente vazio
        // Isso permite que o backspace funcione normalmente para apagar texto
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
        <input
          ref={ref}
          className={`
            w-full px-3 py-1.5 text-sm
            bg-white/5 border border-white/5 
            rounded 
            text-white placeholder:text-white/30
            focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20
            transition-all duration-200
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

Input.displayName = 'Input'

