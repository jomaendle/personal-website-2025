"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error | undefined;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // In development, log the error for debugging
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="mx-auto max-w-md p-6 text-center">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-destructive">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm font-medium">
                  Error details (development only)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-destructive">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
          <Button
            onClick={() => {
              this.setState({ hasError: false, error: undefined });
              window.location.reload();
            }}
            variant="outline"
          >
            Refresh page
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export function withErrorBoundary<T extends object>(
  Component: React.ComponentType<T>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: T) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Hook for handling async errors in components
export function useErrorHandler() {
  const [, setState] = React.useState();
  
  return React.useCallback((error: Error) => {
    setState(() => {
      throw error;
    });
  }, []);
}