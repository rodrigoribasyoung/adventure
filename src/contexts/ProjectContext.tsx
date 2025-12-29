import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAuth } from './AuthContext'
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
  const { projects, loading: projectsLoading } = useProjects()
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  const isMaster = userData?.isMaster === true

  // Carregar projeto salvo do localStorage ou selecionar o primeiro disponível
  useEffect(() => {
    if (projectsLoading || !userData) {
      setLoading(true)
      return
    }

    const savedProjectId = localStorage.getItem(PROJECT_STORAGE_KEY)
    
    if (savedProjectId) {
      const savedProject = projects.find(p => p.id === savedProjectId)
      if (savedProject) {
        setCurrentProjectState(savedProject)
        setLoading(false)
        return
      }
    }

    // Se não há projeto salvo, selecionar o primeiro disponível
    if (projects.length > 0) {
      const firstProject = projects[0]
      setCurrentProjectState(firstProject)
      localStorage.setItem(PROJECT_STORAGE_KEY, firstProject.id)
    }

    setLoading(false)
  }, [projects, projectsLoading, userData])

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

