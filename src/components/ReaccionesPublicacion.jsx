import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { Button } from 'react-bootstrap';
import { notificarLike } from '../services/notificationService';

const REACCIONES = [
  { tipo: 'love', emoji: '❤️' }
];

const ReaccionesPublicacion = ({ publicacionId, user }) => {
  const [reacciones, setReacciones] = useState({});
  const [miReaccion, setMiReaccion] = useState(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'publicaciones', publicacionId), (snap) => {
      const data = snap.data();
      setReacciones(data && data.reacciones ? data.reacciones : {});
      if (user && data && data.reacciones) {
        const tipo = Object.keys(data.reacciones).find(tipo => Array.isArray(data.reacciones[tipo]) && data.reacciones[tipo].includes(user.uid));
        setMiReaccion(tipo || null);
      } else {
        setMiReaccion(null);
      }
    });
    return unsub;
  }, [publicacionId, user]);

  const handleReaccion = async (tipo) => {
    if (!user) return;
    const pubRef = doc(db, 'publicaciones', publicacionId);
    // Quitar la reacción anterior
    let nuevasReacciones = { ...reacciones };
    Object.keys(nuevasReacciones).forEach(t => {
      nuevasReacciones[t] = nuevasReacciones[t].filter(uid => uid !== user.uid);
      if (nuevasReacciones[t].length === 0) delete nuevasReacciones[t];
    });
    // Agregar nueva reacción
    let esNuevoLike = false;
    if (tipo) {
      if (!nuevasReacciones[tipo]) nuevasReacciones[tipo] = [];
      // Si no estaba antes, es nuevo like
      if (!nuevasReacciones[tipo].includes(user.uid)) {
        nuevasReacciones[tipo].push(user.uid);
        esNuevoLike = true;
      }
    }
    await updateDoc(pubRef, { reacciones: nuevasReacciones });

    // Notificación al dueño de la publicación
    if (tipo === 'love' && esNuevoLike) {
      const pubSnap = await getDoc(pubRef);
      if (pubSnap.exists()) {
        const pub = pubSnap.data();
        if (pub.autorUid && pub.autorUid !== user.uid) {
          await notificarLike(user.uid, pub.autorUid, publicacionId);
        }
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '20px',
      background: miReaccion === 'love' ? '#fee2e2' : '#f3f4f6',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onClick={() => handleReaccion(miReaccion === 'love' ? null : 'love')}
    >
      <span style={{ 
        fontSize: 20,
        lineHeight: 1,
        transition: 'transform 0.2s ease'
      }}>
        ❤️
      </span>
      <span style={{ 
        fontWeight: 600, 
        color: miReaccion === 'love' ? '#dc2626' : '#6b7280',
        fontSize: 14
      }}>
        {reacciones['love'] ? reacciones['love'].length : 0}
      </span>
    </div>
  );
};

export default ReaccionesPublicacion;

