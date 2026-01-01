import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Task } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Timestamp as FirestoreTimestamp } from 'firebase/firestore'
import { useProjectUsers } from '@/features/projectMembers/hooks/useProjectUsers'

const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  type: z.string().min(1, 'Tipo é obrigatório'),
  dueDate: z.string().optional(),
  status: z.enum(['pending', 'completed']).optional(),
  assignedTo: z.string().min(1, 'Responsável é obrigatório'),
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
  const navigate = useNavigate()
  const { responsibles, loading: membersLoading } = useProjectUsers()
  
  // Filtrar apenas responsáveis ativos
  const activeMembers = responsibles.filter(m => m.active)
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'pending',
      assignedTo: '',
    },
  })
  
  // Atualizar valores padrão quando membros forem carregados
  useEffect(() => {
    if (membersLoading) return
    
    reset(task
      ? {
          title: task.title,
          description: task.description || '',
          type: task.type,
          dueDate: task.dueDate
            ? new Date(task.dueDate.toMillis()).toISOString().split('T')[0]
            : '',
          status: task.status,
          assignedTo: task.assignedTo || (activeMembers.length > 0 ? activeMembers[0].id : ''),
        }
      : {
          status: 'pending',
          assignedTo: activeMembers.length > 0 ? activeMembers[0].id : '',
        })
  }, [task, activeMembers, membersLoading, reset])

  const handleSubmitForm = async (data: TaskFormData) => {
    // Validar se há responsáveis ativos no projeto
    if (activeMembers.length === 0) {
      throw new Error('É necessário ter pelo menos um responsável ativo no projeto para criar tarefas. Por favor, cadastre um responsável primeiro.')
    }
    
    // Validar se responsável foi selecionado
    if (!data.assignedTo || data.assignedTo.trim() === '') {
      throw new Error('É obrigatório selecionar um responsável para a tarefa.')
    }
    
    // Validar se o responsável selecionado existe e está ativo
    const selectedMember = activeMembers.find(m => m.id === data.assignedTo)
    if (!selectedMember) {
      throw new Error('O responsável selecionado não é válido ou está inativo.')
    }
    
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

      {activeMembers.length === 0 ? (
        <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-400 text-sm font-medium mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Nenhum responsável ativo encontrado
          </p>
          <p className="text-yellow-300/80 text-sm">
            É necessário ter pelo menos um responsável ativo no projeto para criar tarefas. 
            <button
              type="button"
              onClick={() => navigate('/project-members')}
              className="underline ml-1 hover:text-yellow-200 transition-colors"
            >
              Cadastrar responsável agora
            </button>
          </p>
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-white/90 mb-2">
            Responsável *
          </label>
          <select
            {...register('assignedTo')}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
            disabled={membersLoading}
          >
            <option value="">Selecione um responsável</option>
            {activeMembers.map(member => (
              <option key={member.id} value={member.id}>
                {member.name} {member.jobTitle ? `- ${member.jobTitle}` : ''}
              </option>
            ))}
          </select>
          {errors.assignedTo && (
            <p className="mt-1 text-sm text-red-400">{errors.assignedTo.message}</p>
          )}
        </div>
      )}

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

