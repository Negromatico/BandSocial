import React, { useState, useEffect } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import './AuthPromptModal.css';

const AuthPromptModal = ({ user, isGuest }) => {
  const [show, setShow] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // No mostrar si ya está autenticado o si ya se mostró antes
    if (user || hasShown) return;

    let timeoutId;
    let scrollListener;

    // Función para mostrar el modal
    const showModal = () => {
      if (!hasShown && !user) {
        setShow(true);
        setHasShown(true);
        // Guardar en sessionStorage para no mostrar de nuevo en esta sesión
        sessionStorage.setItem('authPromptShown', 'true');
      }
    };

    // Verificar si ya se mostró en esta sesión
    const alreadyShown = sessionStorage.getItem('authPromptShown');
    if (alreadyShown) {
      setHasShown(true);
      return;
    }

    // Temporizador: mostrar después de 15 segundos
    timeoutId = setTimeout(() => {
      showModal();
    }, 15000);

    // Scroll listener: mostrar después de 800px de scroll
    const handleScroll = () => {
      if (window.scrollY > 800) {
        showModal();
        window.removeEventListener('scroll', scrollListener);
      }
    };

    scrollListener = handleScroll;
    window.addEventListener('scroll', scrollListener);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', scrollListener);
    };
  }, [user, hasShown]);

  const handleLogin = () => {
    setShow(false);
    navigate('/login');
  };

  const handleRegister = () => {
    setShow(false);
    navigate('/register');
  };

  const handleContinueAsGuest = () => {
    setShow(false);
    // El usuario puede continuar explorando
  };

  return (
    <Modal 
      show={show} 
      onHide={handleContinueAsGuest}
      centered
      backdrop="static"
      className="auth-prompt-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          ¡Únete a BandSocial!
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="auth-prompt-content">
          <h5>Descubre todo lo que puedes hacer</h5>
          <ul className="benefits-list">
            <li>Conecta con músicos y bandas</li>
            <li>Publica tus eventos musicales</li>
            <li>Compra y vende instrumentos</li>
            <li>Chatea en tiempo real</li>
            <li>Comparte tu música</li>
          </ul>
          <p className="auth-prompt-subtitle">
            Crea tu cuenta gratis o inicia sesión para disfrutar de todas las funcionalidades
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer className="auth-prompt-footer">
        <Button 
          variant="outline-secondary" 
          onClick={handleContinueAsGuest}
          className="btn-continue-guest"
        >
          Continuar explorando
        </Button>
        <Button 
          variant="outline-primary" 
          onClick={handleLogin}
          className="btn-login-modal"
        >
          <FaSignInAlt className="me-2" />
          Iniciar Sesión
        </Button>
        <Button 
          variant="primary" 
          onClick={handleRegister}
          className="btn-register-modal"
        >
          <FaUserPlus className="me-2" />
          Registrarse Gratis
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AuthPromptModal;
