import React, { useState, useEffect } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { BsChatDotsFill } from 'react-icons/bs';
import { db, auth } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ChatWindow from './ChatWindow';
import { useChatDock } from '../contexts/ChatDockContext';

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

const ChatDock = () => {
  const [open, setOpen] = useState(false);
  const [openChats, setOpenChats] = useState([]); // [{user, minimized}]
  const [recentChats, setRecentChats] = useState([]); // [{chatId, with, withEmail, withNombre, ...}]
  const [user, setUser] = useState(null);
  const { chatToOpen, setChatToOpen } = useChatDock();

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

  // Efecto para abrir chat desde contexto
  useEffect(() => {
    if (chatToOpen) {
      handleOpenChat(chatToOpen);
      setChatToOpen(null);
    }
  }, [chatToOpen]);

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
      return [...prev, { user: userInfo, minimized: false, initialMessage: chat.initialMessage }];
    });
    setOpen(false);
  };
  // Minimizar/Maximizar (alternar)
  const handleMinimize = (uid) => setOpenChats(chats => chats.map(c => c.user.uid === uid ? { ...c, minimized: !c.minimized } : c));
  // Cerrar
  const handleClose = (uid) => setOpenChats(chats => chats.filter(c => c.user.uid !== uid));

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 2000, display: 'flex', flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
      {/* Ventanas de chat abiertas, apiladas horizontalmente */}
      {openChats.map(({ user, minimized, initialMessage }) => (
        <ChatWindow
          key={user.uid}
          user={user}
          minimized={minimized}
          initialMessage={initialMessage}
          onMinimize={() => handleMinimize(user.uid)}
          onClose={() => handleClose(user.uid)}
          style={{ marginRight: 0 }}
        />
      ))}
      {/* Dock flotante */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {/* Botón flotante */}
        <Button
          style={{ 
            borderRadius: '50%', 
            width: 64, 
            height: 64, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)', 
            display: open ? 'none' : 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: 30, 
            marginBottom: 10,
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          onClick={() => setOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 25px rgba(102, 126, 234, 0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(102, 126, 234, 0.4)';
          }}
        >
          <BsChatDotsFill />
        </Button>
        {/* Ventana dock lista de chats */}
        {open && (
          <div style={{ 
            width: 420, 
            background: 'var(--card-bg, #ffffff)',
            backdropFilter: 'blur(10px)',
            color: 'var(--text-primary, #1f2937)', 
            borderRadius: 20, 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(102, 126, 234, 0.1)', 
            overflow: 'hidden', 
            marginBottom: 10,
            border: '1px solid rgba(102, 126, 234, 0.2)'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <BsChatDotsFill style={{ fontSize: 20, color: '#fff' }} />
                <span style={{ fontWeight: 700, fontSize: 19, color: '#fff', letterSpacing: '0.3px' }}>Mensajes Recientes</span>
              </div>
              <Button 
                variant="link" 
                className="btn-close-modal"
                style={{ 
                  fontSize: 28, 
                  padding: 0,
                  lineHeight: 1,
                  textDecoration: 'none'
                }} 
                onClick={() => setOpen(false)}
              >
                ×
              </Button>
            </div>
            <div style={{ 
              minHeight: 250, 
              maxHeight: 500, 
              overflowY: 'auto', 
              background: 'transparent', 
              padding: 12 
            }}>
              {recentChats.length > 0 ? recentChats.map(chat => (
                <div 
                  key={chat.chatId} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 14, 
                    padding: '14px 12px', 
                    borderRadius: 12, 
                    cursor: 'pointer', 
                    transition: 'all 0.2s ease', 
                    marginBottom: 6, 
                    background: 'var(--bg-secondary, rgba(255, 255, 255, 0.7))',
                    border: '1px solid var(--border-color, rgba(102, 126, 234, 0.1))',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }} 
                  onClick={() => handleOpenChat(chat)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(102, 126, 234, 0.1)';
                    e.currentTarget.style.transform = 'translateX(-4px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-secondary, rgba(255, 255, 255, 0.7))';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div style={{ 
                    width: 48, 
                    height: 48, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 700, 
                    fontSize: 20,
                    color: '#fff',
                    flexShrink: 0,
                    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)'
                  }}>
                    {chat.avatar ? (
                      <img src={chat.avatar} alt="avatar" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      (chat.withNombre?.[0] || chat.withEmail?.[0] || '?').toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 15, color: 'var(--text-primary, #1f2937)', marginBottom: 4 }}>
                      {chat.withNombre || chat.withEmail}
                    </div>
                    <div style={{ 
                      color: 'var(--text-secondary, #6b7280)', 
                      fontSize: 13, 
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {chat.lastMsg ? chat.lastMsg.slice(0, 35) + (chat.lastMsg.length > 35 ? '...' : '') : 'Inicia una conversación'}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ 
                  color: 'var(--text-secondary, #9ca3af)', 
                  textAlign: 'center', 
                  marginTop: 60,
                  marginBottom: 60,
                  fontSize: 15
                }}>
                  <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>💬</div>
                  <div>No hay conversaciones recientes</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatDock;
