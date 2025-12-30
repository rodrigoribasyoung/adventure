import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { useAccount } from './AccountContext'
import { Project } from '@/types'
import { useProjects } from '@/hooks/useProjects'

interface ProjectContextType {
  currentProject: Project | null
  setCurrentProject: (project: Project | null) => void
  loading: boolean
  isMaster: boolean // Se o usuário é master (Adventure)
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined)

export const useProject = () => {
  const context = useContext(ProjectContext)
  if (context === undefined) {
    throw new Error('useProject deve ser usado dentro de um ProjectProvider')
  }
  return context
}

interface ProjectProviderProps {
  children: ReactNode
}

const PROJECT_STORAGE_KEY = 'adventure_current_project_id'

export const ProjectProvider = ({ children }: ProjectProviderProps) => {
  const { userData } = useAuth()
  const { currentAccount } = useAccount()
  const { projects, loading: projectsLoading } = useProjects()
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const isMaster = userData?.isMaster === true

  // Filtrar projetos pela conta atual
  const availableProjects = currentAccount 
    ? projects.filter(p => p.accountId === currentAccount.id)
    : projects

  // Carregar projeto salvo do localStorage ou selecionar o primeiro disponível
  useEffect(() => {
    if (projectsLoading || !userData) {
      setLoading(true)
      return
    }

    // Se for master e não houver conta selecionada, não mostrar projetos
    if (isMaster && !currentAccount) {
      setCurrentProjectState(null)
      setLoading(false)
      return
    }

    const savedProjectId = localStorage.getItem(PROJECT_STORAGE_KEY)
    
    if (savedProjectId) {
      const savedProject = availableProjects.find(p => p.id === savedProjectId && p.active)
      if (savedProject) {
        setCurrentProjectState(savedProject)
        setLoading(false)
        return
      } else {
        // Projeto salvo não existe mais ou está inativo, limpar localStorage
        localStorage.removeItem(PROJECT_STORAGE_KEY)
      }
    }

    // Se não há projeto salvo, selecionar o primeiro disponível e ativo
    const activeProjects = availableProjects.filter(p => p.active)
    if (activeProjects.length > 0) {
      const firstProject = activeProjects[0]
      setCurrentProjectState(firstProject)
      localStorage.setItem(PROJECT_STORAGE_KEY, firstProject.id)
    } else {
      // Não há projetos ativos
      setCurrentProjectState(null)
    }

    setLoading(false)
  }, [availableProjects, projectsLoading, userData, isMaster, currentAccount])

  const setCurrentProject = (project: Project | null) => {
    setCurrentProjectState(project)
    if (project) {
      localStorage.setItem(PROJECT_STORAGE_KEY, project.id)
    } else {
      localStorage.removeItem(PROJECT_STORAGE_KEY)
    }
  }

  const value: ProjectContextType = {
    currentProject,
    setCurrentProject,
    loading,
    isMaster,
  }

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
}

