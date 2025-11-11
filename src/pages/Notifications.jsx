import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Spinner } from 'react-bootstrap';
import { FaBell, FaUserPlus, FaHeart, FaComment, FaMusic, FaCalendar, FaCheckDouble } from 'react-icons/fa';
import { db, auth } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Listener en tiempo real para notificaciones
    const notificationsQuery = query(
      collection(db, 'notificaciones'),
      where('usuarioId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(notificationsQuery, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, navigate]);

  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notificaciones', notificationId), {
        leida: true
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifs = notifications.filter(n => !n.leida);
      await Promise.all(
        unreadNotifs.map(notif => 
          updateDoc(doc(db, 'notificaciones', notif.id), { leida: true })
        )
      );
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    // Navegar según el tipo de notificación
    switch (notification.tipo) {
      case 'seguidor':
        navigate(`/profile/${notification.origenUid}`);
        break;
      case 'like':
      case 'comentario':
        navigate('/publicaciones');
        break;
      case 'producto':
        navigate('/musicmarket');
        break;
      case 'evento':
        navigate('/eventos');
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'seguidor':
        return <FaUserPlus className="notif-icon" style={{ color: '#667eea' }} />;
      case 'like':
        return <FaHeart className="notif-icon" style={{ color: '#ef4444' }} />;
      case 'comentario':
        return <FaComment className="notif-icon" style={{ color: '#10b981' }} />;
      case 'producto':
        return <FaMusic className="notif-icon" style={{ color: '#f59e0b' }} />;
      case 'evento':
        return <FaCalendar className="notif-icon" style={{ color: '#8b5cf6' }} />;
      default:
        return <FaBell className="notif-icon" style={{ color: '#6b7280' }} />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)}d`;
    return date.toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.leida;
    if (filter === 'read') return notif.leida;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.leida).length;

  return (
    <Container className="notifications-page py-4">
      <Card className="notifications-card">
        <Card.Header className="notifications-header">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h3 className="mb-1">
                <FaBell className="me-2" />
                Notificaciones
              </h3>
              {unreadCount > 0 && (
                <small className="text-muted">{unreadCount} sin leer</small>
              )}
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={markAllAsRead}
              >
                <FaCheckDouble className="me-2" />
                Marcar todas como leídas
              </Button>
            )}
          </div>
        </Card.Header>

        <div className="notifications-filters">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            Todas ({notifications.length})
          </Button>
          <Button
            variant={filter === 'unread' ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => setFilter('unread')}
          >
            Sin leer ({unreadCount})
          </Button>
          <Button
            variant={filter === 'read' ? 'primary' : 'outline-secondary'}
            size="sm"
            onClick={() => setFilter('read')}
          >
            Leídas ({notifications.length - unreadCount})
          </Button>
        </div>

        <Card.Body className="notifications-body">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-5">
              <FaBell size={60} style={{ color: '#d1d5db', marginBottom: '20px' }} />
              <h5 className="text-muted">No tienes notificaciones</h5>
              <p className="text-muted">
                {filter === 'unread' && 'No tienes notificaciones sin leer'}
                {filter === 'read' && 'No tienes notificaciones leídas'}
                {filter === 'all' && 'Cuando recibas notificaciones, aparecerán aquí'}
              </p>
            </div>
          ) : (
            <div className="notifications-list">
              {filteredNotifications.map(notif => (
                <div
                  key={notif.id}
                  className={`notification-item-page ${!notif.leida ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notif)}
                >
                  <div className="notification-icon-wrapper">
                    {getNotificationIcon(notif.tipo)}
                  </div>
                  <div className="notification-content">
                    <p className="notification-text">{notif.mensaje}</p>
                    <span className="notification-time">{formatTime(notif.createdAt)}</span>
                  </div>
                  {!notif.leida && <div className="notification-dot" />}
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Notifications;
