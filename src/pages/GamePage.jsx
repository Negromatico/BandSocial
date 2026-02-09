import React from 'react';
import { Container } from 'react-bootstrap';
import PianoTiles from '../components/PianoTiles';

const GamePage = () => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(120deg, #f3f0fa 0%, #ede9fe 100%)',
      paddingTop: '80px',
      paddingBottom: '40px'
    }}>
      <Container>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '30px',
          color: '#667eea'
        }}>
          <h1 style={{ 
            fontSize: '48px', 
            fontWeight: '700',
            marginBottom: '10px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Zona de Juegos
          </h1>
          <p style={{ 
            fontSize: '18px', 
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            ¡Relájate y diviértete con nuestro juego musical!
          </p>
        </div>
        
        <PianoTiles />
      </Container>
    </div>
  );
};

export default GamePage;
