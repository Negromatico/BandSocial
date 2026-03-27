import React, { useState, useEffect, useRef } from 'react';
import { Container } from 'react-bootstrap';
import { auth, db } from '../services/firebase';
import { collection, onSnapshot, doc, setDoc, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FaComments, FaInbox, FaArrowLeft, FaPaperPlane } from 'react-icons/fa';
import { useChatDock } from '../contexts/ChatDockContext';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMsg, setNewMsg] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const navigate = useNavigate();
  const { openChat } = useChatDock();
  const chatBottomRef = useRef(null);

  // Mantener isMobile reactivo al cambiar tamaño de ventana
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cargar lista de conversaciones desde userChats (colección correcta)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      navigate('/login');
      return;
    }

    const chatsRef = collection(db, 'userChats', user.uid, 'chats');
    const unsubscribe = onSnapshot(chatsRef, (snapshot) => {
      let chats = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      chats.sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''));
      setConversations(chats);
      setLoading(false);
    }, (error) => {
      console.error('Error cargando mensajes:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Cargar mensajes del chat seleccionado (solo en móvil)
  useEffect(() => {
    if (!selectedChat || !isMobile) return;
    setLoadingMessages(true);
    const q = query(
      collection(db, 'chats', selectedChat.chatId, 'messages'),
      orderBy('createdAt')
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingMessages(false);
      // Marcar como leído
      const user = auth.currentUser;
      if (user) {
        setDoc(
          doc(db, 'userChats', user.uid, 'chats', selectedChat.chatId),
          { lastRead: true },
          { merge: true }
        ).catch(console.error);
      }
    });
    return unsub;
  }, [selectedChat, isMobile]);

  const handleOpenChat = (chat) => {
    if (isMobile) {
      // En móvil: mostrar vista de chat en pantalla completa
      setSelectedChat(chat);
    } else {
      // En escritorio: abrir el dock flotante
      openChat({
        with: chat.with,
        withEmail: chat.withEmail || chat.withNombre || 'Usuario',
        withNombre: chat.withNombre || chat.withEmail || 'Usuario',
        chatId: chat.chatId,
        avatar: chat.avatar || '',
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!newMsg.trim() || !selectedChat || !user) return;
    const msgText = newMsg.trim();
    setNewMsg('');

    await addDoc(collection(db, 'chats', selectedChat.chatId, 'messages'), {
      text: msgText,
      from: user.uid,
      to: selectedChat.with,
      createdAt: serverTimestamp(),
    });

    // Actualizar metadatos de ambos usuarios
    await Promise.all([
      setDoc(doc(db, 'userChats', user.uid, 'chats', selectedChat.chatId), {
        chatId: selectedChat.chatId,
        with: selectedChat.with,
        withEmail: selectedChat.withEmail,
        withNombre: selectedChat.withNombre,
        lastMsg: msgText,
        lastAt: new Date().toISOString(),
        lastFrom: user.uid,
        lastRead: true,
      }, { merge: true }),
      setDoc(doc(db, 'userChats', selectedChat.with, 'chats', selectedChat.chatId), {
        chatId: selectedChat.chatId,
        with: user.uid,
        withEmail: user.email,
        withNombre: user.displayName || user.email,
        lastMsg: msgText,
        lastAt: new Date().toISOString(),
        lastFrom: user.uid,
        lastRead: false,
      }, { merge: true }),
    ]);
  };

  const formatTime = (lastAt) => {
    if (!lastAt) return '';
    try {
      const date = new Date(lastAt);
      const now = new Date();
      const diff = now - date;
      if (diff < 60000) return 'Ahora';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
      return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
    } catch {
      return '';
    }
  };

  // ==========================
  // VISTA DE CHAT EN MÓVIL
  // ==========================
  if (isMobile && selectedChat) {
    const me = auth.currentUser;
    return (
      <div className="mobile-chat-view">
        {/* Header del chat */}
        <div className="mobile-chat-header">
          <button className="mobile-chat-back" onClick={() => setSelectedChat(null)}>
            <FaArrowLeft />
          </button>
          <div className="mobile-chat-avatar">
            {selectedChat.avatar ? (
              <img src={selectedChat.avatar} alt={selectedChat.withNombre} />
            ) : (
              <span>{(selectedChat.withNombre || selectedChat.withEmail || 'U')[0].toUpperCase()}</span>
            )}
          </div>
          <div className="mobile-chat-user-info">
            <span className="mobile-chat-name">{selectedChat.withNombre || selectedChat.withEmail || 'Usuario'}</span>
          </div>
        </div>

        {/* Mensajes */}
        <div className="mobile-chat-messages">
          {loadingMessages ? (
            <div className="text-center py-4">
              <div className="spinner-border spinner-border-sm text-primary" role="status" />
            </div>
          ) : messages.length === 0 ? (
            <div className="mobile-chat-empty">
              <p>No hay mensajes aún. ¡Di hola!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`mobile-msg-bubble ${msg.from === me?.uid ? 'mine' : 'theirs'}`}
              >
                <span>{msg.text}</span>
              </div>
            ))
          )}
          <div ref={chatBottomRef} />
        </div>

        {/* Input de mensaje */}
        <form className="mobile-chat-input" onSubmit={handleSendMessage}>
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            autoFocus
          />
          <button type="submit" disabled={!newMsg.trim()}>
            <FaPaperPlane />
          </button>
        </form>
      </div>
    );
  }

  // ==========================
  // VISTA DE LISTA DE CHATS
  // ==========================
  if (loading) {
    return (
      <Container className="messages-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="messages-container">
      <div className="messages-header">
        <h2><FaComments className="me-2" />Mensajes</h2>
      </div>

      {conversations.length === 0 ? (
        <div className="empty-state">
          <FaInbox className="empty-state-icon" />
          <h4>No tienes mensajes</h4>
          <p className="text-muted">Cuando inicies una conversación, aparecerá aquí</p>
        </div>
      ) : (
        <div className="conversations-list">
          {conversations.map((chat) => {
            const me = auth.currentUser;
            const isUnread = chat.lastMsg && chat.lastFrom !== me?.uid && !chat.lastRead;
            return (
              <div
                key={chat.chatId || chat.id}
                className={`conversation-item ${isUnread ? 'unread' : ''}`}
                onClick={() => handleOpenChat(chat)}
              >
                <div className="conversation-avatar">
                  {chat.avatar ? (
                    <img src={chat.avatar} alt={chat.withNombre} />
                  ) : (
                    <div className="avatar-placeholder">
                      {(chat.withNombre || chat.withEmail || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  {isUnread && <span className="unread-indicator" />}
                </div>
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h6 className="conversation-name">
                      {chat.withNombre || chat.withEmail || 'Usuario'}
                    </h6>
                    <span className="conversation-time">{formatTime(chat.lastAt)}</span>
                  </div>
                  <div className="conversation-preview">
                    <p className={`last-message ${isUnread ? 'fw-semibold text-dark' : ''}`}>
                      {chat.lastMsg
                        ? (chat.lastFrom === me?.uid
                          ? `Tú: ${chat.lastMsg.slice(0, 40)}`
                          : chat.lastMsg.slice(0, 40))
                        : 'Inicia la conversación'}
                    </p>
                    {isUnread && <span className="unread-dot" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Container>
  );
};

export default Messages;
