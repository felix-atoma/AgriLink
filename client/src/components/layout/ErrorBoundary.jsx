import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error (e.g., to an error reporting service)
    console.error('Uncaught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Something went wrong.</h1>
          <p className="text-gray-600">An unexpected error occurred. Please try refreshing the page.</p>
          <pre className="bg-gray-100 text-sm text-red-500 p-4 mt-4 rounded">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
