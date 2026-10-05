import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by Cargas ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetData = () => {
    try {
      // Clear all cargas keys to prevent persistent crash loops
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('cargas_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    window.location.href = '/';
  };

  private handleTryAgain = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-[400px] w-full flex items-center justify-center p-6"
          dir="rtl"
          id="cargas-error-boundary-fallback"
        >
          <div className="max-w-lg w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {this.props.fallbackTitle || 'حدث تنبيه أثناء معالجة البيانات'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                تم احتواء الخطأ البرمجي بنجاح لمنع توقف التطبيق أو ظهور الشاشة الفارغة. يمكنك إعادة المحاولة أو استعادة البيانات الافتراضية بأمان.
              </p>
              {this.state.error && (
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-[11px] font-mono text-rose-600 dark:text-rose-400 text-left max-h-24 overflow-y-auto" dir="ltr">
                  {this.state.error.message || String(this.state.error)}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleTryAgain}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 transition-colors shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>إعادة المحاولة الآن</span>
              </button>

              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
              >
                <Home className="w-4 h-4" />
                <span>تحديث الصفحة</span>
              </button>

              <button
                onClick={this.handleResetData}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors border border-rose-200 dark:border-rose-800"
                title="استعادة الأصول والبيانات الافتراضية لمنظومة كارجاس"
              >
                <RotateCcw className="w-4 h-4" />
                <span>استعادة البيانات الافتراضية</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
