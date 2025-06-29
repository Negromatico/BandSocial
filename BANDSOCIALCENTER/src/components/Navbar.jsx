import React from 'react';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';

const AppNavbar = () => {
  const [user, setUser] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
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
            <Nav.Link as={Link} to="/">Inicio</Nav.Link>
            <Nav.Link as={Link} to="/publicaciones">Publicaciones</Nav.Link>
            <Nav.Link as={Link} to="/eventos">Eventos</Nav.Link>
            <Nav.Link as={Link} to="/chat">Chat</Nav.Link>
          </Nav>
          {user ? (
            <NavDropdown
              title={<span style={{ color: '#7c3aed', fontWeight: 600 }}>{user.displayName || user.email || 'Cuenta'}</span>}
              id="user-nav-dropdown"
              align="end"
            >
              <NavDropdown.Item as={Link} to="/profile">Perfil</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/publicaciones">Publicaciones realizadas</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={handleLogout}>Cerrar sesión</NavDropdown.Item>
              <NavDropdown.Item onClick={handleDeleteAccount} style={{ color: '#dc3545' }}>Borrar cuenta</NavDropdown.Item>
            </NavDropdown>
          ) : (
            <div className="d-flex gap-2">
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
