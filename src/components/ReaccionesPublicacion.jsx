import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { Button } from 'react-bootstrap';
import { enviarNotificacion } from '../services/notificaciones';

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
        if (pub.uid && pub.uid !== user.uid) {
          // Buscar nombre del perfil
          let nombre = 'Alguien';
          try {
            const perfilSnap = await getDoc(doc(db, 'perfiles', user.uid));
            if (perfilSnap.exists()) {
              const data = perfilSnap.data();
              nombre = data.nombre || data.email || 'Alguien';
            }
          } catch {}
          await enviarNotificacion(pub.uid, {
            type: 'like',
            text: `A ${nombre} le gustó tu publicación`,
            link: `/publicaciones/${publicacionId}`
          });
        }
      }
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      <Button
        variant={miReaccion === 'love' ? 'danger' : 'outline-secondary'}
        size="sm"
        style={{ fontSize: miReaccion === 'love' ? 24 : 18, borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}
        onClick={() => handleReaccion(miReaccion === 'love' ? null : 'love')}
      >
        ❤️
      </Button>
      <span style={{ marginLeft: 8, fontWeight: 600, color: '#d00', fontSize: 16 }}>
        {reacciones['love'] ? reacciones['love'].length : 0}
      </span>
    </div>
  );
};

export default ReaccionesPublicacion;

