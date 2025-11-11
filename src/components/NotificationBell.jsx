import React from 'react';
import { Dropdown, Badge } from 'react-bootstrap';
import { BellFill } from 'react-bootstrap-icons';
import { useNavigate } from 'react-router-dom';
import useNotifications from '../hooks/useNotifications';

export default function NotificationBell() {
  const { notifications, markAsRead } = useNotifications();
  const unreadCount = notifications.filter(n => !n.read).length;
  const navigate = useNavigate();

  const handleClick = async (n) => {
    if (!n.read) await markAsRead(n.id);
    if (n.link) navigate(n.link);
  };

  return (
    <Dropdown align="end" className="notification-bell">
      <Dropdown.Toggle variant="link" style={{color: '#7c3aed', position: 'relative', fontSize: 22, padding: 0, boxShadow: 'none'}}>
        <BellFill />
        {unreadCount > 0 && (
          <Badge bg="danger" pill style={{position:'absolute', top:0, right:0, fontSize:11}}>{unreadCount}</Badge>
        )}
      </Dropdown.Toggle>
      <Dropdown.Menu style={{minWidth:320, maxHeight:400, overflowY:'auto'}}>
        <Dropdown.Header>Notificaciones</Dropdown.Header>
        {notifications.length === 0 && <Dropdown.ItemText className="text-muted">Sin notificaciones nuevas</Dropdown.ItemText>}
        {notifications.map(n => (
          <Dropdown.Item
            key={n.id}
            style={{fontWeight: n.read ? 400 : 700, background: n.read ? '' : '#ede9fe', cursor: n.link ? 'pointer' : 'default'}}
            onClick={() => handleClick(n)}
            as={n.link ? 'button' : 'div'}
          >
            <div style={{fontSize:14}}>{n.text}</div>
            <div style={{fontSize:11, color:'#888'}}>{new Date(n.date?.toDate ? n.date.toDate() : n.date).toLocaleString()}</div>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
}
