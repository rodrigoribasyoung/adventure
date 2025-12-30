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
    default: 'bg-white/5 border border-white/5',
    elevated: 'bg-white/5 border border-white/10',
    outlined: 'bg-transparent border border-white/10',
  }
  
  const glowClass = glow ? 'glow-blue' : ''

  return (
    <div
      className={`
        rounded p-3
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

