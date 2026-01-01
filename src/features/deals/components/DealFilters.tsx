import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { FiSearch } from 'react-icons/fi'
import { useFunnels } from '@/features/funnels/hooks/useFunnels'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { useProjectUsers } from '@/features/projectMembers/hooks/useProjectUsers'

export interface DealFilters {
  search: string
  status: string[] // 'active' | 'won' | 'lost' | 'paused'
  stage: string[]
  contactId: string
  companyId: string
  assignedTo: string
  minValue: number | null
  maxValue: number | null
  dateFrom: string
  dateTo: string
}

interface DealFiltersProps {
  filters: DealFilters
  onFiltersChange: (filters: DealFilters) => void
  onReset: () => void
}

export const DealFilters = ({ filters, onFiltersChange, onReset }: DealFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const { activeFunnel } = useFunnels()
  const { contacts } = useContacts()
  const { companies } = useCompanies()
  const { responsibles } = useProjectUsers()
  const members = responsibles // Compatibilidade

  const handleFilterChange = (key: keyof DealFilters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const handleStatusToggle = (status: string) => {
    const currentStatuses = filters.status || []
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status]
    handleFilterChange('status', newStatuses)
  }

  const handleStageToggle = (stageId: string) => {
    const currentStages = filters.stage || []
    const newStages = currentStages.includes(stageId)
      ? currentStages.filter(s => s !== stageId)
      : [...currentStages, stageId]
    handleFilterChange('stage', newStages)
  }

  const hasActiveFilters = 
    filters.status?.length > 0 ||
    filters.stage?.length > 0 ||
    filters.contactId ||
    filters.companyId ||
    filters.assignedTo ||
    filters.minValue !== null ||
    filters.maxValue !== null ||
    filters.dateFrom ||
    filters.dateTo

  return (
    <Card className="mb-4">
      <div className="space-y-4">
        {/* Busca e Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60">
              <FiSearch className="w-4 h-4" />
            </div>
            <Input
              placeholder="Buscar por título, contato ou empresa..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  // Pesquisa já é feita automaticamente, apenas prevenir submit do form se houver
                  e.preventDefault()
                }
              }}
              className="pl-10"
            />
          </div>
          <Button
            variant="primary-red"
            size="sm"
            onClick={() => {
              // A pesquisa já é feita automaticamente via onChange
              // Este botão serve como feedback visual
            }}
            className="flex items-center gap-2"
          >
            <FiSearch className="w-4 h-4" />
            Pesquisar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 bg-primary-red text-white text-xs rounded-full">
                {[
                  filters.status?.length || 0,
                  filters.stage?.length || 0,
                  filters.contactId ? 1 : 0,
                  filters.companyId ? 1 : 0,
                  filters.assignedTo ? 1 : 0,
                  filters.minValue !== null ? 1 : 0,
                  filters.maxValue !== null ? 1 : 0,
                  filters.dateFrom ? 1 : 0,
                  filters.dateTo ? 1 : 0,
                ].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
            >
              Limpar Filtros
            </Button>
          )}
        </div>

        {/* Filtros Expandidos */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Status
              </label>
              <div className="space-y-2">
                {[
                  { value: 'active', label: 'Em Andamento' },
                  { value: 'won', label: 'Ganho' },
                  { value: 'lost', label: 'Perda' },
                  { value: 'paused', label: 'Pausada' },
                ].map((status) => (
                  <label key={status.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.status?.includes(status.value) || false}
                      onChange={() => handleStatusToggle(status.value)}
                      className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
                    />
                    <span className="text-sm text-white/90">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Estágios */}
            {activeFunnel && (
              <div>
                <label className="block text-sm font-medium text-white/90 mb-2">
                  Estágios
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {activeFunnel.stages
                    .sort((a, b) => a.order - b.order)
                    .map((stage) => (
                      <label key={stage.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.stage?.includes(stage.id) || false}
                          onChange={() => handleStageToggle(stage.id)}
                          className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
                        />
                        <span className="text-sm text-white/90">{stage.name}</span>
                      </label>
                    ))}
                </div>
              </div>
            )}

            {/* Contato */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Contato
              </label>
              <select
                value={filters.contactId || ''}
                onChange={(e) => handleFilterChange('contactId', e.target.value || '')}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
              >
                <option value="">Todos os contatos</option>
                {contacts.map(contact => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Empresa
              </label>
              <select
                value={filters.companyId || ''}
                onChange={(e) => handleFilterChange('companyId', e.target.value || '')}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
              >
                <option value="">Todas as empresas</option>
                {companies.map(company => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Responsável */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Responsável
              </label>
              <select
                value={filters.assignedTo || ''}
                onChange={(e) => handleFilterChange('assignedTo', e.target.value || '')}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
              >
                <option value="">Todos os responsáveis</option>
                {members.filter((m: any) => m.active).map((member: any) => (
                  <option key={member.id} value={member.id}>
                    {member.name} {member.jobTitle ? `- ${member.jobTitle}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Valor Mínimo */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Valor Mínimo (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={filters.minValue?.toString() || ''}
                onChange={(e) => handleFilterChange('minValue', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="0.00"
              />
            </div>

            {/* Valor Máximo */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Valor Máximo (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={filters.maxValue?.toString() || ''}
                onChange={(e) => handleFilterChange('maxValue', e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="0.00"
              />
            </div>

            {/* Data De */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Data de Criação (De)
              </label>
              <Input
                type="date"
                value={filters.dateFrom || ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>

            {/* Data Até */}
            <div>
              <label className="block text-sm font-medium text-white/90 mb-2">
                Data de Criação (Até)
              </label>
              <Input
                type="date"
                value={filters.dateTo || ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}



