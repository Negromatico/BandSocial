import React, { useEffect, useState, useRef } from 'react';
import { db, auth } from '../services/firebase';
import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { Row, Col, ListGroup, Form, Button, Spinner, Badge } from 'react-bootstrap';

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

const MessengerChat = () => {
  const user = auth.currentUser;
  const [chats, setChats] = useState([]);
  const [unreadChats, setUnreadChats] = useState({});
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const messagesEndRef = useRef(null);

  // Load user chats
  useEffect(() => {
    if (!user) return;
    setLoadingChats(true);
    const unsub = onSnapshot(collection(db, 'userChats', user.uid, 'chats'), (snap) => {
      const data = snap.docs.map(doc => doc.data());
      // Order by lastAt desc
      data.sort((a, b) => (b.lastAt || '').localeCompare(a.lastAt || ''));
      setChats(data);
      // Calcular chats no leídos
      const unread = {};
      data.forEach(chat => {
        if (chat.lastMsg && chat.lastFrom && chat.lastFrom !== user.uid && !chat.lastRead) {
          unread[chat.chatId] = true;
        }
      });
      setUnreadChats(unread);
      setLoadingChats(false);
    });
    return unsub;
  }, [user]);

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat) return;
    setLoadingMsgs(true);
    const q = query(collection(db, 'chats', selectedChat.chatId, 'messages'), orderBy('createdAt'));
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => doc.data()));
      setLoadingMsgs(false);
      // Marcar como leído este chat
      if (user && selectedChat) {
        import('firebase/firestore').then(({ doc, updateDoc }) => {
          updateDoc(doc(db, 'userChats', user.uid, 'chats', selectedChat.chatId), { lastRead: true });
        });
      }
    });
    return unsub;
  }, [selectedChat, user, db]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedChat]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedChat) return;
    // Optimistic UI: agrega el mensaje localmente
    setMessages(prev => ([...prev, {
      text: newMsg,
      from: user.uid,
      to: selectedChat.with,
      createdAt: new Date(),
      optimistic: true
    }]));
    const msgText = newMsg;
    setNewMsg('');
    // Firebase
    await addDoc(collection(db, 'chats', selectedChat.chatId, 'messages'), {
      text: msgText,
      from: user.uid,
      to: selectedChat.with,
      createdAt: serverTimestamp(),
    });
    // Actualiza metadatos para ambos usuarios
    await Promise.all([
      import('firebase/firestore').then(({ doc, setDoc }) =>
        setDoc(doc(db, 'userChats', user.uid, 'chats', selectedChat.chatId), {
          chatId: selectedChat.chatId,
          with: selectedChat.with,
          withEmail: selectedChat.withEmail,
          withNombre: selectedChat.withNombre,
          lastMsg: msgText,
          lastAt: new Date().toISOString(),
          lastFrom: user.uid,
          lastRead: true
        }, { merge: true })
      ),
      import('firebase/firestore').then(({ doc, setDoc }) =>
        setDoc(doc(db, 'userChats', selectedChat.with, 'chats', selectedChat.chatId), {
          chatId: selectedChat.chatId,
          with: user.uid,
          withEmail: user.email,
          withNombre: user.displayName || user.email,
          lastMsg: msgText,
          lastAt: new Date().toISOString(),
          lastFrom: user.uid,
          lastRead: false
        }, { merge: true })
      )
    ]);
  };

  return (
    <Row className="g-0" style={{ minHeight: '70vh', background: '#f3f0fa', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 24px #a78bfa33' }}>
      {/* Sidebar de chats */}
      <Col xs={12} md={4} style={{ borderRight: '2px solid #ede9fe', background: '#ede9fe', minHeight: 400 }}>
        <div className="p-3 border-bottom" style={{ color: '#7c3aed', fontWeight: 700, fontSize: 20 }}>
          <span>Chats</span>
        </div>
        {loadingChats ? (
          <div className="text-center my-4"><Spinner animation="border" /></div>
        ) : chats.length === 0 ? (
          <div className="text-center my-5" style={{ color: '#a78bfa' }}>
            <div style={{ fontSize: 38 }}>💬</div>
            <div>No tienes mensajes recientes todavía</div>
          </div>
        ) : (
          <ListGroup variant="flush">
            {chats.map((c, i) => (
              <ListGroup.Item
                key={i}
                active={selectedChat?.chatId === c.chatId}
                onClick={() => setSelectedChat(c)}
                style={{ cursor: 'pointer', border: 'none', background: unreadChats[c.chatId] ? '#fef08a' : (selectedChat?.chatId === c.chatId ? '#e9d5ff' : 'inherit'), fontWeight: unreadChats[c.chatId] ? 700 : 400 }}
                className="d-flex align-items-center gap-2"
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
                  {c.withNombre ? c.withNombre[0].toUpperCase() : '👤'}
                </div>
                <div className="flex-grow-1">
                  <div style={{ fontWeight: 500, color: '#7c3aed' }}>{c.withNombre || 'Usuario'}</div>
                  <div style={{ fontSize: 13, color: '#6b7280' }}>{c.lastMsg?.slice(0, 30) || ''}</div>
                </div>
                {unreadChats[c.chatId] && (
                  <span style={{ background: '#dc3545', color: '#fff', borderRadius: '50%', minWidth: 16, height: 16, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, padding: '0 4px', marginLeft: 6 }}>●</span>
                )}
                {c.lastAt && <Badge bg="light" text="dark" style={{ fontSize: 11 }}>{new Date(c.lastAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Badge>}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Col>

      {/* Área de mensajes */}
      <Col xs={12} md={8} style={{ background: '#f3f0fa', minHeight: 400, display: 'flex', flexDirection: 'column' }}>
        {!selectedChat ? (
          <div className="d-flex flex-column justify-content-center align-items-center h-100">
            <div style={{ fontSize: 52, color: '#a78bfa' }}>💬</div>
            <div className="mt-2" style={{ color: '#7c3aed', fontWeight: 500 }}>Selecciona un chat para comenzar</div>
          </div>
        ) : (
          <>
            <div className="border-bottom p-3 d-flex align-items-center" style={{ background: '#ede9fe' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18 }}>
                {selectedChat.withEmail ? selectedChat.withEmail[0].toUpperCase() : '👤'}
              </div>
              <div className="ms-2">
                <div style={{ fontWeight: 600, color: '#7c3aed' }}>{selectedChat.withEmail}</div>
              </div>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 16, background: '#f3f0fa' }}>
              {loadingMsgs ? (
                <div className="text-center my-4"><Spinner animation="border" /></div>
              ) : (
                <div>
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`d-flex ${msg.from === user.uid ? 'justify-content-end' : 'justify-content-start'}`}
                    >
                      <div
                        style={{
                          background: msg.from === user.uid ? '#a78bfa' : '#ede9fe',
                          color: msg.from === user.uid ? '#fff' : '#7c3aed',
                          borderRadius: 16,
                          padding: '8px 16px',
                          marginBottom: 6,
                          maxWidth: '70%',
                          fontSize: 15,
                          boxShadow: '0 1px 4px #a78bfa22',
                        }}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <Form onSubmit={handleSend} className="p-3 border-top d-flex gap-2" style={{ background: '#ede9fe' }}>
              <Form.Control
                type="text"
                value={newMsg}
                onChange={e => setNewMsg(e.target.value)}
                placeholder="Escribe un mensaje..."
                autoFocus
                style={{ borderRadius: 16, border: '1.5px solid #a78bfa' }}
              />
              <Button type="submit" variant="primary" style={{ borderRadius: 16, minWidth: 90 }} disabled={!newMsg.trim()}>
                Enviar
              </Button>
            </Form>
          </>
        )}
      </Col>
    </Row>
  );
};

export default MessengerChat;
