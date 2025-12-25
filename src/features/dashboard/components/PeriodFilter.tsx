import { Button } from '@/components/ui/Button'

export type PeriodOption = 'today' | 'week' | 'month' | 'custom' | 'all'

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

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-sm text-white/70">Período:</span>
      
      <Button
        variant={selectedPeriod === 'today' ? 'primary-blue' : 'ghost'}
        size="sm"
        onClick={() => onPeriodChange('today')}
      >
        Hoje
      </Button>

      <Button
        variant={selectedPeriod === 'week' ? 'primary-blue' : 'ghost'}
        size="sm"
        onClick={() => onPeriodChange('week')}
      >
        Esta Semana
      </Button>

      <Button
        variant={selectedPeriod === 'month' ? 'primary-blue' : 'ghost'}
        size="sm"
        onClick={() => onPeriodChange('month')}
      >
        Este Mês
      </Button>

      <Button
        variant={selectedPeriod === 'all' ? 'primary-blue' : 'ghost'}
        size="sm"
        onClick={() => onPeriodChange('all')}
      >
        Todos
      </Button>

      <Button
        variant={selectedPeriod === 'custom' ? 'primary-blue' : 'ghost'}
        size="sm"
        onClick={() => onPeriodChange('custom')}
      >
        Customizado
      </Button>

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


