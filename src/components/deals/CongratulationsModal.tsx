import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useNavigate } from 'react-router-dom'

interface CongratulationsModalProps {
  isOpen: boolean
  dealTitle: string
  dealValue?: string
  onClose: () => void
}

export const CongratulationsModal = ({ isOpen, dealTitle, dealValue, onClose }: CongratulationsModalProps) => {
  const navigate = useNavigate()

  const handleGoToDeals = () => {
    navigate('/deals')
    onClose()
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      size="md"
    >
      <div className="text-center py-6">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl text-white/90 mb-2 font-bold">
            Parabéns!
          </h2>
          <p className="text-white/70 text-base mb-1">
            Você fechou a negociação
          </p>
          <p className="text-white/90 text-lg font-medium mb-2">
            {dealTitle}
          </p>
          {dealValue && (
            <p className="text-primary-red text-xl font-bold">
              {dealValue}
            </p>
          )}
        </div>
        
        <p className="text-white/60 text-sm mb-6">
          Continue assim! Cada negociação fechada é um passo em direção ao sucesso.
        </p>
        
        <div className="flex gap-3 justify-center">
          <Button
            variant="primary-red"
            onClick={handleGoToDeals}
            className="px-6"
          >
            Ver Minhas Negociações
          </Button>
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </Modal>
  )
}

