import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const userSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido'),
  role: z.enum(['admin', 'user']),
})

type UserFormData = z.infer<typeof userSchema>

interface UserFormProps {
  user?: User
  onSubmit: (data: UserFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const UserForm = ({ user, onSubmit, onCancel, loading = false }: UserFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
        }
      : {
          role: 'user',
        },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nome *"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Nome completo"
      />

      <Input
        label="Email *"
        type="email"
        {...register('email')}
        error={errors.email?.message}
        placeholder="email@exemplo.com"
        disabled={!!user} // Não permitir editar email de usuários existentes
      />

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Permissão *
        </label>
        <select
          {...register('role')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
        >
          <option value="user">Usuário</option>
          <option value="admin">Administrador</option>
        </select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

