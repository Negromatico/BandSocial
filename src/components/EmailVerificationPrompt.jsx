import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { FaEnvelope, FaCheckCircle, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const EmailVerificationPrompt = ({ user, onVerified }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleResendEmail = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await sendEmailVerification(user);
      setMessage('¡Correo de verificación reenviado! Revisa tu bandeja de entrada.');
    } catch (err) {
      console.error('Error al reenviar email:', err);
      setError('No se pudo reenviar el correo. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    
    try {
      await user.reload();
      if (user.emailVerified) {
        setMessage('¡Email verificado exitosamente!');
        setTimeout(() => {
          onVerified();
        }, 1500);
      } else {
        setError('Tu email aún no ha sido verificado. Por favor, revisa tu correo y haz clic en el enlace de verificación.');
      }
    } catch (err) {
      console.error('Error al verificar:', err);
      setError('Error al verificar el estado. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      setError('Error al cerrar sesión. Intenta de nuevo.');
    }
  };

  return (
    <Modal 
      show={true} 
      backdrop="static" 
      keyboard={false}
      centered
      className="verification-modal"
    >
      <Modal.Header style={{ 
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        color: 'white',
        borderRadius: '12px 12px 0 0',
        border: 'none',
        padding: '20px'
      }}>
        <Modal.Title style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          fontSize: '20px',
          fontWeight: 700
        }}>
          <FaEnvelope size={24} />
          Verifica tu correo electrónico
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ padding: '30px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <FaEnvelope size={64} style={{ color: '#6366f1', marginBottom: '20px' }} />
          <h5 style={{ marginBottom: '15px', fontWeight: 600 }}>
            Hemos enviado un correo de verificación a:
          </h5>
          <p style={{ 
            fontSize: '16px', 
            color: '#6366f1', 
            fontWeight: 600,
            marginBottom: '20px'
          }}>
            {user?.email}
          </p>
          <p style={{ color: '#6b7280', fontSize: '15px', lineHeight: '1.6' }}>
            Por favor, revisa tu bandeja de entrada y haz clic en el enlace de verificación para activar tu cuenta.
          </p>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '10px' }}>
            Si no ves el correo, revisa tu carpeta de spam o correo no deseado.
          </p>
        </div>

        {message && (
          <Alert variant="success" className="d-flex align-items-center gap-2">
            <FaCheckCircle /> {message}
          </Alert>
        )}
        
        {error && (
          <Alert variant="warning">
            {error}
          </Alert>
        )}
      </Modal.Body>
      <Modal.Footer style={{ 
        borderTop: '1px solid #e5e7eb',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', width: '100%' }}>
          <Button 
            variant="outline-secondary"
            onClick={handleResendEmail}
            disabled={loading}
            style={{
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 600
            }}
          >
            {loading ? 'Reenviando...' : 'Reenviar correo'}
          </Button>
          <Button 
            variant="primary"
            onClick={handleCheckVerification}
            disabled={loading}
            style={{
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: 600,
              background: '#6366f1',
              border: 'none'
            }}
          >
            {loading ? 'Verificando...' : 'Ya verifiqué mi correo'}
          </Button>
        </div>
        <Button 
          variant="outline-danger"
          onClick={handleLogout}
          disabled={loading}
          style={{
            borderRadius: '8px',
            padding: '10px 20px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%'
          }}
        >
          <FaSignOutAlt />
          Cerrar sesión
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EmailVerificationPrompt;
