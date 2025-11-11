import React, { useState, useEffect } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { FaBell, FaUserPlus, FaHeart, FaComment, FaMusic, FaCalendar } from 'react-icons/fa';
import { db, auth } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

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
      setUnreadCount(notifs.filter(n => !n.leida).length);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

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
    return date.toLocaleDateString('es-CO');
  };

  return (
    <Dropdown align="end" className="notification-dropdown">
      <Dropdown.Toggle 
        variant="link" 
        id="notification-dropdown"
        className="notification-toggle"
      >
        <FaBell size={20} />
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            pill 
            className="notification-badge"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-menu">
        <div className="notification-header">
          <h6 className="mb-0">Notificaciones</h6>
          {unreadCount > 0 && (
            <button 
              className="mark-all-read-btn"
              onClick={markAllAsRead}
            >
              Marcar todas como leídas
            </button>
          )}
        </div>

        <div className="notification-list">
          {loading ? (
            <div className="notification-loading">
              <div className="spinner-border spinner-border-sm" role="status">
                <span className="visually-hidden">Cargando...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="notification-empty">
              <FaBell size={40} style={{ color: '#d1d5db', marginBottom: '10px' }} />
              <p>No tienes notificaciones</p>
            </div>
          ) : (
            notifications.slice(0, 10).map(notif => (
              <div
                key={notif.id}
                className={`notification-item ${!notif.leida ? 'unread' : ''}`}
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
            ))
          )}
        </div>

        {notifications.length > 10 && (
          <div className="notification-footer">
            <button 
              className="view-all-btn"
              onClick={() => navigate('/notifications')}
            >
              Ver todas las notificaciones
            </button>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationCenter;
