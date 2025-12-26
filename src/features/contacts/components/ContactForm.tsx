import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Contact } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useCustomFields } from '@/features/customFields/hooks/useCustomFields'
import { RenderCustomFields } from '@/components/customFields/RenderCustomFields'

const contactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  companyId: z.string().optional(),
  customFields: z.record(z.any()).optional(),
})

type ContactFormData = z.infer<typeof contactSchema>

interface ContactFormProps {
  contact?: Contact
  onSubmit: (data: ContactFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const ContactForm = ({ contact, onSubmit, onCancel, loading = false }: ContactFormProps) => {
  const { customFields } = useCustomFields('contact')
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: contact
      ? {
          name: contact.name,
          email: contact.email || '',
          phone: contact.phone || '',
          companyId: contact.companyId || '',
          customFields: contact.customFields || {},
        }
      : {
          customFields: {},
        },
  })

  const handleFormSubmit = async (data: ContactFormData) => {
    await onSubmit({
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      companyId: data.companyId || undefined,
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
    </form>
  )
}

