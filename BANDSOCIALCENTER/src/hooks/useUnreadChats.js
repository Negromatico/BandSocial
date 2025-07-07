import { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function useUnreadChats() {
  const [unreadCount, setUnreadCount] = useState(0);
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setUnreadCount(0);
      return;
    }
    const unsub = onSnapshot(collection(db, 'userChats', user.uid, 'chats'), (snap) => {
      let count = 0;
      snap.forEach(doc => {
        const data = doc.data();
        if (data.lastMsg && data.lastFrom && data.lastFrom !== user.uid && !data.lastRead) {
          count++;
        }
      });
      setUnreadCount(count);
    });
    return unsub;
  }, []);
  return unreadCount;
}
