import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Company } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCustomFields } from '@/features/customFields/hooks/useCustomFields'
import { RenderCustomFields } from '@/components/customFields/RenderCustomFields'
import { useContacts } from '@/features/contacts/hooks/useContacts'

const companySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  customFields: z.record(z.any()).optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  company?: Company
  onSubmit: (data: CompanyFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const CompanyForm = ({ company, onSubmit, onCancel, loading = false }: CompanyFormProps) => {
  const { customFields } = useCustomFields('company')
  const { contacts } = useContacts()
  
  // Buscar contatos relacionados a esta empresa
  const relatedContacts = company ? contacts.filter(c => c.companyId === company.id) : []
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: company
      ? {
          name: company.name,
          cnpj: company.cnpj || '',
          email: company.email || '',
          phone: company.phone || '',
          customFields: company.customFields || {},
        }
      : {
          customFields: {},
        },
  })

  const handleFormSubmit = async (data: CompanyFormData) => {
    await onSubmit({
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      cnpj: data.cnpj || undefined,
      customFields: data.customFields && Object.keys(data.customFields).length > 0 ? data.customFields : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Nome *"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Nome da empresa"
      />

      <Input
        label="CNPJ"
        {...register('cnpj')}
        error={errors.cnpj?.message}
        placeholder="00.000.000/0000-00"
      />

      <Input
        label="Email"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="email@exemplo.com"
      />

      <Input
        label="Telefone"
        {...register('phone')}
        error={errors.phone?.message}
        placeholder="(00) 00000-0000"
      />

      <RenderCustomFields
        customFields={customFields}
        control={control}
        entityCustomFields={company?.customFields}
      />

      {/* Contatos Relacionados */}
      {company && relatedContacts.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <label className="block text-sm font-medium text-white/90 mb-2">
            Contatos Relacionados ({relatedContacts.length})
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto bg-white/5 rounded-lg p-3">
            {relatedContacts.map(contact => (
              <div key={contact.id} className="text-sm text-white/70">
                {contact.name} {contact.email && `(${contact.email})`}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : company ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

