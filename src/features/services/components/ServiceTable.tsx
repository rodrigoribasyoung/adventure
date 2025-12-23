import { useState } from 'react'
import { Service } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface ServiceTableProps {
  services: Service[]
  loading: boolean
  onEdit: (service: Service) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

export const ServiceTable = ({ services, loading, onEdit, onDelete, onCreateNew }: ServiceTableProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando serviços...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar serviços..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button variant="primary-red" onClick={onCreateNew}>
          + Novo Serviço
        </Button>
      </div>

      {filteredServices.length === 0 ? (
        <div className="bg-background-darker border border-white/10 rounded-lg p-12 text-center">
          <p className="text-white/70 mb-4">
            {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
          </p>
          {!searchTerm && (
            <Button variant="primary-blue" onClick={onCreateNew}>
              Criar Primeiro Serviço
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-background-darker border border-white/10 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredServices.map((service) => (
                  <tr
                    key={service.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => onEdit(service)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{service.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-white/70 max-w-md truncate">
                        {service.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-primary-red">
                        {formatCurrency(service.price, service.currency)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          service.active
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {service.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(service)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este serviço?')) {
                              onDelete(service.id)
                            }
                          }}
                        >
                          Excluir
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

