import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { getBackendUrl } from '../services/apiConfig';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    try {
      const url = `${getBackendUrl()}/api/log-error`;
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error?.message || 'Unknown error',
          stack: error?.stack,
          componentStack: errorInfo?.componentStack,
        }),
      }).catch(() => {});
    } catch (_) {}
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="w-full h-full flex-1 min-h-0 casino-table-bg flex items-center justify-center p-4 text-slate-100 select-none">
          <div className="max-w-md w-full bg-[#12151E] border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-2">
              Arena Display Recovered
            </h3>
            <p className="text-slate-400 text-xs font-mono mb-6">
              A temporary interface glitch was prevented from interrupting your session.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-tactile cursor-pointer flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} />
              <span>RECONNECT ARENA TABLE</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
