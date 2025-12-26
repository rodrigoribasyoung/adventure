import { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface QuickCreateButtonProps {
  onClick: () => void
  label?: string
  className?: string
}

export const QuickCreateButton = ({ onClick, label = '+ Novo', className }: QuickCreateButtonProps) => {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`text-primary-red hover:text-primary-red/80 hover:bg-primary-red/10 ${className || ''}`}
    >
      {label}
    </Button>
  )
}

