import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword, sendEmailVerification, signOut } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Alert, ProgressBar, Modal } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './Login.css';

const Register = () => {
  const { register, handleSubmit, watch } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  const passwordValue = watch('password');

  useEffect(() => {
    if (passwordValue) {
      let strength = 0;
      if (passwordValue.length >= 6) strength += 25;
      if (passwordValue.length >= 8) strength += 25;
      if (/[A-Z]/.test(passwordValue)) strength += 25;
      if (/[0-9]/.test(passwordValue)) strength += 25;
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(0);
    }
  }, [passwordValue]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'danger';
    if (passwordStrength < 75) return 'warning';
    return 'success';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 50) return 'Débil';
    if (passwordStrength < 75) return 'Media';
    return 'Fuerte';
  };

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      // Configurar el enlace de verificación
      const actionCodeSettings = {
        url: window.location.origin + '/__/auth/action',
        handleCodeInApp: false
      };
      
      // Enviar email de verificación con la configuración correcta
      await sendEmailVerification(user, actionCodeSettings);
      
      await setDoc(doc(db, 'perfiles', user.uid), {
        uid: user.uid,
        email: user.email,
        nombre: '',
        type: 'musico',
        fotoPerfil: '',
        fotos: [],
        videoUrl: '',
        ciudad: '',
        departamento: '',
        municipio: '',
        generos: [],
        instrumentos: [],
        buscan: [],
        miembros: '',
        descripcion: '',
        telefono: '',
        redesSociales: {
          spotify: '',
          soundcloud: '',
        },
        seguidores: [],
        siguiendo: [],
        dias: [],
        horarios: [],
        planActual: 'free',
        membershipPlan: 'free',
        perfilCompletado: false,
        emailVerified: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      // Cerrar sesión para que el usuario no quede autenticado
      await signOut(auth);
      
      // Mostrar mensaje de verificación
      setError('');
      setUserEmail(user.email);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error al registrar:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo ya está registrado');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres');
      } else {
        setError('No se pudo registrar. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
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
            <img src={logo} alt="BandSocial" className="login-logo" />
            <h2 className="login-title">¡Únete a la banda!</h2>
            <p className="login-subtitle">Crea tu cuenta y conecta con músicos</p>
          </div>

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
                  placeholder="Contraseña (mínimo 6 caracteres)"
                  {...register('password', { required: true, minLength: 6 })}
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
              {passwordValue && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <small className="text-white">Seguridad:</small>
                    <small className={`text-${getPasswordStrengthColor()}`}>
                      {getPasswordStrengthText()}
                    </small>
                  </div>
                  <ProgressBar 
                    now={passwordStrength} 
                    variant={getPasswordStrengthColor()}
                    style={{ height: '5px' }}
                  />
                </div>
              )}
            </Form.Group>

            {error && <Alert variant="danger" className="custom-alert">{error}</Alert>}

            <Button type="submit" className="btn-login mb-2" disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Regístrate'}
            </Button>

            <Button
              className="btn-register-alt"
              onClick={() => navigate('/login')}
            >
              Ya tengo cuenta
            </Button>
          </Form>
        </div>
      </div>

      {/* Modal de Éxito */}
      <Modal 
        show={showSuccessModal} 
        onHide={() => {
          setShowSuccessModal(false);
          navigate('/');
        }}
        centered
        backdrop="static"
        className="modern-modal"
      >
        <Modal.Body className="text-center p-5" style={{
          background: 'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(75, 0, 130, 0.1) 100%)',
          backdropFilter: 'blur(10px)',
          borderRadius: '15px',
          border: '1px solid rgba(138, 43, 226, 0.3)'
        }}>
          <div className="mb-4">
            <FaCheckCircle size={80} style={{ color: '#8a2be2' }} />
          </div>
          <h3 style={{ color: '#8a2be2', fontWeight: 'bold', marginBottom: '20px' }}>
            ¡Cuenta creada exitosamente!
          </h3>
          <div className="mb-4" style={{
            background: 'rgba(138, 43, 226, 0.1)',
            padding: '20px',
            borderRadius: '10px',
            border: '1px solid rgba(138, 43, 226, 0.2)'
          }}>
            <FaEnvelope size={30} style={{ color: '#8a2be2', marginBottom: '10px' }} />
            <p style={{ color: 'var(--text-primary)', marginBottom: '10px' }}>
              Hemos enviado un correo de verificación a:
            </p>
            <p style={{ 
              color: '#8a2be2', 
              fontWeight: 'bold',
              fontSize: '1.1rem',
              wordBreak: 'break-word'
            }}>
              {userEmail}
            </p>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Por favor, verifica tu correo antes de iniciar sesión.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '30px' }}>
            Una vez verificado, podrás iniciar sesión y completar tu perfil.
          </p>
          <Button 
            onClick={() => {
              setShowSuccessModal(false);
              navigate('/');
            }}
            style={{
              background: 'linear-gradient(135deg, #8a2be2 0%, #4b0082 100%)',
              border: 'none',
              padding: '12px 40px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              borderRadius: '25px',
              boxShadow: '0 4px 15px rgba(138, 43, 226, 0.4)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(138, 43, 226, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(138, 43, 226, 0.4)';
            }}
          >
            Continuar
          </Button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Register;
