import React, { useContext, useState, useEffect } from 'react';
import { Navbar, Nav, Container, Form, InputGroup, NavDropdown, Button } from 'react-bootstrap';
import NotificationCenter from './NotificationCenter';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { GuestContext } from '../App';
import useUnreadChats from '../hooks/useUnreadChats';
import { useTheme } from '../contexts/ThemeContext';
import { FaSearch, FaUserCircle, FaMoon, FaSun } from 'react-icons/fa';
import logo from '../assets/logo.png';
import './Navbar.css';

const AppNavbar = () => {
  const [user, setUser] = React.useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const guestContext = useContext(GuestContext);
  const isGuest = guestContext && guestContext.isGuest;
  const unreadCount = useUnreadChats();
  const { theme, toggleTheme } = useTheme();
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
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery(''); // Limpiar después de buscar
    }
  };

  return (
    <Navbar expand="lg" className="custom-navbar shadow-sm sticky-top">
      <Container fluid className="px-4">
        {/* Logo */}
        <Navbar.Brand as={Link} to="/publicaciones" className="brand-logo">
          <img src={logo} alt="BandSocial" className="navbar-logo" />
          <span className="brand-name">BandSocial</span>
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
                placeholder="Buscar usuarios, eventos, productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e);
                  }
                }}
              />
              <InputGroup.Text 
                className="search-icon" 
                onClick={handleSearch}
                style={{ cursor: 'pointer' }}
              >
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
          </Form>

          {/* Right Side Actions */}
          <div className="navbar-actions d-flex align-items-center gap-3">
            {/* Theme Toggle Button */}
            <Button
              variant="light"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              style={{
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: 'none',
                backgroundColor: 'var(--button-secondary)',
                color: 'var(--text-primary)'
              }}
              title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
            >
              {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
            </Button>
            
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
                  <NavDropdown.Item as={Link} to="/mis-publicaciones">Mis Publicaciones</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/followers">Seguidores y Siguiendo</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>Cerrar sesión</NavDropdown.Item>
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
