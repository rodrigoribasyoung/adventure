import { useState, useCallback } from 'react'

export interface UseAdvancedFilterOptions<T> {
  initialFilters: T
  onFilterChange?: (filters: T) => void
  persistKey?: string // localStorage key para persistir filtros
}

export const useAdvancedFilter = <T extends Record<string, any>>({
  initialFilters,
  onFilterChange,
  persistKey,
}: UseAdvancedFilterOptions<T>) => {
  // Carregar filtros do localStorage se existir
  const loadPersistedFilters = (): T => {
    if (!persistKey) return initialFilters
    try {
      const saved = localStorage.getItem(persistKey)
      if (saved) {
        return { ...initialFilters, ...JSON.parse(saved) }
      }
    } catch (error) {
      console.warn('Erro ao carregar filtros salvos:', error)
    }
    return initialFilters
  }

  const [filters, setFilters] = useState<T>(loadPersistedFilters)

  // Salvar filtros no localStorage
  const saveFilters = useCallback((newFilters: T) => {
    if (persistKey) {
      try {
        localStorage.setItem(persistKey, JSON.stringify(newFilters))
      } catch (error) {
        console.warn('Erro ao salvar filtros:', error)
      }
    }
  }, [persistKey])

  const updateFilters = useCallback((newFilters: T | ((prev: T) => T)) => {
    setFilters(prev => {
      const updated = typeof newFilters === 'function' ? newFilters(prev) : newFilters
      saveFilters(updated)
      if (onFilterChange) {
        onFilterChange(updated)
      }
      return updated
    })
  }, [saveFilters, onFilterChange])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    if (persistKey) {
      localStorage.removeItem(persistKey)
    }
    if (onFilterChange) {
      onFilterChange(initialFilters)
    }
  }, [initialFilters, persistKey, onFilterChange])

  return {
    filters,
    setFilters: updateFilters,
    resetFilters,
  }
}

