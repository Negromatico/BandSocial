import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Hook para escuchar notificaciones en tiempo real
export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = auth.onAuthStateChanged(user => {
      setUserId(user ? user.uid : null);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!userId) return;
    const q = query(
      collection(db, 'users', userId, 'notificaciones'),
      orderBy('date', 'desc')
    );
    const unsubscribe = onSnapshot(q, snap => {
      setNotifications(
        snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      );
    });
    return unsubscribe;
  }, [userId]);

  // Marcar como leída
  const markAsRead = async (notiId) => {
    if (!userId || !notiId) return;
    const ref = doc(db, 'users', userId, 'notificaciones', notiId);
    await updateDoc(ref, { read: true });
  };

  return { notifications, markAsRead };
}
