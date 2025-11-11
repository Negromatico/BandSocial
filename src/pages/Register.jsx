import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Alert } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';

const Register = () => {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      // Crear documento de perfil base en Firestore
      const user = userCredential.user;
      await import('../services/firebase').then(({ db }) =>
        import('firebase/firestore').then(({ doc, setDoc }) =>
          setDoc(doc(db, 'perfiles', user.uid), {
            uid: user.uid,
            email: user.email,
            nombre: '',
            type: 'musico',
            fotoPerfil: '',
            fotos: [],
            videoUrl: '',
            ciudad: null,
            generos: [],
            instrumentos: [],
            buscan: [],
            miembros: '',
            dias: [],
            horarios: [],
            updatedAt: new Date().toISOString(),
          })
        )
      );
      navigate('/membership');
    } catch (err) {
      setError('No se pudo registrar. ¿El correo ya existe?');
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
            <h2 className="login-title">¡Únete a la banda!</h2>
            <p className="login-subtitle">Crea tu cuenta y empieza a conectar con músicos</p>
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
            </Form.Group>

            {error && <Alert variant="danger" className="custom-alert">{error}</Alert>}

            <Button type="submit" className="btn-login">
              Crear cuenta
            </Button>

            <Button
              className="btn-register"
              onClick={() => navigate('/login')}
            >
              Ya tengo cuenta
            </Button>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
