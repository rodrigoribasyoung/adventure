import { useState } from 'react'
import { Company } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface CompanyListProps {
  companies: Company[]
  loading: boolean
  onEdit: (company: Company) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

export const CompanyList = ({ companies, loading, onEdit, onDelete, onCreateNew }: CompanyListProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCompanies = companies.filter((company) =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.cnpj?.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando empresas...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar empresas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button variant="primary-red" onClick={onCreateNew}>
          + Nova Empresa
        </Button>
      </div>

      {filteredCompanies.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-white/70 mb-4">
              {searchTerm ? 'Nenhuma empresa encontrada' : 'Nenhuma empresa cadastrada'}
            </p>
            {!searchTerm && (
              <Button variant="primary-blue" onClick={onCreateNew}>
                Criar Primeira Empresa
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCompanies.map((company) => (
            <Card key={company.id} variant="elevated">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{company.name}</h3>
                {company.cnpj && (
                  <p className="text-white/70 text-sm">CNPJ: {company.cnpj}</p>
                )}
                {company.email && (
                  <p className="text-white/70 text-sm">{company.email}</p>
                )}
                {company.phone && (
                  <p className="text-white/70 text-sm">{company.phone}</p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(company)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja excluir esta empresa?')) {
                        onDelete(company.id)
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

