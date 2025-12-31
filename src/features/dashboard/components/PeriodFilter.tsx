import { Button } from '@/components/ui/Button'

export type PeriodOption = 
  | 'today' 
  | 'yesterday' 
  | 'last7d' 
  | 'last30d' 
  | 'lastQuarter' 
  | 'lastSemester' 
  | 'lastYear' 
  | 'thisQuarter' 
  | 'thisSemester' 
  | 'thisYear' 
  | 'custom' 
  | 'all'

interface PeriodFilterProps {
  selectedPeriod: PeriodOption
  onPeriodChange: (period: PeriodOption) => void
  onCustomDateRange?: (startDate: Date, endDate: Date) => void
  customStartDate?: Date
  customEndDate?: Date
}

export const PeriodFilter = ({
  selectedPeriod,
  onPeriodChange,
  onCustomDateRange,
  customStartDate,
  customEndDate,
}: PeriodFilterProps) => {
  const handleCustomDateChange = (type: 'start' | 'end', value: string) => {
    if (!onCustomDateRange) return

    const date = value ? new Date(value) : undefined
    
    if (type === 'start') {
      const end = customEndDate || new Date()
      if (date) {
        onCustomDateRange(date, end)
      }
    } else {
      const start = customStartDate || new Date()
      if (date) {
        onCustomDateRange(start, date)
      }
    }
  }

  const periodOptions = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last7d', label: 'Últimos 7 dias' },
    { value: 'last30d', label: 'Últimos 30 dias' },
    { value: 'lastQuarter', label: 'Último trimestre' },
    { value: 'lastSemester', label: 'Último semestre' },
    { value: 'lastYear', label: 'Último ano' },
    { value: 'thisQuarter', label: 'Este trimestre' },
    { value: 'thisSemester', label: 'Este semestre' },
    { value: 'thisYear', label: 'Este ano' },
    { value: 'custom', label: 'Personalizado' },
    { value: 'all', label: 'Todos' },
  ]

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-white/70">Período:</span>
      
      <select
        value={selectedPeriod}
        onChange={(e) => onPeriodChange(e.target.value as PeriodOption)}
        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
      >
        {periodOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {selectedPeriod === 'custom' && onCustomDateRange && (
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={customStartDate ? customStartDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleCustomDateChange('start', e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/50"
          />
          <span className="text-white/70">até</span>
          <input
            type="date"
            value={customEndDate ? customEndDate.toISOString().split('T')[0] : ''}
            onChange={(e) => handleCustomDateChange('end', e.target.value)}
            className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/50"
          />
        </div>
      )}
    </div>
  )
}



