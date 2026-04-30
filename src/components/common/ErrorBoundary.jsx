// src/components/common/ErrorBoundary.jsx
import { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-ea-void flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-ea-card border border-ea-magenta/30 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-12 h-12 text-ea-magenta mx-auto mb-4" />
            <h1 className="font-display font-bold text-white text-xl mb-2">
              Something went wrong
            </h1>
            <p className="text-ea-muted text-sm mb-6 font-body">
              {this.state.error?.message || 'An unexpected error occurred.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-ea-cyan text-ea-void
                         font-display font-bold rounded-xl hover:bg-cyan-300 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Reload App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
