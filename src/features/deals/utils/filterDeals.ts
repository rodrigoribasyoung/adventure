import { Deal } from '@/types'
import { DealFilters } from '../components/DealFilters'

export const filterDeals = (deals: Deal[], filters: DealFilters, contacts: Array<{ id: string; name: string }>, companies: Array<{ id: string; name: string }>): Deal[] => {
  return deals.filter(deal => {
    // Busca por texto (título, contato ou empresa)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const dealTitleMatch = deal.title.toLowerCase().includes(searchLower)
      
      // Buscar nome do contato
      const contact = contacts.find(c => c.id === deal.contactId)
      const contactMatch = contact?.name.toLowerCase().includes(searchLower) || false
      
      // Buscar nome da empresa
      const company = deal.companyId ? companies.find(c => c.id === deal.companyId) : null
      const companyMatch = company?.name.toLowerCase().includes(searchLower) || false
      
      if (!dealTitleMatch && !contactMatch && !companyMatch) {
        return false
      }
    }

    // Filtro por status
    if (filters.status && filters.status.length > 0) {
      const dealStatus = deal.status || 'active'
      if (!filters.status.includes(dealStatus)) {
        return false
      }
    }

    // Filtro por estágio
    if (filters.stage && filters.stage.length > 0) {
      if (!filters.stage.includes(deal.stage)) {
        return false
      }
    }

    // Filtro por contato
    if (filters.contactId) {
      if (deal.contactId !== filters.contactId) {
        return false
      }
    }

    // Filtro por empresa
    if (filters.companyId) {
      if (deal.companyId !== filters.companyId) {
        return false
      }
    }

    // Filtro por valor mínimo
    if (filters.minValue !== null && filters.minValue !== undefined) {
      if (deal.value < filters.minValue) {
        return false
      }
    }

    // Filtro por valor máximo
    if (filters.maxValue !== null && filters.maxValue !== undefined) {
      if (deal.value > filters.maxValue) {
        return false
      }
    }

    // Filtro por data de criação (De)
    if (filters.dateFrom) {
      const filterDate = new Date(filters.dateFrom)
      filterDate.setHours(0, 0, 0, 0)
      const dealDate = deal.createdAt?.toDate()
      if (!dealDate || dealDate < filterDate) {
        return false
      }
    }

    // Filtro por data de criação (Até)
    if (filters.dateTo) {
      const filterDate = new Date(filters.dateTo)
      filterDate.setHours(23, 59, 59, 999)
      const dealDate = deal.createdAt?.toDate()
      if (!dealDate || dealDate > filterDate) {
        return false
      }
    }

    return true
  })
}



