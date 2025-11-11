import React, { useState, useContext } from 'react';
import { Modal } from 'react-bootstrap';
import { db, auth } from '../services/firebase';
import { GuestContext } from '../App';
import { collection, addDoc, serverTimestamp, query, where, getDocs, getDoc, doc } from 'firebase/firestore';
import { uploadToCloudinary } from '../services/cloudinary';


const tipos = [
  { value: 'busco-musico', label: 'Busco Músico' },
  { value: 'busco-banda', label: 'Busco Banda' },
  { value: 'evento', label: 'Evento' },
  { value: 'otro', label: 'Otro' },
];

async function obtenerNombreUsuario(user) {
  if (!user) return 'Usuario';
  try {
    const { getDoc, doc: docFirestore } = await import('firebase/firestore');
    const { db } = await import('../services/firebase');
    const perfilSnap = await getDoc(docFirestore(db, 'perfiles', user.uid));
    if (perfilSnap.exists()) {
      return perfilSnap.data().nombre || (user.displayName && user.displayName.trim()) ? user.displayName : 'Usuario';
    }
  } catch {}
  return (user.displayName && user.displayName.trim()) ? user.displayName : 'Usuario';
}

const PublicacionForm = ({ onCreated }) => {
  const guestContext = useContext(GuestContext);
  const isGuest = guestContext && (guestContext.isGuest === true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState(tipos[0].value);
  const [otroTipo, setOtroTipo] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [ciudadesOptions, setCiudadesOptions] = React.useState([]);
  const [otraCiudad, setOtraCiudad] = useState('');
  React.useEffect(() => {
    fetch('https://api-colombia.com/api/v1/City')
      .then(res => res.json())
      .then(data => {
        const options = data.map(city => city.name).sort();
        setCiudadesOptions(options);
      })
      .catch(() => setCiudadesOptions([]));
  }, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imagenes, setImagenes] = useState([]);
  const [imagenesPreview, setImagenesPreview] = useState([]);

  const handleImagenChange = e => {
    const files = Array.from(e.target.files);
    setImagenes(files);
    setImagenesPreview(files.map(file => URL.createObjectURL(file)));
  };


  const handleSubmit = async e => {
    e.preventDefault();
    if (isGuest) {
      setShowAuthPrompt(true);
      return;
    }
    setError('');
    if (!titulo.trim() || !descripcion.trim()) {
      setError('Título y descripción son obligatorios');
      return;
    }
    if (tipo === 'otro' && !otroTipo.trim()) {
      setError('Por favor especifica el tipo.');
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      
      // Verificar plan de membresía y límite de publicaciones
      const perfilSnap = await getDoc(doc(db, 'perfiles', user.uid));
      if (perfilSnap.exists()) {
        const perfil = perfilSnap.data();
        const planActual = perfil.planActual || 'estandar';
        
        // Contar publicaciones del usuario
        const publicacionesQuery = query(
          collection(db, 'publicaciones'),
          where('autorUid', '==', user.uid)
        );
        const publicacionesSnap = await getDocs(publicacionesQuery);
        const cantidadPublicaciones = publicacionesSnap.size;
        
        // Verificar límites según plan
        if (planActual === 'estandar' && cantidadPublicaciones >= 1) {
          setError('Has alcanzado el límite de publicaciones de tu plan Estándar (1 publicación). Actualiza a Premium para publicar sin límites.');
          setLoading(false);
          return;
        }
      }
      let imagenesUrl = [];
      if (imagenes.length > 0) {
        for (const file of imagenes) {
          const url = await uploadToCloudinary(file, 'Bandas', 'bandas/publicaciones');
          imagenesUrl.push(url);
        }
      }
      await addDoc(collection(db, 'publicaciones'), {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo: tipo === 'otro' ? otroTipo.trim() : tipo,
        ciudad,
        autorUid: user.uid,
        autorNombre: await obtenerNombreUsuario(user),
        createdAt: serverTimestamp(),
        imagenesUrl,
      });
      setTitulo('');
      setDescripcion('');
      setTipo(tipos[0].value);
      setOtroTipo('');
      setCiudad('');
      setImagenes([]);
      setImagenesPreview([]);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
      if (onCreated) onCreated();
    } catch (err) {
      console.error('Error al crear publicación:', err);
      setError('Error al crear publicación: ' + (err.message || 'Intenta de nuevo'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f3f0fa', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px #ede9fe' }}>
      <Modal show={showAuthPrompt} onHide={() => setShowAuthPrompt(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Acción solo para usuarios registrados</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Debes iniciar sesión o registrarte para publicar.</p>
          <div className="d-flex gap-3 justify-content-center mt-3">
            <button type="button" className="btn btn-primary" onClick={() => window.location.href = '/login'}>Iniciar sesión</button>
            <button type="button" className="btn btn-outline-primary" onClick={() => window.location.href = '/register'}>Registrarse</button>
          </div>
        </Modal.Body>
      </Modal>
      <div className="mb-2">
        <label>Título *</label>
        <input className="form-control" value={titulo} onChange={e => setTitulo(e.target.value)} maxLength={60} required />
      </div>
      <div className="mb-2">
        <label>Descripción *</label>
        <textarea className="form-control" value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={3} maxLength={300} required />
      </div>
      <div className="mb-2">
        <label>Tipo</label>
        <select className="form-select" value={tipo} onChange={e => setTipo(e.target.value)}>
          {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        {tipo === 'otro' && (
          <input
            className="form-control mt-2"
            placeholder="Especifica el tipo"
            value={otroTipo}
            onChange={e => setOtroTipo(e.target.value)}
            maxLength={30}
            required
          />
        )}
      </div>
      <div className="mb-3">
        <label>Ciudad</label>
        <select className="form-select" value={ciudad} onChange={e => setCiudad(e.target.value)}>
          <option value="">Selecciona ciudad</option>
          {ciudadesOptions.map(c => <option key={c} value={c}>{c}</option>)}
          <option value="Otro (especificar)">Otro (especificar)</option>
        </select>
        {ciudad === 'Otro (especificar)' && (
          <input
            className="form-control mt-2"
            placeholder="Especifica ciudad"
            value={otraCiudad}
            onChange={e => setOtraCiudad(e.target.value)}
            maxLength={40}
            required
          />
        )}
      </div>
      <div className="mb-3">
        <label>Imágenes (opcional, puedes seleccionar varias)</label>
        <input type="file" accept="image/*" className="form-control" onChange={handleImagenChange} multiple />
        {imagenesPreview.length > 0 && (
          <div className="mt-2 d-flex flex-wrap gap-2">
            {imagenesPreview.map((src, i) => (
              <img key={i} src={src} alt={`preview${i}`} style={{maxWidth:100, maxHeight:100, borderRadius:8, objectFit:'cover'}} />
            ))}
          </div>
        )}
      </div>
      {success && <div className="alert alert-success py-1">¡Publicación creada exitosamente!</div>}
      {error && <div className="alert alert-danger py-1">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Publicando...' : 'Publicar'}
      </button>
    </form>
  );
};

export default PublicacionForm;
