import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, getDoc, doc as docFirestore } from 'firebase/firestore';
import { Form, Button } from 'react-bootstrap';
import { notificarComentario } from '../services/notificationService';

const ComentariosPublicacion = ({ publicacionId, user }) => {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'publicaciones', publicacionId, 'comentarios'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setComentarios(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsub;
  }, [publicacionId]);

  const handleComentar = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    setLoading(true);
    try {
      // Obtener nombre real del perfil
      let perfilNombre = 'Usuario';
      try {
        const perfilSnap = await import('firebase/firestore').then(({ getDoc, doc: docFirestore }) =>
          getDoc(docFirestore(db, 'perfiles', user.uid))
        );
        if (perfilSnap && perfilSnap.exists()) {
          const data = perfilSnap.data();
          perfilNombre = data.nombre || data.nombreCompleto || 'Usuario';
        }
      } catch (e) { /* Si falla, sigue con 'Usuario' */ }
      await addDoc(collection(db, 'publicaciones', publicacionId, 'comentarios'), {
        texto: nuevoComentario,
        autorUid: user.uid,
        autorNombre: perfilNombre,
        createdAt: Timestamp.now(),
      });
      // Notificación al dueño de la publicación
      const pubSnap = await getDoc(docFirestore(db, 'publicaciones', publicacionId));
      if (pubSnap.exists()) {
        const pub = pubSnap.data();
        if (pub.autorUid && pub.autorUid !== user.uid) {
          await notificarComentario(user.uid, pub.autorUid, publicacionId);
        }
      }
      setNuevoComentario('');
      setLoading(false);
    } catch (err) {
      console.error('Error al comentar:', err);
      alert('Error al comentar: ' + (err && err.message ? err.message : err));
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>
        {comentarios.length === 0 ? 'Sé el primero en comentar' : 'Comentarios'}
      </div>
      <div style={{ maxHeight: 120, overflowY: 'auto', marginBottom: 8 }}>
        
        {comentarios.map(com => (
          <div key={com.id} style={{ fontSize: 14, marginBottom: 6 }}>
            <span style={{ fontWeight: 500 }}>{com.autorNombre}:</span> {com.texto}
          </div>
        ))}
      </div>
      {user && (
        <Form onSubmit={handleComentar} className="d-flex gap-2">
          <Form.Control
            size="sm"
            type="text"
            placeholder="Escribe un comentario..."
            value={nuevoComentario}
            onChange={e => setNuevoComentario(e.target.value)}
            disabled={loading}
            maxLength={150}
          />
          <Button type="submit" size="sm" disabled={loading || !nuevoComentario.trim()}>
            Comentar
          </Button>
        </Form>
      )}
    </div>
  );
};

export default ComentariosPublicacion;
