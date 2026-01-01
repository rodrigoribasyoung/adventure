import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Contact } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useCustomFields } from '@/features/customFields/hooks/useCustomFields'
import { RenderCustomFields } from '@/components/customFields/RenderCustomFields'
import { useCompanies } from '@/features/companies/hooks/useCompanies'
import { CompanyForm } from '@/features/companies/components/CompanyForm'
import { QuickCreateButton } from '@/components/forms/QuickCreateButton'

const contactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  companyId: z.string().optional(), // DEPRECATED - usar companyIds
  companyIds: z.array(z.string()).optional(),
  jobTitle: z.string().optional(),
  department: z.string().optional(),
  linkedin: z.string().url('URL inválida').optional().or(z.literal('')),
  notes: z.string().optional(),
  customFields: z.record(z.any()).optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
  contact?: Contact
  onSubmit: (data: { 
    firstName: string
    lastName?: string
    email?: string
    phone?: string
    companyId?: string
    companyIds?: string[]
    jobTitle?: string
    department?: string
    linkedin?: string
    notes?: string
    customFields?: Record<string, any>
  }) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const ContactForm = ({ contact, onSubmit, onCancel, loading = false }: ContactFormProps) => {
  const { customFields } = useCustomFields('contact')
  const { companies, createCompany } = useCompanies()
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false)
  const [quickCreateLoading, setQuickCreateLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact
      ? {
          name: contact.name,
          email: contact.email || '',
          phone: contact.phone || '',
          companyId: contact.companyId || '',
          companyIds: contact.companyIds || (contact.companyId ? [contact.companyId] : []),
          jobTitle: contact.jobTitle || '',
          department: contact.department || '',
          linkedin: contact.linkedin || '',
          notes: contact.notes || '',
          customFields: contact.customFields || {},
        }
      : {
          companyIds: [],
          customFields: {},
        },
  })

  const handleQuickCreateCompany = async (companyData: any) => {
    try {
      setQuickCreateLoading(true)
      const companyId = await createCompany(companyData)
      setValue('companyId', companyId)
      setIsCompanyModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar empresa:', error)
      throw error
    } finally {
      setQuickCreateLoading(false)
    }
  }

  const handleFormSubmit = async (data: ContactFormData) => {
    // Converter name em firstName e lastName
    const nameParts = data.name.trim().split(' ')
    const firstName = nameParts[0] || data.name
    const lastName = nameParts.slice(1).join(' ') || undefined
    
    await onSubmit({
      firstName,
      lastName,
      email: data.email || undefined,
      phone: data.phone || undefined,
      companyId: data.companyId || undefined, // Manter para compatibilidade
      companyIds: data.companyIds && data.companyIds.length > 0 ? data.companyIds : undefined,
      jobTitle: data.jobTitle || undefined,
      department: data.department || undefined,
      linkedin: data.linkedin || undefined,
      notes: data.notes || undefined,
      customFields: data.customFields && Object.keys(data.customFields).length > 0 ? data.customFields : undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        label="Nome *"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Nome do contato"
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

      <Input
        label="Cargo/Função"
        {...register('jobTitle')}
        error={errors.jobTitle?.message}
        placeholder="Ex: Gerente de Vendas, Diretor"
      />

      <Input
        label="Departamento"
        {...register('department')}
        error={errors.department?.message}
        placeholder="Ex: Vendas, Marketing"
      />

      <Input
        label="LinkedIn"
        type="url"
        {...register('linkedin')}
        error={errors.linkedin?.message}
        placeholder="https://linkedin.com/in/exemplo"
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-white/90">
            Empresas
          </label>
          <QuickCreateButton onClick={() => setIsCompanyModalOpen(true)} />
        </div>
        <select
          multiple
          {...register('companyIds')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200 min-h-[120px]"
        >
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-white/60">
          Segure Ctrl/Cmd para selecionar múltiplas empresas
        </p>
        {/* Manter campo antigo para compatibilidade (oculto) */}
        <select
          {...register('companyId')}
          className="hidden"
        >
          <option value="">Nenhuma empresa</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Observações
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200 resize-none"
          placeholder="Observações sobre o contato..."
        />
      </div>

      <RenderCustomFields
        customFields={customFields}
        control={control}
        entityCustomFields={contact?.customFields}
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : contact ? 'Atualizar' : 'Criar'}
        </Button>
      </div>

      {/* Modal rápido de criação de empresa */}
      <Modal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        title="Nova Empresa"
        size="md"
      >
        <CompanyForm
          onSubmit={handleQuickCreateCompany}
          onCancel={() => setIsCompanyModalOpen(false)}
          loading={quickCreateLoading}
        />
      </Modal>
    </form>
  )
}

