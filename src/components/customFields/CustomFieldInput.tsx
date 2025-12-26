import { CustomField } from '@/types'
import { Input } from '@/components/ui/Input'
import { Controller, Control, FieldValues, Path } from 'react-hook-form'

interface CustomFieldInputProps<T extends FieldValues> {
  field: CustomField
  control: Control<T>
  error?: string
  defaultValue?: any
}

export function CustomFieldInput<T extends FieldValues>({ field, control, error, defaultValue }: CustomFieldInputProps<T>) {
  const renderInput = (value: any, onChange: (value: any) => void, fieldError?: string) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            label={field.name + (field.required ? ' *' : '')}
            value={value || ''}
            onChange={(e) => onChange(e.target.value || undefined)}
            error={fieldError || error}
            placeholder={`Digite ${field.name.toLowerCase()}`}
          />
        )
      
      case 'number':
        return (
          <Input
            label={field.name + (field.required ? ' *' : '')}
            type="number"
            value={value || ''}
            onChange={(e) => onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
            error={fieldError || error}
            placeholder={`Digite ${field.name.toLowerCase()}`}
          />
        )
      
      case 'date':
        let dateValue = ''
        if (value) {
          if (typeof value === 'number') {
            dateValue = new Date(value).toISOString().split('T')[0]
          } else if (typeof value === 'string') {
            dateValue = value.split('T')[0]
          } else if (value instanceof Date) {
            dateValue = value.toISOString().split('T')[0]
          }
        }
        return (
          <Input
            label={field.name + (field.required ? ' *' : '')}
            type="date"
            value={dateValue}
            onChange={(e) => onChange(e.target.value ? new Date(e.target.value).getTime() : undefined)}
            error={fieldError || error}
          />
        )
      
      case 'select':
        return (
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              {field.name + (field.required ? ' *' : '')}
            </label>
            <select
              value={value || ''}
              onChange={(e) => onChange(e.target.value || undefined)}
              className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-red/50 focus:border-primary-red/50 transition-all duration-200"
            >
              <option value="">Selecione uma opção</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {(fieldError || error) && <p className="mt-1 text-sm text-red-400">{fieldError || error}</p>}
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <Controller
      name={`customFields.${field.id}` as Path<T>}
      control={control}
      defaultValue={defaultValue}
      rules={{
        required: field.required ? `${field.name} é obrigatório` : false,
      }}
      render={({ field: formField, fieldState }) => (
        <div>
          {renderInput(formField.value, formField.onChange, fieldState.error?.message)}
        </div>
      )}
    />
  )
}

