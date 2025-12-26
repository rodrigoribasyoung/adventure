import { Button } from './Button'

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  itemsPerPage: number
  totalItems: number
  onItemsPerPageChange?: (itemsPerPage: number) => void
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  itemsPerPage,
  totalItems,
  onItemsPerPageChange,
}: PaginationProps) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 5

    if (totalPages <= maxVisible) {
      // Mostrar todas as páginas se houver poucas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Sempre mostrar primeira página
      pages.push(1)

      // Calcular início e fim do range central
      let start = Math.max(2, currentPage - 1)
      let end = Math.min(totalPages - 1, currentPage + 1)

      // Ajustar se estiver perto do início
      if (currentPage <= 3) {
        end = Math.min(4, totalPages - 1)
      }

      // Ajustar se estiver perto do fim
      if (currentPage >= totalPages - 2) {
        start = Math.max(2, totalPages - 3)
      }

      // Adicionar ellipsis antes se necessário
      if (start > 2) {
        pages.push('...')
      }

      // Adicionar páginas do range central
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      // Adicionar ellipsis depois se necessário
      if (end < totalPages - 1) {
        pages.push('...')
      }

      // Sempre mostrar última página
      if (totalPages > 1) {
        pages.push(totalPages)
      }
    }

    return pages
  }

  if (totalPages === 0) {
    return null
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-white/10">
      <div className="flex items-center gap-4">
        <span className="text-sm text-white/70">
          Mostrando {startItem} a {endItem} de {totalItems} negociações
        </span>
        
        {onItemsPerPageChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/70">Itens por página:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-white/50">
                  ...
                </span>
              )
            }

            const pageNumber = page as number
            const isActive = pageNumber === currentPage

            return (
              <Button
                key={pageNumber}
                variant={isActive ? 'primary-red' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(pageNumber)}
                className="min-w-[2.5rem]"
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Próxima
        </Button>
      </div>
    </div>
  )
}



