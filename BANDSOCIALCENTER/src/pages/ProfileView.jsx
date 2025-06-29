import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Card, Row, Col, Badge, Button, Spinner } from 'react-bootstrap';
import ChatModal from '../components/ChatModal';

const ProfileView = () => {
  const { uid } = useParams();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchPerfil = async () => {
      setLoading(true);
      const docSnap = await getDoc(doc(db, 'perfiles', uid));
      if (docSnap.exists()) setPerfil(docSnap.data());
      setLoading(false);
    };
    fetchPerfil();
  }, [uid]);

  if (loading) return <div className="text-center my-5"><Spinner animation="border" /></div>;
  if (!perfil) return <div className="text-center my-5 text-danger">Perfil no encontrado.</div>;

  const isMusico = perfil.type === 'musico';

  return (
    <div className="d-flex justify-content-center align-items-center py-5" style={{ minHeight: '100vh', background: 'linear-gradient(120deg, #f3f0fa 60%, #ede9fe 100%)' }}>
      <Card style={{ maxWidth: 700, width: '100%', border: '2px solid #a78bfa' }} className="shadow-lg">
        <Card.Body>
          <div className="d-flex align-items-center mb-4">
            <div style={{ width: 90, height: 90, borderRadius: '50%', background: '#a78bfa', overflow: 'hidden', marginRight: 20 }}>
              {perfil.fotoPerfil && perfil.fotoPerfil !== '' ? (
                <img src={perfil.fotoPerfil} alt="avatar" style={{ width: 90, height: 90, objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: 52, color: '#fff', lineHeight: '90px', display: 'block', textAlign: 'center' }}>🎵</span>
              )}
            </div>
            <div>
              <h2 style={{ color: '#7c3aed', fontWeight: 700 }} className="mb-1">{perfil.nombre}</h2>
              <Badge bg="secondary" className="me-2">{isMusico ? 'Músico' : 'Banda'}</Badge>
              <Badge bg="light" text="dark">{perfil.ciudad?.label}</Badge>
            </div>
          </div>
          <Row className="mb-3">
            <Col md={6}>
              <div><strong>Géneros:</strong> {perfil.generos?.map(g => g.label).join(', ') || 'N/A'}</div>
              {isMusico ? (
                <div><strong>Instrumentos:</strong> {perfil.instrumentos?.map(i => i.label).join(', ') || 'N/A'}</div>
              ) : (
                <>
                  <div><strong>Miembros:</strong> {perfil.miembros || 'N/A'}</div>
                  <div><strong>Buscan:</strong> {perfil.buscan?.map(i => i.label).join(', ') || 'N/A'}</div>
                </>
              )}
              <div><strong>Días disponibles:</strong> {perfil.dias?.map(d => d.label).join(', ') || 'N/A'}</div>
              {perfil.horarios?.length > 0 && <div><strong>Horarios requeridos:</strong> {perfil.horarios?.map(h => h.label).join(', ')}</div>}
            </Col>
            <Col md={6}>
              <div className="mb-2">
                <strong>Video de presentación:</strong>
                {perfil.videoUrl ? (
                  <video src={perfil.videoUrl} controls style={{ width: '100%', maxHeight: 220, marginTop: 6, borderRadius: 8, border: '2px solid #a78bfa' }} />
                ) : (
                  <div className="text-muted">No hay video publicado</div>
                )}
              </div>
              <div>
                <strong>Fotos:</strong>
                <div className="d-flex gap-2 flex-wrap mt-2">
                  {perfil.fotos?.length > 0 ? perfil.fotos.filter(url => url !== perfil.fotoPerfil).map((url, idx) => (
                    <img key={idx} src={url} alt="foto" style={{ width: 70, height: 70, objectFit: 'cover', borderRadius: 4, border: '2px solid #a78bfa' }} />
                  )) : <span className="text-muted">No hay fotos</span>}
                </div>
              </div>
            </Col>
          </Row>
          <div className="d-flex justify-content-end mt-4">
            <Button variant="primary" size="lg" onClick={() => setShowChat(true)}>
              Contactar
            </Button>
          </div>
        </Card.Body>
      </Card>
      <ChatModal show={showChat} onHide={() => setShowChat(false)} otherUser={{ uid: perfil.uid, email: perfil.email, nombre: perfil.nombre }} />
    </div>
  );
};

export default ProfileView;
