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

const ChatModal = ({ show, onHide, otherUser }) => {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const user = auth.currentUser;
  const chatId = user && otherUser ? getChatId(user.uid, otherUser.uid) : null;

  // Preferir nombre sobre email
  const displayName = otherUser?.nombre || otherUser?.email || 'Usuario';

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
    if (!newMsg.trim()) return;
    await addDoc(collection(db, 'chats', chatId, 'messages'), {
      text: newMsg,
      from: user.uid,
      to: otherUser.uid,
      createdAt: serverTimestamp(),
    });
    setNewMsg('');
    // Crear chat metadata para ambos usuarios
    await Promise.all([
      setDoc(doc(db, 'userChats', user.uid, 'chats', chatId), {
        chatId,
        with: otherUser.uid,
        withEmail: otherUser.email,
        withNombre: otherUser.nombre,
        lastMsg: newMsg,
        lastAt: new Date().toISOString(),
      }, { merge: true }),
      setDoc(doc(db, 'userChats', otherUser.uid, 'chats', chatId), {
        chatId,
        with: user.uid,
        withEmail: user.email,
        withNombre: user.displayName || user.nombre || user.email,
        lastMsg: newMsg,
        lastAt: new Date().toISOString(),
      }, { merge: true }),
    ]);
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
          />
          <Button type="submit" variant="primary">Enviar</Button>
        </Form>
      </Modal.Footer>
    </Modal>
  );
};

export default ChatModal;
