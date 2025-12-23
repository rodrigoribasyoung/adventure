import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Company } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const companySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
})

type CompanyFormData = z.infer<typeof companySchema>

interface CompanyFormProps {
  company?: Company
  onSubmit: (data: CompanyFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const CompanyForm = ({ company, onSubmit, onCancel, loading = false }: CompanyFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormData>({
    resolver: zodResolver(companySchema),
    defaultValues: company
      ? {
          name: company.name,
          cnpj: company.cnpj || '',
          email: company.email || '',
          phone: company.phone || '',
        }
      : undefined,
  })

  const handleFormSubmit = async (data: CompanyFormData) => {
    await onSubmit({
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
      cnpj: data.cnpj || undefined,
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

