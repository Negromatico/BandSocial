import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Card } from 'react-bootstrap';

import { useEffect } from 'react';
import { auth } from '../services/firebase';

export default function PreLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(user => {
      if (user) {
        navigate('/publicaciones', { replace: true });
      }
    });
    // Por si ya está cargado
    if (auth.currentUser) {
      navigate('/publicaciones', { replace: true });
    }
    return unsub;
  }, [navigate]);

  const handleGuest = () => {
    localStorage.setItem('guest', 'true');
    navigate('/publicaciones');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Container fluid className="d-flex flex-row justify-content-center align-items-center" style={{ minHeight: '100vh', maxWidth: 1400 }}>
        {/* Columna izquierda: Logo y texto */}
        <div className="d-none d-md-flex flex-column justify-content-center align-items-start" style={{ flex: 1, minWidth: 350, maxWidth: 480 }}>
          <div style={{ fontSize: 60, fontWeight: 800, color: '#7c3aed', fontFamily: 'DM Serif Display, serif', letterSpacing: 1, marginBottom: 12 }}>
            BandSocial
          </div>
          <div style={{ fontSize: 28, fontWeight: 600, color: '#22223b', marginBottom: 12 }}>
            ¡Conecta con músicos y bandas!
          </div>
          <div style={{ fontSize: 20, color: '#4a4e69', maxWidth: 400 }}>
            Haz nuevos amigos, comparte eventos y encuentra tu próxima banda o proyecto musical.
          </div>
        </div>
        {/* Columna derecha: Card de acciones */}
        <div className="d-flex flex-column justify-content-center align-items-center" style={{ flex: 1, minWidth: 350, maxWidth: 420 }}>
          <Card style={{ width: '100%', padding: 0, borderRadius: 8, boxShadow: '0 2px 12px #0001', border: 'none', background: '#fff' }}>
            <Card.Body className="p-4">
              <div className="d-flex flex-column gap-3">
                <Button variant="primary" size="lg" style={{ fontWeight: 700, fontSize: 18 }} onClick={() => navigate('/login')}>Iniciar sesión</Button>
                <Button variant="success" size="lg" style={{ fontWeight: 700, fontSize: 18 }} onClick={() => navigate('/register')}>Crear una cuenta</Button>
                <Button variant="outline-secondary" size="lg" style={{ fontWeight: 700, fontSize: 18 }} onClick={handleGuest}>Ingresar como invitado</Button>
              </div>
            </Card.Body>
            <div className="text-center pb-3" style={{ fontSize: 15, color: '#65676b' }}>
              ¿Olvidaste tu contraseña? <span style={{ color: '#7c3aed', cursor: 'pointer' }} onClick={() => navigate('/login')}>Recupérala aquí</span>
            </div>
          </Card>

        </div>
      </Container>
    </div>
  );
}

