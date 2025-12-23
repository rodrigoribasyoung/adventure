import { useState } from 'react'
import { Contact } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface ContactTableProps {
  contacts: Contact[]
  loading: boolean
  onEdit: (contact: Contact) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

export const ContactTable = ({ contacts, loading, onEdit, onDelete, onCreateNew }: ContactTableProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredContacts = contacts.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.phone?.includes(searchTerm)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-white/70">Carregando contatos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Buscar contatos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
        <Button variant="primary-red" onClick={onCreateNew}>
          + Novo Contato
        </Button>
      </div>

      {filteredContacts.length === 0 ? (
        <div className="bg-background-darker border border-white/10 rounded-lg p-12 text-center">
          <p className="text-white/70 mb-4">
            {searchTerm ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}
          </p>
          {!searchTerm && (
            <Button variant="primary-blue" onClick={onCreateNew}>
              Criar Primeiro Contato
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
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => onEdit(contact)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{contact.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/70">{contact.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white/70">{contact.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(contact)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (confirm('Tem certeza que deseja excluir este contato?')) {
                              onDelete(contact.id)
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

