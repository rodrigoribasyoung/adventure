import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { FiArrowLeft } from 'react-icons/fi'

interface BackButtonProps {
  to?: string
  label?: string
  className?: string
}

export const BackButton = ({ to, label = 'Voltar', className = '' }: BackButtonProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <Button
      variant="ghost"
      onClick={handleClick}
      className={`text-white/70 hover:text-white ${className}`}
    >
      <FiArrowLeft className="w-4 h-4 mr-2" />
      {label}
    </Button>
  )
}
