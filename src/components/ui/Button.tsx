import { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary-red' | 'primary-blue' | 'combined' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: ReactNode
}

export const Button = ({
  variant = 'primary-red',
  size = 'md',
  children,
  className = '',
  disabled,
  onClick,
  onMouseEnter,
  ...props
}: ButtonProps) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e)
  }

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    onMouseEnter?.(e)
  }
  const baseStyles = 'rounded transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    'primary-red': 'bg-gradient-red text-white hover:opacity-90',
    'primary-blue': 'bg-gradient-blue text-white hover:opacity-90',
    'combined': 'bg-gradient-combined text-white hover:opacity-90',
    'secondary': 'bg-white/5 text-white/90 hover:bg-white/10 border border-white/10',
    'ghost': 'text-white/70 hover:text-white/90 hover:bg-white/5',
  }
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-sm',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </button>
  )
}

