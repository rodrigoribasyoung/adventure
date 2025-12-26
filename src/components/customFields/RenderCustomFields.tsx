import { CustomField } from '@/types'
import { CustomFieldInput } from './CustomFieldInput'
import { Control, FieldValues } from 'react-hook-form'

interface RenderCustomFieldsProps<T extends FieldValues> {
  customFields: CustomField[]
  control: Control<T>
  entityCustomFields?: Record<string, any>
}

export function RenderCustomFields<T extends FieldValues>({ customFields, control, entityCustomFields }: RenderCustomFieldsProps<T>) {
  if (customFields.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 pt-4 border-t border-white/10">
      <h3 className="text-lg font-semibold text-white">Campos Personalizados</h3>
      {customFields.map((field) => (
        <CustomFieldInput
          key={field.id}
          field={field}
          control={control}
          defaultValue={entityCustomFields?.[field.id]}
        />
      ))}
    </div>
  )
}

