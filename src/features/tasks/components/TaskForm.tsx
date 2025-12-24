import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Task } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore'

const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  type: z.string().min(1, 'Tipo é obrigatório'),
  dueDate: z.string().optional(),
  status: z.enum(['pending', 'completed']).optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskFormProps {
  task?: Task
  dealId?: string
  onSubmit: (data: TaskFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

// Tipos de tarefa padrão
const TASK_TYPES = [
  { value: 'call', label: 'Ligação' },
  { value: 'email', label: 'E-mail' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'proposal', label: 'Enviar Proposta' },
  { value: 'quote', label: 'Enviar Orçamento' },
  { value: 'contract', label: 'Enviar Contrato' },
  { value: 'payment', label: 'Cobrança' },
  { value: 'other', label: 'Outro' },
]

export const TaskForm = ({ task, dealId, onSubmit, onCancel, loading = false }: TaskFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task
      ? {
          title: task.title,
          description: task.description || '',
          type: task.type,
          dueDate: task.dueDate
            ? new Date(task.dueDate.toMillis()).toISOString().split('T')[0]
            : '',
          status: task.status,
        }
      : {
          status: 'pending',
        },
  })

  const handleSubmitForm = async (data: TaskFormData) => {
    const submitData: any = {
      ...data,
      description: data.description || undefined,
      status: data.status || 'pending',
    }

    if (dealId) {
      submitData.dealId = dealId
    }

    if (data.dueDate && data.dueDate.trim() !== '') {
      submitData.dueDate = FirestoreTimestamp.fromDate(new Date(data.dueDate))
    } else {
      submitData.dueDate = undefined
    }

    await onSubmit(submitData)
  }

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="space-y-4">
      <Input
        label="Título *"
        {...register('title')}
        error={errors.title?.message}
        placeholder="Ex: Ligar para o cliente"
      />

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Tipo de Tarefa *
        </label>
        <select
          {...register('type')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
        >
          <option value="">Selecione o tipo</option>
          {TASK_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-400">{errors.type.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Descrição / Observações
        </label>
        <textarea
          {...register('description')}
          rows={4}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200 resize-none"
          placeholder="Adicione observações ou detalhes sobre a tarefa..."
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
        )}
      </div>

      <Input
        label="Data de Vencimento"
        type="date"
        {...register('dueDate')}
        error={errors.dueDate?.message}
      />

      {task && (
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="status"
            checked={watch('status') === 'completed'}
            onChange={(e) => setValue('status', e.target.checked ? 'completed' : 'pending')}
            className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
          />
          <label htmlFor="status" className="text-sm font-medium text-white/90">
            Tarefa concluída
          </label>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : task ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

