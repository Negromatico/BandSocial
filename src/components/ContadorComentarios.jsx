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
    <div className="post-action">
      <FaComment className="post-action-icon" />
      <span>{count}</span>
    </div>
  );
};

export default ContadorComentarios;
