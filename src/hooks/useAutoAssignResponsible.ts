import { useMemo } from 'react'
import { useProjectUsers } from '@/features/projectMembers/hooks/useProjectUsers'
import { useDeals } from '@/features/deals/hooks/useDeals'

/**
 * Hook para detectar automaticamente o responsável mais apropriado
 * baseado em empresa, projeto ou histórico de negociações
 */
export const useAutoAssignResponsible = (companyId?: string, dealId?: string) => {
  const { responsibles } = useProjectUsers()
  const { deals } = useDeals()
  
  const autoAssignedResponsible = useMemo(() => {
    const activeResponsibles = responsibles.filter(r => r.active)
    
    if (activeResponsibles.length === 0) {
      return null
    }
    
    // Se há um dealId, buscar o responsável do deal
    if (dealId) {
      const deal = deals.find(d => d.id === dealId)
      if (deal?.assignedTo) {
        const responsible = activeResponsibles.find(r => r.id === deal.assignedTo)
        if (responsible) {
          return responsible
        }
      }
    }
    
    // Se há uma companyId, buscar o responsável mais frequente em deals dessa empresa
    if (companyId) {
      const companyDeals = deals.filter(d => d.companyId === companyId && d.assignedTo)
      if (companyDeals.length > 0) {
        // Contar frequência de cada responsável
        const responsibleCount = new Map<string, number>()
        companyDeals.forEach(deal => {
          if (deal.assignedTo) {
            responsibleCount.set(deal.assignedTo, (responsibleCount.get(deal.assignedTo) || 0) + 1)
          }
        })
        
        // Encontrar o responsável mais frequente
        let maxCount = 0
        let mostFrequentId = ''
        responsibleCount.forEach((count, id) => {
          if (count > maxCount) {
            maxCount = count
            mostFrequentId = id
          }
        })
        
        if (mostFrequentId) {
          const responsible = activeResponsibles.find(r => r.id === mostFrequentId)
          if (responsible) {
            return responsible
          }
        }
      }
    }
    
    // Caso padrão: primeiro responsável ativo
    return activeResponsibles[0] || null
  }, [responsibles, deals, companyId, dealId])
  
  return autoAssignedResponsible
}

