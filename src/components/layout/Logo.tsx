interface LogoProps {
  variant?: 'dark' | 'white' | 'light' | 'black'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const Logo = ({ variant = 'white', size = 'md', className = '' }: LogoProps) => {
  const getLogoPath = (variant: string) => {
    const variants: Record<string, string> = {
      dark: '/assets/brand/logo/adventure-dark-1.png',
      white: '/assets/brand/logo/adventure-white-1.png',
      light: '/assets/brand/logo/adventure-light-1.png',
      black: '/assets/brand/logo/adventure-black-1.png',
    }
    return variants[variant] || variants.white
  }
  
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
  }

  return (
    <img
      src={getLogoPath(variant)}
      alt="Adventure Labs"
      className={`${sizes[size]} ${className}`}
    />
  )
}

