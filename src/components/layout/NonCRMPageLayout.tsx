import { ReactNode } from 'react'

interface NonCRMPageLayoutProps {
  children: ReactNode
  className?: string
}

export const NonCRMPageLayout = ({ children, className = '' }: NonCRMPageLayoutProps) => {
  return (
    <div 
      className={`min-h-screen flex flex-col relative ${className}`}
      style={{ 
        background: 'linear-gradient(135deg, #0a1628 0%, #1a2f4a 30%, #0f1b2e 70%, #051018 100%)' 
      }}
    >
      {children}
    </div>
  )
}
