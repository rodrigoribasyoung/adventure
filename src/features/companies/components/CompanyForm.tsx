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
  onSubmit: (data: CompanyFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const CompanyForm = ({ company, onSubmit, onCancel, loading = false }: CompanyFormProps) => {
  const { customFields } = useCustomFields('company')
  const { contacts } = useContacts()
  
  // Buscar contatos relacionados a esta empresa (usando companyIds ou companyId para compatibilidade)
  const relatedContacts = company 
    ? contacts.filter(c => 
        (company.contactIds?.includes(c.id)) || 
        (c.companyId === company.id) ||
        (c.companyIds?.includes(company.id))
      )
    : []
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

  const handleFormSubmit = async (data: CompanyFormData) => {
    await onSubmit({
      ...data,
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
        <label className="block text-sm font-medium text-white/90 mb-2">
          Contatos
        </label>
        <select
          multiple
          {...register('contactIds')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200 min-h-[120px]"
        >
          {contacts.map(contact => (
            <option key={contact.id} value={contact.id}>
              {contact.name} {contact.email && `(${contact.email})`}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-white/60">
          Segure Ctrl/Cmd para selecionar múltiplos contatos
        </p>
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
    </form>
  )
}

