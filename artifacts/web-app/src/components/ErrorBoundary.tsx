import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Generic error boundary that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the broken component tree.
 *
 * Usage:
 *   <ErrorBoundary fallback={<div>Something went wrong.</div>}> <GenerateSP /> </ErrorBoundary>
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service.
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const { hasError } = this.state;
    const { fallback, children } = this.props;
    if (hasError) {
      return fallback ?? (
        <div style={{ padding: "32px", textAlign: "center", color: "var(--text)" }}>
          <h2>Une erreur s’est produite.</h2>
          <p>Veuillez réessayer ou contacter le support.</p>
        </div>
      );
    }
    return children;
  }
}
