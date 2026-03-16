import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Badge } from 'react-bootstrap';
import { auth, db } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FaComments, FaInbox } from 'react-icons/fa';
import { useChatDock } from '../contexts/ChatDockContext';
import './Messages.css';

const Messages = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { openChat } = useChatDock();

  useEffect(() => {
    if (!auth.currentUser) {
      navigate('/login');
      return;
    }

    const q = query(
      collection(db, 'conversaciones'),
      where('participantes', 'array-contains', auth.currentUser.uid),
      orderBy('ultimaActualizacion', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(convs);
      setLoading(false);
    }, (error) => {
      console.error('Error loading conversations:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleOpenChat = (conversation) => {
    const otherUserId = conversation.participantes.find(id => id !== auth.currentUser.uid);
    
    openChat({
      with: otherUserId,
      withEmail: conversation.participantesInfo?.[otherUserId]?.email || 'Usuario',
      withNombre: conversation.participantesInfo?.[otherUserId]?.nombre || 'Usuario',
      chatId: conversation.id,
      avatar: conversation.participantesInfo?.[otherUserId]?.fotoPerfil || ''
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return 'Ahora';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

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
        <h2>
          <FaComments className="me-2" />
          Mensajes
        </h2>
      </div>

      {conversations.length === 0 ? (
        <div className="empty-state">
          <FaInbox className="empty-state-icon" />
          <h4>No tienes mensajes</h4>
          <p className="text-muted">
            Cuando inicies una conversación, aparecerá aquí
          </p>
        </div>
      ) : (
        <ListGroup className="conversations-list">
          {conversations.map((conversation) => {
            const otherUserId = conversation.participantes.find(id => id !== auth.currentUser.uid);
            const otherUser = conversation.participantesInfo?.[otherUserId] || {};
            const unread = conversation.noLeidos?.[auth.currentUser.uid] || 0;

            return (
              <ListGroup.Item
                key={conversation.id}
                className={`conversation-item ${unread > 0 ? 'unread' : ''}`}
                onClick={() => handleOpenChat(conversation)}
                style={{ cursor: 'pointer' }}
              >
                <div className="conversation-avatar">
                  {otherUser.fotoPerfil ? (
                    <img src={otherUser.fotoPerfil} alt={otherUser.nombre} />
                  ) : (
                    <div className="avatar-placeholder">
                      {(otherUser.nombre || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="conversation-content">
                  <div className="conversation-header">
                    <h6 className="conversation-name">
                      {otherUser.nombre || otherUser.email || 'Usuario'}
                    </h6>
                    <span className="conversation-time">
                      {formatTime(conversation.ultimaActualizacion)}
                    </span>
                  </div>
                  
                  <div className="conversation-preview">
                    <p className="last-message">
                      {conversation.ultimoMensaje || 'Sin mensajes'}
                    </p>
                    {unread > 0 && (
                      <Badge bg="primary" className="unread-badge">
                        {unread}
                      </Badge>
                    )}
                  </div>
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      )}
    </Container>
  );
};

export default Messages;
