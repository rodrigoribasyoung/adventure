import { useState, ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export interface FilterField {
  key: string
  label: string
  type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'checkbox'
  options?: Array<{ value: string; label: string }>
  placeholder?: string
}

export interface AdvancedFilterProps<T extends Record<string, any>> {
  filters: T
  onFiltersChange: (filters: T) => void
  onReset: () => void
  searchPlaceholder?: string
  fields?: FilterField[]
  customFields?: ReactNode
}

export const AdvancedFilter = <T extends Record<string, any>>({
  filters,
  onFiltersChange,
  onReset,
  searchPlaceholder = 'Buscar...',
  fields = [],
  customFields,
}: AdvancedFilterProps<T>) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const handleFilterChange = (key: keyof T, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    })
  }

  const handleMultiSelectToggle = (key: keyof T, value: string) => {
    const currentValues = (filters[key] as string[]) || []
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    handleFilterChange(key, newValues)
  }

  const countActiveFilters = () => {
    let count = 0
    Object.entries(filters).forEach(([key, value]) => {
      if (key === 'search' && value) count++
      else if (Array.isArray(value) && value.length > 0) count++
      else if (value !== null && value !== undefined && value !== '') count++
    })
    return count
  }

  const hasActiveFilters = countActiveFilters() > 0

  const renderField = (field: FilterField) => {
    const value = filters[field.key]

    switch (field.type) {
      case 'text':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {field.label}
            </label>
            <Input
              type="text"
              value={(value as string) || ''}
              onChange={(e) => handleFilterChange(field.key as keyof T, e.target.value)}
              placeholder={field.placeholder}
            />
          </div>
        )

      case 'number':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {field.label}
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={(value as number)?.toString() || ''}
              onChange={(e) => handleFilterChange(field.key as keyof T, e.target.value ? parseFloat(e.target.value) : null)}
              placeholder={field.placeholder}
            />
          </div>
        )

      case 'date':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {field.label}
            </label>
            <Input
              type="date"
              value={(value as string) || ''}
              onChange={(e) => handleFilterChange(field.key as keyof T, e.target.value)}
            />
          </div>
        )

      case 'select':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {field.label}
            </label>
            <select
              value={(value as string) || ''}
              onChange={(e) => handleFilterChange(field.key as keyof T, e.target.value || '')}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
            >
              <option value="">Todos</option>
              {field.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        )

      case 'multiselect':
        return (
          <div key={field.key}>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {field.label}
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {field.options?.map(option => (
                <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(value as string[])?.includes(option.value) || false}
                    onChange={() => handleMultiSelectToggle(field.key as keyof T, option.value)}
                    className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
                  />
                  <span className="text-sm text-white/90">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 'checkbox':
        return (
          <div key={field.key}>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={(value as boolean) || false}
                onChange={(e) => handleFilterChange(field.key as keyof T, e.target.checked)}
                className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
              />
              <span className="text-sm text-white/90">{field.label}</span>
            </label>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="mb-4">
      <div className="space-y-4">
        {/* Busca e Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder={searchPlaceholder}
              value={(filters.search as string) || ''}
              onChange={(e) => handleFilterChange('search' as keyof T, e.target.value)}
            />
          </div>
          {(fields.length > 0 || customFields) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Ocultar' : 'Mostrar'} Filtros
              {hasActiveFilters && (
                <span className="ml-2 px-2 py-0.5 bg-primary-red text-white text-xs rounded-full">
                  {countActiveFilters()}
                </span>
              )}
            </Button>
          )}
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
        {isExpanded && (fields.length > 0 || customFields) && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/10">
            {fields.map(field => renderField(field))}
            {customFields}
          </div>
        )}
      </div>
    </Card>
  )
}

