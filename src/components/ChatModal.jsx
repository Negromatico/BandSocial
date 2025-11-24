import React, { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form, ListGroup, Spinner } from 'react-bootstrap';
import { db, auth } from '../services/firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  setDoc,
  getDoc,
} from 'firebase/firestore';

function getChatId(uid1, uid2) {
  return [uid1, uid2].sort().join('_');
}

const ChatModal = ({ show, onHide, otherUser, otherUserId, otherUserName, otherUserPhoto }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const user = auth.currentUser;
  
  // Normalizar datos del otro usuario (soportar ambos formatos)
  const normalizedOtherUser = otherUser || {
    uid: otherUserId,
    nombre: otherUserName,
    email: otherUserName, // Fallback
    fotoPerfil: otherUserPhoto
  };
  
  const chatId = user && normalizedOtherUser ? getChatId(user.uid, normalizedOtherUser.uid) : null;

  // Preferir nombre sobre email
  const displayName = normalizedOtherUser?.nombre || normalizedOtherUser?.email || 'Usuario';

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, show]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || sending) return;
    
    setSending(true);
    const messageText = newMsg.trim();
    
    try {
      // Limpiar el input inmediatamente para mejor UX
      setNewMsg('');
      
      // Enviar mensaje
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: messageText,
        from: user.uid,
        to: normalizedOtherUser.uid,
        createdAt: serverTimestamp(),
      });
      
      // Obtener nombre del usuario actual
      let currentUserName = user.displayName || user.email;
      if (!user.displayName) {
        try {
          const userDoc = await getDoc(doc(db, 'perfiles', user.uid));
          if (userDoc.exists()) {
            currentUserName = userDoc.data().nombre || user.email;
          }
        } catch (err) {
          console.error('Error obteniendo nombre de usuario:', err);
        }
      }
      
      // Crear chat metadata para ambos usuarios
      await Promise.all([
        setDoc(doc(db, 'userChats', user.uid, 'chats', chatId), {
          chatId,
          with: normalizedOtherUser.uid,
          withEmail: normalizedOtherUser.email || '',
          withNombre: normalizedOtherUser.nombre || normalizedOtherUser.email || 'Usuario',
          lastMsg: messageText,
          lastAt: new Date().toISOString(),
        }, { merge: true }),
        setDoc(doc(db, 'userChats', normalizedOtherUser.uid, 'chats', chatId), {
          chatId,
          with: user.uid,
          withEmail: user.email,
          withNombre: currentUserName,
          lastMsg: messageText,
          lastAt: new Date().toISOString(),
        }, { merge: true }),
      ]);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
      // Restaurar el mensaje si hubo error
      setNewMsg(messageText);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="md" centered>
      <Modal.Header closeButton style={{ background: '#a78bfa', color: '#fff' }}>
        <Modal.Title>Chat con {displayName}</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ background: '#f3f0fa', minHeight: 350, maxHeight: 400, overflowY: 'auto' }}>
        {loading ? (
          <div className="text-center my-4"><Spinner animation="border" /></div>
        ) : (
          <ListGroup variant="flush">
            {messages.map((msg, idx) => (
              <ListGroup.Item
                key={idx}
                className={msg.from === user.uid ? 'text-end bg-light' : 'text-start'}
                style={{ border: 'none', background: msg.from === user.uid ? '#e9d5ff' : '#fff' }}
              >
                <span style={{ fontWeight: 500 }}>{msg.text}</span>
              </ListGroup.Item>
            ))}
            <div ref={messagesEndRef} />
          </ListGroup>
        )}
      </Modal.Body>
      <Modal.Footer style={{ background: '#f3f0fa' }}>
        <Form onSubmit={handleSend} className="w-100 d-flex gap-2">
          <Form.Control
            type="text"
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            placeholder="Escribe un mensaje..."
            autoFocus
            disabled={sending}
          />
          <Button type="submit" variant="primary" disabled={sending || !newMsg.trim()}>
            {sending ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-1"
                />
                Enviando...
              </>
            ) : (
              'Enviar'
            )}
          </Button>
        </Form>
      </Modal.Footer>
    </Modal>
  );
};

export default ChatModal;
