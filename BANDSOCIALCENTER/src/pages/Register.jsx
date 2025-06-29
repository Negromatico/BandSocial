import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert } from 'react-bootstrap';

const Register = () => {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setError('');
    try {
      await createUserWithEmailAndPassword(auth, data.email, data.password);
      navigate('/profile');
    } catch (err) {
      setError('No se pudo registrar. ¿El correo ya existe?');
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ minWidth: 350, maxWidth: 400 }} className="shadow p-4">
        <Card.Body>
          <Card.Title className="mb-4 text-center" style={{ color: '#7c3aed' }}>Registrarse</Card.Title>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group className="mb-3">
              <Form.Label>Correo</Form.Label>
              <Form.Control type="email" placeholder="Correo" {...register('email', { required: true })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control type="password" placeholder="Contraseña (mínimo 6 caracteres)" {...register('password', { required: true, minLength: 6 })} />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100">Crear cuenta</Button>
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Register;
