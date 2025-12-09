import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '2rem',
            fontFamily: 'system-ui, sans-serif',
            maxWidth: '600px',
            margin: '0 auto',
          }}
        >
          <h1 style={{ color: '#d32f2f' }}>Something went wrong</h1>
          <p>We're sorry, but something unexpected happened.</p>
          <details style={{ marginTop: '1rem' }}>
            <summary style={{ cursor: 'pointer' }}>Error details</summary>
            <pre
              style={{
                background: '#f5f5f5',
                padding: '1rem',
                borderRadius: '4px',
                overflow: 'auto',
              }}
            >
              {this.state.error?.toString()}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
