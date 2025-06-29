import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import UploadMedia from './UploadMedia';
import { Card, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';

// Opciones predefinidas
const ciudades = [
  { value: 'bogota', label: 'Bogotá' },
  { value: 'medellin', label: 'Medellín' },
  { value: 'cali', label: 'Cali' },
  { value: 'barranquilla', label: 'Barranquilla' },
  { value: 'otra', label: 'Otra' },
];
const generos = [
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'salsa', label: 'Salsa' },
  { value: 'urbano', label: 'Urbano' },
  { value: 'otro', label: 'Otro' },
];
const instrumentos = [
  { value: 'guitarra', label: 'Guitarra' },
  { value: 'bajo', label: 'Bajo' },
  { value: 'bateria', label: 'Batería' },
  { value: 'voz', label: 'Voz' },
  { value: 'teclado', label: 'Teclado' },
  { value: 'otro', label: 'Otro' },
];
const dias = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

const ProfileForm = ({ defaultType = 'musico', onSubmit, defaultValues = {} }) => {
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
    <div className="d-flex justify-content-center align-items-center py-4" style={{ minHeight: 'unset' }}>
      <Card style={{ minWidth: 350, maxWidth: 600, width: '100%', background: '#f8f5ff', border: '1.5px solid #a78bfa' }} className="shadow p-4">
        <Card.Body>
          <Card.Title className="mb-4 text-center" style={{ color: '#7c3aed', fontWeight: 700, fontSize: 26, letterSpacing: 1 }}>
            <span>Editar Perfil</span> <Badge bg="secondary">{type === 'musico' ? 'Músico' : 'Banda'}</Badge>
          </Card.Title>
          <Form
            onSubmit={handleSubmit((data) => {
              onSubmit && onSubmit({ ...data, type, videoUrl, fotos });
            })}
          >
            <Form.Group className="mb-3">
              <Form.Label>Nombre {type === 'banda' ? 'de la banda' : 'del músico'}</Form.Label>
              <Form.Control
                {...register('nombre', { required: true })}
                placeholder={type === 'banda' ? 'Nombre de la banda' : 'Nombre completo'}
                maxLength={40}
                autoComplete="off"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Tipo de perfil</Form.Label>
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
                <Form.Label>Ciudad</Form.Label>
                <Controller
                  name="ciudad"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={ciudades} />
                  )}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Géneros musicales</Form.Label>
                <Controller
                  name="generos"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={generos} isMulti />
                  )}
                />
              </Col>
            </Row>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label>Días disponibles</Form.Label>
                <Controller
                  name="dias"
                  control={control}
                  render={({ field }) => (
                    <Select {...field} options={dias} isMulti />
                  )}
                />
              </Col>
              {type === 'musico' && (
                <Col md={6} className="mb-3">
                  <Form.Label>Instrumentos</Form.Label>
                  <Controller
                    name="instrumentos"
                    control={control}
                    render={({ field }) => (
                      <Select {...field} options={instrumentos} isMulti />
                    )}
                  />
                </Col>
              )}
            </Row>
            {type === 'banda' && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Miembros (roles/instrumentos)</Form.Label>
                  <Form.Control {...register('miembros')} placeholder="Ej: Juan - Guitarra, Ana - Voz" />
                </Form.Group>
                <Row>
                  <Col md={6} className="mb-3">
                    <Form.Label>¿Qué buscan? (instrumentos)</Form.Label>
                    <Controller
                      name="buscan"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} options={instrumentos} isMulti />
                      )}
                    />
                  </Col>
                  <Col md={6} className="mb-3">
                    <Form.Label>Horarios requeridos</Form.Label>
                    <Controller
                      name="horarios"
                      control={control}
                      render={({ field }) => (
                        <Select {...field} options={dias} isMulti />
                      )}
                    />
                  </Col>
                </Row>
              </>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Video de presentación (máx 10s)</Form.Label>
              <UploadMedia
                type="video"
                maxDuration={10}
                onUpload={setVideoUrl}
                folder="videos"
              />
              {videoUrl && <div className="text-success small">Video subido ✔️</div>}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fotos (máx 5)</Form.Label>
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
              <Button type="submit" variant="primary" size="lg">
                Guardar perfil
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfileForm;
