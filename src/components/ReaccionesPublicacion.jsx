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
  const [procesando, setProcesando] = useState(false);

  useEffect(() => {
    if (!publicacionId) return;
    
    console.log(`[Reacciones] Iniciando listener para publicación ${publicacionId}`);
    
    const unsub = onSnapshot(
      doc(db, 'publicaciones', publicacionId), 
      (snap) => {
        if (!snap.exists()) {
          console.log(`[Reacciones] Publicación ${publicacionId} no existe`);
          return;
        }
        
        const data = snap.data();
        const reaccionesData = data?.reacciones || {};
        
        console.log(`[Reacciones] Datos recibidos:`, reaccionesData);
        
        setReacciones(reaccionesData);
        
        // Detectar mi reacción
        if (user?.uid) {
          let miReaccionActual = null;
          for (const tipo in reaccionesData) {
            if (Array.isArray(reaccionesData[tipo]) && reaccionesData[tipo].includes(user.uid)) {
              miReaccionActual = tipo;
              break;
            }
          }
          console.log(`[Reacciones] Mi reacción actual: ${miReaccionActual}`);
          setMiReaccion(miReaccionActual);
        } else {
          setMiReaccion(null);
        }
      },
      (error) => {
        console.error(`[Reacciones] Error en listener:`, error);
      }
    );
    
    return () => {
      console.log(`[Reacciones] Limpiando listener para ${publicacionId}`);
      unsub();
    };
  }, [publicacionId, user?.uid]);

  const handleReaccion = async (tipo) => {
    if (!user) {
      console.log('[Reacciones] Usuario no autenticado');
      return;
    }
    
    if (procesando) {
      console.log('[Reacciones] Ya hay una operación en proceso');
      return;
    }
    
    setProcesando(true);
    console.log(`[Reacciones] Procesando reacción tipo: ${tipo}`);
    
    try {
      const pubRef = doc(db, 'publicaciones', publicacionId);
      
      // Obtener datos actuales
      const pubSnap = await getDoc(pubRef);
      if (!pubSnap.exists()) {
        console.error('[Reacciones] Publicación no existe');
        return;
      }
      
      const pubData = pubSnap.data();
      const reaccionesActuales = pubData.reacciones || {};
      
      console.log('[Reacciones] Reacciones actuales en Firestore:', reaccionesActuales);
      
      // Crear copia profunda
      const nuevasReacciones = {};
      for (const t in reaccionesActuales) {
        if (Array.isArray(reaccionesActuales[t])) {
          nuevasReacciones[t] = [...reaccionesActuales[t]];
        }
      }
      
      // Remover mi UID de todas las reacciones
      for (const t in nuevasReacciones) {
        nuevasReacciones[t] = nuevasReacciones[t].filter(uid => uid !== user.uid);
        if (nuevasReacciones[t].length === 0) {
          delete nuevasReacciones[t];
        }
      }
      
      // Si tipo no es null, agregar mi reacción
      let esNuevoLike = false;
      if (tipo) {
        if (!nuevasReacciones[tipo]) {
          nuevasReacciones[tipo] = [];
        }
        nuevasReacciones[tipo].push(user.uid);
        esNuevoLike = true;
      }
      
      console.log('[Reacciones] Nuevas reacciones a guardar:', nuevasReacciones);
      
      // Actualizar en Firestore
      await updateDoc(pubRef, { 
        reacciones: nuevasReacciones 
      });
      
      console.log('[Reacciones] Actualización exitosa en Firestore');

      // Notificación al dueño de la publicación
      if (tipo === 'love' && esNuevoLike && pubData.autorUid && pubData.autorUid !== user.uid) {
        console.log('[Reacciones] Enviando notificación de like');
        await notificarLike(user.uid, pubData.autorUid, publicacionId);
      }
    } catch (error) {
      console.error('[Reacciones] Error al actualizar reacción:', error);
      alert('Error al actualizar la reacción. Por favor intenta de nuevo.');
    } finally {
      setProcesando(false);
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
      cursor: procesando ? 'wait' : 'pointer',
      opacity: procesando ? 0.6 : 1,
      pointerEvents: procesando ? 'none' : 'auto'
    }}
    onClick={() => handleReaccion(miReaccion === 'love' ? null : 'love')}
    title={miReaccion === 'love' ? 'Quitar me gusta' : 'Me gusta'}
    >
      <span style={{ 
        fontSize: 20,
        lineHeight: 1,
        transition: 'transform 0.2s ease',
        transform: miReaccion === 'love' ? 'scale(1.2)' : 'scale(1)'
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

