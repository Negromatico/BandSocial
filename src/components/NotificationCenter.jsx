import React, { useState, useEffect } from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { FaBell, FaUserPlus, FaHeart, FaComment, FaMusic, FaCalendar, FaEnvelope } from 'react-icons/fa';
import { db, auth } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useChatDock } from '../contexts/ChatDockContext';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todas');
  const navigate = useNavigate();
  const { openChat } = useChatDock();
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
        // Si tiene referenciaId (ID de la publicación), navegar a publicaciones con scroll
        if (notification.referenciaId) {
          navigate('/publicaciones', { state: { scrollToPublicacion: notification.referenciaId } });
        } else {
          navigate('/publicaciones');
        }
        break;
      case 'nueva_publicacion':
        navigate('/publicaciones');
        break;
      case 'producto':
        if (notification.referenciaId) {
          navigate('/musicmarket', { state: { scrollToProducto: notification.referenciaId } });
        } else {
          navigate('/musicmarket');
        }
        break;
      case 'evento':
        if (notification.referenciaId) {
          navigate('/eventos', { state: { scrollToEvento: notification.referenciaId } });
        } else {
          navigate('/eventos');
        }
        break;
      case 'mensaje':
        // Abrir chat flotante con el remitente
        openChat({
          with: notification.origenUid,
          withEmail: notification.origenNombre || 'Usuario',
          withNombre: notification.origenNombre || 'Usuario',
          chatId: [user.uid, notification.origenUid].sort().join('_')
        });
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (tipo) => {
    switch (tipo) {
      case 'seguidor':
        return <FaUserPlus className="notif-icon" style={{ color: '#3b82f6' }} />;
      case 'like':
        return <FaHeart className="notif-icon" style={{ color: '#ef4444' }} />;
      case 'comentario':
        return <FaComment className="notif-icon" style={{ color: '#3b82f6' }} />;
      case 'nueva_publicacion':
        return <FaBell className="notif-icon" style={{ color: '#3b82f6' }} />;
      case 'producto':
        return <FaMusic className="notif-icon" style={{ color: '#3b82f6' }} />;
      case 'evento':
        return <FaCalendar className="notif-icon" style={{ color: '#3b82f6' }} />;
      case 'mensaje':
        return <FaEnvelope className="notif-icon" style={{ color: '#3b82f6' }} />;
      default:
        return <FaBell className="notif-icon" style={{ color: '#6b7280' }} />;
    }
  };

  const getNotificationCategory = (tipo) => {
    if (tipo === 'evento') return 'eventos';
    if (['seguidor', 'like', 'comentario', 'nueva_publicacion'].includes(tipo)) return 'sociales';
    return 'todas';
  };

  const getActionButtons = (notification) => {
    switch (notification.tipo) {
      case 'evento':
        return [
          { label: 'Ver evento', action: () => handleNotificationClick(notification) },
          { label: 'Descartar', action: () => markAsRead(notification.id), secondary: true }
        ];
      case 'seguidor':
        return [
          { label: 'Ver perfil', action: () => handleNotificationClick(notification) },
          { label: 'Seguir de vuelta', action: () => handleNotificationClick(notification), secondary: true }
        ];
      case 'comentario':
        return [
          { label: 'Responder', action: () => handleNotificationClick(notification) },
          { label: 'Ver publicación', action: () => handleNotificationClick(notification), secondary: true }
        ];
      case 'like':
        return [
          { label: 'Ver publicación', action: () => handleNotificationClick(notification) }
        ];
      default:
        return [
          { label: 'Ver detalles', action: () => handleNotificationClick(notification) },
          { label: 'Descartar', action: () => markAsRead(notification.id), secondary: true }
        ];
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'todas') return true;
    return getNotificationCategory(notif.tipo) === activeTab;
  });

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
          <div className="notification-header-top">
            <div className="notification-title">
              <FaBell className="title-icon" />
              <h6 className="mb-0">Notificaciones</h6>
            </div>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read-btn"
                onClick={markAllAsRead}
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="notification-tabs">
            <button 
              className={`tab-btn ${activeTab === 'todas' ? 'active' : ''}`}
              onClick={() => setActiveTab('todas')}
            >
              Todas ({notifications.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'eventos' ? 'active' : ''}`}
              onClick={() => setActiveTab('eventos')}
            >
              Eventos ({notifications.filter(n => getNotificationCategory(n.tipo) === 'eventos').length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'sociales' ? 'active' : ''}`}
              onClick={() => setActiveTab('sociales')}
            >
              Sociales ({notifications.filter(n => getNotificationCategory(n.tipo) === 'sociales').length})
            </button>
          </div>
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
            filteredNotifications.slice(0, 10).map(notif => {
              const actionButtons = getActionButtons(notif);
              return (
                <div
                  key={notif.id}
                  className={`notification-item ${!notif.leida ? 'unread' : ''}`}
                >
                  <div className="notification-icon-wrapper">
                    {getNotificationIcon(notif.tipo)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-header-row">
                      <p className="notification-title">{notif.mensaje.split('.')[0]}</p>
                      <span className="notification-time">{formatTime(notif.createdAt)}</span>
                      {!notif.leida && <div className="notification-dot" />}
                    </div>
                    <p className="notification-description">
                      {notif.mensaje.split('.').slice(1).join('.').trim()}
                    </p>
                    <div className="notification-actions">
                      {actionButtons.map((btn, idx) => (
                        <button
                          key={idx}
                          className={`action-btn ${btn.secondary ? 'secondary' : 'primary'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            btn.action();
                          }}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
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
