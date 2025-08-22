'use client';

import React, { Component, ReactNode } from 'react';

interface ShaderErrorBoundaryState {
  hasError: boolean;
  errorInfo: string | null;
}

interface ShaderErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

class ShaderErrorBoundary extends Component<ShaderErrorBoundaryProps, ShaderErrorBoundaryState> {
  constructor(props: ShaderErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ShaderErrorBoundaryState {
    // Update state to trigger fallback UI
    return {
      hasError: true,
      errorInfo: error.message
    };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error for debugging
    console.warn('Shader Error Boundary caught an error:', error, errorInfo);
    
    // Call optional error handler
    this.props.onError?.(error, errorInfo);

    // Check if it's a WebGL-related error
    const isWebGLError = 
      error.message.includes('WebGL') ||
      error.message.includes('canvas') ||
      error.message.includes('shader') ||
      error.message.includes('context');

    if (isWebGLError) {
      // Store in sessionStorage to prevent repeated attempts
      try {
        sessionStorage.setItem('webgl-disabled', 'true');
      } catch {
        // SessionStorage might not be available
      }
    }
  }

  override render() {
    if (this.state.hasError) {
      // Render fallback UI
      return this.props.fallback || (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-black via-slate-900 to-slate-800 opacity-60"
          style={{
            background: `
              radial-gradient(circle at 20% 50%, rgba(87, 63, 105, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(61, 89, 120, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 40% 80%, rgba(26, 26, 26, 0.8) 0%, transparent 50%),
              linear-gradient(135deg, #000000 0%, #1a1a1a 100%)
            `
          }}
        />
      );
    }

    return this.props.children;
  }
}

export { ShaderErrorBoundary };