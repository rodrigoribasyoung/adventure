import { Component, ReactNode } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erro capturado pelo ErrorBoundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined })
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background-dark flex items-center justify-center p-4">
          <Card className="max-w-md">
            <h2 className="text-2xl font-bold text-white mb-4">
              Ops! Algo deu errado
            </h2>
            <p className="text-white/70 mb-4">
              Ocorreu um erro inesperado. Por favor, tente recarregar a página.
            </p>
            {this.state.error && (
              <details className="mb-4">
                <summary className="text-white/60 text-sm cursor-pointer">
                  Detalhes do erro
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-black/20 p-2 rounded overflow-auto">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
            <Button variant="primary-red" onClick={this.handleReset}>
              Recarregar Página
            </Button>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

