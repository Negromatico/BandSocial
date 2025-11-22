import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaCrown, FaCheck, FaTimes } from 'react-icons/fa';

const UpgradePremiumModal = ({ show, onHide, limitType = 'publicaciones' }) => {
  const navigate = useNavigate();

  const handleUpgrade = () => {
    onHide();
    navigate('/membership');
  };

  const getLimitMessage = () => {
    switch (limitType) {
      case 'publicaciones':
        return {
          title: '¡Has alcanzado el límite de publicaciones!',
          description: 'Tu plan Estándar permite 1 publicación. Actualiza a Premium para publicar sin límites.',
          icon: ''
        };
      case 'productos':
        return {
          title: '¡Has alcanzado el límite de productos!',
          description: 'Tu plan Estándar permite 1 producto en MusicMarket. Actualiza a Premium para vender sin límites.',
          icon: ''
        };
      case 'eventos':
        return {
          title: '¡Has alcanzado el límite de eventos!',
          description: 'Tu plan Estándar permite 1 evento. Actualiza a Premium para crear eventos sin límites.',
          icon: ''
        };
      default:
        return {
          title: '¡Has alcanzado el límite!',
          description: 'Actualiza a Premium para disfrutar de funciones ilimitadas.',
          icon: ''
        };
    }
  };

  const message = getLimitMessage();

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Body className="p-0" style={{ overflow: 'hidden', borderRadius: '12px' }}>
        {/* Header con gradiente */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '40px 30px',
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '10px' }}>{message.icon}</div>
          <h2 style={{ fontWeight: '700', marginBottom: '10px', fontSize: '1.8rem' }}>
            {message.title}
          </h2>
          <p style={{ fontSize: '1.1rem', opacity: 0.95, marginBottom: 0 }}>
            {message.description}
          </p>
        </div>

        {/* Comparación de planes */}
        <div style={{ padding: '30px' }}>
          <div className="row g-3">
            {/* Plan Free */}
            <div className="col-md-6">
              <div style={{
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                height: '100%',
                background: '#f9fafb'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <h4 style={{ color: '#6b7280', fontWeight: '600', marginBottom: '5px' }}>
                    Plan Free
                  </h4>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#9ca3af' }}>
                    GRATIS
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheck style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    <span style={{ color: '#6b7280' }}>5 mensajes por día</span>
                  </li>
                  <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheck style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    <span style={{ color: '#6b7280' }}>20 mensajes en chat/día</span>
                  </li>
                  <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheck style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    <span style={{ color: '#6b7280' }}>1 publicación por día</span>
                  </li>
                  <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheck style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    <span style={{ color: '#6b7280' }}>1 evento por día</span>
                  </li>
                  <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaTimes style={{ color: '#ef4444', fontSize: '1.2rem' }} />
                    <span style={{ color: '#6b7280' }}>Reacciones ilimitadas</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Plan Premium */}
            <div className="col-md-6">
              <div style={{
                border: '3px solid #667eea',
                borderRadius: '12px',
                padding: '20px',
                height: '100%',
                background: 'linear-gradient(135deg, #f3f0fa 0%, #ede9fe 100%)',
                position: 'relative',
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  right: '20px',
                  background: '#fbbf24',
                  color: '#78350f',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  <FaCrown /> RECOMENDADO
                </div>
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <h4 style={{ color: '#667eea', fontWeight: '700', marginBottom: '5px' }}>
                    Plan Premium
                  </h4>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: '#667eea' }}>
                    $29.990
                    <span style={{ fontSize: '1rem', fontWeight: '400', color: '#6b7280' }}> COP/mes</span>
                  </div>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheck style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    <span style={{ color: '#1f2937', fontWeight: '500' }}>Mensajes ilimitados</span>
                  </li>
                  <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheck style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    <span style={{ color: '#1f2937', fontWeight: '500' }}>Chat ilimitado</span>
                  </li>
                  <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheck style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    <span style={{ color: '#1f2937', fontWeight: '500' }}>Publicaciones ilimitadas</span>
                  </li>
                  <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheck style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    <span style={{ color: '#1f2937', fontWeight: '500' }}>Eventos ilimitados</span>
                  </li>
                  <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheck style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    <span style={{ color: '#1f2937', fontWeight: '500' }}>Comentarios ilimitados</span>
                  </li>
                  <li style={{ padding: '8px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FaCheck style={{ color: '#10b981', fontSize: '1.2rem' }} />
                    <span style={{ color: '#1f2937', fontWeight: '500' }}>Reacciones ilimitadas</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="d-flex gap-3 mt-4">
            <Button
              variant="outline-secondary"
              onClick={onHide}
              style={{
                flex: 1,
                padding: '12px',
                fontWeight: '600',
                borderRadius: '8px'
              }}
            >
              Tal vez después
            </Button>
            <Button
              onClick={handleUpgrade}
              style={{
                flex: 2,
                padding: '12px',
                fontWeight: '700',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                fontSize: '1.1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <FaCrown /> Actualizar a Premium
            </Button>
          </div>

          {/* Garantía */}
          <div style={{
            textAlign: 'center',
            marginTop: '20px',
            padding: '15px',
            background: '#f0fdf4',
            borderRadius: '8px',
            border: '1px solid #86efac'
          }}>
            <p style={{ margin: 0, color: '#166534', fontSize: '0.9rem', fontWeight: '500' }}>
              ✨ Cancela cuando quieras • Sin compromisos • Soporte 24/7
            </p>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default UpgradePremiumModal;
