import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Button, Form, Alert, Row, Col, ProgressBar, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaGuitar, FaMapMarkerAlt, FaMusic, FaCamera, FaInstagram, FaYoutube, FaSpotify, FaSoundcloud, FaInfoCircle, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Select from 'react-select';
import { instrumentos } from '../data/opciones';
import { uploadToCloudinary } from '../services/cloudinary';
import logo from '../assets/logo.png';
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
  const { register, handleSubmit, control, watch } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);
  const [type, setType] = useState('musico');
  const [ciudadesOptions, setCiudadesOptions] = useState([]);
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [fotoPreview, setFotoPreview] = useState('');
  const [uploadingFoto, setUploadingFoto] = useState(false);
  const [emailValid, setEmailValid] = useState(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  // Watch para validaciones en tiempo real
  const emailValue = watch('email');
  const passwordValue = watch('password');
  const nombreValue = watch('nombre');
  const ciudadValue = watch('ciudad');
  const generosValue = watch('generos');
  const instrumentosValue = watch('instrumentos');

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

  // Validación de email en tiempo real
  useEffect(() => {
    if (emailValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      setEmailValid(emailRegex.test(emailValue));
    } else {
      setEmailValid(null);
    }
  }, [emailValue]);

  // Calcular fuerza de contraseña
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

  // Calcular progreso del formulario
  useEffect(() => {
    if (step === 2) {
      let completed = 0;
      let total = type === 'musico' ? 5 : 6;
      
      if (nombreValue) completed++;
      if (ciudadValue) completed++;
      if (generosValue && generosValue.length > 0) completed++;
      if (type === 'musico' && instrumentosValue && instrumentosValue.length > 0) completed++;
      if (type === 'banda') {
        completed++; // buscan es opcional
        total--;
      }
      if (fotoPerfil) completed++;
      
      setProgress((completed / total) * 100);
    }
  }, [step, nombreValue, ciudadValue, generosValue, instrumentosValue, fotoPerfil, type]);

  // Subir foto de perfil
  const handleFotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setFotoPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setUploadingFoto(true);
    try {
      const url = await uploadToCloudinary(file, 'Bandas', 'perfiles');
      setFotoPerfil(url);
    } catch (err) {
      console.error('Error subiendo foto:', err);
      setError('Error al subir la foto. Intenta de nuevo.');
    } finally {
      setUploadingFoto(false);
    }
  };

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
      
      // Crear perfil completo en Firestore
      await setDoc(doc(db, 'perfiles', user.uid), {
        uid: user.uid,
        email: user.email,
        nombre: data.nombre || '',
        type: type,
        fotoPerfil: fotoPerfil || '',
        fotos: [],
        videoUrl: '',
        ciudad: data.ciudad || null,
        generos: data.generos || [],
        instrumentos: data.instrumentos || [],
        buscan: data.buscan || [],
        miembros: data.miembros || '',
        descripcion: data.descripcion || '',
        telefono: data.telefono || '',
        redesSociales: {
          spotify: data.spotify || '',
          soundcloud: data.soundcloud || '',
        },
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
            <img src={logo} alt="BandSocial" className="login-logo" />
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
                      className={`input-with-icon ${emailValid === true ? 'is-valid' : emailValid === false ? 'is-invalid' : ''}`}
                    />
                    {emailValid === true && <FaCheckCircle className="validation-icon valid" />}
                    {emailValid === false && <FaTimesCircle className="validation-icon invalid" />}
                  </div>
                  {emailValid === false && (
                    <small className="text-danger">Ingresa un correo válido</small>
                  )}
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
              </>
            )}

            {step === 2 && (
              <>
                {/* Barra de progreso */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-white fw-bold">Progreso del perfil</small>
                    <small className="text-white">{Math.round(progress)}%</small>
                  </div>
                  <ProgressBar 
                    now={progress} 
                    variant="success"
                    style={{ height: '8px', borderRadius: '10px' }}
                  />
                </div>

                {/* Foto de perfil */}
                <Form.Group className="mb-4 text-center">
                  <Form.Label className="text-white d-flex align-items-center justify-content-center gap-2">
                    Foto de Perfil (Recomendado)
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Una foto ayuda a que otros músicos te reconozcan</Tooltip>}
                    >
                      <FaInfoCircle style={{ cursor: 'pointer', fontSize: '14px' }} />
                    </OverlayTrigger>
                  </Form.Label>
                  <div className="foto-upload-container">
                    {fotoPreview || fotoPerfil ? (
                      <div className="foto-preview">
                        <img src={fotoPreview || fotoPerfil} alt="Preview" />
                        <button
                          type="button"
                          className="foto-remove"
                          onClick={() => {
                            setFotoPerfil('');
                            setFotoPreview('');
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <label className="foto-upload-label">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFotoUpload}
                          style={{ display: 'none' }}
                        />
                        <div className="foto-upload-placeholder">
                          {uploadingFoto ? (
                            <div className="spinner-border text-light" role="status">
                              <span className="visually-hidden">Subiendo...</span>
                            </div>
                          ) : (
                            <>
                              <FaCamera size={30} />
                              <small>Click para subir foto</small>
                            </>
                          )}
                        </div>
                      </label>
                    )}
                  </div>
                </Form.Group>

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

                {/* Redes Sociales */}
                <div className="redes-sociales-section mb-3">
                  <Form.Label className="text-white d-flex align-items-center gap-2 mb-3">
                    <FaMusic /> Redes Sociales (Opcional)
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Comparte tus redes para que otros puedan escuchar tu música</Tooltip>}
                    >
                      <FaInfoCircle style={{ cursor: 'pointer', fontSize: '14px' }} />
                    </OverlayTrigger>
                  </Form.Label>
                  
                  <Row>
                    <Col md={6} className="mb-2">
                      <div className="social-input-wrapper">
                        <FaSpotify className="social-icon spotify" />
                        <Form.Control
                          type="text"
                          placeholder="Artista en Spotify"
                          {...register('spotify')}
                          className="input-with-social-icon"
                        />
                      </div>
                    </Col>
                    <Col md={6} className="mb-2">
                      <div className="social-input-wrapper">
                        <FaSoundcloud className="social-icon soundcloud" />
                        <Form.Control
                          type="text"
                          placeholder="Usuario de SoundCloud"
                          {...register('soundcloud')}
                          className="input-with-social-icon"
                        />
                      </div>
                    </Col>
                  </Row>
                </div>

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
              <div className="d-flex gap-3">
                <Button 
                  type="button" 
                  className="btn-login flex-fill"
                  onClick={() => setStep(2)}
                  disabled={!emailValid || passwordStrength < 25}
                >
                  Continuar
                </Button>
                <Button
                  type="button"
                  className="btn-register flex-fill"
                  onClick={() => navigate('/login')}
                >
                  Ya tengo cuenta
                </Button>
              </div>
            )}
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
