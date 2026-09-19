import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React Component:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '32px', fontFamily: 'sans-serif', maxWidth: '600px', margin: '40px auto', backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px' }}>
          <h2 style={{ color: '#991B1B', margin: '0 0 12px 0' }}>⚠️ Application Error</h2>
          <p style={{ color: '#7F1D1D', fontSize: '14px', marginBottom: '16px' }}>
            An unexpected error occurred while rendering the page.
          </p>
          <pre style={{ backgroundColor: '#FFFFFF', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '12px', color: '#B91C1C', border: '1px solid #FECACA' }}>
            {this.state.error?.toString()}
          </pre>
          <button
            onClick={() => {
              window.location.reload();
            }}
            style={{ marginTop: '16px', padding: '8px 16px', backgroundColor: '#DC2626', color: '#FFFFFF', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
