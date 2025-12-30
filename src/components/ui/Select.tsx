import { SelectHTMLAttributes, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = '', children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs text-white/70 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            className={`
              w-full px-3 py-1.5 text-sm
              bg-white/5 border border-white/5 
              rounded 
              text-white
              focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20
              transition-all duration-200
              appearance-none
              cursor-pointer
              ${error ? 'border-red-500/50 focus:ring-red-500/30' : ''}
              ${className}
            `}
            {...props}
          >
            {children}
          </select>
          {/* Seta customizada */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-white/60"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-400/80">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

