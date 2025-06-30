import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, arrayUnion, Timestamp } from 'firebase/firestore';
import { Button, Form, Modal, Container } from 'react-bootstrap';
import Select from 'react-select';

const Eventos = () => {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({ titulo: '', lugar: '', fecha: '', hora: '', descripcion: '' });
  const [user, setUser] = useState(auth.currentUser);
  const [asistiendo, setAsistiendo] = useState({});
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  const fetchEventos = async () => {
    setLoading(true);
    const q = query(collection(db, 'eventos'), orderBy('fecha', 'asc'));
    const snapshot = await getDocs(q);
    let eventosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Solo eventos cuya fecha+hora es futura
    const now = new Date();
    eventosData = eventosData.filter(ev => ev.fecha && ev.hora); // Solo descarta eventos sin fecha/hora
    // Buscar nombre del creador
    const { getDoc, doc: docFirestore } = await import('firebase/firestore');
    await Promise.all(eventosData.map(async ev => {
      if (ev.creador) {
        try {
          const perfilSnap = await getDoc(docFirestore(db, 'perfiles', ev.creador));
          if (perfilSnap.exists()) {
            ev.creadorNombre = perfilSnap.data().nombre || perfilSnap.data().email || ev.creador;
          } else {
            ev.creadorNombre = ev.creador;
          }
        } catch {
          ev.creadorNombre = ev.creador;
        }
      } else {
        ev.creadorNombre = 'Desconocido';
      }
    }));
    setEventos(eventosData);
    setLoading(false);
  };

  useEffect(() => {
    fetchEventos();
  }, []);

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSuccess(false);
    if (!nuevoEvento.titulo || !nuevoEvento.lugar || !nuevoEvento.fecha || !nuevoEvento.hora || !nuevoEvento.descripcion) {
      setCreateError('Todos los campos son obligatorios.');
      return;
    }
    if (nuevoEvento.descripcion.length > 250) {
      setCreateError('La descripción no puede superar los 250 caracteres.');
      return;
    }
    setCreating(true);
    try {
      await addDoc(collection(db, 'eventos'), {
        ...nuevoEvento,
        asistentes: [],
        creador: user ? user.uid : null,
        createdAt: Timestamp.now(),
      });
      setCreateSuccess(true);
      setShowModal(false);
      setNuevoEvento({ titulo: '', lugar: '', fecha: '', hora: '', descripcion: '' });
      fetchEventos();
    } catch (err) {
      setCreateError('No se pudo crear el evento. Intenta de nuevo.');
    } finally {
      setCreating(false);
    }
  };

  const handleAsistir = async (eventoId) => {
    if (!user) return;
    const eventoRef = doc(db, 'eventos', eventoId);
    await updateDoc(eventoRef, { asistentes: arrayUnion(user.uid) });
    setAsistiendo(prev => ({ ...prev, [eventoId]: true }));
    fetchEventos();
  };

  useEffect(() => {
    if (!user) return;
    // Marcar a cuáles eventos ya asiste el usuario
    eventos.forEach(ev => {
      if (ev.asistentes && ev.asistentes.includes(user.uid)) {
        setAsistiendo(prev => ({ ...prev, [ev.id]: true }));
      }
    });
  }, [eventos, user]);

  // --- Filtros eventos ---
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState({ value: 'todos', label: 'Todos' });
  const [filtroLugar, setFiltroLugar] = useState(null);
  const [filtroDia, setFiltroDia] = useState(null);
  const lugaresOptions = React.useMemo(() => {
    const setVals = new Set(eventos.map(ev => ev.lugar).filter(Boolean));
    return Array.from(setVals).map(v => ({ value: v, label: v }));
  }, [eventos]);
  const diasSemana = [
    { value: 0, label: 'Domingo' }, { value: 1, label: 'Lunes' }, { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' }, { value: 4, label: 'Jueves' }, { value: 5, label: 'Viernes' }, { value: 6, label: 'Sábado' }
  ];
  // Filtro eventos
  const eventosFiltrados = eventos.filter(ev => {
    const fechaHora = new Date(ev.fecha + 'T' + ev.hora);
    const eventoPasado = fechaHora <= new Date();
    if (filtroDisponibilidad.value === 'futuros' && eventoPasado) return false;
    if (filtroDisponibilidad.value === 'pasados' && !eventoPasado) return false;
    if (filtroLugar && ev.lugar !== filtroLugar.value) return false;
    if (filtroDia) {
      const diaEvento = fechaHora.getDay();
      if (diaEvento !== filtroDia.value) return false;
    }
    return true;
  });
  return (
    <Container style={{ maxWidth: 700, margin: '0 auto', marginTop: 24 }}>
      <div className="d-flex flex-wrap gap-3 mb-4 align-items-end">
        <div style={{ minWidth: 160 }}>
          <Form.Label>Disponibilidad</Form.Label>
          <Select options={[
            { value: 'todos', label: 'Todos' },
            { value: 'futuros', label: 'Solo futuros' },
            { value: 'pasados', label: 'Solo pasados' },
          ]} value={filtroDisponibilidad} onChange={setFiltroDisponibilidad} isClearable={false} />
        </div>
        <div style={{ minWidth: 160 }}>
          <Form.Label>Lugar</Form.Label>
          <Select options={lugaresOptions} value={filtroLugar} onChange={setFiltroLugar} isClearable />
        </div>
        <div style={{ minWidth: 160 }}>
          <Form.Label>Día</Form.Label>
          <Select options={diasSemana} value={filtroDia} onChange={setFiltroDia} isClearable />
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 style={{ color: '#7c3aed', fontWeight: 700 }}>Eventos</h4>
        {user && <Button variant="primary" onClick={() => setShowModal(true)}>Crear evento</Button>}
      </div>
      {loading ? (
        <div className="text-center">Cargando eventos...</div>
      ) : eventosFiltrados.length === 0 ? (
        <div className="text-center">No hay eventos próximos.</div>
      ) : (
        eventosFiltrados.map(ev => {
          const fechaHora = new Date(ev.fecha + 'T' + ev.hora);
           const eventoPasado = fechaHora <= new Date();
           return (
            <div key={ev.id} className="mb-4 p-3 shadow-sm rounded" style={{ background: eventoPasado ? '#f8f9fa' : '#fff', border: '1px solid #ede9fe', opacity: eventoPasado ? 0.7 : 1 }}>
              <div style={{ fontWeight: 700, fontSize: 20, color: '#7c3aed' }}>{ev.titulo}</div>
              <div style={{ color: '#6b7280', fontSize: 15 }}>{ev.lugar}</div>
              {ev.descripcion && <div style={{ margin: '8px 0', color: '#444', fontSize: 15 }}>{ev.descripcion}</div>}
              <div style={{ fontSize: 15, color: '#a78bfa' }}>
                {fechaHora.toLocaleDateString()} - {ev.hora}
                {eventoPasado && <span className="badge bg-secondary ms-2">No disponible</span>}
              </div>
              <div className="mt-2">
                {!eventoPasado && user && !asistiendo[ev.id] ? (
                  <Button size="sm" variant="success" onClick={() => handleAsistir(ev.id)}>
                    Asistiré
                  </Button>
                ) : !eventoPasado && user && asistiendo[ev.id] ? (
                  <span className="badge bg-success">¡Vas a asistir!</span>
                ) : null}
              </div>
              <div style={{ fontSize: 13, color: '#b5b5b5' }}>Creador: {ev.creadorNombre}</div>
            </div>
          );
        })
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Crear evento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearEvento}>
            <Form.Group className="mb-3">
              <Form.Label>Título</Form.Label>
              <Form.Control type="text" value={nuevoEvento.titulo} onChange={e => setNuevoEvento({ ...nuevoEvento, titulo: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Lugar</Form.Label>
              <Form.Control type="text" value={nuevoEvento.lugar} onChange={e => setNuevoEvento({ ...nuevoEvento, lugar: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <Form.Control type="date" value={nuevoEvento.fecha} onChange={e => setNuevoEvento({ ...nuevoEvento, fecha: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Hora</Form.Label>
              <Form.Control type="time" value={nuevoEvento.hora} onChange={e => setNuevoEvento({ ...nuevoEvento, hora: e.target.value })} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Descripción <span style={{color:'#d00'}}>*</span></Form.Label>
              <Form.Control as="textarea" rows={3} value={nuevoEvento.descripcion} onChange={e => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value.slice(0,250) })} maxLength={250} required />
              <div className="text-end small" style={{color: nuevoEvento.descripcion.length > 240 ? '#d00' : '#888'}}>
                {nuevoEvento.descripcion.length}/250
              </div>
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={creating || !nuevoEvento.titulo || !nuevoEvento.lugar || !nuevoEvento.fecha || !nuevoEvento.hora}>
              {creating ? 'Creando...' : 'Crear evento'}
            </Button>
            {createError && <div className="alert alert-danger mt-2">{createError}</div>}
            {createSuccess && <div className="alert alert-success mt-2">¡Evento creado exitosamente!</div>}
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Eventos;
