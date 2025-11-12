import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Alert, Row, Col } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGuitar, FaMapMarkerAlt, FaMusic } from 'react-icons/fa';
import Select from 'react-select';
import { instrumentos } from '../data/opciones';
import './Login.css';
import './Register.css';

const generos = [
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'salsa', label: 'Salsa' },
  { value: 'urbano', label: 'Urbano' },
  { value: 'vallenato', label: 'Vallenato' },
  { value: 'cumbia', label: 'Cumbia' },
  { value: 'reggaeton', label: 'Reggaetón' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'clasica', label: 'Clásica' },
  { value: 'metal', label: 'Metal' },
  { value: 'punk', label: 'Punk' },
  { value: 'blues', label: 'Blues' },
  { value: 'folclor', label: 'Folclor' },
  { value: 'andina', label: 'Andina' },
  { value: 'tropical', label: 'Tropical' },
  { value: 'otro', label: 'Otro' },
];

const Register = () => {
  const { register, handleSubmit, control } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [type, setType] = useState('musico');
  const [ciudadesOptions, setCiudadesOptions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('https://api-colombia.com/api/v1/City')
      .then(res => res.json())
      .then(data => {
        const uniqueCitiesMap = new Map();
        data.forEach(city => {
          const key = `${city.name}-${city.department || ''}`;
          if (!uniqueCitiesMap.has(key)) {
            uniqueCitiesMap.set(key, {
              value: city.name,
              label: `${city.name}${city.department ? ` (${city.department})` : ''}`,
              key: city.id || key
            });
          }
        });
        const options = Array.from(uniqueCitiesMap.values());
        setCiudadesOptions(options);
      })
      .catch(() => setCiudadesOptions([]));
  }, []);

  const onSubmit = async (data) => {
    setError('');
    setLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      // Crear perfil completo en Firestore
      await setDoc(doc(db, 'perfiles', user.uid), {
        uid: user.uid,
        email: user.email,
        nombre: data.nombre || '',
        type: type,
        fotoPerfil: '',
        fotos: [],
        videoUrl: '',
        ciudad: data.ciudad || null,
        generos: data.generos || [],
        instrumentos: data.instrumentos || [],
        buscan: data.buscan || [],
        miembros: data.miembros || '',
        descripcion: data.descripcion || '',
        telefono: data.telefono || '',
        seguidores: [],
        siguiendo: [],
        dias: [],
        horarios: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      navigate('/membership');
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
            <h2 className="login-title">¡Únete a la banda!</h2>
            <p className="login-subtitle">
              {step === 1 ? 'Paso 1: Datos de acceso' : 'Paso 2: Completa tu perfil'}
            </p>
            <div className="register-steps">
              <span className={step === 1 ? 'active' : 'completed'}>1</span>
              <div className="step-line"></div>
              <span className={step === 2 ? 'active' : ''}>2</span>
            </div>
          </div>

          <Form onSubmit={handleSubmit(onSubmit)} className="login-form register-form">
            {step === 1 && (
              <>
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

                <Button 
                  type="button" 
                  className="btn-login mb-2"
                  onClick={() => setStep(2)}
                >
                  Continuar
                </Button>
              </>
            )}

            {step === 2 && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Tipo de Perfil</Form.Label>
                  <div className="type-selector">
                    <Button
                      type="button"
                      className={`type-btn ${type === 'musico' ? 'active' : ''}`}
                      onClick={() => setType('musico')}
                    >
                      <FaGuitar /> Músico
                    </Button>
                    <Button
                      type="button"
                      className={`type-btn ${type === 'banda' ? 'active' : ''}`}
                      onClick={() => setType('banda')}
                    >
                      <FaMusic /> Banda
                    </Button>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Nombre {type === 'banda' ? 'de la Banda' : 'Completo'} *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={type === 'banda' ? 'Nombre de tu banda' : 'Tu nombre completo'}
                    {...register('nombre', { required: true })}
                    className="input-with-icon"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Ciudad *</Form.Label>
                  <Controller
                    name="ciudad"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={ciudadesOptions}
                        placeholder="Selecciona tu ciudad"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Géneros Musicales *</Form.Label>
                  <Controller
                    name="generos"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        {...field}
                        options={generos}
                        isMulti
                        placeholder="Selecciona géneros"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    )}
                  />
                </Form.Group>

                {type === 'musico' && (
                  <Form.Group className="mb-3">
                    <Form.Label className="text-white">Instrumentos *</Form.Label>
                    <Controller
                      name="instrumentos"
                      control={control}
                      rules={{ required: true }}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={instrumentos}
                          isMulti
                          placeholder="Selecciona instrumentos"
                          className="react-select-container"
                          classNamePrefix="react-select"
                        />
                      )}
                    />
                  </Form.Group>
                )}

                {type === 'banda' && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">¿Qué buscan?</Form.Label>
                      <Controller
                        name="buscan"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={instrumentos}
                            isMulti
                            placeholder="Ej: Guitarrista, Baterista"
                            className="react-select-container"
                            classNamePrefix="react-select"
                          />
                        )}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="text-white">Número de Miembros</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Ej: 4 miembros"
                        {...register('miembros')}
                        className="input-with-icon"
                      />
                    </Form.Group>
                  </>
                )}

                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Teléfono (opcional)</Form.Label>
                  <Form.Control
                    type="tel"
                    placeholder="Ej: 3001234567"
                    {...register('telefono')}
                    className="input-with-icon"
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="text-white">Descripción (opcional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Cuéntanos sobre ti o tu banda..."
                    {...register('descripcion')}
                    className="input-with-icon"
                  />
                </Form.Group>

                {error && <Alert variant="danger" className="custom-alert">{error}</Alert>}

                <Row>
                  <Col xs={6}>
                    <Button 
                      type="button" 
                      className="btn-register w-100"
                      onClick={() => setStep(1)}
                    >
                      Atrás
                    </Button>
                  </Col>
                  <Col xs={6}>
                    <Button 
                      type="submit" 
                      className="btn-login w-100"
                      disabled={loading}
                    >
                      {loading ? 'Creando...' : 'Crear cuenta'}
                    </Button>
                  </Col>
                </Row>
              </>
            )}

            {step === 1 && (
              <Button
                type="button"
                className="btn-register"
                onClick={() => navigate('/login')}
              >
                Ya tengo cuenta
              </Button>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
