import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import UploadMedia from './UploadMedia';
import HorariosField from './HorariosField';
import { Card, Button, Form, Row, Col, Alert, Badge } from 'react-bootstrap';

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
const instrumentos = [
  { value: 'guitarra', label: 'Guitarra' },
  { value: 'bajo', label: 'Bajo' },
  { value: 'bateria', label: 'Batería' },
  { value: 'voz', label: 'Voz' },
  { value: 'teclado', label: 'Teclado' },
  { value: 'saxofon', label: 'Saxofón' },
  { value: 'trompeta', label: 'Trompeta' },
  { value: 'trombon', label: 'Trombón' },
  { value: 'clarinete', label: 'Clarinete' },
  { value: 'flauta', label: 'Flauta' },
  { value: 'violin', label: 'Violín' },
  { value: 'violonchelo', label: 'Violonchelo' },
  { value: 'contrabajo', label: 'Contrabajo' },
  { value: 'arpa', label: 'Arpa' },
  { value: 'marimba', label: 'Marimba' },
  { value: 'acordeon', label: 'Acordeón' },
  { value: 'percusion', label: 'Percusión' },
  { value: 'gaita', label: 'Gaita' },
  { value: 'tiple', label: 'Tiple' },
  { value: 'requinto', label: 'Requinto' },
  { value: 'bandola', label: 'Bandola' },
  { value: 'charango', label: 'Charango' },
  { value: 'cuatro', label: 'Cuatro' },
  { value: 'ukelele', label: 'Ukelele' },
  { value: 'armonica', label: 'Armónica' },
  { value: 'otro', label: 'Otro (especificar)' },
];
// El selector de días ahora está en HorariosField.jsx

const ProfileForm = ({ defaultType = 'musico', onSubmit, defaultValues = {} }) => {
  // Ciudades de Colombia (hook correcto)
  const [ciudadesOptions, setCiudadesOptions] = React.useState([]);
  React.useEffect(() => {
    fetch('https://api-colombia.com/api/v1/City')
      .then(res => res.json())
      .then(data => {
        const options = data.map(city => ({ value: city.name, label: city.name }));
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
                    <Select {...field} options={ciudadesOptions} isClearable isSearchable placeholder="Selecciona ciudad o municipio" />
                  )}
                />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label>Géneros musicales</Form.Label>
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
                    <Form.Label>Días disponibles</Form.Label>
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
                    <Form.Label>Instrumentos</Form.Label>
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
                    <HorariosField control={control} register={register} setValue={setValue} watch={watch} />
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
              {videoUrl && (
                <div className="d-flex align-items-center gap-2 mt-2">
                  <div className="text-success small">Video subido ✔️</div>
                  <Button size="sm" variant="outline-danger" onClick={() => setVideoUrl('')}>Eliminar video</Button>
                </div>
              )}
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
