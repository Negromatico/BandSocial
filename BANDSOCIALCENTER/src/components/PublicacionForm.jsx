import React, { useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const tipos = [
  { value: 'busco-musico', label: 'Busco Músico' },
  { value: 'busco-banda', label: 'Busco Banda' },
  { value: 'evento', label: 'Evento' },
  { value: 'otro', label: 'Otro' },
];

const ciudades = [
  'Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Otra'
];

const PublicacionForm = ({ onCreated }) => {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tipo, setTipo] = useState(tipos[0].value);
  const [ciudad, setCiudad] = useState(ciudades[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!titulo.trim() || !descripcion.trim()) {
      setError('Título y descripción son obligatorios');
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'publicaciones'), {
        titulo: titulo.trim(),
        descripcion: descripcion.trim(),
        tipo,
        ciudad,
        autorUid: user.uid,
        autorNombre: user.displayName || user.email,
        createdAt: serverTimestamp(),
      });
      setTitulo('');
      setDescripcion('');
      setTipo(tipos[0].value);
      setCiudad(ciudades[0]);
      if (onCreated) onCreated();
    } catch (err) {
      setError('Error al crear publicación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: '#f3f0fa', borderRadius: 12, padding: 20, boxShadow: '0 1px 4px #ede9fe' }}>
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
      </div>
      <div className="mb-3">
        <label>Ciudad</label>
        <select className="form-select" value={ciudad} onChange={e => setCiudad(e.target.value)}>
          {ciudades.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      {error && <div className="alert alert-danger py-1">{error}</div>}
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Publicando...' : 'Publicar'}
      </button>
    </form>
  );
};

export default PublicacionForm;
