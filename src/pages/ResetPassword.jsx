import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import { auth } from '../services/firebase';
import { Button, Form, Alert } from 'react-bootstrap';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import './Login.css';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [email, setEmail] = useState('');
  const [oobCode, setOobCode] = useState('');

  useEffect(() => {
    const code = searchParams.get('oobCode');
    
    if (!code) {
      setError('Enlace inválido o expirado');
      setValidating(false);
      return;
    }

    setOobCode(code);

    // Verificar que el código sea válido
    verifyPasswordResetCode(auth, code)
      .then((email) => {
        setEmail(email);
        setValidating(false);
      })
      .catch((err) => {
        console.error('Error verificando código:', err);
        setError('Este enlace ha expirado o es inválido. Solicita uno nuevo.');
        setValidating(false);
      });
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess(true);
      
      // Redirigir al login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      console.error('Error al restablecer contraseña:', err);
      
      let errorMessage = 'No se pudo restablecer la contraseña. ';
      
      switch (err.code) {
        case 'auth/expired-action-code':
          errorMessage += 'Este enlace ha expirado. Solicita uno nuevo.';
          break;
        case 'auth/invalid-action-code':
          errorMessage += 'Este enlace es inválido o ya fue usado.';
          break;
        case 'auth/weak-password':
          errorMessage += 'La contraseña es muy débil.';
          break;
        default:
          errorMessage += err.message || 'Intenta de nuevo.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="login-container">
        <div className="login-background">
          <h1 className="login-logo-outside">
            <span className="logo-band">BAND</span>
            <span className="logo-social">SOCIAL</span>
          </h1>
          <div className="login-card">
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
              <p className="mt-3 text-white">Verificando enlace...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="login-container">
        <div className="login-background">
          <h1 className="login-logo-outside">
            <span className="logo-band">BAND</span>
            <span className="logo-social">SOCIAL</span>
          </h1>
          <div className="login-card">
            <div className="text-center py-5">
              <FaCheckCircle size={80} color="#28a745" className="mb-4" />
              <h2 className="text-white mb-3">¡Contraseña actualizada!</h2>
              <p className="text-white-50">
                Tu contraseña ha sido restablecida exitosamente.
              </p>
              <p className="text-white-50">
                Redirigiendo al inicio de sesión...
              </p>
              <div className="spinner-border spinner-border-sm text-light mt-3" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-background">
        <h1 className="login-logo-outside">
          <span className="logo-band">BAND</span>
          <span className="logo-social">SOCIAL</span>
        </h1>
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">Restablecer Contraseña</h2>
            <p className="login-subtitle">
              {email ? `Para: ${email}` : 'Crea tu nueva contraseña'}
            </p>
          </div>

          {error ? (
            <div className="text-center py-4">
              <Alert variant="danger" className="custom-alert">
                {error}
              </Alert>
              <Button
                className="btn-login mt-3"
                onClick={() => navigate('/login')}
              >
                Volver al inicio de sesión
              </Button>
            </div>
          ) : (
            <Form onSubmit={handleSubmit} className="login-form">
              <Form.Group className="mb-3 input-group-custom">
                <Form.Label className="text-white mb-2">Nueva Contraseña</Form.Label>
                <div className="input-icon-wrapper">
                  <FaLock className="input-icon" />
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="input-with-icon"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </Form.Group>

              <Form.Group className="mb-4 input-group-custom">
                <Form.Label className="text-white mb-2">Confirmar Contraseña</Form.Label>
                <div className="input-icon-wrapper">
                  <FaLock className="input-icon" />
                  <Form.Control
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="input-with-icon"
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </Form.Group>

              <Button 
                type="submit" 
                className="btn-login mb-3"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Actualizando...
                  </>
                ) : (
                  'Restablecer Contraseña'
                )}
              </Button>

              <button
                type="button"
                className="forgot-password-link"
                onClick={() => navigate('/login')}
              >
                Volver al inicio de sesión
              </button>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
