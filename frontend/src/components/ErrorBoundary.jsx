import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('💥 React Error Boundary Caught Error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-xl space-y-5 text-center">
            
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-900 border border-amber-300 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-black text-stone-900">
                Something didn't load smoothly
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                {this.state.error?.message || 'A temporary visual component encountered an issue.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer border border-stone-300"
              >
                <Home className="w-4 h-4" />
                <span>Return Home</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
