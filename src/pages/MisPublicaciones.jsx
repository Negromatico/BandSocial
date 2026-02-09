import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { Container, Row, Col, Card, Button, Spinner, Alert } from 'react-bootstrap';
import { FaTrash, FaEdit, FaImage, FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './MisPublicaciones.css';

const MisPublicaciones = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u);
      if (!u) {
        navigate('/login');
      }
    });
    return unsub;
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchMisPublicaciones();
    }
  }, [user]);

  const fetchMisPublicaciones = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const q = query(
        collection(db, 'publicaciones'),
        where('autorUid', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      let pubs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filtrar publicaciones eliminadas
      pubs = pubs.filter(p => !p.deleted);
      
      // Ordenar por fecha en el cliente
      pubs.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
      setPublicaciones(pubs);
    } catch (err) {
      console.error('Error cargando publicaciones:', err);
      setError('Error al cargar tus publicaciones. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (publicacionId) => {
    if (!window.confirm('¿Estás seguro de eliminar esta publicación?')) return;
    
    try {
      await deleteDoc(doc(db, 'publicaciones', publicacionId));
      setPublicaciones(prev => prev.filter(p => p.id !== publicacionId));
    } catch (err) {
      console.error('Error eliminando publicación:', err);
      alert('Error al eliminar la publicación');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    const date = timestamp.toDate();
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando tus publicaciones...</p>
      </Container>
    );
  }

  return (
    <Container className="mis-publicaciones-container py-4">
      <div className="page-header mb-4">
        <h2>Mis Publicaciones</h2>
        <p className="text-muted">Gestiona todas tus publicaciones en un solo lugar</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {publicaciones.length === 0 ? (
        <div className="no-publicaciones text-center py-5">
          <FaImage size={60} color="#9ca3af" className="mb-3" />
          <h4>No tienes publicaciones aún</h4>
          <p className="text-muted">Comienza a compartir tu música y conecta con otros músicos</p>
          <Button variant="primary" onClick={() => navigate('/publicaciones')}>
            Crear mi primera publicación
          </Button>
        </div>
      ) : (
        <Row>
          {publicaciones.map(pub => (
            <Col key={pub.id} md={6} lg={4} className="mb-4">
              <Card className="publicacion-card h-100">
                {pub.imagenesUrl && pub.imagenesUrl.length > 0 && (
                  <Card.Img 
                    variant="top" 
                    src={pub.imagenesUrl[0]} 
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                <Card.Body>
                  <Card.Title>{pub.titulo || 'Sin título'}</Card.Title>
                  <Card.Text className="publicacion-descripcion">
                    {pub.descripcion}
                  </Card.Text>
                  
                  <div className="publicacion-meta mb-3">
                    {pub.tipo && (
                      <span className="badge bg-primary me-2">{pub.tipo}</span>
                    )}
                    {pub.ciudad && (
                      <small className="text-muted">
                        <FaMapMarkerAlt className="me-1" />
                        {pub.ciudad}
                      </small>
                    )}
                  </div>

                  <div className="publicacion-footer">
                    <small className="text-muted">
                      <FaCalendarAlt className="me-1" />
                      {formatDate(pub.createdAt)}
                    </small>
                  </div>
                </Card.Body>
                <Card.Footer className="bg-white border-top">
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={() => handleDelete(pub.id)}
                      className="flex-grow-1"
                    >
                      <FaTrash className="me-1" />
                      Eliminar
                    </Button>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <div className="publicaciones-stats mt-4 p-3 bg-light rounded">
        <h5>Estadísticas</h5>
        <p className="mb-0">
          Total de publicaciones: <strong>{publicaciones.length}</strong>
        </p>
      </div>
    </Container>
  );
};

export default MisPublicaciones;
