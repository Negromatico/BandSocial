import React, { useContext, useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, InputGroup, NavDropdown } from 'react-bootstrap';
import NotificationCenter from './NotificationCenter';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { GuestContext } from '../App';
import useUnreadChats from '../hooks/useUnreadChats';
import { FaSearch, FaUserCircle } from 'react-icons/fa';
import './Navbar.css';

const AppNavbar = () => {
  const [user, setUser] = React.useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const guestContext = useContext(GuestContext);
  const isGuest = guestContext && guestContext.isGuest;
  const unreadCount = useUnreadChats();
  const navigate = useNavigate();

  React.useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          const docSnap = await getDoc(doc(db, 'perfiles', user.uid));
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
        }
      }
    };
    fetchUserProfile();
  }, [user]);

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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <Navbar bg="white" expand="lg" className="custom-navbar shadow-sm sticky-top">
      <Container fluid className="px-4">
        {/* Logo */}
        <Navbar.Brand as={Link} to="/publicaciones" className="navbar-logo">
          <span className="logo-band">BAND</span>
          <span className="logo-social">SOCIAL</span>
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          {/* Navigation Links */}
          <Nav className="mx-auto navbar-links">
            <Nav.Link as={Link} to="/publicaciones" className="nav-link-custom">
              Inicio
            </Nav.Link>
            <Nav.Link as={Link} to="/musicmarket" className="nav-link-custom">
              Musicmarket
            </Nav.Link>
            <Nav.Link as={Link} to="/eventos" className="nav-link-custom">
              Eventos
            </Nav.Link>
          </Nav>

          {/* Search Bar */}
          <Form onSubmit={handleSearch} className="search-form mx-3">
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <InputGroup.Text className="search-icon">
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
          </Form>

          {/* Right Side Actions */}
          <div className="navbar-actions d-flex align-items-center gap-3">
            {user && !isGuest && (
              <>
                <NotificationCenter />
                <NavDropdown
                  title={
                    <div className="user-avatar">
                      {userProfile?.fotoPerfil ? (
                        <img src={userProfile.fotoPerfil} alt="Avatar" className="avatar-img" />
                      ) : (
                        <FaUserCircle size={35} color="#0d6efd" />
                      )}
                    </div>
                  }
                  id="user-nav-dropdown"
                  align="end"
                  className="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile">Mi Perfil</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/publicaciones">Mis Publicaciones</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/followers">Seguidores y Siguiendo</NavDropdown.Item>
                  {!isGuest && (
                    <NavDropdown.Item as={Link} to="/chat">
                      Chat {unreadCount > 0 && <span className="badge bg-danger ms-2">{unreadCount}</span>}
                    </NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Cerrar sesión</NavDropdown.Item>
                  <NavDropdown.Item onClick={handleDeleteAccount} className="text-danger">
                    Borrar cuenta
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
            {!user && !isGuest && (
              <div className="d-flex gap-2">
                <Link to="/login" className="btn btn-outline-primary btn-sm">
                  Entrar
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Registro
                </Link>
              </div>
            )}
            {isGuest && (
              <div className="d-flex gap-2 align-items-center">
                <span className="badge bg-warning text-dark">Invitado</span>
                <Link to="/login" className="btn btn-outline-primary btn-sm">
                  Entrar
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Registro
                </Link>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

import ChatDock from './ChatDock';

export default function AppNavbarWithDock(props) {
  return (
    <>
      <AppNavbar {...props} />
      <ChatDock />
    </>
  );
}

// Para mantener retrocompatibilidad
export { AppNavbar };
