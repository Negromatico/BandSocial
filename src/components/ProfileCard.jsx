import React, { useState, useContext } from 'react';
import { Card, Badge, Button, Modal } from 'react-bootstrap';
import ChatModal from './ChatModal';
import { GuestContext } from '../App';
import { useNavigate } from 'react-router-dom';

const ProfileCard = ({ profile }) => {
  const [showChat, setShowChat] = useState(false);
  const [showGallery, setShowGallery] = useState(false);

  const isGuest = useContext(GuestContext);
  const isMusico = profile.type === 'musico';
  const foto = profile.fotoPerfil || profile.fotos?.[0] || 'https://placehold.co/300x200/7c3aed/fff?text=Sin+foto';

  const navigate = useNavigate();
  // El usuario propietario del perfil
  const otherUser = { uid: profile.uid, email: profile.email, nombre: profile.nombre };

  return (
    <>
      <Card
        className="shadow-lg h-100 profile-card-hover"
        style={{
          minWidth: 250,
          maxWidth: 320,
          width: '100%',
          minHeight: 390,
          maxHeight: 430,
          display: 'flex',
          flexDirection: 'column',
          borderColor: '#a78bfa',
          borderRadius: 18,
          background: '#fff',
          cursor: 'pointer',
        }}
        onClick={() => setShowGallery(true)}
      >
        <Card.Body style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 0 }}>
          <div className="d-flex flex-column align-items-center mb-2">
            <img
              src={profile.fotoPerfil || (profile.fotos && profile.fotos[0]) || 'https://placehold.co/120x120/7c3aed/fff?text=Sin+foto'}
              alt="Foto de perfil"
              className="rounded-circle mb-2"
              style={{ width: 80, height: 80, objectFit: 'cover', border: '3px solid #a78bfa', background: '#ede9fe', cursor: 'pointer' }}
              onClick={e => { e.stopPropagation(); setShowGallery(true); }}
            />
            <Badge bg={profile.type === 'musico' ? 'primary' : 'success'} className="mb-1" style={{ fontSize: 13 }}>
              {profile.type === 'musico' ? 'Músico' : 'Banda'}
            </Badge>
          </div>
          <div className="mb-2">
            <Badge bg="secondary" style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: 100,
              display: 'inline-block',
            }}>{profile.ciudad?.label || 'Ciudad'}</Badge>
          </div>
          <div className="mb-2" style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            maxWidth: '100%',
          }}>
            <strong>Géneros: </strong>
            {profile.generos?.map(g => g.label).join(', ') || 'N/A'}
          </div>
          {isMusico ? (
            <div className="mb-2" style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              maxWidth: '100%',
            }}>
              <strong>Instrumentos: </strong>
              {profile.instrumentos?.map(i => i.label).join(', ') || 'N/A'}
            </div>
          ) : (
            <>
              <div className="mb-2" style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxWidth: '100%',
              }}>
                <strong>Miembros: </strong>
                {profile.miembros || 'N/A'}
              </div>
              <div className="mb-2" style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                maxWidth: '100%',
              }}>
                <strong>Buscan: </strong>
                {profile.buscan?.map(i => i.label).join(', ') || 'N/A'}
              </div>
            </>
          )}
          <div className="mt-auto" style={{ width: '100%', marginBottom: 10 }}>
            <Button variant="primary" className="w-100 mt-2" onClick={() => {
              setShowChat(true);
            }}>
              Contactar
            </Button>
          </div>
        </Card.Body>
      </Card>
      <ChatModal show={showChat} onHide={() => setShowChat(false)} otherUser={otherUser} />

      <Modal show={showGallery} onHide={() => setShowGallery(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {profile.nombre || (profile.type === 'musico' ? 'Músico' : 'Banda')}
            <Badge bg={profile.type === 'musico' ? 'primary' : 'success'} className="ms-3" style={{ fontSize: 15 }}>
              {profile.type === 'musico' ? 'Músico' : 'Banda'}
            </Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex flex-column flex-md-row gap-4 align-items-center mb-3">
            <img
              src={profile.fotoPerfil || (profile.fotos && profile.fotos[0]) || 'https://placehold.co/120x120/7c3aed/fff?text=Sin+foto'}
              alt="Foto de perfil"
              className="rounded-circle mb-2"
              style={{ width: 100, height: 100, objectFit: 'cover', border: '3px solid #a78bfa', background: '#ede9fe' }}
            />
            <div>
              <div className="mb-1">
                <Badge bg="secondary" style={{ fontSize: 13 }}>
                  {profile.ciudad?.label || 'Ciudad'}
                </Badge>
              </div>
              <div><strong>Géneros:</strong> {profile.generos?.map(g => g.label).join(', ') || 'N/A'}</div>
              {profile.type === 'musico' ? (
                <div><strong>Instrumentos:</strong> {profile.instrumentos?.map(i => i.label).join(', ') || 'N/A'}</div>
              ) : (
                <>
                  <div><strong>Miembros:</strong> {profile.miembros || 'N/A'}</div>
                  <div><strong>Buscan:</strong> {profile.buscan?.map(i => i.label).join(', ') || 'N/A'}</div>
                </>
              )}
            </div>
          </div>
          <div className="mb-3">
            <strong>Galería de imágenes:</strong>
            <div className="d-flex flex-wrap gap-3 justify-content-center mt-2">
              {(profile.fotos && profile.fotos.length > 0) ? (
                profile.fotos.map((foto, idx) => (
                  <img key={idx} src={foto} alt={`foto${idx+1}`} style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 12, border: '2px solid #a78bfa' }} />
                ))
              ) : (
                <span className="text-muted">No hay fotos adicionales</span>
              )}
            </div>
          </div>
          {profile.videoUrl && (
            <div className="mb-3">
              <strong>Video de presentación:</strong>
              <div className="text-center mt-2">
                <video src={profile.videoUrl} controls style={{ width: 320, maxWidth: '100%', borderRadius: 12, border: '2px solid #a78bfa' }} />
              </div>
            </div>
          )}
          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" size="lg" onClick={() => { setShowGallery(false); setShowChat(true); }}>
              Contactar
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProfileCard;
