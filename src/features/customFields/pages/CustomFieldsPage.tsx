import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { BackButton } from '@/components/common/BackButton'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { CustomFieldForm } from '../components/CustomFieldForm'
import { CustomFieldList } from '../components/CustomFieldList'
import { useCustomFields } from '../hooks/useCustomFields'
import { CustomField } from '@/types'
import { Toast } from '@/components/ui/Toast'

const CustomFieldsPage = () => {
  const { customFields, loading, createCustomField, updateCustomField, deleteCustomField } = useCustomFields()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<CustomField | undefined>()
  const [formLoading, setFormLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; visible: boolean }>({
    message: '',
    type: 'success',
    visible: false,
  })

  const handleCreateNew = () => {
    setSelectedField(undefined)
    setIsFormOpen(true)
  }

  const handleEdit = (field: CustomField) => {
    setSelectedField(field)
    setIsFormOpen(true)
  }

  const handleSubmit = async (data: any) => {
    try {
      setFormLoading(true)
      if (selectedField) {
        await updateCustomField(selectedField.id, data)
        setToast({ message: 'Campo personalizado atualizado com sucesso!', type: 'success', visible: true })
      } else {
        await createCustomField(data)
        setToast({ message: 'Campo personalizado criado com sucesso!', type: 'success', visible: true })
      }
      setIsFormOpen(false)
      setSelectedField(undefined)
    } catch (error: any) {
      console.error('Erro ao salvar campo personalizado:', error)
      setToast({ message: error.message || 'Erro ao salvar campo personalizado', type: 'error', visible: true })
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomField(id)
      setToast({ message: 'Campo personalizado excluído com sucesso!', type: 'success', visible: true })
    } catch (error: any) {
      console.error('Erro ao excluir campo personalizado:', error)
      setToast({ message: 'Erro ao excluir campo personalizado', type: 'error', visible: true })
    }
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <BackButton to="/settings" />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Campos Personalizados</h1>
            <p className="text-white/70">Gerencie campos personalizados para contatos, empresas e negociações</p>
          </div>
          <Button variant="primary-red" onClick={handleCreateNew}>
            + Novo Campo
          </Button>
        </div>

        <Card>
          <CustomFieldList
            customFields={customFields}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </Card>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false)
          setSelectedField(undefined)
        }}
        title={selectedField ? 'Editar Campo Personalizado' : 'Novo Campo Personalizado'}
        size="md"
      >
        <CustomFieldForm
          customField={selectedField}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsFormOpen(false)
            setSelectedField(undefined)
          }}
          loading={formLoading}
        />
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </Container>
  )
}

export default CustomFieldsPage

