import { CustomField } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface CustomFieldListProps {
  customFields: CustomField[]
  onEdit: (field: CustomField) => void
  onDelete: (id: string) => void
  loading?: boolean
}

const ENTITY_TYPE_LABELS: Record<string, string> = {
  contact: 'Contato',
  company: 'Empresa',
  deal: 'Negociação',
}

const FIELD_TYPE_LABELS: Record<string, string> = {
  text: 'Texto',
  number: 'Número',
  date: 'Data',
  select: 'Lista de Seleção',
}

export const CustomFieldList = ({ customFields, onEdit, onDelete, loading }: CustomFieldListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-white/70">Carregando campos personalizados...</div>
      </div>
    )
  }

  if (customFields.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-white/70 mb-4">Nenhum campo personalizado cadastrado.</p>
        <p className="text-white/50 text-sm">Crie campos personalizados para adicionar informações adicionais aos seus contatos, empresas e negociações.</p>
      </div>
    )
  }

  // Agrupar por tipo de entidade
  const groupedFields = customFields.reduce((acc, field) => {
    if (!acc[field.entityType]) {
      acc[field.entityType] = []
    }
    acc[field.entityType].push(field)
    return acc
  }, {} as Record<string, CustomField[]>)

  return (
    <div className="space-y-6">
      {Object.entries(groupedFields).map(([entityType, fields]) => (
        <div key={entityType}>
          <h3 className="text-lg font-semibold text-white mb-4">
            {ENTITY_TYPE_LABELS[entityType]}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(field => (
              <Card key={field.id} variant="elevated">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{field.name}</h4>
                      <p className="text-sm text-white/70 mt-1">
                        {FIELD_TYPE_LABELS[field.type]}
                      </p>
                    </div>
                    {field.required && (
                      <span className="ml-2 px-2 py-0.5 text-xs bg-primary-red/20 text-primary-red rounded-full">
                        Obrigatório
                      </span>
                    )}
                  </div>
                  
                  {field.type === 'select' && field.options && field.options.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-white/10">
                      <p className="text-xs text-white/60 mb-1">Opções:</p>
                      <div className="flex flex-wrap gap-1">
                        {field.options.slice(0, 3).map((option, idx) => (
                          <span key={idx} className="px-2 py-0.5 text-xs bg-white/10 text-white/70 rounded">
                            {option}
                          </span>
                        ))}
                        {field.options.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-white/60">
                            +{field.options.length - 3} mais
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(field)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Tem certeza que deseja excluir este campo personalizado?')) {
                          onDelete(field.id)
                        }
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

