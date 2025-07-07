import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert } from 'react-bootstrap';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState('');
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, data.email, data.password);
      navigate('/profile');
    } catch (err) {
      setError('Correo o contraseña incorrectos');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSent(false);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSent(true);
    } catch (err) {
      setResetError('No se pudo enviar el correo. ¿El correo está registrado?');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ minWidth: 350, maxWidth: 400 }} className="shadow p-4">
        <Card.Body>
          <Card.Title className="mb-4 text-center" style={{ color: '#7c3aed' }}>Iniciar sesión</Card.Title>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Correo</Form.Label>
              <Form.Control type="email" placeholder="Correo" {...register('email', { required: true })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" placeholder="Contraseña" {...register('password', { required: true })} />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">Entrar</Button>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Form>
          <Button variant="secondary" className="w-100 mt-3" onClick={() => {
            localStorage.setItem('guest', 'true');
            navigate('/');
          }}>
            Entrar como invitado
          </Button>
          <div className="text-center mt-3">
            <button className="btn btn-link p-0" style={{color: '#7c3aed'}} onClick={() => setShowReset(true)}>
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          {showReset && (
            <Form onSubmit={handleResetPassword} className="mt-3">
              <Form.Group className="mb-2">
                <Form.Label>Correo para recuperar contraseña</Form.Label>
                <Form.Control
                  type="email"
                  value={resetEmail}
                  onChange={e => setResetEmail(e.target.value)}
                  placeholder="Ingresa tu correo"
                  required
                />
              </Form.Group>
              <Button type="submit" variant="secondary" className="w-100 mb-2">Enviar correo de recuperación</Button>
              {resetSent && <Alert variant="success">Correo enviado. Revisa tu bandeja de entrada.</Alert>}
              {resetError && <Alert variant="danger">{resetError}</Alert>}
              <div className="text-center">
                <button type="button" className="btn btn-link p-0" onClick={() => setShowReset(false)}>
                  Cancelar
                </button>
              </div>
            </Form>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;
