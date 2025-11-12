import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Alert } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/membership');
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSent(false);
    
    if (!resetEmail || !resetEmail.includes('@')) {
      setResetError('Por favor ingresa un correo electrónico válido');
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
      console.log('Correo de recuperación enviado exitosamente a:', resetEmail);
    } catch (err) {
      console.error('Error al enviar correo de recuperación:', err);
      
      let errorMessage = 'No se pudo enviar el correo. ';
      
      switch (err.code) {
        case 'auth/user-not-found':
          errorMessage += 'Este correo no está registrado.';
          break;
        case 'auth/invalid-email':
          errorMessage += 'El formato del correo es inválido.';
          break;
        case 'auth/too-many-requests':
          errorMessage += 'Demasiados intentos. Intenta más tarde.';
          break;
        case 'auth/network-request-failed':
          errorMessage += 'Error de conexión. Verifica tu internet.';
          break;
        default:
          errorMessage += err.message || 'Intenta de nuevo.';
      }
      
      setResetError(errorMessage);
    }
  };

  return (
    <div className="login-container">
      <div className="login-background">
        <h1 className="login-logo-outside">
          <span className="logo-band">BAND</span>
          <span className="logo-social">SOCIAL</span>
        </h1>
        <div className="login-card">
          <div className="login-header">
            <h2 className="login-title">¡Sube al escenario!</h2>
            <p className="login-subtitle">Inicia sesión y conecta con tu audiencia</p>
          </div>

          {!showReset ? (
            <Form onSubmit={handleSubmit(onSubmit)} className="login-form">
              <Form.Group className="mb-3 input-group-custom">
                <div className="input-icon-wrapper">
                  <FaUser className="input-icon" />
                  <Form.Control
                    type="email"
                    placeholder="Correo Electrónico"
                    {...register('email', { required: true })}
                    className="input-with-icon"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-3 input-group-custom">
                <div className="input-icon-wrapper">
                  <FaLock className="input-icon" />
                  <Form.Control
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresar Contraseña"
                    {...register('password', { required: true })}
                    className="input-with-icon"
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

              <div className="text-center mb-3">
                <button
                  type="button"
                  className="forgot-password-link"
                  onClick={() => setShowReset(true)}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {error && <Alert variant="danger" className="custom-alert">{error}</Alert>}

              <Button type="submit" className="btn-login mb-2">
                Inicia sesión
              </Button>

              <Button
                className="btn-register-alt"
                onClick={() => navigate('/register')}
              >
                Regístrate
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleResetPassword} className="login-form">
              <Form.Group className="mb-3">
                <Form.Label className="text-white">Correo para recuperar contraseña</Form.Label>
                <div className="input-icon-wrapper">
                  <FaUser className="input-icon" />
                  <Form.Control
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="Ingresa tu correo"
                    required
                    className="input-with-icon"
                  />
                </div>
              </Form.Group>
              
              <Button type="submit" className="btn-login mb-2">
                Enviar correo de recuperación
              </Button>
              
              {resetSent && (
                <Alert variant="success">
                  <strong>✅ Correo enviado exitosamente</strong>
                  <p className="mb-0 mt-2" style={{ fontSize: '0.9rem' }}>
                    📧 Revisa tu bandeja de entrada<br/>
                    ⚠️ <strong>Si no lo ves, revisa tu carpeta de SPAM</strong><br/>
                    <small>El correo puede tardar hasta 5 minutos en llegar</small>
                  </p>
                </Alert>
              )}
              {resetError && <Alert variant="danger">{resetError}</Alert>}
              
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => setShowReset(false)}
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

export default Login;
