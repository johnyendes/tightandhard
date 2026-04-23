import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeout: NodeJS.Timeout | null = null;
  private maxRetries = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log error to monitoring service
    this.logError(error, errorInfo);

    // Attempt auto-recovery
    this.attemptAutoRecovery(error);
  }

  logError = (error: Error, errorInfo: ErrorInfo) => {
    console.error('Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Send to monitoring service (implement based on your needs)
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.toString(),
          stack: error.stack,
          errorInfo,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent
        })
      }).catch(() => {
        // Fail silently if error reporting fails
      });
    } catch (err) {
      // Fail silently
    }
  };

  attemptAutoRecovery = (error: Error) => {
    // Don't retry if we've exceeded max retries
    if (this.state.retryCount >= this.maxRetries) {
      return;
    }

    // Auto-retry for certain types of errors
    const retryableErrors = [
      'ChunkLoadError',
      'Network Error',
      'Failed to fetch'
    ];

    const shouldRetry = retryableErrors.some(errType => 
      error.message.includes(errType) || error.name.includes(errType)
    );

    if (shouldRetry) {
      console.log(`Attempting auto-recovery (attempt ${this.state.retryCount + 1}/${this.maxRetries})`);
      
      this.retryTimeout = setTimeout(() => {
        this.setState(prevState => ({
          hasError: false,
          error: null,
          errorInfo: null,
          retryCount: prevState.retryCount + 1
        }));
      }, 2000 * (this.state.retryCount + 1)); // Exponential backoff
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="max-w-md w-full text-center space-y-4">
            <div className="p-3 bg-red-100 rounded-full w-fit mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {this.state.retryCount > 0 
                  ? `Auto-recovery failed after ${this.state.retryCount} attempts`
                  : 'An unexpected error occurred'
                }
              </p>
              
              {process.env.NODE_ENV === 'development' && (
                <details className="text-left mt-4 p-3 bg-gray-100 rounded text-xs">
                  <summary className="cursor-pointer font-medium">Error Details</summary>
                  <pre className="mt-2 whitespace-pre-wrap overflow-auto max-h-40">
                    {this.state.error?.toString()}
                    {this.state.error?.stack}
                  </pre>
                </details>
              )}
            </div>

            <div className="flex gap-2">
              <Button onClick={this.handleRetry} className="flex-1">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleReload} variant="outline" className="flex-1">
                Reload Page
              </Button>
            </div>
            
            <Button 
              onClick={this.handleGoHome} 
              variant="ghost" 
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Homepage
            </Button>
            
            {this.state.retryCount < this.maxRetries && (
              <p className="text-xs text-gray-500">
                Auto-retry in progress... ({this.state.retryCount + 1}/{this.maxRetries})
              </p>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}