import { useState, useEffect } from 'react'
import { Deal } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCloseReasons } from '@/features/closeReasons/hooks/useCloseReasons'

interface DealCloseModalProps {
  isOpen: boolean
  deal: Deal | null
  onClose: () => void
  onConfirm: (status: 'won' | 'lost', closeReason?: string) => Promise<void>
  loading?: boolean
}

export const DealCloseModal = ({ isOpen, deal, onClose, onConfirm, loading }: DealCloseModalProps) => {
  const [status, setStatus] = useState<'won' | 'lost'>('won')
  const [selectedReason, setSelectedReason] = useState<string>('')
  const { closeReasons, loading: reasonsLoading } = useCloseReasons()
  const [availableReasons, setAvailableReasons] = useState(closeReasons.filter(r => r.type === status))

  useEffect(() => {
    if (isOpen && deal) {
      setStatus('won')
      setSelectedReason('')
    }
  }, [isOpen, deal])

  useEffect(() => {
    setAvailableReasons(closeReasons.filter(r => r.type === status))
    setSelectedReason('')
  }, [status, closeReasons])

  const handleConfirm = async () => {
    await onConfirm(status, selectedReason || undefined)
  }

  if (!deal) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Fechar Negociação: ${deal.title}`}
      size="md"
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Status de Fechamento *
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="won"
                checked={status === 'won'}
                onChange={(e) => setStatus(e.target.value as 'won' | 'lost')}
                className="w-4 h-4 text-green-500 bg-white/5 border-white/10"
              />
              <span className="text-white">Vendiada (Ganho)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="lost"
                checked={status === 'lost'}
                onChange={(e) => setStatus(e.target.value as 'won' | 'lost')}
                className="w-4 h-4 text-red-500 bg-white/5 border-white/10"
              />
              <span className="text-white">Perdida</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Motivo de Fechamento
          </label>
          {reasonsLoading ? (
            <div className="text-white/70 text-sm">Carregando motivos...</div>
          ) : (
            <select
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50"
            >
              <option value="">Selecione um motivo (opcional)</option>
              {availableReasons.map((reason) => (
                <option key={reason.id} value={reason.id}>
                  {reason.name}
                  {reason.category && ` (${reason.category})`}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="ghost" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            variant={status === 'won' ? 'primary-blue' : 'primary-red'}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? 'Fechando...' : `Confirmar ${status === 'won' ? 'Ganho' : 'Perda'}`}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

