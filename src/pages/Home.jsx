import React, { useEffect, useState, useContext } from 'react';
import { Container, Row, Col, Button, Badge, Spinner, Form, Modal } from 'react-bootstrap';
import { db, auth } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import ProfileCard from '../components/ProfileCard';
import Select from 'react-select';

import { instrumentos } from '../data/opciones';

const generos = [
  { value: 'rock', label: 'Rock' },
  { value: 'pop', label: 'Pop' },
  { value: 'jazz', label: 'Jazz' },
  { value: 'blues', label: 'Blues' },
  { value: 'reggae', label: 'Reggae' },
  { value: 'salsa', label: 'Salsa' },
  { value: 'cumbia', label: 'Cumbia' },
  { value: 'vallenato', label: 'Vallenato' },
  { value: 'merengue', label: 'Merengue' },
  { value: 'bachata', label: 'Bachata' },
  { value: 'tropical', label: 'Tropical' },
  { value: 'urbano', label: 'Urbano' },
  { value: 'electronica', label: 'Electrónica' },
  { value: 'trap', label: 'Trap' },
  { value: 'reggaeton', label: 'Reggaetón' },
  { value: 'folclor', label: 'Folclor' },
  { value: 'andina', label: 'Andina' },
  { value: 'norteña', label: 'Norteña' },
  { value: 'banda', label: 'Banda' },
  { value: 'ranchera', label: 'Ranchera' },
  { value: 'balada', label: 'Balada' },
  { value: 'metal', label: 'Metal' },
  { value: 'punk', label: 'Punk' },
  { value: 'alternativo', label: 'Alternativo' },
  { value: 'gospel', label: 'Gospel' },
  { value: 'infantil', label: 'Infantil' },
  { value: 'otro', label: 'Otro (especificar)' },
];

import { GuestContext } from '../App';

const Home = () => {
  const [ciudadesOptions, setCiudadesOptions] = React.useState([]);
  React.useEffect(() => {
    fetch('https://api-colombia.com/api/v1/City')
      .then(res => res.json())
      .then(data => {
        const options = data.map(city => ({ value: city.name.toLowerCase(), label: city.name })).sort((a, b) => a.label.localeCompare(b.label));
        setCiudadesOptions(options);
      })
      .catch(() => setCiudadesOptions([]));
  }, []);
  const guestContext = useContext(GuestContext);
  const [user, setUser] = useState(auth.currentUser);

  const navigate = useNavigate();
  const [perfiles, setPerfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ciudad, setCiudad] = useState(null);
  const [tipo, setTipo] = useState(null);
  const [genero, setGenero] = useState(null);
  const [otroGenero, setOtroGenero] = useState('');
  const [instrumento, setInstrumento] = useState(null);
  const [otroInstrumento, setOtroInstrumento] = useState('');
  const [disponible, setDisponible] = useState({ value: 'todos', label: 'Todos' });


  const generosOptions = React.useMemo(() => {
    const setVals = new Set();
    perfiles.forEach(p => (p.generos||[]).forEach(g => setVals.add(g.value)));
    return Array.from(setVals).map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
  }, [perfiles]);
  const instrumentosOptions = React.useMemo(() => {
    const setVals = new Set();
    perfiles.forEach(p => (p.instrumentos||[]).forEach(i => setVals.add(i.value)));
    perfiles.forEach(p => (p.buscan||[]).forEach(i => setVals.add(i.value)));
    return Array.from(setVals).map(v => ({ value: v, label: v.charAt(0).toUpperCase() + v.slice(1) }));
  }, [perfiles]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    const fetchPerfiles = async () => {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'perfiles'));
      setPerfiles(querySnapshot.docs.map(doc => doc.data()));
      setLoading(false);
    };
    fetchPerfiles();
  }, []);

  const perfilesFiltrados = perfiles.filter(p => {
    if (disponible.value !== 'todos') {
      if (disponible.value === 'disponibles' && p.disponible === false) return false;
      if (disponible.value === 'no_disponibles' && p.disponible !== false) return false;
    }
    if (ciudad && (!p.ciudad || p.ciudad.value !== ciudad.value)) return false;
    if (tipo && p.type !== tipo.value) return false;
    if (genero) {
      if (genero.value === 'otro') {
        const buscar = otroGenero.trim().toLowerCase();
        if (!p.generos || !p.generos.some(g => {
          if (typeof g === 'string') return g.trim().toLowerCase() === buscar;
          if (g && g.value) return g.value.trim().toLowerCase() === buscar;
          return false;
        })) return false;
      } else {
        if (!p.generos || !p.generos.some(g => (g.value || g).toLowerCase() === genero.value.toLowerCase())) return false;
      }
    }
    if (instrumento) {
      if (instrumento.value === 'otro') {
        const buscar = otroInstrumento.trim().toLowerCase();
        if (p.type === 'musico' && (!p.instrumentos || !p.instrumentos.some(i => {
          if (typeof i === 'string') return i.trim().toLowerCase() === buscar;
          if (i && i.value) return i.value.trim().toLowerCase() === buscar;
          return false;
        }))) return false;
        if (p.type === 'banda' && (!p.buscan || !p.buscan.some(i => {
          if (typeof i === 'string') return i.trim().toLowerCase() === buscar;
          if (i && i.value) return i.value.trim().toLowerCase() === buscar;
          return false;
        }))) return false;
      } else {
        if (p.type === 'musico' && (!p.instrumentos || !p.instrumentos.some(i => (i.value || i).toLowerCase() === instrumento.value.toLowerCase()))) return false;
        if (p.type === 'banda' && (!p.buscan || !p.buscan.some(i => (i.value || i).toLowerCase() === instrumento.value.toLowerCase()))) return false;
      }
    }
    return true;
  });

  return (
    <Container fluid style={{ padding: '40px 0', background: 'linear-gradient(120deg, #f3f0fa 60%, #ede9fe 100%)', minHeight: '100vh' }}>
      <h1 className="mb-5 text-center" style={{ color: '#7c3aed', fontWeight: 700 }}>Marketplace de Músicos y Bandas</h1>
      <Container>
        <Row className="mb-4 g-3 justify-content-center">
          <Col md={3} sm={6} xs={12} className="mb-2">
            <Form.Label>Ciudad</Form.Label>
            <Select options={[...ciudadesOptions, { value: 'otra', label: 'Otra' }]} value={ciudad} onChange={setCiudad} isClearable />
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
            <Select options={generos} value={genero} onChange={val => { setGenero(val); if (!val || val.value !== 'otro') setOtroGenero(''); }} isClearable />
            {genero && genero.value === 'otro' && (
              <input
                className="form-control mt-2"
                placeholder="Especifica el género musical"
                value={otroGenero}
                onChange={e => setOtroGenero(e.target.value)}
                maxLength={40}
              />
            )}
          </Col>
          <Col md={3} sm={6} xs={12} className="mb-2">
            <Form.Label>Instrumento</Form.Label>
            <Select options={instrumentos} value={instrumento} onChange={val => { setInstrumento(val); if (!val || val.value !== 'otro') setOtroInstrumento(''); }} isClearable />
            {instrumento && instrumento.value === 'otro' && (
              <input
                className="form-control mt-2"
                placeholder="Especifica el instrumento"
                value={otroInstrumento}
                onChange={e => setOtroInstrumento(e.target.value)}
                maxLength={40}
              />
            )}
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
