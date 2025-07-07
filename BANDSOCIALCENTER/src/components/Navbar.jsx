import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import NotificationBell from './NotificationBell';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { GuestContext } from '../App';
import useUnreadChats from '../hooks/useUnreadChats';

const AppNavbar = () => {
  const [user, setUser] = React.useState(null);
  const guestContext = useContext(GuestContext);
  const isGuest = guestContext && guestContext.isGuest;
  const unreadCount = useUnreadChats();
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    localStorage.removeItem('guest');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('¿Seguro que deseas borrar tu cuenta? Esta acción no se puede deshacer.')) return;
    try {
      await auth.currentUser.delete();
      navigate('/register');
    } catch (err) {
      alert('Error borrando la cuenta: ' + (err.message || err.toString()));
    }
  };


  return (
    <Navbar bg="white" expand="md" className="shadow-sm mb-4 sticky-top" style={{ borderBottom: '2px solid #ede9fe', zIndex: 1030 }} collapseOnSelect>
      <Container>
        <Navbar.Brand as={Link} to="/" style={{ color: '#7c3aed', fontWeight: 700, fontSize: 24 }}>
          BandSocial
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto gap-2">
            <Nav.Link as={Link} to="/publicaciones">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/musicos">Músicos/Bandas</Nav.Link>
            <Nav.Link as={Link} to="/eventos">Eventos</Nav.Link>
            <Nav.Link as={Link} to="/chat" style={{ position: 'relative' }}>
              Chat
              {unreadCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 2,
                  right: -14,
                  background: '#dc3545',
                  color: '#fff',
                  borderRadius: '50%',
                  minWidth: 20,
                  height: 20,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 5px',
                  fontWeight: 700,
                  zIndex: 2
                }}>{unreadCount}</span>
              )}
            </Nav.Link>
          </Nav>
          {user && !isGuest && (
            <div className="d-flex align-items-center gap-2">
              <NotificationBell />
              <NavDropdown
                title={<span style={{ color: '#7c3aed', fontWeight: 600 }}>{user.displayName || 'Cuenta'}</span>}
                id="user-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">Perfil</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/publicaciones">Publicaciones realizadas</NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/soporte">Soporte</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Cerrar sesión</NavDropdown.Item>
                <NavDropdown.Item onClick={handleDeleteAccount} style={{ color: '#dc3545' }}>Borrar cuenta</NavDropdown.Item>
              </NavDropdown>
            </div>
          )}
          {!user && !isGuest && (
            <div className="d-flex gap-2">
              <Button variant="primary" as={Link} to="/login">Entrar</Button>
              <Button variant="outline-primary" as={Link} to="/register">Registro</Button>
            </div>
          )}
          {isGuest && (
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-warning text-dark">Invitado</span>
              <Button variant="primary" as={Link} to="/login">Entrar</Button>
              <Button variant="outline-primary" as={Link} to="/register">Registro</Button>
            </div>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
