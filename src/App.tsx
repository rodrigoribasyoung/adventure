import { RouterProvider } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ProjectProvider } from './contexts/ProjectContext'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { InstallPrompt } from './components/pwa/InstallPrompt'
import { router } from './routes'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProjectProvider>
          <RouterProvider router={router} />
          <InstallPrompt />
        </ProjectProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App

