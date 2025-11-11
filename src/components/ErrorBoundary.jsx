import React from 'react';
import { FiAlertTriangle, FiRefreshCw, FiHome } from 'react-icons/fi';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Aquí podrías enviar el error a un servicio de tracking como Sentry
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
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
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '500px',
            color: '#1F2937',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
          }} className="animate-scale-in">
            <FiAlertTriangle size={64} color="#EF4444" style={{ marginBottom: '20px' }} />
            <h1 style={{ fontSize: '24px', marginBottom: '16px', color: '#1F2937' }}>
              ¡Oops! Algo salió mal
            </h1>
            <p style={{ color: '#6B7280', marginBottom: '24px', fontSize: '16px' }}>
              Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                marginBottom: '24px',
                textAlign: 'left',
                background: '#F3F4F6',
                padding: '16px',
                borderRadius: '8px',
                fontSize: '12px'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '8px' }}>
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre style={{ overflow: 'auto', fontSize: '11px' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => e.target.style.background = '#7C3AED'}
                onMouseOut={(e) => e.target.style.background = '#8B5CF6'}
              >
                <FiRefreshCw size={18} />
                Recargar página
              </button>
              
              <button
                onClick={this.handleGoHome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: 'white',
                  color: '#8B5CF6',
                  border: '2px solid #8B5CF6',
                  borderRadius: '8px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                  e.target.style.background = '#F3F4F6';
                }}
                onMouseOut={(e) => {
                  e.target.style.background = 'white';
                }}
              >
                <FiHome size={18} />
                Ir al inicio
              </button>
            </div>

            <p style={{ marginTop: '24px', fontSize: '14px', color: '#9CA3AF' }}>
              Si el problema persiste, contáctanos en <a href="mailto:soporte@bandsocial.com" style={{ color: '#8B5CF6', textDecoration: 'none' }}>soporte@bandsocial.com</a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
