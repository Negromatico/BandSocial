import React, { useEffect, useState, useContext } from 'react';
import { db, auth } from '../services/firebase';
import { uploadToCloudinary } from '../services/cloudinary';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, arrayUnion, Timestamp, getDoc } from 'firebase/firestore';
import { Button, Form, Modal, Container } from 'react-bootstrap';
import { GuestContext } from '../App';
import Select from 'react-select';
import DateRangePicker from '../components/DateRangePicker';
import ComentariosEvento from '../components/ComentariosEvento';
import { enviarNotificacion } from '../services/notificaciones';
import { finalizarEventosVencidos } from '../utils/eventoFinalizacionAutomatica';


const Eventos = () => {
  const guestContext = useContext(GuestContext);
  const isGuest = typeof guestContext === 'object' ? guestContext.isGuest : guestContext;
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  // Los invitados pueden ver eventos, solo restringir crear/asistir
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [nuevoEvento, setNuevoEvento] = useState({ titulo: '', lugar: '', otraCiudad: '', fecha: '', hora: '', descripcion: '', precio: '', aforo: '' });
  const [imagenes, setImagenes] = useState([]);
  const [imagenesPreview, setImagenesPreview] = useState([]);
  const [user, setUser] = useState(auth.currentUser);
  const [asistiendo, setAsistiendo] = useState({});
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [createSuccess, setCreateSuccess] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  // Si hay usuario autenticado, limpia el flag de invitado
  useEffect(() => {
    if (user && isGuest) {
      localStorage.removeItem('guest');
      // Si GuestContext tiene setter, ponlo en false aquí
      // Por ejemplo: if (typeof setIsGuest === 'function') setIsGuest(false);
    }
  }, [user, isGuest]);

  const fetchEventos = async () => {
    setLoading(true);
    const q = query(collection(db, 'eventos'), orderBy('fecha', 'desc'));
    const snapshot = await getDocs(q);
    let eventosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Ordena por fecha DESC y luego hora DESC localmente
    eventosData.sort((a, b) => {
      if ((a.fecha || '') === (b.fecha || '')) {
        return (b.hora || '').localeCompare(a.hora || '');
      }
      return (b.fecha || '').localeCompare(a.fecha || '');
    });
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
    finalizarEventosVencidos().then(fetchEventos);
  }, []);

  const handleImagenChange = e => {
    const files = Array.from(e.target.files);
    setImagenes(files);
    setImagenesPreview(files.map(file => URL.createObjectURL(file)));
  };

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    if (user === undefined) return;
    if (user === null || isGuest) {
      setShowAuthPrompt(true);
      return;
    }
    setCreateError('');
    setCreateSuccess(false);
    if (!nuevoEvento.titulo || !nuevoEvento.lugar || !nuevoEvento.fecha || (!nuevoEvento.fechaRango && !nuevoEvento.hora) || !nuevoEvento.descripcion || !nuevoEvento.aforo) {
      setCreateError('Todos los campos son obligatorios.');
      return;
    }
    // Validar que la fecha/hora no sea pasada
    if (!nuevoEvento.fechaRango) {
      const fechaHoraEvento = new Date(nuevoEvento.fecha + 'T' + (nuevoEvento.hora || '00:00'));
      if (fechaHoraEvento < new Date()) {
        setCreateError('La fecha y hora del evento no pueden ser anteriores al momento actual.');
        return;
      }
    } else {
      const fechaInicio = new Date(nuevoEvento.fecha + 'T00:00');
      if (fechaInicio < new Date()) {
        setCreateError('La fecha de inicio no puede ser anterior al momento actual.');
        return;
      }
    }
    if (nuevoEvento.descripcion.length > 250) {
      setCreateError('La descripción no puede superar los 250 caracteres.');
      return;
    }
    setCreating(true);
    try {
      let imagenesUrl = [];
      if (imagenes.length > 0) {
        for (const file of imagenes) {
          const url = await uploadToCloudinary(file, 'Bandas', 'bandas/eventos');
          imagenesUrl.push(url);
        }
      }
      await addDoc(collection(db, 'eventos'), {
        ...nuevoEvento,
        precio: nuevoEvento.precio ? Number(nuevoEvento.precio) : 0,
        aforo: Number(nuevoEvento.aforo),
        asistentes: [],
        creador: user ? user.uid : null,
        createdAt: Timestamp.now(),
        imagenesUrl,
      });
      setCreateSuccess(true);
      setShowModal(false);
      setNuevoEvento({ titulo: '', lugar: '', fecha: '', hora: '', descripcion: '' });
      setImagenes([]);
      setImagenesPreview([]);
      fetchEventos();
    } catch (err) {
      setCreateError('No se pudo crear el evento. Intenta de nuevo.');
    } finally {
      setCreating(false);
    }
  };

  const handleAsistir = async (eventoId) => {
    if (user === undefined) return;
    if (user === null || isGuest) {
      setShowAuthPrompt(true);
      return;
    }
    if (!user) return;
    const eventoRef = doc(db, 'eventos', eventoId);
    await updateDoc(eventoRef, { asistentes: arrayUnion(user.uid) });
    setAsistiendo(prev => ({ ...prev, [eventoId]: true }));

    // Notificación al creador
    const eventoSnap = await getDoc(eventoRef);
    if (eventoSnap.exists()) {
      const evento = eventoSnap.data();
      if (evento.creador && evento.creador !== user.uid) {
        // Buscar nombre del perfil
        let nombre = 'Alguien';
        try {
          const perfilSnap = await getDoc(doc(db, 'perfiles', user.uid));
          if (perfilSnap.exists()) {
            const data = perfilSnap.data();
            nombre = data.nombre || data.email || 'Alguien';
          }
        } catch {}
        await enviarNotificacion(evento.creador, {
          type: 'event_attendance',
          text: `${nombre} asistirá a tu evento "${evento.titulo}"`,
          link: `/eventos/${eventoId}`
        });
      }
    }
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
  const [filtroOtraCiudad, setFiltroOtraCiudad] = useState('');
  const [filtroFechaInicio, setFiltroFechaInicio] = useState('');
const [filtroFechaFin, setFiltroFechaFin] = useState('');
const [filtroRango, setFiltroRango] = useState(false);
  const [ciudadesOptions, setCiudadesOptions] = React.useState([]);
  useEffect(() => {
    fetch('https://api-colombia.com/api/v1/City')
      .then(res => res.json())
      .then(data => {
        // Eliminar duplicados usando Set y ordenar
        const uniqueCities = [...new Set(data.map(city => city.name))].sort();
        setCiudadesOptions(uniqueCities);
      })
      .catch(() => setCiudadesOptions([]));
  }, []);
  const lugaresOptions = React.useMemo(() => {
    const setVals = new Set([
      ...ciudadesOptions,
      ...eventos.map(ev => ev.lugar).filter(Boolean)
    ]); // ciudadesOptions ya es la lista de ciudades de Colombia
    return Array.from(setVals).map(v => ({ value: v, label: v }));
  }, [ciudadesOptions, eventos]);

  // Filtro eventos
  const eventosFiltrados = eventos.filter(ev => {
    // Disponibilidad
    if (filtroDisponibilidad.value === 'futuros') {
      const fechaHora = new Date(ev.fecha + 'T' + (ev.hora || '00:00'));
      if (fechaHora <= new Date()) return false;
    } else if (filtroDisponibilidad.value === 'pasados') {
      const fechaHora = new Date(ev.fecha + 'T' + (ev.hora || '00:00'));
      if (fechaHora > new Date()) return false;
    }
    // Lugar
    if (filtroLugar && filtroLugar.value !== 'Otros' && ev.lugar !== filtroLugar.value) return false;
    if (filtroLugar && filtroLugar.value === 'Otros' && filtroOtraCiudad && ev.lugar !== filtroOtraCiudad) return false;
    // Fecha/rango de fechas
    if (filtroFechaInicio) {
      if (filtroRango && filtroFechaFin) {
        if (ev.fecha < filtroFechaInicio || ev.fecha > filtroFechaFin) return false;
      } else {
        if (ev.fecha !== filtroFechaInicio) return false;
      }
    }
    return true;
  });
  return (
    <Container style={{ maxWidth: 700, margin: '0 auto', marginTop: 24 }}>
      <div className="d-flex flex-row gap-4 mb-4 align-items-end" style={{flexWrap:'wrap'}}>
        <div style={{ minWidth: 170, flex: 1 }}>
          <Form.Label className="mb-1">Disponibilidad</Form.Label>
          <Select options={[
            { value: 'todos', label: 'Todos' },
            { value: 'futuros', label: 'Solo futuros' },
            { value: 'pasados', label: 'Solo pasados' },
          ]} value={filtroDisponibilidad} onChange={setFiltroDisponibilidad} isClearable={false} styles={{control:(base)=>({...base,minHeight:38})}} />
        </div>
        <div style={{ minWidth: 170, flex: 1 }}>
          <Form.Label className="mb-1">Lugar</Form.Label>
          <Select options={lugaresOptions} value={filtroLugar} onChange={v => { setFiltroLugar(v); setFiltroOtraCiudad(''); }} isClearable styles={{control:(base)=>({...base,minHeight:38})}} />
          {filtroLugar && filtroLugar.value === 'Otros' && (
            <input type="text" className="form-control mt-1" placeholder="Especifica ciudad/lugar" value={filtroOtraCiudad} onChange={e => setFiltroOtraCiudad(e.target.value)} style={{minHeight:38}} />
          )}
        </div>
        <div style={{ minWidth: 250, flex: 1 }}>
          <Form.Label className="mb-1">Fecha</Form.Label>
          <div className="d-flex flex-row align-items-end gap-2">
            <DateRangePicker
              valueStart={filtroFechaInicio || ''}
              valueEnd={filtroFechaFin || ''}
              onChangeStart={val => setFiltroFechaInicio(val)}
              onChangeEnd={val => setFiltroFechaFin(val)}
              rango={!!filtroRango}
            />
            <Form.Check
              type="switch"
              id="filtro-rango-switch"
              label="Buscar por rango"
              checked={!!filtroRango}
              onChange={e => setFiltroRango(e.target.checked)}
              style={{marginBottom:0, marginLeft:8, whiteSpace:'nowrap'}}
            />
          </div>
        </div>
      </div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 style={{ color: '#7c3aed', fontWeight: 700 }}>Eventos</h4>
        {user === undefined ? null : (user && !isGuest) ? (
          <Button variant="primary" onClick={() => setShowModal(true)}>Crear evento</Button>
        ) : null}
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
                ) : !eventoPasado && isGuest ? (
                  <Button size="sm" variant="success" onClick={() => setShowAuthPrompt(true)}>
                    Asistiré
                  </Button>
                ) : null} 
              </div>
              <div style={{ fontSize: 13, color: '#b5b5b5' }}>Creador: {ev.creadorNombre}</div>
<ComentariosEvento eventoId={ev.id} user={user} />
              {user && ev.creador === user.uid && !ev.finalizado && !eventoPasado && (
                <Button
                  size="sm"
                  variant="warning"
                  style={{ position: 'absolute', top: 14, right: 110 }}
                  onClick={async () => {
                    if (window.confirm('¿Marcar este evento como finalizado?')) {
                      try {
                        await import('firebase/firestore').then(async ({ updateDoc, doc: docFirestore }) => {
                          await updateDoc(docFirestore(db, 'eventos', ev.id), { finalizado: true });
                        });
                        // Notificar a los asistentes
                        if (ev.asistentes && Array.isArray(ev.asistentes) && ev.asistentes.length > 0) {
                          for (const asistente of ev.asistentes) {
                            if (asistente !== user.uid) {
                              await enviarNotificacion(asistente, {
                                type: 'event_ended',
                                text: `El evento "${ev.titulo}" ha finalizado`,
                                link: ''
                              });
                            }
                          }
                        }
                        await fetchEventos();
                      } catch (err) {
                        alert('No se pudo finalizar el evento. ' + (err && err.message ? err.message : err));
                      }
                    }
                  }}
                  className="me-2"
                >
                  Finalizar evento
                </Button>
              )}
              {user && ev.creador === user.uid && (
                <Button
                  size="sm"
                  variant="danger"
                  style={{ position: 'absolute', top: 14, right: 14 }}
                  onClick={async () => {
                    if (window.confirm('¿Seguro que quieres eliminar este evento?')) {
                      try {
                        await import('firebase/firestore').then(async ({ deleteDoc, doc: docFirestore }) => {
                          await deleteDoc(docFirestore(db, 'eventos', ev.id));
                        });
                        // Notificar a los asistentes
                        if (ev.asistentes && Array.isArray(ev.asistentes) && ev.asistentes.length > 0) {
                          for (const asistente of ev.asistentes) {
                            if (asistente !== user.uid) {
                              await enviarNotificacion(asistente, {
                                type: 'event_deleted',
                                text: `El evento "${ev.titulo}" ha sido eliminado`,
                                link: ''
                              });
                            }
                          }
                        }
                        await fetchEventos();
                      } catch (err) {
                        alert('No se pudo eliminar el evento. ' + (err && err.message ? err.message : err));
                      }
                    }
                  }}
                >
                  Eliminar evento
                </Button>
              )}
            </div>
          );
        })
      )}
      <Modal show={showModal && user && !isGuest} onHide={() => setShowModal(false)}>
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
              <select className="form-control" value={nuevoEvento.lugar} onChange={e => setNuevoEvento({ ...nuevoEvento, lugar: e.target.value, otraCiudad: '' })} required>
                <option value="">Selecciona ciudad/lugar</option>
                {ciudadesOptions.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="Otros">Otros...</option>
              </select>
              {nuevoEvento.lugar === 'Otros' && (
                <input type="text" className="form-control mt-2" placeholder="Especifica ciudad/lugar" value={nuevoEvento.otraCiudad} onChange={e => setNuevoEvento({ ...nuevoEvento, otraCiudad: e.target.value })} required />
              )}
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Fecha</Form.Label>
              <div className="d-flex align-items-center gap-3 mb-2">
                <Form.Check
                  type="switch"
                  id="rango-fecha-switch"
                  label="Evento de varios días"
                  checked={!!nuevoEvento.fechaRango}
                  onChange={e => setNuevoEvento({ ...nuevoEvento, fechaRango: e.target.checked })}
                />
              </div>
              <DateRangePicker
                valueStart={nuevoEvento.fecha}
                valueEnd={nuevoEvento.fechaFin || nuevoEvento.fecha}
                onChangeStart={val => setNuevoEvento({ ...nuevoEvento, fecha: val })}
                onChangeEnd={val => setNuevoEvento({ ...nuevoEvento, fechaFin: val })}
                rango={!!nuevoEvento.fechaRango}
              />
            </Form.Group>
            {!nuevoEvento.fechaRango && (
              <Form.Group className="mb-3">
                <Form.Label>Hora</Form.Label>
                <Form.Control type="time" value={nuevoEvento.hora} onChange={e => setNuevoEvento({ ...nuevoEvento, hora: e.target.value })} required />
              </Form.Group>
            )}
            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} value={nuevoEvento.descripcion} onChange={e => setNuevoEvento({ ...nuevoEvento, descripcion: e.target.value.slice(0,250) })} maxLength={250} required />
              <div className="text-end small" style={{color: nuevoEvento.descripcion.length > 240 ? '#d00' : '#888'}}>
                {nuevoEvento.descripcion.length}/250
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Precio de la entrada (COP)</Form.Label>
              <Form.Control type="number" min="0" placeholder="0 (gratis)" value={nuevoEvento.precio} onChange={e => setNuevoEvento({ ...nuevoEvento, precio: e.target.value })} />
              <Form.Text className="text-muted">Deja en 0 si el evento es gratuito.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Aforo (capacidad máxima)</Form.Label>
              <Form.Control type="number" min="1" required value={nuevoEvento.aforo} onChange={e => setNuevoEvento({ ...nuevoEvento, aforo: e.target.value })} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Imágenes (opcional, puedes seleccionar varias)</Form.Label>
              <Form.Control type="file" accept="image/*" multiple onChange={handleImagenChange} />
              {imagenesPreview.length > 0 && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                  {imagenesPreview.map((src, i) => (
                    <img key={i} src={src} alt={`preview${i}`} style={{maxWidth:100, maxHeight:100, borderRadius:8, objectFit:'cover'}} />
                  ))}
                </div>
              )}
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100" disabled={creating || !nuevoEvento.titulo || !nuevoEvento.lugar || !nuevoEvento.fecha || (!nuevoEvento.fechaRango && !nuevoEvento.hora)}>
              {creating ? 'Creando...' : 'Crear evento'}
            </Button>
            {createError && <div className="alert alert-danger mt-2">{createError}</div>}
            {createSuccess && <div className="alert alert-success mt-2">¡Evento creado exitosamente!</div>}
          </Form>
        </Modal.Body>
      </Modal>
      <Modal show={showAuthPrompt} onHide={() => setShowAuthPrompt(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Acción solo para usuarios registrados</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Debes iniciar sesión o registrarte para interactuar con eventos.</p>
          <div className="d-flex gap-3 justify-content-center mt-3">
            <Button variant="primary" onClick={() => window.location.href = '/login'}>Iniciar sesión</Button>
            <Button variant="outline-primary" onClick={() => window.location.href = '/register'}>Registrarse</Button>
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Eventos;
