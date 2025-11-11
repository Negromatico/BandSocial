import React, { useState, useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { BsChatDotsFill } from 'react-icons/bs';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ChatWindow from './ChatWindow';

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

const ChatDock = () => {
  const [open, setOpen] = useState(false);
  const [openChats, setOpenChats] = useState([]); // [{user, minimized}]
  const [recentChats, setRecentChats] = useState([]); // [{chatId, with, withEmail, withNombre, ...}]
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) {
      setRecentChats([]);
      return;
    }
    const unsub = onSnapshot(collection(db, 'userChats', user.uid, 'chats'), (snap) => {
      let chats = snap.docs.map(doc => doc.data());
      chats.sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''));
      setRecentChats(chats);
    });
    return unsub;
  }, [user]);

  // Abrir chat (si ya está abierto, lo maximiza)
  const handleOpenChat = (chat) => {
    setOpenChats((prev) => {
      const exists = prev.find(c => c.user.uid === chat.with);
      if (exists) {
        return prev.map(c => c.user.uid === chat.with ? { ...c, minimized: false } : c);
      }
      // user info para la ventana
      const userInfo = {
        uid: chat.with,
        email: chat.withEmail,
        nombre: chat.withNombre,
        avatar: chat.avatar || '',
        chatId: chat.chatId,
      };
      return [...prev, { user: userInfo, minimized: false }];
    });
    setOpen(false);
  };
  // Minimizar
  const handleMinimize = (uid) => setOpenChats(chats => chats.map(c => c.user.uid === uid ? { ...c, minimized: true } : c));
  // Cerrar
  const handleClose = (uid) => setOpenChats(chats => chats.filter(c => c.user.uid !== uid));

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 2000, display: 'flex', flexDirection: 'row', alignItems: 'flex-end' }}>
      {/* Ventanas de chat abiertas, apiladas horizontalmente */}
      {openChats.map(({ user, minimized }) => (
        <ChatWindow
          key={user.uid}
          user={user}
          minimized={minimized}
          onMinimize={() => handleMinimize(user.uid)}
          onClose={() => handleClose(user.uid)}
          style={{ marginRight: 12 }}
        />
      ))}
      {/* Dock flotante */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {/* Botón flotante */}
        <Button
          variant="primary"
          style={{ borderRadius: '50%', width: 56, height: 56, boxShadow: '0 2px 8px #0002', display: open ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, marginBottom: 8 }}
          onClick={() => setOpen(true)}
        >
          <BsChatDotsFill />
        </Button>
        {/* Ventana dock lista de chats */}
        {open && (
          <div style={{ width: 340, background: '#18181b', color: '#fff', borderRadius: 18, boxShadow: '0 4px 32px #0004', overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#27272a', padding: '12px 18px' }}>
              <span style={{ fontWeight: 600, fontSize: 18 }}>Mensajes</span>
              <Button variant="link" style={{ color: '#fff', fontSize: 22, padding: 0 }} onClick={() => setOpen(false)}>&times;</Button>
            </div>
            <div style={{ minHeight: 200, maxHeight: 400, overflowY: 'auto', background: '#222', padding: 10 }}>
              {recentChats.length > 0 ? recentChats.map(chat => (
                <div key={chat.chatId} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 8px', borderRadius: 10, cursor: 'pointer', transition: 'background .2s', marginBottom: 4, background: '#232323' }} onClick={() => handleOpenChat(chat)}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 18 }}>
                    {chat.avatar ? <img src={chat.avatar} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%' }} /> : (chat.withNombre?.[0] || chat.withEmail?.[0] || '?')}
                  </div>
                  <span style={{ fontWeight: 600 }}>{chat.withNombre || chat.withEmail}</span>
                  <span style={{ color: '#bbb', fontSize: 13, marginLeft: 'auto' }}>{chat.lastMsg ? chat.lastMsg.slice(0, 25) : ''}</span>
                </div>
              )) : <div style={{ color: '#bbb', textAlign: 'center', marginTop: 40 }}>No hay conversaciones recientes.</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDock;
