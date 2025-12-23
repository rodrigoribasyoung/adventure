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
  ...props
}: ButtonProps) => {
  const baseStyles = 'font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    'primary-red': 'bg-gradient-red text-white glow-red hover:shadow-[0_0_30px_rgba(218,0,40,0.7)]',
    'primary-blue': 'bg-gradient-blue text-white glow-blue hover:shadow-[0_0_30px_rgba(4,42,161,0.7)]',
    'combined': 'bg-gradient-combined text-white glow-combined hover:shadow-[0_0_35px_rgba(218,0,40,0.5),0_0_35px_rgba(4,42,161,0.5)]',
    'secondary': 'bg-white/10 text-white hover:bg-white/20 border border-white/20',
    'ghost': 'text-white/80 hover:text-white hover:bg-white/10',
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}

