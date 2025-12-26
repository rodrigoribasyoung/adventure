import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CustomField } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

const customFieldSchema = z.object({
  entityType: z.enum(['contact', 'company', 'deal']),
  name: z.string().min(1, 'Nome do campo é obrigatório'),
  type: z.enum(['text', 'number', 'date', 'select']),
  options: z.array(z.string()),
  required: z.boolean(),
})

type CustomFieldFormData = z.infer<typeof customFieldSchema>

interface CustomFieldFormProps {
  customField?: CustomField
  onSubmit: (data: CustomFieldFormData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export const CustomFieldForm = ({ customField, onSubmit, onCancel, loading = false }: CustomFieldFormProps) => {
  const form = useForm<CustomFieldFormData>({
    resolver: zodResolver(customFieldSchema),
    defaultValues: customField
      ? {
          entityType: customField.entityType,
          name: customField.name,
          type: customField.type,
          options: customField.options || [],
          required: customField.required,
        }
      : {
          entityType: 'contact',
          type: 'text',
          required: false,
          options: [],
        },
  })

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  })

  const fieldType = watch('type')

  const handleFormSubmit = async (data: CustomFieldFormData) => {
    await onSubmit(data)
  }

  const addOption = () => {
    append('')
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Tipo de Entidade *
        </label>
        <select
          {...register('entityType')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
        >
          <option value="contact">Contato</option>
          <option value="company">Empresa</option>
          <option value="deal">Negociação</option>
        </select>
        {errors.entityType && (
          <p className="mt-1 text-sm text-red-400">{errors.entityType.message}</p>
        )}
      </div>

      <Input
        label="Nome do Campo *"
        {...register('name')}
        error={errors.name?.message}
        placeholder="Ex: Número de funcionários"
      />

      <div>
        <label className="block text-sm font-medium text-white/90 mb-2">
          Tipo de Campo *
        </label>
        <select
          {...register('type')}
          className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
        >
          <option value="text">Texto</option>
          <option value="number">Número</option>
          <option value="date">Data</option>
          <option value="select">Lista de Seleção</option>
        </select>
        {errors.type && (
          <p className="mt-1 text-sm text-red-400">{errors.type.message}</p>
        )}
      </div>

      {fieldType === 'select' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-white/90">
              Opções da Lista *
            </label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={addOption}
            >
              + Adicionar Opção
            </Button>
          </div>
          {fields.map((field, index) => (
            <div key={field.id} className="flex gap-2">
              <Input
                {...register(`options.${index}` as const)}
                placeholder={`Opção ${index + 1}`}
                error={errors.options?.[index]?.message}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                className="text-red-400 hover:text-red-300"
              >
                Remover
              </Button>
            </div>
          ))}
          {fields.length === 0 && (
            <p className="text-sm text-white/60">
              Nenhuma opção adicionada. Clique em "Adicionar Opção" para criar uma lista.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="required"
          {...register('required')}
          className="w-4 h-4 text-primary-red bg-white/5 border-white/10 rounded focus:ring-primary-red/50"
        />
        <label htmlFor="required" className="text-sm font-medium text-white/90">
          Campo obrigatório
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary-red" disabled={loading}>
          {loading ? 'Salvando...' : customField ? 'Atualizar' : 'Criar'}
        </Button>
      </div>
    </form>
  )
}

