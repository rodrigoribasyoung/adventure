import { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
  glow?: boolean
}

export const Card = ({
  children,
  variant = 'default',
  glow = false,
  className = '',
  ...props
}: CardProps) => {
  const variants = {
    default: 'bg-white/5 border border-white/10',
    elevated: 'bg-white/10 border border-white/20 shadow-lg',
    outlined: 'bg-transparent border border-white/20',
  }
  
  const glowClass = glow ? 'glow-blue' : ''

  return (
    <div
      className={`
        rounded-lg p-6
        ${variants[variant]}
        ${glowClass}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}

