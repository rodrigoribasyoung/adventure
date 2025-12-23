import { useState } from 'react'
import { Contact } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

interface ContactListProps {
  contacts: Contact[]
  loading: boolean
  onEdit: (contact: Contact) => void
  onDelete: (id: string) => void
  onCreateNew: () => void
}

export const ContactList = ({ contacts, loading, onEdit, onDelete, onCreateNew }: ContactListProps) => {
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
        <Card>
          <div className="text-center py-12">
            <p className="text-white/70 mb-4">
              {searchTerm ? 'Nenhum contato encontrado' : 'Nenhum contato cadastrado'}
            </p>
            {!searchTerm && (
              <Button variant="primary-blue" onClick={onCreateNew}>
                Criar Primeiro Contato
              </Button>
            )}
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredContacts.map((contact) => (
            <Card key={contact.id} variant="elevated">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">{contact.name}</h3>
                {contact.email && (
                  <p className="text-white/70 text-sm">{contact.email}</p>
                )}
                {contact.phone && (
                  <p className="text-white/70 text-sm">{contact.phone}</p>
                )}
                <div className="flex gap-2 pt-2">
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
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

