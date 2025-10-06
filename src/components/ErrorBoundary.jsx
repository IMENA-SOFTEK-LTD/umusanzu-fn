import { Component, useCallback } from 'react'
import PropTypes from 'prop-types'
import { toast } from 'react-toastify'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    this.setState({
      error,
      errorInfo,
    })

    // Show toast notification for non-critical errors
    if (!this.props.silent) {
      toast.error('Something went wrong. Please try again.', {
        position: 'top-right',
        autoClose: 5000,
      })
    }

    // Report error to monitoring service (if available)
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }))
    } else {
      toast.error('Maximum retry attempts reached. Please refresh the page.', {
        position: 'top-right',
        autoClose: 8000,
      })
    }
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleRetry, this.handleReload)
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="mb-4">
              <svg
                className="mx-auto h-12 w-12 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Oops! Something went wrong
            </h2>
            
            <p className="text-gray-600 mb-6">
              We encountered an unexpected error. Don't worry, we're working to fix it.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 mb-2">
                  Error Details (Development)
                </summary>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                  {this.state.error.toString()}
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {this.state.retryCount < (this.props.maxRetries || 3) && (
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                >
                  Try Again ({this.props.maxRetries - this.state.retryCount} left)
                </button>
              )}
              
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-colors"
              >
                Reload Page
              </button>
            </div>

            {this.props.showSupport && (
              <p className="mt-4 text-sm text-gray-500">
                If the problem persists, please{' '}
                <a
                  href="mailto:support@umusanzu.com"
                  className="text-primary hover:underline"
                >
                  contact support
                </a>
              </p>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
  onError: PropTypes.func,
  silent: PropTypes.bool,
  maxRetries: PropTypes.number,
  showSupport: PropTypes.bool,
}

ErrorBoundary.defaultProps = {
  silent: false,
  maxRetries: 3,
  showSupport: true,
}

export default ErrorBoundary

// Higher-order component for wrapping components with error boundary
export const withErrorBoundary = (Component, errorBoundaryProps = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// Hook for error reporting in functional components
export const useErrorHandler = () => {
  const handleError = useCallback((error, errorInfo) => {
    console.error('Error caught by useErrorHandler:', error, errorInfo)
    
    toast.error('An error occurred. Please try again.', {
      position: 'top-right',
      autoClose: 5000,
    })
  }, [])

  return handleError
}
