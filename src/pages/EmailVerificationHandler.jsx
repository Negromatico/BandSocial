import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Container, Card, Spinner, Button } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const EmailVerificationHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleVerification = async () => {
      const mode = searchParams.get('mode');
      const oobCode = searchParams.get('oobCode');

      // Verificar que sea una acción de verificación de email
      if (mode !== 'verifyEmail' || !oobCode) {
        setStatus('error');
        setMessage('Enlace de verificación inválido o expirado.');
        return;
      }

      try {
        // Aplicar el código de verificación
        await applyActionCode(auth, oobCode);
        
        setStatus('success');
        setMessage('¡Tu correo electrónico ha sido verificado exitosamente!');
        
        // Redirigir al perfil después de 3 segundos
        setTimeout(() => {
          navigate('/profile');
        }, 3000);
      } catch (error) {
        console.error('Error al verificar email:', error);
        setStatus('error');
        
        if (error.code === 'auth/invalid-action-code') {
          setMessage('El enlace de verificación ha expirado o ya fue utilizado.');
        } else if (error.code === 'auth/expired-action-code') {
          setMessage('El enlace de verificación ha expirado. Por favor, solicita uno nuevo.');
        } else {
          setMessage('Error al verificar el correo. Por favor, intenta de nuevo.');
        }
      }
    };

    handleVerification();
  }, [searchParams, navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      padding: '20px'
    }}>
      <Container style={{ maxWidth: '600px' }}>
        <Card style={{
          borderRadius: '20px',
          border: 'none',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden'
        }}>
          <Card.Body style={{ padding: '60px 40px', textAlign: 'center' }}>
            {status === 'loading' && (
              <>
                <Spinner 
                  animation="border" 
                  style={{ 
                    width: '80px', 
                    height: '80px',
                    color: '#6366f1',
                    marginBottom: '30px'
                  }} 
                />
                <h2 style={{ 
                  fontSize: '28px', 
                  fontWeight: 700,
                  color: '#1f2937',
                  marginBottom: '15px'
                }}>
                  Verificando tu correo...
                </h2>
                <p style={{ 
                  fontSize: '16px',
                  color: '#6b7280',
                  lineHeight: '1.6'
                }}>
                  Por favor espera mientras verificamos tu dirección de correo electrónico.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 30px',
                  animation: 'scaleIn 0.5s ease-out'
                }}>
                  <FaCheckCircle size={50} color="white" />
                </div>
                <h2 style={{ 
                  fontSize: '32px', 
                  fontWeight: 700,
                  color: '#10b981',
                  marginBottom: '20px'
                }}>
                  ¡Verificación Exitosa!
                </h2>
                <p style={{ 
                  fontSize: '18px',
                  color: '#1f2937',
                  lineHeight: '1.6',
                  marginBottom: '10px'
                }}>
                  {message}
                </p>
                <p style={{ 
                  fontSize: '15px',
                  color: '#6b7280',
                  marginBottom: '30px'
                }}>
                  Serás redirigido a tu perfil en unos segundos...
                </p>
                <Button
                  onClick={() => navigate('/profile')}
                  style={{
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    border: 'none',
                    borderRadius: '10px',
                    padding: '12px 40px',
                    fontSize: '16px',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    transition: 'transform 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  Ir a mi perfil ahora
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 30px'
                }}>
                  <FaTimesCircle size={50} color="white" />
                </div>
                <h2 style={{ 
                  fontSize: '32px', 
                  fontWeight: 700,
                  color: '#ef4444',
                  marginBottom: '20px'
                }}>
                  Error de Verificación
                </h2>
                <p style={{ 
                  fontSize: '18px',
                  color: '#1f2937',
                  lineHeight: '1.6',
                  marginBottom: '30px'
                }}>
                  {message}
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="outline-secondary"
                    onClick={() => navigate('/login')}
                    style={{
                      borderRadius: '10px',
                      padding: '12px 30px',
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    Ir a Inicio de Sesión
                  </Button>
                  <Button
                    onClick={() => navigate('/profile')}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '12px 30px',
                      fontSize: '16px',
                      fontWeight: 600
                    }}
                  >
                    Solicitar nuevo enlace
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </Container>

      <style>{`
        @keyframes scaleIn {
          from {
            transform: scale(0);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default EmailVerificationHandler;
