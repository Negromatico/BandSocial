import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { FaComment } from 'react-icons/fa';

const ContadorComentarios = ({ publicacionId }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const comentariosRef = collection(db, 'publicaciones', publicacionId, 'comentarios');
    
    const unsubscribe = onSnapshot(comentariosRef, (snapshot) => {
      setCount(snapshot.size);
    }, (error) => {
      console.error('Error al escuchar comentarios:', error);
      setCount(0);
    });

    return () => unsubscribe();
  }, [publicacionId]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '8px 12px',
      borderRadius: '20px',
      background: '#f3f4f6',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}>
      <FaComment style={{ 
        fontSize: 16,
        color: '#6b7280'
      }} />
      <span style={{ 
        fontWeight: 600, 
        color: '#6b7280',
        fontSize: 14
      }}>
        {count}
      </span>
    </div>
  );
};

export default ContadorComentarios;
