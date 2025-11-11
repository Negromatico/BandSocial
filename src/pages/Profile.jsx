import React, { useState, useEffect, useRef } from 'react';
import { db, auth } from '../services/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Container, Modal, Button } from 'react-bootstrap';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../services/cloudinary';
import { instrumentos } from '../data/opciones';

const Profile = () => {
  const [showEditAllModal, setShowEditAllModal] = useState(false);
  const [editAllDraft, setEditAllDraft] = useState({});
  const [editAllStatus, setEditAllStatus] = useState('');
  const [user, setUser] = useState(auth.currentUser);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [status, setStatus] = useState('');
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFotoModal, setShowFotoModal] = useState(false);
  const [showVerFoto, setShowVerFoto] = useState(false);
  const [editField, setEditField] = useState(null);
  const [fieldDraft, setFieldDraft] = useState('');
  const [editBio, setEditBio] = useState(false);
  const [bioDraft, setBioDraft] = useState('');
  const [showGaleriaModal, setShowGaleriaModal] = useState(false);
  const [galeriaFiles, setGaleriaFiles] = useState([]);
  const [galeriaUploading, setGaleriaUploading] = useState(false);
  const [galeriaStatus, setGaleriaStatus] = useState('');
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (showEditAllModal) setEditAllDraft({
      nombre: initialValues?.nombre || '',
      ciudad: initialValues?.ciudad || '',
      bio: initialValues?.bio || '',
      videoUrl: initialValues?.videoUrl || '',
      generos: Array.isArray(initialValues?.generos) ? initialValues.generos : [],
      instrumentos: Array.isArray(initialValues?.instrumentos) ? initialValues.instrumentos : [],
      miembros: initialValues?.miembros || '',
      dias: (initialValues?.dias || []).join(', '),
      horarios: (initialValues?.horarios || []).join(', '),
      buscan: (initialValues?.buscan || []).join(', '),
    });
    setEditAllStatus('');
  }, [showEditAllModal, initialValues]);

  // Guardar todos los campos del modal de edición general
const handleEditAllSave = (e) => {
  e.preventDefault();
  setEditAllStatus('Actualizando...');
  const camposArray = [
    'generos', 'instrumentos', 'dias', 'horarios', 'buscan'
  ];
  const data = { ...editAllDraft };
  for (const campo of camposArray) {
    if (campo === 'instrumentos' && Array.isArray(data[campo])) {
      data[campo] = data[campo].map(s => (typeof s === 'string' ? s.trim() : s)).filter(Boolean);
    } else {
      data[campo] = (data[campo] || '').split(',').map(s => s.trim()).filter(Boolean);
    }
  }
  if (!data.nombre.trim()) {
    setEditAllStatus('⚠️ El nombre no puede estar vacío.');
    return;
  }
  if (!data.bio.trim()) {
    setEditAllStatus('⚠️ La biografía no puede estar vacía.');
    return;
  }
  setDoc(doc(db, 'perfiles', user.uid), {
    ...initialValues,
    ...data,
    uid: user.uid,
    email: user.email,
    updatedAt: new Date().toISOString(),
  })
    .then(() => {
      setInitialValues(prev => ({ ...prev, ...data }));
      setShowEditAllModal(false);
      setEditAllStatus('');
      setStatus('✅ Perfil actualizado correctamente.');
    })
    .catch(err => {
      setEditAllStatus('❌ Error actualizando perfil: ' + (err.message || err.toString()));
    });
}

// Manejar selección de archivos para galería
  const handleGaleriaUpload = (e) => {
    setGaleriaStatus('');
    setGaleriaFiles(Array.from(e.target.files || []));
  };

  // Subir archivos a Cloudinary y guardar en Firestore
  const handleGuardarGaleria = async () => {
    if (!galeriaFiles.length) {
      setGaleriaStatus('⚠️ Debes seleccionar al menos un archivo.');
      return;
    }
    setGaleriaUploading(true);
    setGaleriaStatus('Subiendo archivos...');
    try {
      const urls = [];
      for (const file of galeriaFiles) {
        const url = await uploadToCloudinary(file);
        urls.push(url);
      }
      const nuevasFotos = [...(initialValues.fotos || []), ...urls];
      await setDoc(doc(db, 'perfiles', user.uid), {
        ...initialValues,
        fotos: nuevasFotos,
        uid: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString(),
      });
      setInitialValues(prev => ({ ...prev, fotos: nuevasFotos }));
      setGaleriaFiles([]);
      setGaleriaStatus('✅ Archivos subidos y guardados en tu galería.');
    } catch (err) {
      setGaleriaStatus('❌ Error subiendo archivos: ' + (err.message || err.toString()));
    } finally {
      setGaleriaUploading(false);
    }
  };


  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) setShowAuthModal(true);
    else setShowAuthModal(false);
  }, [user]);

  const cleanProfileData = (data) => {
    const cleaned = { ...data };
    const arrayFields = ['generos', 'dias', 'instrumentos', 'buscan', 'horarios', 'fotos'];
    arrayFields.forEach(f => {
      if (cleaned[f] === undefined) cleaned[f] = [];
    });
    if (cleaned.ciudad === undefined) cleaned.ciudad = '';
    if (cleaned.videoUrl === undefined) cleaned.videoUrl = '';
    if (cleaned.miembros === undefined) cleaned.miembros = '';
    return cleaned;
  };

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const docRef = doc(db, 'perfiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setInitialValues(cleanProfileData(docSnap.data()));
      } else {
        setInitialValues(cleanProfileData({}));
      }
    } catch (err) {
      setStatus('❌ Error cargando perfil. Intenta recargar la página o revisar tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, [user]);

  const saveField = async (field) => {
    if (!user) return;
    // Validación básica de campos vacíos
    if ((typeof fieldDraft === 'string' && fieldDraft.trim() === '') || (Array.isArray(fieldDraft) && fieldDraft.length === 0)) {
      setStatus('⚠️ El campo no puede estar vacío.');
      return;
    }
    setStatus('Actualizando...');
    let value = fieldDraft;
    if (["generos", "instrumentos", "buscan", "horarios", "dias", "fotos"].includes(field)) {
      value = fieldDraft.split(',').map(s => s.trim()).filter(Boolean);
      if (value.length === 0) {
        setStatus('⚠️ Debes ingresar al menos un elemento.');
        return;
      }
    }
    try {
      await setDoc(doc(db, 'perfiles', user.uid), {
        ...initialValues,
        [field]: value,
        uid: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString(),
      });
      setInitialValues(prev => ({ ...prev, [field]: value }));
      setEditField(null);
      setStatus('✅ Campo actualizado correctamente.');
    } catch (err) {
      if (err.code === 'permission-denied') {
        setStatus('❌ No tienes permisos para editar este campo.');
      } else if (err.message && err.message.includes('network')) {
        setStatus('❌ Error de red. Revisa tu conexión a internet.');
      } else {
        setStatus('❌ Error actualizando campo: ' + (err.message || err.toString()));
      }
    }
  };

  const cancelField = () => {
    setEditField(null);
    setFieldDraft('');
  };

  const saveBio = async () => {
    if (!user) return;
    if (!bioDraft || bioDraft.trim() === '') {
      setStatus('⚠️ La biografía no puede estar vacía.');
      return;
    }
    setStatus('Actualizando...');
    try {
      await setDoc(doc(db, 'perfiles', user.uid), {
        ...initialValues,
        bio: bioDraft,
        uid: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString(),
      });
      setInitialValues(prev => ({ ...prev, bio: bioDraft }));
      setEditBio(false);
      setStatus('✅ Biografía actualizada correctamente.');
    } catch (err) {
      if (err.code === 'permission-denied') {
        setStatus('❌ No tienes permisos para editar la biografía.');
      } else if (err.message && err.message.includes('network')) {
        setStatus('❌ Error de red. Revisa tu conexión a internet.');
      } else {
        setStatus('❌ Error actualizando biografía: ' + (err.message || err.toString()));
      }
    }
  };

  const cancelBio = () => {
    setEditBio(false);
    setBioDraft(initialValues?.bio || '');
  };

  const handleChangeFoto = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setStatus('Subiendo foto...');
    try {
      const url = await uploadToCloudinary(file);
      await setDoc(doc(db, 'perfiles', user.uid), {
        ...initialValues,
        fotoPerfil: url,
        uid: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString(),
      });
      setInitialValues(prev => ({ ...prev, fotoPerfil: url }));
      fetchProfile();
      setStatus('✅ Foto de perfil actualizada correctamente.');
    } catch (err) {
      if (err.code === 'permission-denied') {
        setStatus('❌ No tienes permisos para subir la foto.');
      } else if (err.message && err.message.includes('network')) {
        setStatus('❌ Error de red. Revisa tu conexión a internet.');
      } else {
        setStatus('❌ Error subiendo foto: ' + (err.message || err.toString()));
      }
    }
  };

  if (loading) return (
    <Container fluid style={{ padding: '32px 0', background: 'linear-gradient(120deg, #f3f0fa 60%, #ede9fe 100%)', minHeight: '100vh' }}>
      <div className="text-center">Cargando...</div>
    </Container>
  );

  return (
    <>
      <Modal show={showAuthModal} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center p-5">
          <h4 className="mb-3" style={{ color: '#7c3aed' }}>¡Bienvenido a BandSocial!</h4>
          <p>Debes iniciar sesión o registrarte para editar tu perfil.</p>
          <div className="d-flex gap-3 justify-content-center mt-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/login')}>Iniciar sesión</Button>
            <Button variant="outline-primary" size="lg" onClick={() => navigate('/register')}>Registrarse</Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal para edición general de perfil */}
      <Modal show={showEditAllModal} onHide={() => setShowEditAllModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Editar perfil completo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEditAllSave}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={editAllDraft.nombre || ''} onChange={e => setEditAllDraft(d => ({...d, nombre: e.target.value}))} />
            </div>
            <div className="mb-3">
              <label className="form-label">Ciudad</label>
              <input className="form-control" value={editAllDraft.ciudad || ''} onChange={e => setEditAllDraft(d => ({...d, ciudad: e.target.value}))} />
            </div>
            <div className="mb-3">
              <label className="form-label">Biografía</label>
              <textarea className="form-control" value={editAllDraft.bio || ''} onChange={e => setEditAllDraft(d => ({...d, bio: e.target.value}))} />
            </div>
            <div className="mb-3">
              <label className="form-label">Video (URL o archivo)</label>
              <div className="d-flex gap-2 align-items-center">
                <input className="form-control" style={{ flex: 1 }} value={editAllDraft.videoUrl || ''} onChange={e => setEditAllDraft(d => ({...d, videoUrl: e.target.value}))} placeholder="Pega la URL de tu video o súbelo" />
                <input type="file" accept="video/*" style={{ maxWidth: 180 }} onChange={async e => {
                  const file = e.target.files[0];
                  if (!file) return;
                  setEditAllStatus('Subiendo video...');
                  try {
                    const url = await uploadToCloudinary(file);
                    setEditAllDraft(d => ({...d, videoUrl: url}));
                    setEditAllStatus('✅ Video subido');
                  } catch (err) {
                    setEditAllStatus('❌ Error subiendo video: ' + (err.message || err.toString()));
                  }
                }} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Géneros</label>
              <Select
                isMulti
                options={[
                  { value: 'rock', label: 'Rock' },
                  { value: 'pop', label: 'Pop' },
                  { value: 'jazz', label: 'Jazz' },
                  { value: 'blues', label: 'Blues' },
                  { value: 'reggae', label: 'Reggae' },
                  { value: 'salsa', label: 'Salsa' },
                  { value: 'cumbia', label: 'Cumbia' },
                  { value: 'norteño', label: 'Norteño' },
                  { value: 'banda', label: 'Banda' },
                  { value: 'tropical', label: 'Tropical' },
                  { value: 'otro', label: 'Otro (especificar)' }
                ]}
                value={Array.isArray(editAllDraft.generos)
                  ? [
                      { value: 'rock', label: 'Rock' },
                      { value: 'pop', label: 'Pop' },
                      { value: 'jazz', label: 'Jazz' },
                      { value: 'blues', label: 'Blues' },
                      { value: 'reggae', label: 'Reggae' },
                      { value: 'salsa', label: 'Salsa' },
                      { value: 'cumbia', label: 'Cumbia' },
                      { value: 'norteño', label: 'Norteño' },
                      { value: 'banda', label: 'Banda' },
                      { value: 'tropical', label: 'Tropical' },
                      { value: 'otro', label: 'Otro (especificar)' }
                    ].filter(opt => editAllDraft.generos.includes(opt.value))
                  : []}
                onChange={opts => setEditAllDraft(d => ({
                  ...d,
                  generos: opts.map(opt => opt.value)
                }))}
                placeholder="Selecciona géneros musicales"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Instrumentos</label>
              <Select
                isMulti
                options={instrumentos}
                value={Array.isArray(editAllDraft.instrumentos)
                  ? instrumentos.filter(opt => editAllDraft.instrumentos.includes(opt.value))
                  : []}
                onChange={opts => setEditAllDraft(d => ({
                  ...d,
                  instrumentos: opts.map(opt => opt.value)
                }))}
                placeholder="Selecciona instrumentos"
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Miembros</label>
              <input className="form-control" value={editAllDraft.miembros || ''} onChange={e => setEditAllDraft(d => ({...d, miembros: e.target.value}))} />
            </div>
            <div className="mb-3">
              <label className="form-label">Días (separados por coma)</label>
              <input className="form-control" value={editAllDraft.dias || ''} onChange={e => setEditAllDraft(d => ({...d, dias: e.target.value}))} />
            </div>
            <div className="mb-3">
              <label className="form-label">Horarios (separados por coma)</label>
              <input className="form-control" value={editAllDraft.horarios || ''} onChange={e => setEditAllDraft(d => ({...d, horarios: e.target.value}))} />
            </div>
            <div className="mb-3">
              <label className="form-label">Buscan (separados por coma)</label>
              <input className="form-control" value={editAllDraft.buscan || ''} onChange={e => setEditAllDraft(d => ({...d, buscan: e.target.value}))} />
            </div>
            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowEditAllModal(false)}>Cancelar</Button>
              <Button type="submit" variant="success">Guardar cambios</Button>
            </div>
            <div className="mt-2" style={{ minHeight: 24 }}>{editAllStatus}</div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Modal para ver/cambiar foto de perfil */}
      <Modal show={showFotoModal} onHide={() => setShowFotoModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Foto de perfil</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <Button variant="outline-primary" className="mb-3 w-100" onClick={() => setShowVerFoto(true)}>Ver foto de perfil</Button>
          <Button variant="outline-secondary" className="mb-3 w-100" onClick={() => fileInputRef.current.click()}>Cambiar foto de perfil</Button>
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleChangeFoto} />
        </Modal.Body>
      </Modal>

      {/* Modal para ver la foto en grande */}
      <Modal show={showVerFoto} onHide={() => setShowVerFoto(false)} centered>
        <Modal.Body className="text-center p-0" style={{ background: '#000' }}>
          {initialValues?.fotoPerfil ? (
            <img src={initialValues.fotoPerfil} alt="avatar" style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', margin: '0 auto' }} />
          ) : (
            <span style={{ fontSize: 80, color: '#fff', lineHeight: '90px' }}>🎵</span>
          )}
        </Modal.Body>
      </Modal>

      {user && (
        <Container fluid className="p-0" style={{ maxWidth: 900, margin: '0 auto', marginTop: 24, background: '#fff', borderRadius: 18, boxShadow: '0 4px 24px #0001', border: '1px solid #ede9fe', overflow: 'hidden' }}>
          {/* Portada estilo Facebook */}
          <div style={{ position: 'relative', width: '100%', height: 220, background: '#ede9fe', overflow: 'hidden' }}>
            <Button
              size="sm"
              variant="light"
              style={{ position: 'absolute', top: 12, right: 12, zIndex: 2, fontWeight: 500, border: '1px solid #ddd' }}
              onClick={() => document.getElementById('input-portada').click()}
            >
              Cambiar portada
            </Button>
            <input
              type="file"
              id="input-portada"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                setStatus('Subiendo portada...');
                try {
                  const url = await uploadToCloudinary(file, 'Bandas', 'portadas');
                  await setDoc(doc(db, 'perfiles', user.uid), {
                    ...initialValues,
                    fotoPortada: url,
                    uid: user.uid,
                    email: user.email,
                    updatedAt: new Date().toISOString(),
                  });
                  setInitialValues(prev => ({ ...prev, fotoPortada: url }));
                  setStatus('Portada actualizada ✔️');
                } catch (err) {
                  setStatus('Error subiendo portada: ' + (err.message || err.toString()));
                }
              }}
            />
            {/* Avatar superpuesto */}
            <div
              style={{
                position: 'absolute',
                left: 32,
                bottom: -48,
                width: 110,
                height: 110,
                borderRadius: '50%',
                boxShadow: '0 0 0 6px #fff',
                background: '#a78bfa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                border: '2px solid #ede9fe',
                cursor: 'pointer',
                zIndex: 3
              }}
              onClick={() => setShowFotoModal(true)}
            >
              {initialValues?.fotoPerfil ? (
                <img
                  src={initialValues.fotoPerfil}
                  alt="Avatar"
                  style={{
                    width: 124,
                    height: 124,
                    borderRadius: '50%',
                    border: '5px solid #fff',
                    boxShadow: '0 2px 12px #7c3aed33',
                    objectFit: 'contain',
                    background: '#fff',
                    position: 'relative',
                    zIndex: 2,
                    overflow: 'hidden',
                    display: 'block',
                  }}
                  onClick={() => setShowFotoModal(true)}
                />
              ) : (
                <span style={{ fontSize: 48, color: '#fff', lineHeight: '110px' }}>🎵</span>
              )}
            </div>
          </div>
          {/* Info principal y botones */}
          <div style={{ padding: '64px 24px 16px 24px', position: 'relative', minHeight: 120 }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap">
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#7c3aed', lineHeight: 1 }}>{initialValues?.nombre ? initialValues.nombre : 'Mi perfil'}</div>
                {/* Biografía editable inline */}
                <div style={{ fontSize: 16, color: '#444', marginTop: 2, fontWeight: 400, minHeight: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editBio ? (
                    <>
                      <input
                        type="text"
                        value={bioDraft}
                        maxLength={120}
                        autoFocus
                        style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px', width: 240 }}
                        onChange={e => setBioDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveBio(); if (e.key === 'Escape') cancelBio(); }}
                      />
                      <Button size="sm" variant="success" onClick={saveBio}>Guardar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelBio}>Cancelar</Button>
                    </>
                  ) : (
                    <>
                      <span>{initialValues?.bio || '¡Personaliza tu biografía!'}</span>
                      <Button size="sm" variant="link" style={{ color: '#7c3aed', textDecoration: 'underline', fontWeight: 500 }} onClick={() => { setEditBio(true); setBioDraft(initialValues?.bio || ''); }}>Editar</Button>
                    </>
                  )}
                </div>
                <span className="badge bg-secondary mt-2" style={{ fontSize: 15 }}>{initialValues?.type === 'banda' ? 'Banda' : 'Músico'}</span>
              </div>
              <div className="d-flex flex-column flex-md-row gap-2 mt-3 mt-md-0">
                <Button variant="outline-primary" onClick={() => setShowEditAllModal(true)}>Editar perfil</Button>
                <Button
                  variant={initialValues?.disponible ? 'success' : 'secondary'}
                  onClick={async () => {
                    const newDisponible = !initialValues?.disponible;
                    await setDoc(doc(db, 'perfiles', user.uid), {
                      ...initialValues,
                      disponible: newDisponible,
                      uid: user.uid,
                      email: user.email,
                      updatedAt: new Date().toISOString(),
                    });
                    setInitialValues(prev => ({ ...prev, disponible: newDisponible }));
                  }}
                >
                  {initialValues?.disponible ? 'Disponible' : 'No disponible'}
                </Button>
              </div>
            </div>
            <div className="row g-3 mt-2 mb-4 px-3">
              {/* Nombre */}
              <div className="col-md-6">
                <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Nombre
                    <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => { setEditField('nombre'); setFieldDraft(initialValues?.nombre || ''); }}>
                      <i className="bi bi-pencil" style={{ fontSize: 17 }} />
                    </span>
                  </div>
                  {editField === 'nombre' ? (
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <input type="text" value={fieldDraft} maxLength={40} autoFocus style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px', width: 180 }}
                        onChange={e => setFieldDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveField('nombre'); if (e.key === 'Escape') cancelField(); }}
                      />
                      <Button size="sm" variant="success" onClick={() => saveField('nombre')}>Guardar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelField}>Cancelar</Button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: '#222', marginTop: 2 }}>{initialValues?.nombre || <span className="text-muted">No especificado</span>}</div>
                  )}
                </div>
              </div>
              {/* Tipo de perfil */}
              <div className="col-md-6">
                <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Tipo de perfil
                    <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => { setEditField('type'); setFieldDraft(initialValues?.type || 'musico'); }}>
                      <i className="bi bi-pencil" style={{ fontSize: 17 }} />
                    </span>
                  </div>
                  {editField === 'type' ? (
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <select value={fieldDraft} onChange={e => setFieldDraft(e.target.value)} style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px' }}>
                        <option value="musico">Músico</option>
                        <option value="banda">Banda</option>
                      </select>
                      <Button size="sm" variant="success" onClick={() => saveField('type')}>Guardar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelField}>Cancelar</Button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: '#222', marginTop: 2 }}>{initialValues?.type === 'banda' ? 'Banda' : 'Músico'}</div>
                  )}
                </div>
              </div>
              {/* Ciudad */}
              <div className="col-md-6">
                <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Ciudad
                    <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => { setEditField('ciudad'); setFieldDraft(initialValues?.ciudad || ''); }}>
                      <i className="bi bi-pencil" style={{ fontSize: 17 }} />
                    </span>
                  </div>
                  {editField === 'ciudad' ? (
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <input type="text" value={fieldDraft} maxLength={40} autoFocus style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px', width: 180 }}
                        onChange={e => setFieldDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveField('ciudad'); if (e.key === 'Escape') cancelField(); }}
                      />
                      <Button size="sm" variant="success" onClick={() => saveField('ciudad')}>Guardar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelField}>Cancelar</Button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: '#222', marginTop: 2 }}>{initialValues?.ciudad || <span className="text-muted">No especificada</span>}</div>
                  )}
                </div>
              </div>
              {/* Géneros musicales */}
              <div className="col-md-6">
                <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Géneros musicales
                    <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => { setEditField('generos'); setFieldDraft(initialValues?.generos?.join(', ') || ''); }}>
                      <i className="bi bi-pencil" style={{ fontSize: 17 }} />
                    </span>
                  </div>
                  {editField === 'generos' ? (
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <input type="text" value={fieldDraft} maxLength={60} autoFocus style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px', width: 220 }}
                        onChange={e => setFieldDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveField('generos'); if (e.key === 'Escape') cancelField(); }}
                      />
                      <Button size="sm" variant="success" onClick={() => saveField('generos')}>Guardar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelField}>Cancelar</Button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: '#222', marginTop: 2 }}>{initialValues?.generos?.length ? initialValues.generos.join(', ') : <span className="text-muted">No especificados</span>}</div>
                  )}
                </div>
              </div>
              {/* Instrumentos */}
              <div className="col-md-6">
                <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Instrumentos
                    <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => { setEditField('instrumentos'); setFieldDraft(initialValues?.instrumentos?.join(', ') || ''); }}>
                      <i className="bi bi-pencil" style={{ fontSize: 17 }} />
                    </span>
                  </div>
                  {editField === 'instrumentos' ? (
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <input type="text" value={fieldDraft} maxLength={60} autoFocus style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px', width: 220 }}
                        onChange={e => setFieldDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveField('instrumentos'); if (e.key === 'Escape') cancelField(); }}
                      />
                      <Button size="sm" variant="success" onClick={() => saveField('instrumentos')}>Guardar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelField}>Cancelar</Button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: '#222', marginTop: 2 }}>{initialValues?.instrumentos?.length ? initialValues.instrumentos.join(', ') : <span className="text-muted">No especificados</span>}</div>
                  )}
                </div>
              </div>
              {/* Horarios disponibles/requeridos */}
              <div className="col-md-6">
                <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Horarios {initialValues?.type === 'banda' ? 'requeridos' : 'disponibles'}
                    <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => { setEditField('horarios'); setFieldDraft(initialValues?.horarios?.join(', ') || ''); }}>
                      <i className="bi bi-pencil" style={{ fontSize: 17 }} />
                    </span>
                  </div>
                  {editField === 'horarios' ? (
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <input type="text" value={fieldDraft} maxLength={60} autoFocus style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px', width: 220 }}
                        onChange={e => setFieldDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveField('horarios'); if (e.key === 'Escape') cancelField(); }}
                      />
                      <Button size="sm" variant="success" onClick={() => saveField('horarios')}>Guardar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelField}>Cancelar</Button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: '#222', marginTop: 2 }}>{initialValues?.horarios?.length ? initialValues.horarios.join(', ') : <span className="text-muted">No especificados</span>}</div>
                  )}
                </div>
              </div>
              {/* Buscando */}
              <div className="col-md-6">
                <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Buscando
                    <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => { setEditField('buscan'); setFieldDraft(initialValues?.buscan?.join(', ') || ''); }}>
                      <i className="bi bi-pencil" style={{ fontSize: 17 }} />
                    </span>
                  </div>
                  {editField === 'buscan' ? (
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <input type="text" value={fieldDraft} maxLength={60} autoFocus style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px', width: 220 }}
                        onChange={e => setFieldDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveField('buscan'); if (e.key === 'Escape') cancelField(); }}
                      />
                      <Button size="sm" variant="success" onClick={() => saveField('buscan')}>Guardar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelField}>Cancelar</Button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: '#222', marginTop: 2 }}>{initialValues?.buscan?.length ? initialValues.buscan.join(', ') : <span className="text-muted">No especificados</span>}</div>
                  )}
                </div>
              </div>
              {/* Biografía */}
              <div className="col-12">
                <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Biografía
                    <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => { setEditField('bio'); setFieldDraft(initialValues?.bio || ''); }}>
                      <i className="bi bi-pencil" style={{ fontSize: 17 }} />
                    </span>
                  </div>
                  {editField === 'bio' ? (
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <textarea value={fieldDraft} maxLength={120} autoFocus style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '4px 8px', width: 320, minHeight: 40 }}
                        onChange={e => setFieldDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) saveField('bio'); if (e.key === 'Escape') cancelField(); }}
                      />
                      <Button size="sm" variant="success" onClick={() => saveField('bio')}>Guardar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelField}>Cancelar</Button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: '#222', marginTop: 2 }}>{initialValues?.bio || <span className="text-muted">¡Personaliza tu biografía!</span>}</div>
                  )}
                </div>
              </div>
              {/* Miembros (solo para banda) */}
              {initialValues?.type === 'banda' && (
                <div className="col-md-6">
                  <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Miembros
                      <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => { setEditField('miembros'); setFieldDraft(initialValues?.miembros || ''); }}>
                        <i className="bi bi-pencil" style={{ fontSize: 17 }} />
                      </span>
                    </div>
                    {editField === 'miembros' ? (
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <input type="text" value={fieldDraft} maxLength={60} autoFocus style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px', width: 220 }}
                          onChange={e => setFieldDraft(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveField('miembros'); if (e.key === 'Escape') cancelField(); }}
                        />
                        <Button size="sm" variant="success" onClick={() => saveField('miembros')}>Guardar</Button>
                        <Button size="sm" variant="secondary" onClick={cancelField}>Cancelar</Button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 16, color: '#222', marginTop: 2 }}>{initialValues?.miembros || <span className="text-muted">No especificados</span>}</div>
                    )}
                  </div>
                </div>
              )}
              {/* Video de presentación */}
              <div className="col-md-6">
                <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Video de presentación (URL)
                    <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => { setEditField('videoUrl'); setFieldDraft(initialValues?.videoUrl || ''); }}>
                      <i className="bi bi-pencil" style={{ fontSize: 17 }} />
                    </span>
                  </div>
                  {editField === 'videoUrl' ? (
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <input type="text" value={fieldDraft} maxLength={120} autoFocus style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px', width: 260 }}
                        onChange={e => setFieldDraft(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveField('videoUrl'); if (e.key === 'Escape') cancelField(); }}
                      />
                      <Button size="sm" variant="success" onClick={() => saveField('videoUrl')}>Guardar</Button>
                      <Button size="sm" variant="secondary" onClick={cancelField}>Cancelar</Button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 16, color: '#222', marginTop: 2 }}>{initialValues?.videoUrl ? (
                      <a href={initialValues.videoUrl} target="_blank" rel="noopener noreferrer">{initialValues.videoUrl}</a>
                    ) : (
                      <span className="text-muted">No especificado</span>
                    )}</div>
                  )}
                </div>
              </div>
              {/* Galería multimedia: fotos y videos */}
              <div className="col-md-6">
                <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Galería multimedia
                    <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => setShowGaleriaModal(true)}>
                      <i className="bi bi-upload" style={{ fontSize: 17 }} />
                    </span>
                  </div>
                  <div style={{ fontSize: 16, color: '#222', marginTop: 2, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {initialValues?.fotos?.length ? (
                      initialValues.fotos.map((url, idx) =>
                        url.match(/\.(mp4|webm|ogg)$/i) ? (
                          <video key={idx} src={url} controls style={{ width: 70, height: 70, borderRadius: 8, objectFit: 'cover', background: '#eee' }} />
                        ) : (
                          <img key={idx} src={url} alt="media" style={{ width: 70, height: 70, borderRadius: 8, objectFit: 'cover', background: '#eee' }} />
                        )
                      )
                    ) : <span className="text-muted">No hay archivos</span>}
                  </div>
                </div>
                {/* Modal para subir múltiples archivos */}
                <Modal show={showGaleriaModal} onHide={() => setShowGaleriaModal(false)} centered>
                  <Modal.Header closeButton>
                    <Modal.Title>Subir fotos y videos</Modal.Title>
                  </Modal.Header>
                  <Modal.Body className="text-center">
                    <input type="file" multiple accept="image/*,video/*" onChange={handleGaleriaUpload} />
                    <div className="mt-3">
                      <Button variant="success" onClick={handleGuardarGaleria} disabled={galeriaUploading}>{galeriaUploading ? 'Subiendo...' : 'Guardar en galería'}</Button>
                    </div>
                    <div className="mt-2" style={{ minHeight: 24 }}>{galeriaStatus}</div>
                  </Modal.Body>
                </Modal>
              </div>
              {/* Días disponibles (para músicos) */}
              {initialValues?.type !== 'banda' && (
                <div className="col-md-6">
                  <div className="card p-3 mb-2" style={{ border: '1px solid #ede9fe', borderRadius: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: 17, color: '#7c3aed' }}>Días disponibles
                      <span style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => { setEditField('dias'); setFieldDraft((initialValues?.dias||[]).join(', ')); }}>
                        <i className="bi bi-pencil" style={{ fontSize: 17 }} />
                      </span>
                    </div>
                    {editField === 'dias' ? (
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <input type="text" value={fieldDraft} maxLength={60} autoFocus style={{ fontSize: 16, border: '1px solid #ccc', borderRadius: 6, padding: '2px 8px', width: 220 }}
                          onChange={e => setFieldDraft(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') saveField('dias'); if (e.key === 'Escape') cancelField(); }}
                        />
                        <Button size="sm" variant="success" onClick={() => saveField('dias')}>Guardar</Button>
                        <Button size="sm" variant="secondary" onClick={cancelField}>Cancelar</Button>
                      </div>
                    ) : (
                      <div style={{ fontSize: 16, color: '#222', marginTop: 2 }}>{initialValues?.dias?.length ? initialValues.dias.join(', ') : <span className="text-muted">No especificados</span>}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {status && (
              <div className="mt-3">
                <div className={`alert ${status.includes('✔️') ? 'alert-success' : 'alert-danger'}`}>{status}</div>
              </div>
            )}
          </div>
        </Container>
      )}
    </>
  );
};

export default Profile;