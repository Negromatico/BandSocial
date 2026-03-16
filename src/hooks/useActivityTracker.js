import { useEffect, useRef } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Hook para rastrear el tiempo de uso activo del usuario
 * Actualiza el campo tiempoUsoTotal en Firestore cada minuto
 */
const useActivityTracker = (userId) => {
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const isActiveRef = useRef(true);

  useEffect(() => {
    if (!userId) return;

    // Iniciar tracking
    startTimeRef.current = Date.now();
    isActiveRef.current = true;

    // Detectar cuando el usuario está inactivo (cambia de pestaña o minimiza)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        isActiveRef.current = false;
      } else {
        isActiveRef.current = true;
        startTimeRef.current = Date.now();
      }
    };

    // Detectar cuando el usuario está activo (movimiento del mouse, teclado)
    const handleActivity = () => {
      if (!isActiveRef.current) {
        isActiveRef.current = true;
        startTimeRef.current = Date.now();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('mousemove', handleActivity);
    document.addEventListener('keydown', handleActivity);
    document.addEventListener('click', handleActivity);
    document.addEventListener('scroll', handleActivity);

    // Actualizar tiempo cada minuto
    intervalRef.current = setInterval(async () => {
      if (isActiveRef.current && startTimeRef.current) {
        const now = Date.now();
        const minutosTranscurridos = Math.floor((now - startTimeRef.current) / (1000 * 60));
        
        if (minutosTranscurridos > 0) {
          try {
            await updateDoc(doc(db, 'perfiles', userId), {
              tiempoUsoTotal: increment(minutosTranscurridos),
              ultimaActividad: new Date()
            });
            startTimeRef.current = now;
          } catch (error) {
            console.error('Error actualizando tiempo de uso:', error);
          }
        }
      }
    }, 60000); // Cada minuto

    // Cleanup al desmontar
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('keydown', handleActivity);
      document.removeEventListener('click', handleActivity);
      document.removeEventListener('scroll', handleActivity);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Guardar tiempo final al salir
      if (isActiveRef.current && startTimeRef.current) {
        const now = Date.now();
        const minutosTranscurridos = Math.floor((now - startTimeRef.current) / (1000 * 60));
        
        if (minutosTranscurridos > 0) {
          updateDoc(doc(db, 'perfiles', userId), {
            tiempoUsoTotal: increment(minutosTranscurridos),
            ultimaActividad: new Date()
          }).catch(err => console.error('Error al guardar tiempo final:', err));
        }
      }
    };
  }, [userId]);
};

export default useActivityTracker;
