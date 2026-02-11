import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { BsChevronDown, BsChevronUp, BsXLg, BsCheckAll } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc as docFirestore, setDoc, where, getDocs, updateDoc } from 'firebase/firestore';
import { notificarNuevoMensaje } from '../services/notificationService';

const ChatWindow = ({ user, onClose, onMinimize, minimized, style = {}, initialMessage, ...props }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRead, setIsRead] = useState(false);
  const [initialMessageSent, setInitialMessageSent] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const me = auth.currentUser;
  const chatId = user && me ? [user.uid, me.uid].sort().join('_') : null;

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsub;
  }, [chatId]);

  // Escuchar el estado de lectura del destinatario
  useEffect(() => {
    if (!chatId || !me || !user) return;

    const unsubscribe = onSnapshot(
      docFirestore(db, 'userChats', user.uid, 'chats', chatId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          // El mensaje está visto si el destinatario lo marcó como leído Y el último mensaje es mío
          const messageIsRead = data.lastRead === true && data.lastFrom === me.uid;
          setIsRead(messageIsRead);
        } else {
          setIsRead(false);
        }
      },
      (error) => {
        console.error('Error escuchando estado de lectura:', error);
        setIsRead(false);
      }
    );

    return unsubscribe;
  }, [chatId, me, user]);

  // Marcar mensajes como leídos cuando se abre el chat
  useEffect(() => {
    if (!chatId || !me || !user || minimized) return;

    const marcarComoLeido = async () => {
      try {
        // Marcar el chat como leído en userChats
        await setDoc(docFirestore(db, 'userChats', me.uid, 'chats', chatId), {
          lastRead: true
        }, { merge: true });

        // Eliminar notificaciones de mensajes de este usuario
        const notifQuery = query(
          collection(db, 'notificaciones'),
          where('usuarioId', '==', me.uid),
          where('tipo', '==', 'mensaje'),
          where('origenUid', '==', user.uid),
          where('leida', '==', false)
        );
        
        const notifSnap = await getDocs(notifQuery);
        const updatePromises = notifSnap.docs.map(doc => 
          updateDoc(docFirestore(db, 'notificaciones', doc.id), { leida: true })
        );
        await Promise.all(updatePromises);
      } catch (error) {
        console.error('Error marcando mensajes como leídos:', error);
      }
    };

    marcarComoLeido();
  }, [chatId, me, user, minimized]);

  useEffect(() => {
    if (!minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, minimized]);

  // Enviar mensaje inicial automáticamente si se proporciona
  useEffect(() => {
    if (initialMessage && !initialMessageSent && !loading && me && user && chatId) {
      const sendInitialMessage = async () => {
        try {
          await addDoc(collection(db, 'chats', chatId, 'messages'), {
            text: initialMessage,
            from: me.uid,
            to: user.uid,
            createdAt: serverTimestamp(),
          });
          // Actualiza metadatos para ambos usuarios
          await Promise.all([
            setDoc(docFirestore(db, 'userChats', me.uid, 'chats', chatId), {
              chatId,
              with: user.uid,
              withEmail: user.email,
              withNombre: user.nombre,
              lastMsg: initialMessage,
              lastAt: new Date().toISOString(),
              lastFrom: me.uid,
              lastRead: true
            }, { merge: true }),
            setDoc(docFirestore(db, 'userChats', user.uid, 'chats', chatId), {
              chatId,
              with: me.uid,
              withEmail: me.email,
              withNombre: me.displayName || me.email,
              lastMsg: initialMessage,
              lastAt: new Date().toISOString(),
              lastFrom: me.uid,
              lastRead: false
            }, { merge: true }),
          ]);
          
          // Enviar notificación al destinatario
          await notificarNuevoMensaje(me.uid, user.uid, initialMessage);
          setInitialMessageSent(true);
        } catch (error) {
          console.error('Error enviando mensaje inicial:', error);
        }
      };
      
      sendInitialMessage();
    }
  }, [initialMessage, initialMessageSent, loading, me, user, chatId]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !me || !user) return;
    const msgText = input;
    setInput('');
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: msgText,
      from: me.uid,
      to: user.uid,
      createdAt: serverTimestamp(),
    });
    // Actualiza metadatos para ambos usuarios
    await Promise.all([
      setDoc(docFirestore(db, 'userChats', me.uid, 'chats', chatId), {
        chatId,
        with: user.uid,
        withEmail: user.email,
        withNombre: user.nombre,
        lastMsg: msgText,
        lastAt: new Date().toISOString(),
        lastFrom: me.uid,
        lastRead: true
      }, { merge: true }),
      setDoc(docFirestore(db, 'userChats', user.uid, 'chats', chatId), {
        chatId,
        with: me.uid,
        withEmail: me.email,
        withNombre: me.displayName || me.email,
        lastMsg: msgText,
        lastAt: new Date().toISOString(),
        lastFrom: me.uid,
        lastRead: false
      }, { merge: true }),
    ]);
    
    // Enviar notificación al destinatario
    await notificarNuevoMensaje(me.uid, user.uid, msgText);
  };

  return (
    <div
      style={{
        width: 380,
        height: minimized ? 56 : 520,
        background: 'var(--card-bg, #ffffff)',
        backdropFilter: 'blur(10px)',
        color: 'var(--text-primary, #1f2937)',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(102, 126, 234, 0.1)',
        overflow: 'hidden',
        marginBottom: 10,
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid rgba(102, 126, 234, 0.2)',
        transition: 'all 0.3s ease',
        ...style,
      }}
      {...props}
    >
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
        padding: '12px 18px', 
        height: 56,
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 12,
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
          onClick={() => navigate(`/profile/${user.uid}`)}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
        >
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: '50%', 
            background: 'rgba(255, 255, 255, 0.2)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 700, 
            fontSize: 18,
            color: '#fff',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}>
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              (user?.nombre?.[0] || user?.email?.[0] || '?').toUpperCase()
            )}
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: '#fff', letterSpacing: '0.3px' }}>
            {user?.nombre || user?.email || 'Usuario'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Button 
            variant="link" 
            style={{ 
              color: '#fff', 
              fontSize: 20, 
              padding: 0,
              opacity: 0.9,
              transition: 'opacity 0.2s'
            }} 
            onClick={onMinimize}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
          >
            {minimized ? <BsChevronUp /> : <BsChevronDown />}
          </Button>
          <Button 
            variant="link" 
            style={{ 
              color: '#fff', 
              fontSize: 18, 
              padding: 0,
              opacity: 0.9,
              transition: 'opacity 0.2s'
            }} 
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.9'}
          >
            <BsXLg />
          </Button>
        </div>
      </div>
      {/* Mensajes */}
      {!minimized && (
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          background: 'var(--bg-secondary, #f9fafb)', 
          padding: 16
        }}>
          {loading ? (
            <div className="text-center my-4">
              <Spinner animation="border" style={{ color: '#667eea' }} />
            </div>
          ) : (
            messages.length > 0 ? messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.from === me?.uid ? 'flex-end' : 'flex-start',
                marginBottom: 10
              }}>
                <div style={{
                  maxWidth: '75%',
                  background: msg.from === me?.uid 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                    : 'var(--card-bg, #ffffff)',
                  color: msg.from === me?.uid ? '#fff' : 'var(--text-primary, #1f2937)',
                  borderRadius: 16,
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  boxShadow: msg.from === me?.uid 
                    ? '0 4px 12px rgba(102, 126, 234, 0.3)' 
                    : '0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: msg.from === me?.uid 
                    ? 'none' 
                    : '1px solid var(--border-color, rgba(102, 126, 234, 0.1))',
                  wordWrap: 'break-word',
                  lineHeight: 1.4
                }}>
                  {msg.text}
                </div>
                {msg.from === me?.uid && idx === messages.length - 1 && isRead && (
                  <div style={{
                    fontSize: 11,
                    color: '#9ca3af',
                    marginTop: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}>
                    <BsCheckAll style={{ fontSize: 14, color: '#667eea' }} />
                    Visto
                  </div>
                )}
              </div>
            )) : (
              <div style={{ 
                color: 'var(--text-secondary, #9ca3af)', 
                textAlign: 'center', 
                marginTop: 80,
                fontSize: 14
              }}>
                <div style={{ fontSize: 48, marginBottom: 12, opacity: 0.5 }}>💬</div>
                <div>No hay mensajes aún</div>
                <div style={{ fontSize: 13, marginTop: 8 }}>Envía un mensaje para iniciar la conversación</div>
              </div>
            )
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
      {/* Input */}
      {!minimized && (
        <Form 
          style={{ 
            background: 'var(--card-bg, #ffffff)', 
            padding: 12, 
            borderTop: '1px solid var(--border-color, rgba(102, 126, 234, 0.1))',
            backdropFilter: 'blur(10px)'
          }} 
          onSubmit={handleSend}
        >
          <div style={{ display: 'flex', gap: 10 }}>
            <Form.Control
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              style={{ 
                background: 'var(--input-bg, #f9fafb)', 
                color: 'var(--text-primary, #1f2937)', 
                border: '1px solid var(--border-color, rgba(102, 126, 234, 0.2))',
                borderRadius: 12,
                padding: '10px 14px',
                fontSize: 14,
                transition: 'all 0.2s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                e.target.style.boxShadow = 'none';
              }}
            />
            <Button 
              type="submit" 
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none',
                borderRadius: 12,
                padding: '10px 20px',
                fontWeight: 600,
                fontSize: 14,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
              }}
            >
              Enviar
            </Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default ChatWindow;
