import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import UploadMedia from './UploadMedia';
import HorariosField from './HorariosField';
import { Card, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaEdit, FaUser, FaUsers, FaMapMarkerAlt, FaMusic, FaCalendar, FaGuitar, FaVideo, FaCamera } from 'react-icons/fa';
import './ProfileForm.css';

// Opciones predefinidas
// Las ciudades se cargarán dinámicamente desde la API de Colombia
// Declarar esta lógica DENTRO del componente ProfileForm, no aquí.
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
  { value: 'otro', label: 'Otro (especificar)' },
];
import { instrumentos } from '../data/opciones';
// El selector de días ahora está en HorariosField.jsx

const ProfileForm = ({ defaultType = 'musico', onSubmit, defaultValues = {} }) => {
  // Ciudades de Colombia (hook correcto)
  const [ciudadesOptions, setCiudadesOptions] = React.useState([]);
  React.useEffect(() => {
    fetch('https://api-colombia.com/api/v1/City')
      .then(res => res.json())
      .then(data => {
        // Eliminar duplicados usando Map con ID único
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
  // Inicialización robusta de todos los states
  const [type, setType] = useState(defaultValues.type || defaultType); // musico | banda
  const [fotoPerfil, setFotoPerfil] = useState(defaultValues.fotoPerfil || '');
  const [videoUrl, setVideoUrl] = useState(defaultValues.videoUrl || '');
  const [fotos, setFotos] = useState(defaultValues.fotos || []); // array de urls

  const { control, handleSubmit, register, reset, setValue, watch } = useForm({ defaultValues });

  // Pre-cargar datos si defaultValues cambia
  React.useEffect(() => {
    if (defaultValues) {
      setType(defaultValues.type || defaultType);
      setFotoPerfil(defaultValues.fotoPerfil || '');
      setVideoUrl(defaultValues.videoUrl || '');
      setFotos(defaultValues.fotos || []);
      reset({
        ...defaultValues,
        ciudad: defaultValues.ciudad || null,
        generos: defaultValues.generos || [],
        dias: defaultValues.dias || [],
        instrumentos: defaultValues.instrumentos || [],
        miembros: defaultValues.miembros || '',
        buscan: defaultValues.buscan || [],
        horarios: defaultValues.horarios || [],
        fotoPerfil: defaultValues.fotoPerfil || '',
        videoUrl: defaultValues.videoUrl || '',
        fotos: defaultValues.fotos || [],
      });
      // Sincroniza el valor de fotoPerfil con el form
      setValue('fotoPerfil', defaultValues.fotoPerfil || '');
    }
  }, [defaultValues, reset, defaultType, setValue]);

  // Manejo de subida de fotos (máx 5)
  const handleFotoUpload = (url) => {
    setFotos((prev) => (prev.length < 5 ? [...prev, url] : prev));
  };
  const handleRemoveFoto = (idx) => {
    setFotos((prev) => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="profile-form-container">
      <Card className="profile-form-card">
        <div className="profile-form-header">
          <div className="header-content">
            <div className="header-icon">
              <FaEdit />
            </div>
            <div className="header-text">
              <h2>Editar Perfil</h2>
              <Badge bg="primary" className="profile-type-badge">
                {type === 'musico' ? <><FaUser className="me-1" /> Músico</> : <><FaUsers className="me-1" /> Banda</>}
              </Badge>
            </div>
          </div>
        </div>
        <Card.Body className="profile-form-body">
          <Form
            onSubmit={handleSubmit((data) => {
              onSubmit && onSubmit({ ...data, type, videoUrl, fotos });
            })}
          >
            <Form.Group className="mb-3">
              <Form.Label className="form-label-modern">
                Nombre {type === 'banda' ? 'de la banda' : 'del músico'}
              </Form.Label>
              <Form.Control
                {...register('nombre', { required: true })}
                placeholder={type === 'banda' ? 'Nombre de la banda o músico' : 'Nombre de la banda o músico'}
                maxLength={40}
                autoComplete="off"
                className="modern-input"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-modern">
                Tipo de Perfil
              </Form.Label>
              <Select
                value={type === 'musico' ? { value: 'musico', label: 'Músico' } : { value: 'banda', label: 'Banda' }}
                onChange={(opt) => setType(opt.value)}
                options={[
                  { value: 'musico', label: 'Músico' },
                  { value: 'banda', label: 'Banda' },
                ]}
                isSearchable={false}
              />
            </Form.Group>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label-modern">
                  Ciudad
                </Form.Label>
                <Controller
                  name="ciudad"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={ciudadesOptions} isClearable isSearchable placeholder="Selecciona ciudad o municipio" />
                  )}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="form-label-modern">
                  Géneros musicales
                </Form.Label>
                <Controller
                  name="generos"
                  control={control}
                  render={({ field }) => (
                    <>
                      <Select {...field} options={generos} isMulti placeholder="Selecciona géneros" />
                      {Array.isArray(field.value) && field.value.some(opt => opt.value === 'otro') && (
                        <Form.Control className="mt-2" placeholder="Especifica el género musical" {...register('otroGenero', { required: false })} />
                      )}
                    </>
                  )}
                />
              </Col>
            </Row>
            <Row>
              {type === 'musico' && (
                <>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label-modern">
                      Días disponibles
                    </Form.Label>
                    <Controller
                      name="dias"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} options={[
                          { value: 'lunes', label: 'Lunes' },
                          { value: 'martes', label: 'Martes' },
                          { value: 'miercoles', label: 'Miércoles' },
                          { value: 'jueves', label: 'Jueves' },
                          { value: 'viernes', label: 'Viernes' },
                          { value: 'sabado', label: 'Sábado' },
                          { value: 'domingo', label: 'Domingo' },
                        ]} isMulti />
                      )}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label-modern">
                      Instrumentos
                    </Form.Label>
                    <Controller
                      name="instrumentos"
                      control={control}
                      render={({ field }) => (
                        <>
                          <Select {...field} options={instrumentos} isMulti placeholder="Selecciona instrumentos" />
                          {Array.isArray(field.value) && field.value.some(opt => opt.value === 'otro') && (
                            <Form.Control className="mt-2" placeholder="Especifica el instrumento" {...register('otroInstrumento', { required: false })} />
                          )}
                        </>
                      )}
                    />
                  </Col>
                </>
              )}
            </Row>
            {type === 'banda' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label className="form-label-modern">
                    Miembros (roles/instrumentos)
                  </Form.Label>
                  <Form.Control {...register('miembros')} placeholder="Ej: Juan - Guitarra, Ana - Voz" className="modern-input" />
                </Form.Group>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label-modern">
                      ¿Qué buscan? (instrumentos)
                    </Form.Label>
                    <Controller
                      name="buscan"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} options={instrumentos} isMulti />
                      )}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label className="form-label-modern">
                      Horarios requeridos
                    </Form.Label>
                    <HorariosField control={control} register={register} setValue={setValue} watch={watch} />
                  </Col>
                </Row>
              </>
            )}
            <Form.Group className="mb-3">
              <Form.Label className="form-label-modern">
                Video de presentación (máx 10s)
              </Form.Label>
              <UploadMedia
                type="video"
                maxDuration={10}
                onUpload={setVideoUrl}
                folder="videos"
              />
              {videoUrl && (
                <div className="d-flex align-items-center gap-2 mt-2">
                  <div className="text-success small">Video subido ✔️</div>
                  <Button size="sm" variant="outline-danger" onClick={() => setVideoUrl('')}>Eliminar video</Button>
                </div>
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="form-label-modern">
                Fotos (máx 5)
              </Form.Label>
              {fotos.length < 5 && (
                <UploadMedia
                  type="image"
                  onUpload={handleFotoUpload}
                  folder="fotos"
                />
              )}
              <div className="d-flex gap-2 flex-wrap mt-2">
                {fotos.map((url, idx) => (
                  <div key={idx} style={{ position: 'relative' }}>
                    <img src={url} alt="foto" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 4, border: '2px solid #a78bfa' }} />
                    <Button size="sm" variant="danger" style={{ position: 'absolute', top: 0, right: 0, borderRadius: '50%', padding: '2px 6px', fontSize: 12 }} onClick={() => handleRemoveFoto(idx)}>
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            </Form.Group>
            <div className="d-grid mt-4">
              <Button type="submit" className="save-profile-btn" size="lg">
                Guardar Cambios
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfileForm;
