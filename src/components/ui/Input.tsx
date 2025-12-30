import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
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

