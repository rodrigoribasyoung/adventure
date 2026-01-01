import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Company } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useCustomFields } from '@/features/customFields/hooks/useCustomFields'
import { RenderCustomFields } from '@/components/customFields/RenderCustomFields'
import { useContacts } from '@/features/contacts/hooks/useContacts'
import { ContactForm } from '@/features/contacts/components/ContactForm'
import { QuickCreateButton } from '@/components/forms/QuickCreateButton'

const companySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  // Campos de segmentação
  segment: z.string().optional(),
  industry: z.string().optional(),
  size: z.enum(['micro', 'pequena', 'media', 'grande', 'enterprise']).optional(),
  annualRevenue: z.number().optional(),
  employeeCount: z.number().optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  linkedin: z.string().url('URL inválida').optional().or(z.literal('')),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  notes: z.string().optional(),
  contactIds: z.array(z.string()).optional(),
  customFields: z.record(z.any()).optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  company?: Company
  onSubmit: (data: {
    name: string
    cnpj?: string
    email?: string
    phone?: string
    website?: string
    segment?: string
    industry?: string
    size?: 'micro' | 'pequena' | 'media' | 'grande' | 'enterprise'
    annualRevenue?: number
    employeeCount?: number
    socialMedia?: {
      linkedin?: string
      instagram?: string
      facebook?: string
      twitter?: string
    }
    notes?: string
    contactIds?: string[]
    customFields?: Record<string, any>
  }) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const CompanyForm = ({ company, onSubmit, onCancel, loading = false }: CompanyFormProps) => {
  const { customFields } = useCustomFields('company')
  const { contacts, createContact } = useContacts()
  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [quickCreateLoading, setQuickCreateLoading] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: company
      ? {
          name: company.name,
          cnpj: company.cnpj || '',
          email: company.email || '',
          phone: company.phone || '',
          segment: company.segment || '',
          industry: company.industry || '',
          size: company.size || undefined,
          annualRevenue: company.annualRevenue || undefined,
          employeeCount: company.employeeCount || undefined,
          website: company.website || '',
          linkedin: company.socialMedia?.linkedin || '',
          instagram: company.socialMedia?.instagram || '',
          facebook: company.socialMedia?.facebook || '',
          twitter: company.socialMedia?.twitter || '',
          notes: company.notes || '',
          contactIds: company.contactIds || [],
          customFields: company.customFields || {},
        }
      : {
          contactIds: [],
          customFields: {},
        },
  })

  const selectedContactIds = watch('contactIds') || []
  
  // Filtrar contatos por busca
  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.email?.toLowerCase().includes(contactSearch.toLowerCase()) ||
    contact.phone?.includes(contactSearch)
  )

  const handleQuickCreateContact = async (contactData: any) => {
    try {
      setQuickCreateLoading(true)
      const contactId = await createContact(contactData)
      // Adicionar o novo contato aos selecionados
      const currentIds = selectedContactIds
      if (!currentIds.includes(contactId)) {
        setValue('contactIds', [...currentIds, contactId])
      }
      setIsContactModalOpen(false)
    } catch (error) {
      console.error('Erro ao criar contato:', error)
      throw error
    } finally {
      setQuickCreateLoading(false)
    }
  }

  const handleFormSubmit = async (data: CompanyFormData) => {
    await onSubmit({
      name: data.name,
      email: data.email || undefined,
      phone: data.phone || undefined,
      cnpj: data.cnpj || undefined,
      website: data.website || undefined,
      segment: data.segment || undefined,
      industry: data.industry || undefined,
      size: data.size || undefined,
      annualRevenue: data.annualRevenue || undefined,
      employeeCount: data.employeeCount || undefined,
      socialMedia: {
        linkedin: data.linkedin || undefined,
        instagram: data.instagram || undefined,
        facebook: data.facebook || undefined,
        twitter: data.twitter || undefined,
      },
      notes: data.notes || undefined,
      contactIds: data.contactIds && data.contactIds.length > 0 ? data.contactIds : undefined,
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

      <Input
        label="Website"
        type="url"
        {...register('website')}
        error={errors.website?.message}
        placeholder="https://exemplo.com"
      />

      {/* Campos de Segmentação */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-sm font-medium text-white/90 mb-3">Segmentação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Segmento"
            {...register('segment')}
            error={errors.segment?.message}
            placeholder="Ex: B2B, B2C, SaaS"
          />

          <Input
            label="Setor/Indústria"
            {...register('industry')}
            error={errors.industry?.message}
            placeholder="Ex: Tecnologia, Varejo"
          />

          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Porte da Empresa
            </label>
            <select
              {...register('size')}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
            >
              <option value="">Selecione o porte</option>
              <option value="micro">Micro</option>
              <option value="pequena">Pequena</option>
              <option value="media">Média</option>
              <option value="grande">Grande</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>

          <Input
            label="Faturamento Anual (R$)"
            type="number"
            step="0.01"
            {...register('annualRevenue', { valueAsNumber: true })}
            error={errors.annualRevenue?.message}
            placeholder="0.00"
          />

          <Input
            label="Número de Funcionários"
            type="number"
            {...register('employeeCount', { valueAsNumber: true })}
            error={errors.employeeCount?.message}
            placeholder="0"
          />
        </div>
      </div>

      {/* Redes Sociais */}
      <div className="pt-4 border-t border-white/10">
        <h3 className="text-sm font-medium text-white/90 mb-3">Redes Sociais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="LinkedIn"
            type="url"
            {...register('linkedin')}
            error={errors.linkedin?.message}
            placeholder="https://linkedin.com/company/exemplo"
          />

          <Input
            label="Instagram"
            {...register('instagram')}
            error={errors.instagram?.message}
            placeholder="@exemplo"
          />

          <Input
            label="Facebook"
            {...register('facebook')}
            error={errors.facebook?.message}
            placeholder="https://facebook.com/exemplo"
          />

          <Input
            label="Twitter/X"
            {...register('twitter')}
            error={errors.twitter?.message}
            placeholder="@exemplo"
          />
        </div>
      </div>

      {/* Múltiplos Contatos */}
      <div className="pt-4 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-white/90">
            Contatos
          </label>
          <QuickCreateButton onClick={() => setIsContactModalOpen(true)} label="+ Novo Contato" />
        </div>
        
        {/* Campo de busca */}
        <div className="mb-2">
          <Input
            label="Buscar contato"
            value={contactSearch}
            onChange={(e) => setContactSearch(e.target.value)}
            placeholder="Digite para buscar..."
          />
        </div>
        
        <select
          multiple
          {...register('contactIds')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200 min-h-[120px]"
          value={selectedContactIds}
          onChange={(e) => {
            const selected = Array.from(e.target.selectedOptions, option => option.value)
            setValue('contactIds', selected)
          }}
        >
          {filteredContacts.length > 0 ? (
            filteredContacts.map(contact => (
              <option 
                key={contact.id} 
                value={contact.id}
              >
                {contact.name} {contact.email && `(${contact.email})`} {contact.jobTitle && `- ${contact.jobTitle}`}
              </option>
            ))
          ) : (
            <option disabled>Nenhum contato encontrado</option>
          )}
        </select>
        <p className="mt-1 text-xs text-white/60">
          Segure Ctrl/Cmd para selecionar múltiplos contatos
        </p>
        {selectedContactIds.length > 0 && (
          <p className="mt-1 text-xs text-white/70">
            {selectedContactIds.length} contato(s) selecionado(s)
          </p>
        )}
      </div>

      {/* Observações */}
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Observações
        </label>
        <textarea
          {...register('notes')}
          rows={3}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200 resize-none"
          placeholder="Observações sobre a empresa..."
        />
      </div>

      <RenderCustomFields
        customFields={customFields}
        control={control}
        entityCustomFields={company?.customFields}
      />


      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : company ? 'Atualizar' : 'Criar'}
        </Button>
      </div>

      {/* Modal rápido de criação de contato */}
      <Modal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        title="Novo Contato"
        size="md"
      >
        <ContactForm
          onSubmit={handleQuickCreateContact}
          onCancel={() => setIsContactModalOpen(false)}
          loading={quickCreateLoading}
        />
      </Modal>
    </form>
  )
}

