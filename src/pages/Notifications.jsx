import React, { useState, useEffect } from 'react';
import { Container, Button, Spinner } from 'react-bootstrap';
import { FaBell, FaUserPlus, FaComment, FaCalendar, FaStar, FaEnvelope } from 'react-icons/fa';
import { db, auth } from '../services/firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useChatDock } from '../contexts/ChatDockContext';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('todas'); // todas, eventos, sociales, mensajes
  const navigate = useNavigate();
  const { openChat } = useChatDock();
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
        return <FaUserPlus className="notif-icon" />;
      case 'comentario':
        return <FaComment className="notif-icon" />;
      case 'evento':
      case 'recordatorio':
        return <FaCalendar className="notif-icon" />;
      case 'destacado':
        return <FaStar className="notif-icon" />;
      case 'mensaje':
        return <FaEnvelope className="notif-icon" />;
      default:
        return <FaBell className="notif-icon" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Hace 1 min';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} hora${Math.floor(diff / 3600) > 1 ? 's' : ''}`;
    if (diff < 604800) return `Hace ${Math.floor(diff / 86400)} día${Math.floor(diff / 86400) > 1 ? 's' : ''}`;
    return date.toLocaleDateString('es-CO', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  const getNotificationCategory = (tipo) => {
    if (tipo === 'evento' || tipo === 'recordatorio') return 'eventos';
    if (tipo === 'seguidor' || tipo === 'comentario' || tipo === 'destacado') return 'sociales';
    if (tipo === 'mensaje') return 'mensajes';
    return 'todas';
  };

  const filteredNotifications = notifications.filter(notif => {
    if (activeTab === 'todas') return true;
    return getNotificationCategory(notif.tipo) === activeTab;
  });

  const unreadCount = notifications.filter(n => !n.leida).length;
  const eventosCount = notifications.filter(n => getNotificationCategory(n.tipo) === 'eventos').length;
  const socialesCount = notifications.filter(n => getNotificationCategory(n.tipo) === 'sociales').length;
  const mensajesCount = notifications.filter(n => getNotificationCategory(n.tipo) === 'mensajes').length;

  const getActionButton = (notif) => {
    switch (notif.tipo) {
      case 'evento':
        return { text: 'Ver evento', action: () => navigate('/eventos') };
      case 'recordatorio':
        return { text: 'Ver detalles', action: () => navigate('/eventos') };
      case 'seguidor':
        return { text: 'Ver perfil', action: () => navigate(`/profile/${notif.origenUid}`) };
      case 'comentario':
        return { text: 'Ver publicación', action: () => navigate('/publicaciones') };
      case 'destacado':
        return { text: 'Ver estadísticas', action: () => navigate('/publicaciones') };
      case 'mensaje':
        return { 
          text: 'Abrir chat', 
          action: () => openChat({
            with: notif.origenUid,
            withEmail: notif.origenNombre || 'Usuario',
            withNombre: notif.origenNombre || 'Usuario',
            chatId: [user.uid, notif.origenUid].sort().join('_')
          })
        };
      default:
        return { text: 'Ver', action: () => {} };
    }
  };

  return (
    <Container className="notifications-page py-4">
      <div className="notifications-container">
        {/* Header */}
        <div className="notifications-header-new">
          <div className="header-left">
            <FaBell className="bell-icon" />
            <h2 className="header-title">Notificaciones</h2>
          </div>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllAsRead}>
              Marcar todas como leídas
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="notifications-tabs">
          <button
            className={`tab-button ${activeTab === 'todas' ? 'active' : ''}`}
            onClick={() => setActiveTab('todas')}
          >
            Todas ({notifications.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'mensajes' ? 'active' : ''}`}
            onClick={() => setActiveTab('mensajes')}
          >
            Mensajes ({mensajesCount})
          </button>
          <button
            className={`tab-button ${activeTab === 'eventos' ? 'active' : ''}`}
            onClick={() => setActiveTab('eventos')}
          >
            Eventos ({eventosCount})
          </button>
          <button
            className={`tab-button ${activeTab === 'sociales' ? 'active' : ''}`}
            onClick={() => setActiveTab('sociales')}
          >
            Sociales ({socialesCount})
          </button>
        </div>

        {/* Content */}
        <div className="notifications-content">
          {loading ? (
            <div className="loading-state">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3">Cargando notificaciones...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="empty-state">
              <FaBell size={60} className="empty-icon" />
              <h5>No tienes notificaciones</h5>
              <p>
                {activeTab === 'eventos' && 'No tienes notificaciones de eventos'}
                {activeTab === 'sociales' && 'No tienes notificaciones sociales'}
                {activeTab === 'mensajes' && 'No tienes notificaciones de mensajes'}
                {activeTab === 'todas' && 'Cuando recibas notificaciones, aparecerán aquí'}
              </p>
            </div>
          ) : (
            <div className="notifications-list-new">
              {filteredNotifications.map(notif => {
                const actionBtn = getActionButton(notif);
                return (
                  <div
                    key={notif.id}
                    className={`notification-item-new ${!notif.leida ? 'unread' : ''}`}
                  >
                    <div className="notification-icon-circle">
                      {getNotificationIcon(notif.tipo)}
                    </div>
                    <div className="notification-body">
                      <div className="notification-header-item">
                        <h4 className="notification-title">
                          {notif.tipo === 'evento' && 'Nuevo evento cerca de ti'}
                          {notif.tipo === 'seguidor' && 'Nuevo seguidor'}
                          {notif.tipo === 'recordatorio' && 'Recordatorio de evento'}
                          {notif.tipo === 'comentario' && 'Nuevo comentario'}
                          {notif.tipo === 'destacado' && 'Evento destacado'}
                          {notif.tipo === 'mensaje' && 'Nuevo mensaje'}
                        </h4>
                        <span className="notification-time-new">{formatTime(notif.createdAt)}</span>
                        {!notif.leida && <div className="notification-dot-new" />}
                      </div>
                      <p className="notification-message">{notif.mensaje}</p>
                      <div className="notification-actions">
                        <button 
                          className="action-link primary"
                          onClick={() => {
                            markAsRead(notif.id);
                            actionBtn.action();
                          }}
                        >
                          {actionBtn.text}
                        </button>
                        {notif.tipo === 'recordatorio' && (
                          <button className="action-link secondary">
                            Descartar
                          </button>
                        )}
                        {notif.tipo === 'seguidor' && (
                          <button className="action-link secondary">
                            Seguir de vuelta
                          </button>
                        )}
                        {notif.tipo === 'comentario' && (
                          <button className="action-link secondary">
                            Responder
                          </button>
                        )}
                        {notif.tipo === 'mensaje' && (
                          <button 
                            className="action-link secondary"
                            onClick={() => markAsRead(notif.id)}
                          >
                            Marcar como leído
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
};

export default Notifications;
