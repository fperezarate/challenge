 "use client";

import React from "react";

type ErrorBoundaryProps = {
  children: React.ReactNode;
  /**
   * Fallback UI opcional completamente personalizada.
   * Si se pasa, se ignoran title/message.
   */
  fallback?: React.ReactNode;
  /**
   * Título mostrado en el fallback por defecto.
   */
  title?: string;
  /**
   * Mensaje mostrado en el fallback por defecto.
   */
  message?: string;
  /**
   * Texto del botón de reintento en el fallback por defecto.
   */
  retryLabel?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // Aquí se podría integrar un servicio de logging real (Sentry, etc.)
    // eslint-disable-next-line no-console
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    const {
      title = "Algo salió mal",
      message = "Hemos encontrado un problema al mostrar esta sección. Intenta nuevamente o recarga la página.",
      retryLabel = "Reintentar",
    } = this.props;

    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <div className="max-w-md rounded-xl border border-border bg-card px-6 py-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            {title}
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            {message}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={this.handleRetry}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {retryLabel}
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2"
            >
              Recargar página
            </button>
          </div>
        </div>
      </div>
    );
  }
}

type WithErrorBoundaryOptions = Omit<
  ErrorBoundaryProps,
  "children" | "fallback"
> & {
  /**
   * Fallback completamente personalizado para este HOC.
   */
  fallback?: React.ReactNode;
  /**
   * Nombre de la sección para fines de depuración.
   */
  displayName?: string;
};

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {},
): React.ComponentType<P> {
  const {
    fallback,
    title = "Algo salió mal en esta sección",
    message = "Ocurrió un error inesperado al renderizar el contenido.",
    retryLabel = "Reintentar",
    displayName,
  } = options;

  const ComponentWithBoundary: React.FC<P> = (props) => (
    <ErrorBoundary
      fallback={fallback}
      title={title}
      message={message}
      retryLabel={retryLabel}
    >
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithBoundary.displayName =
    displayName ||
    `WithErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || "Anonymous"})`;

  return ComponentWithBoundary;
}

