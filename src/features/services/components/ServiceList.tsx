import { useState } from 'react'
import { Service } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatCurrency } from '@/lib/utils/formatCurrency'

interface ServiceListProps {
  services: Service[]
  loading: boolean
  onEdit: (service: Service) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

export const ServiceList = ({ services, loading, onEdit, onDelete, onCreateNew }: ServiceListProps) => {
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
        <Card>
          <div className="text-center py-12">
            <p className="text-white/70 mb-4">
              {searchTerm ? 'Nenhum serviço encontrado' : 'Nenhum serviço cadastrado'}
            </p>
            {!searchTerm && (
              <Button variant="primary-blue" onClick={onCreateNew}>
                Criar Primeiro Serviço
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map((service) => (
            <Card key={service.id} variant="elevated">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h3 className="text-lg font-semibold text-white">{service.name}</h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      service.active
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {service.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                {service.description && (
                  <p className="text-white/70 text-sm">{service.description}</p>
                )}
                <p className="text-xl font-bold text-primary-red">
                  {formatCurrency(service.price, service.currency)}
                </p>
                <div className="flex gap-2 pt-2">
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

