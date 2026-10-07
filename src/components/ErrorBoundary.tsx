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
          <div className="max-w-md w-full casino-vip-card border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-center relative">
            <div className="card-neon-edge" />
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
              <AlertTriangle size={28} />
            </div>
            <h3 className="text-xl font-display font-black text-transparent bg-clip-text bg-gradient-to-b from-[#FFF2CE] via-[#F4D068] to-[#AA7A1E] uppercase tracking-wider mb-2 drop-shadow-[0_2px_12px_rgba(244,208,104,0.3)]">
              Arena Display Recovered
            </h3>
            <p className="text-amber-200/60 text-xs font-mono mb-6">
              A temporary interface glitch was prevented from interrupting your session.
            </p>
            <button
              onClick={this.handleReset}
              className="btn-marquee-gold w-full py-3.5 text-slate-950 font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-tactile cursor-pointer flex items-center justify-center gap-2"
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
