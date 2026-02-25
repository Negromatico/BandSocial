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

  const totalLikes = reacciones['love'] ? reacciones['love'].length : 0;

  return (
    <button 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '6px',
        background: 'transparent',
        border: 'none',
        transition: 'all 0.2s ease',
        cursor: procesando ? 'wait' : 'pointer',
        opacity: procesando ? 0.6 : 1,
        pointerEvents: procesando ? 'none' : 'auto',
        color: miReaccion === 'love' ? '#ed4956' : 'var(--text-secondary, #65676b)',
        fontWeight: miReaccion === 'love' ? 600 : 500,
        fontSize: '15px'
      }}
      onClick={() => handleReaccion(miReaccion === 'love' ? null : 'love')}
      title={miReaccion === 'love' ? 'Quitar me gusta' : 'Me gusta'}
      onMouseEnter={(e) => {
        if (!procesando) {
          e.currentTarget.style.background = 'var(--hover-bg, #f0f2f5)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill={miReaccion === 'love' ? '#ed4956' : 'none'}
        stroke={miReaccion === 'love' ? '#ed4956' : 'currentColor'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'transform 0.2s ease',
          flexShrink: 0
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <span>Me gusta</span>
      {totalLikes > 0 && (
        <span style={{
          marginLeft: '4px',
          fontWeight: 600,
          color: miReaccion === 'love' ? '#ed4956' : 'var(--text-secondary, #65676b)'
        }}>
          {totalLikes}
        </span>
      )}
    </button>
  );
};

export default ReaccionesPublicacion;

