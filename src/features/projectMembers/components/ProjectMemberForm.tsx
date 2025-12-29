import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ProjectMember } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const memberSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  role: z.string().optional(),
  active: z.boolean().default(true),
})

type MemberFormData = z.infer<typeof memberSchema>

interface ProjectMemberFormProps {
  member?: ProjectMember
  onSubmit: (data: MemberFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const ProjectMemberForm = ({ member, onSubmit, onCancel, loading = false }: ProjectMemberFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: member
      ? {
          name: member.name,
          email: member.email || '',
          phone: member.phone || '',
          role: member.role || '',
          active: member.active,
        }
      : {
          active: true,
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome *"
        placeholder="Nome do responsável"
        {...register('name')}
        error={errors.name?.message}
      />

      <Input
        label="Email"
        type="email"
        placeholder="email@exemplo.com"
        {...register('email')}
        error={errors.email?.message}
      />

      <Input
        label="Telefone"
        placeholder="(11) 98765-4321"
        {...register('phone')}
        error={errors.phone?.message}
      />

      <Input
        label="Cargo/Função"
        placeholder="Ex: Vendedor, Gerente, etc."
        {...register('role')}
        error={errors.role?.message}
      />

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="active"
          {...register('active')}
          className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
        />
        <label htmlFor="active" className="text-sm text-white/90">
          Responsável ativo
        </label>
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          className="flex-1"
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary-red"
          className="flex-1"
          disabled={loading}
        >
          {loading ? 'Salvando...' : member ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

