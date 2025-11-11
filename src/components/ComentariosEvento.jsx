import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Form, Button } from 'react-bootstrap';

export default function ComentariosEvento({ eventoId, user }) {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!eventoId) return;
    const q = query(collection(db, 'eventos', eventoId, 'comentarios'), orderBy('createdAt', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setComentarios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [eventoId]);

  const handleEnviar = async e => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    setEnviando(true);
    try {
      let autorNombre = user?.displayName || user?.email || 'anónimo';
try {
  const perfilSnap = await import('firebase/firestore').then(({ getDoc, doc }) => getDoc(doc(db, 'perfiles', user.uid)));
  if (perfilSnap && perfilSnap.exists()) {
    autorNombre = perfilSnap.data().nombre || autorNombre;
  }
} catch {}
await addDoc(collection(db, 'eventos', eventoId, 'comentarios'), {
  autor: autorNombre,
  contenido: nuevoComentario.trim(),
  createdAt: Timestamp.now()
});
      setNuevoComentario('');
    } catch (err) {
      alert('Error al comentar: ' + (err.message || err));
    }
    setEnviando(false);
  };


  return (
    <div className="mt-4">
      <h6>Comentarios</h6>
      <div style={{ maxHeight: 200, overflowY: 'auto' }}>
        {comentarios.length === 0 && <div className="text-muted">Sé el primero en comentar.</div>}
        {comentarios.map(c => (
          <div key={c.id} className="mb-2 p-2 bg-light rounded">
            <div style={{ fontWeight: 600 }}>{c.autor}</div>
            <div>{c.contenido}</div>
            <div className="text-muted small">{c.createdAt?.toDate ? c.createdAt.toDate().toLocaleString() : ''}</div>
          </div>
        ))}
      </div>
      {user && (
        <Form onSubmit={handleEnviar} className="d-flex gap-2 mt-2">
          <Form.Control
            value={nuevoComentario}
            onChange={e => setNuevoComentario(e.target.value)}
            placeholder="Escribe un comentario..."
            maxLength={250}
            disabled={enviando}
            required
          />
          <Button type="submit" disabled={enviando || !nuevoComentario.trim()}>Comentar</Button>
        </Form>
      )}
    </div>
  );
}
