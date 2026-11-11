import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary] Error capturado en la aplicación:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/';
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light p-3">
          <div
            className="card shadow-sm border-0 text-center p-4 p-md-5"
            style={{ maxWidth: '520px', borderRadius: '16px' }}
          >
            <div
              className="d-inline-flex align-items-center justify-content-center bg-danger-subtle text-danger rounded-circle mx-auto mb-3"
              style={{ width: '72px', height: '72px' }}
            >
              <i className="bi bi-exclamation-triangle-fill fs-2"></i>
            </div>

            <h3 className="fw-bold text-dark mb-2">¡Ups! Algo no salió como esperábamos</h3>
            <p className="text-secondary mb-4 small">
              Ocurrió un problema inesperado al cargar esta sección. Hemos evitado que la aplicación
              se detenga por completo.
            </p>

            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 py-2"
                onClick={this.handleReset}
              >
                <i className="bi bi-house-door me-1"></i> Ir al Inicio
              </button>
              <button
                type="button"
                className="btn btn-success px-4 py-2"
                style={{ backgroundColor: '#0f765e', borderColor: '#0f765e' }}
                onClick={this.handleReload}
              >
                <i className="bi bi-arrow-clockwise me-1"></i> Recargar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
