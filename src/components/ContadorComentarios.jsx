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
        cursor: 'pointer',
        color: 'var(--text-secondary, #65676b)',
        fontWeight: 500,
        fontSize: '15px'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--hover-bg, #f0f2f5)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <svg 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          flexShrink: 0
        }}
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
      </svg>
      <span>Comentar</span>
      {count > 0 && (
        <span style={{
          marginLeft: '4px',
          fontWeight: 600,
          color: 'var(--text-secondary, #65676b)'
        }}>
          {count}
        </span>
      )}
    </button>
  );
};

export default ContadorComentarios;
