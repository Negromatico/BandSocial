import React, { useEffect, useState } from 'react';
import MessengerChat from '../components/MessengerChat';
import { Container, Modal, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';

const Chat = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) setShowAuthModal(true);
    else setShowAuthModal(false);
  }, [user]);

  return (
    <>
      <Modal show={showAuthModal} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center p-5">
          <h4 className="mb-3" style={{ color: '#7c3aed' }}>¡Bienvenido a BandSocial!</h4>
          <p>Debes iniciar sesión o registrarte para acceder al chat.</p>
          <div className="d-flex gap-3 justify-content-center mt-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/login')}>Iniciar sesión</Button>
            <Button variant="outline-primary" size="lg" onClick={() => navigate('/register')}>Registrarse</Button>
          </div>
        </Modal.Body>
      </Modal>
      {user && (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f3f0fa 60%, #ede9fe 100%)', paddingTop: 36 }}>
          <Container className="py-4">
            <MessengerChat />
          </Container>
        </div>
      )}
    </>
  );
};

export default Chat;
