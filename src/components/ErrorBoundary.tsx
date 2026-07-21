import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * React Error Boundary — catches render-time JS errors in child components
 * and renders a graceful fallback UI instead of a blank white screen.
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center text-white font-sans px-6 text-center">
          <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h1 className="text-3xl font-black mb-2">Something went wrong</h1>
          <p className="text-text-secondary mb-2 max-w-md leading-relaxed">
            An unexpected error occurred. This has been logged and we'll look into it.
          </p>
          {this.state.error && (
            <pre className="text-xs text-red-400/70 bg-red-500/5 border border-red-500/20 rounded-lg p-4 mb-8 max-w-lg text-left overflow-auto max-h-32">
              {this.state.error.message}
            </pre>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="px-6 py-2.5 rounded-lg border border-brand-border text-text-secondary hover:text-white hover:border-brand-accent font-bold text-sm transition-all cursor-pointer"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-6 py-2.5 rounded-lg bg-brand-accent text-brand-navy font-bold text-sm hover:bg-brand-accent-light transition-all shadow-lg"
            >
              Go Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
