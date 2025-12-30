import { Card } from '@/components/ui/Card'
import { Task } from '@/types'
import { FiAlertCircle, FiClock, FiCheckCircle, FiList } from 'react-icons/fi'

interface TaskScorecardsProps {
  tasks: Task[]
}

export const TaskScorecards = ({ tasks }: TaskScorecardsProps) => {
  const totalTasks = tasks.length
  
  const overdueTasks = tasks.filter(task => 
    task.dueDate && 
    task.dueDate.toDate() < new Date() && 
    task.status === 'pending'
  )
  
  const pendingTasks = tasks.filter(task => 
    task.status === 'pending' && 
    (!task.dueDate || task.dueDate.toDate() >= new Date())
  )
  
  const completedTasks = tasks.filter(task => task.status === 'completed')

  const overdueCount = overdueTasks.length
  const pendingCount = pendingTasks.length
  const completedCount = completedTasks.length

  const completionRate = totalTasks > 0 
    ? Math.round((completedCount / totalTasks) * 100) 
    : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card variant="elevated" className="border-white/20">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/5 rounded-lg">
            <FiList className="w-6 h-6 text-white/70" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white mb-1">{totalTasks}</p>
            <p className="text-sm text-white/70">Total de Tarefas</p>
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="border-red-500/30">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-red-500/20 rounded-lg">
            <FiAlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-400 mb-1">{overdueCount}</p>
            <p className="text-sm text-white/70">Atrasadas</p>
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="border-purple-500/30">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-lg">
            <FiClock className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-400 mb-1">{pendingCount}</p>
            <p className="text-sm text-white/70">Pendentes</p>
          </div>
        </div>
      </Card>

      <Card variant="elevated" className="border-green-500/30">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-500/20 rounded-lg">
            <FiCheckCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-400 mb-1">{completedCount}</p>
            <p className="text-sm text-white/70">Concluídas</p>
            {totalTasks > 0 && (
              <p className="text-xs text-white/50 mt-1">{completionRate}% de conclusão</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

