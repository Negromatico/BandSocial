import React, { useState, useRef, useEffect } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { BsChevronDown, BsXLg } from 'react-icons/bs';
import { db, auth } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc as docFirestore, setDoc } from 'firebase/firestore';

const ChatWindow = ({ user, onClose, onMinimize, minimized, style = {}, ...props }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const me = auth.currentUser;
  const chatId = user && me ? [user.uid, me.uid].sort().join('_') : null;

  useEffect(() => {
    if (!chatId) return;
    setLoading(true);
    const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => doc.data()));
      setLoading(false);
    });
    return unsub;
  }, [chatId]);

  useEffect(() => {
    if (!minimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, minimized]);

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
  };

  return (
    <div
      style={{
        width: 320,
        height: minimized ? 48 : 400,
        background: '#18181b',
        color: '#fff',
        borderRadius: 18,
        boxShadow: '0 4px 32px #0004',
        overflow: 'hidden',
        marginBottom: 8,
        display: 'flex',
        flexDirection: 'column',
        ...style,
      }}
      {...props}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#27272a', padding: '8px 16px', height: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 18 }}>
            {user?.avatar ? <img src={user.avatar} alt="avatar" style={{ width: 32, height: 32, borderRadius: '50%' }} /> : (user?.nombre?.[0] || user?.email?.[0] || '?')}
          </div>
          <span style={{ fontWeight: 600, fontSize: 16 }}>{user?.nombre || user?.email || 'Usuario'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Button variant="link" style={{ color: '#fff', fontSize: 18, padding: 0 }} onClick={onMinimize}><BsChevronDown /></Button>
          <Button variant="link" style={{ color: '#fff', fontSize: 18, padding: 0 }} onClick={onClose}><BsXLg /></Button>
        </div>
      </div>
      {/* Mensajes */}
      {!minimized && (
        <div style={{ flex: 1, overflowY: 'auto', background: '#222', padding: 12 }}>
          {loading ? (
            <div className="text-center my-4"><Spinner animation="border" /></div>
          ) : (
            messages.length > 0 ? messages.map((msg, idx) => (
              <div key={idx} style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: msg.from === me?.uid ? 'flex-end' : 'flex-start',
                marginBottom: 8
              }}>
                <div style={{
                  maxWidth: '80%',
                  background: msg.from === me?.uid ? '#7c3aed' : '#27272a',
                  color: msg.from === me?.uid ? '#fff' : '#fafafa',
                  borderRadius: 16,
                  padding: '7px 13px',
                  fontSize: 15,
                  fontWeight: 500,
                  boxShadow: msg.from === me?.uid ? '0 2px 8px #7c3aed33' : '0 1px 4px #0001',
                  marginLeft: msg.from === me?.uid ? 32 : 0,
                  marginRight: msg.from === me?.uid ? 0 : 32,
                  marginTop: 2
                }}>
                  {msg.text}
                </div>
              </div>
            )) : <div style={{ color: '#bbb', textAlign: 'center', marginTop: 40 }}>No hay mensajes aún.</div>
          )}
          <div ref={messagesEndRef} />
        </div>
      )}
      {/* Input */}
      {!minimized && (
        <Form style={{ background: '#27272a', padding: 8, borderTop: '1px solid #18181b' }} onSubmit={handleSend}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Form.Control
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Escribe un mensaje..."
              style={{ background: '#18181b', color: '#fff', border: 'none' }}
            />
            <Button type="submit" variant="primary">Enviar</Button>
          </div>
        </Form>
      )}
    </div>
  );
};

export default ChatWindow;
