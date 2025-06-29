import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Badge, Spinner, Form, Modal } from 'react-bootstrap';
import { db, auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import ProfileCard from '../components/ProfileCard';
import Select from 'react-select';

const ciudades = [
  { value: 'bogota', label: 'Bogotá' },
  { value: 'medellin', label: 'Medellín' },
  { value: 'cali', label: 'Cali' },
  { value: 'barranquilla', label: 'Barranquilla' },
  { value: 'otra', label: 'Otra' },
];
const generos = [
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'salsa', label: 'Salsa' },
  { value: 'urbano', label: 'Urbano' },
  { value: 'otro', label: 'Otro' },
];
const instrumentos = [
  { value: 'guitarra', label: 'Guitarra' },
  { value: 'bajo', label: 'Bajo' },
  { value: 'bateria', label: 'Batería' },
  { value: 'voz', label: 'Voz' },
  { value: 'teclado', label: 'Teclado' },
  { value: 'otro', label: 'Otro' },
];

const Home = () => {
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
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ciudad, setCiudad] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [genero, setGenero] = useState(null);
  const [instrumento, setInstrumento] = useState(null);

  useEffect(() => {
    const fetchPerfiles = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'perfiles'));
      setPerfiles(querySnapshot.docs.map(doc => doc.data()));
      setLoading(false);
    };
    fetchPerfiles();
  }, []);

  // Filtros visuales
  const perfilesFiltrados = perfiles.filter(p => {
    if (ciudad && (!p.ciudad || p.ciudad.value !== ciudad.value)) return false;
    if (tipo && p.type !== tipo.value) return false;
    if (genero && (!p.generos || !p.generos.some(g => g.value === genero.value))) return false;
    if (instrumento) {
      if (p.type === 'musico' && (!p.instrumentos || !p.instrumentos.some(i => i.value === instrumento.value))) return false;
      if (p.type === 'banda' && (!p.buscan || !p.buscan.some(i => i.value === instrumento.value))) return false;
    }
    return true;
  });

  return (
    <Container fluid style={{ padding: '40px 0', background: 'linear-gradient(120deg, #f3f0fa 60%, #ede9fe 100%)', minHeight: '100vh' }}>
      <Modal show={showAuthModal} centered backdrop="static" keyboard={false}>
        <Modal.Body className="text-center p-5">
          <h4 className="mb-3" style={{ color: '#7c3aed' }}>¡Bienvenido a BandSocial!</h4>
          <p>Debes iniciar sesión o registrarte para acceder al marketplace de músicos y bandas.</p>
          <div className="d-flex gap-3 justify-content-center mt-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/login')}>Iniciar sesión</Button>
            <Button variant="outline-primary" size="lg" onClick={() => navigate('/register')}>Registrarse</Button>
          </div>
        </Modal.Body>
      </Modal>

      <h1 className="mb-5 text-center" style={{ color: '#7c3aed', fontWeight: 700 }}>Marketplace de Músicos y Bandas</h1>
      <Container>
        <Row className="mb-4 g-3 justify-content-center">
          <Col md={3} sm={6} xs={12} className="mb-2">
            <Form.Label>Ciudad</Form.Label>
            <Select options={ciudades} value={ciudad} onChange={setCiudad} isClearable />
          </Col>
          <Col md={3} sm={6} xs={12} className="mb-2">
            <Form.Label>Tipo</Form.Label>
            <Select options={[
              { value: 'musico', label: 'Músico' },
              { value: 'banda', label: 'Banda' },
            ]} value={tipo} onChange={setTipo} isClearable />
          </Col>
          <Col md={3} sm={6} xs={12} className="mb-2">
            <Form.Label>Género</Form.Label>
            <Select options={generos} value={genero} onChange={setGenero} isClearable />
          </Col>
          <Col md={3} sm={6} xs={12} className="mb-2">
            <Form.Label>Instrumento</Form.Label>
            <Select options={instrumentos} value={instrumento} onChange={setInstrumento} isClearable />
          </Col>
        </Row>
        {loading ? (
          <div className="text-center my-5">Cargando perfiles...</div>
        ) : (
          <div style={{ margin: '0 auto' }}>
            <div className="profile-grid" style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '2rem',
              justifyContent: 'center',
              marginTop: 24,
            }}>
              {perfilesFiltrados.length === 0 && <div className="text-center">No hay perfiles que coincidan con los filtros.</div>}
              {perfilesFiltrados.map((p, i) => (
                <div key={i} className="profile-item" style={{
                  flex: '1 1 260px',
                  maxWidth: 320,
                  minWidth: 260,
                  margin: 0,
                  display: 'flex',
                }}>
                  <ProfileCard profile={p} onContact={() => alert('Próximamente: chat directo')} />
                </div>
              ))}
            </div>
          </div>
        )}
      </Container>
    </Container>
  );
};

export default Home;
