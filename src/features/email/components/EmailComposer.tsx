import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const emailSchema = z.object({
  to: z.string().email('Email inválido'),
  subject: z.string().min(1, 'Assunto é obrigatório'),
  body: z.string().min(1, 'Corpo do email é obrigatório'),
})

type EmailFormData = z.infer<typeof emailSchema>

interface EmailComposerProps {
  defaultTo?: string
  defaultSubject?: string
  defaultBody?: string
  onSubmit: (data: EmailFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const EmailComposer = ({
  defaultTo,
  defaultSubject,
  defaultBody,
  onSubmit,
  onCancel,
  loading = false,
}: EmailComposerProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      to: defaultTo || '',
      subject: defaultSubject || '',
      body: defaultBody || '',
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Para *"
        type="email"
        {...register('to')}
        error={errors.to?.message}
        placeholder="email@exemplo.com"
      />

      <Input
        label="Assunto *"
        {...register('subject')}
        error={errors.subject?.message}
        placeholder="Assunto do email"
      />

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Mensagem *
        </label>
        <textarea
          {...register('body')}
          rows={10}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200 resize-none"
          placeholder="Digite sua mensagem aqui..."
          error={errors.body?.message}
        />
        {errors.body && (
          <p className="mt-1 text-sm text-red-400">{errors.body.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar Email'}
        </Button>
      </div>
    </form>
  )
}

