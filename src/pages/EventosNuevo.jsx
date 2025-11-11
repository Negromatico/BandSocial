import React, { useEffect, useState, useContext } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Button, Modal } from 'react-bootstrap';
import { GuestContext } from '../App';
import { FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaThLarge, FaList } from 'react-icons/fa';
import './Eventos.css';

const EventosNuevo = () => {
  const guestContext = useContext(GuestContext);
  const isGuest = typeof guestContext === 'object' ? guestContext.isGuest : guestContext;
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [asistiendo, setAsistiendo] = useState({});
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [sortBy, setSortBy] = useState('recent');

  // Filtros
  const [filtroGenero, setFiltroGenero] = useState([]);
  const [filtroCiudad, setFiltroCiudad] = useState('');
  const [filtroTipo, setFiltroTipo] = useState([]);

  const generos = ['Rock', 'Pop', 'Jazz', 'Hip Hop', 'Indie', 'Salsa'];
  const tiposEvento = ['Conciertos', 'Festivales', 'Jam Sessions', 'Workshops'];

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  const fetchEventos = async () => {
    setLoading(true);
    const q = query(collection(db, 'eventos'), orderBy('fecha', 'desc'));
    const snapshot = await getDocs(q);
    let eventosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Filtrar eventos futuros
    const now = new Date();
    eventosData = eventosData.filter(ev => {
      if (!ev.fecha || !ev.hora) return false;
      const fechaHora = new Date(ev.fecha + 'T' + ev.hora);
      return fechaHora > now;
    });

    // Buscar nombre del creador
    await Promise.all(eventosData.map(async ev => {
      if (ev.creador) {
        try {
          const { getDoc, doc: docFirestore } = await import('firebase/firestore');
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

  useEffect(() => {
    if (!user) return;
    eventos.forEach(ev => {
      if (ev.asistentes && ev.asistentes.includes(user.uid)) {
        setAsistiendo(prev => ({ ...prev, [ev.id]: true }));
      }
    });
  }, [eventos, user]);

  const handleAsistir = async (eventoId) => {
    if (user === undefined) return;
    if (user === null || isGuest) {
      setShowAuthPrompt(true);
      return;
    }
    const eventoRef = doc(db, 'eventos', eventoId);
    await updateDoc(eventoRef, { asistentes: arrayUnion(user.uid) });
    setAsistiendo(prev => ({ ...prev, [eventoId]: true }));
    fetchEventos();
  };

  const toggleFiltroGenero = (genero) => {
    setFiltroGenero(prev =>
      prev.includes(genero) ? prev.filter(g => g !== genero) : [...prev, genero]
    );
  };

  const toggleFiltroTipo = (tipo) => {
    setFiltroTipo(prev =>
      prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
    );
  };

  // Aplicar filtros
  const eventosFiltrados = eventos.filter(ev => {
    if (filtroGenero.length > 0 && !filtroGenero.some(g => ev.generos?.includes(g))) return false;
    if (filtroCiudad && ev.lugar !== filtroCiudad) return false;
    if (filtroTipo.length > 0 && !filtroTipo.includes(ev.tipo)) return false;
    return true;
  });

  // Ordenar eventos
  const eventosOrdenados = [...eventosFiltrados].sort((a, b) => {
    if (sortBy === 'recent') {
      return new Date(b.fecha + 'T' + b.hora) - new Date(a.fecha + 'T' + a.hora);
    } else if (sortBy === 'price-low') {
      return (a.precio || 0) - (b.precio || 0);
    } else if (sortBy === 'price-high') {
      return (b.precio || 0) - (a.precio || 0);
    }
    return 0;
  });

  const getTipoBadgeClass = (tipo) => {
    const tipos = {
      'Conciertos': 'badge-concierto',
      'Festivales': 'badge-festival',
      'Jam Sessions': 'badge-jam-session',
      'Workshops': 'badge-workshop',
    };
    return tipos[tipo] || 'badge-concierto';
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    const dia = date.getDate();
    const mes = date.toLocaleDateString('es-ES', { month: 'short' }).toUpperCase();
    return { dia, mes };
  };

  return (
    <div className="eventos-container">
      {/* Sidebar de filtros */}
      <aside className="eventos-sidebar">
        <div className="sidebar-title">
          <FaFilter /> Filtros
        </div>

        <div className="filter-section">
          <label className="filter-label">Género Musical</label>
          <div className="genre-tags">
            {generos.map(genero => (
              <div
                key={genero}
                className={`genre-tag ${filtroGenero.includes(genero) ? 'active' : ''}`}
                onClick={() => toggleFiltroGenero(genero)}
              >
                {genero}
              </div>
            ))}
          </div>
        </div>

        <div className="filter-section">
          <label className="filter-label">Ciudad</label>
          <select
            className="filter-select"
            value={filtroCiudad}
            onChange={(e) => setFiltroCiudad(e.target.value)}
          >
            <option value="">Todas las ciudades</option>
            {[...new Set(eventos.map(ev => ev.lugar).filter(Boolean))]
              .sort()
              .map(ciudad => (
                <option key={ciudad} value={ciudad}>{ciudad}</option>
              ))}
          </select>
        </div>

        <div className="filter-section">
          <label className="filter-label">Tipo de Evento</label>
          {tiposEvento.map(tipo => (
            <div key={tipo} className="filter-checkbox">
              <input
                type="checkbox"
                id={`tipo-${tipo}`}
                checked={filtroTipo.includes(tipo)}
                onChange={() => toggleFiltroTipo(tipo)}
              />
              <label htmlFor={`tipo-${tipo}`}>{tipo}</label>
            </div>
          ))}
        </div>

        <div className="estadisticas-box">
          <div className="estadisticas-title">Estadísticas</div>
          <div className="stat-item">
            <span className="stat-label">Lista correcta</span>
            <span className="stat-value">{eventos.length}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Próximos 7 días</span>
            <span className="stat-value">
              {eventos.filter(ev => {
                const fecha = new Date(ev.fecha);
                const hoy = new Date();
                const diff = Math.ceil((fecha - hoy) / (1000 * 60 * 60 * 24));
                return diff >= 0 && diff <= 7;
              }).length}
            </span>
          </div>
        </div>
      </aside>

      {/* Contenido principal */}
      <main className="eventos-main">
        <div className="eventos-header">
          <div>
            <h1 className="eventos-title">Eventos Destacados</h1>
            <p className="eventos-subtitle">Descubre los mejores eventos de música en tu ciudad</p>
          </div>
          <div className="view-controls">
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Más recientes</option>
              <option value="price-low">Precio: Menor a Mayor</option>
              <option value="price-high">Precio: Mayor a Menor</option>
            </select>
            <button
              className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
            >
              <FaThLarge />
            </button>
            <button
              className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              <FaList />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center">Cargando eventos...</div>
        ) : eventosOrdenados.length === 0 ? (
          <div className="text-center">No hay eventos disponibles.</div>
        ) : (
          <div className="eventos-grid">
            {eventosOrdenados.map(ev => {
              const { dia, mes } = formatFecha(ev.fecha);
              const numAsistentes = ev.asistentes?.length || 0;
              
              return (
                <div key={ev.id} className="evento-card">
                  <div className={`evento-badge ${getTipoBadgeClass(ev.tipo)}`}>
                    {ev.tipo || 'CONCIERTO'}
                  </div>
                  
                  {ev.imagenesUrl && ev.imagenesUrl[0] ? (
                    <img src={ev.imagenesUrl[0]} alt={ev.titulo} className="evento-image" />
                  ) : (
                    <div className="evento-image" />
                  )}

                  <div className="evento-content">
                    <div className="evento-month">
                      <div className="month-icon">
                        <div className="month-day">{dia}</div>
                        <div className="month-name">{mes}</div>
                      </div>
                      <div>
                        <div className="evento-title">{ev.titulo}</div>
                      </div>
                    </div>

                    <div className="evento-price">
                      {ev.precio > 0 ? `$${ev.precio.toLocaleString('es-CL')}` : 'Gratis'}
                    </div>

                    <div className="evento-details">
                      <div className="detail-row">
                        <FaMapMarkerAlt className="detail-icon" />
                        <span>{ev.lugar}</span>
                      </div>
                      <div className="detail-row">
                        <FaClock className="detail-icon" />
                        <span>{ev.hora} - {new Date(ev.fecha).toLocaleDateString('es-ES')}</span>
                      </div>
                      <div className="detail-row">
                        <FaUsers className="detail-icon" />
                        <span>{numAsistentes} personas interesadas</span>
                      </div>
                    </div>
                  </div>

                  <div className="evento-footer">
                    <div className="evento-attendees">
                      <div className="attendee-avatars">
                        {[...Array(Math.min(3, numAsistentes))].map((_, i) => (
                          <div key={i} className="attendee-avatar">
                            {String.fromCharCode(65 + i)}
                          </div>
                        ))}
                      </div>
                      {numAsistentes > 3 && (
                        <span className="attendee-count">+{numAsistentes - 3}</span>
                      )}
                    </div>
                    <button
                      className={`asistir-btn ${asistiendo[ev.id] ? 'asistiendo' : ''}`}
                      onClick={() => handleAsistir(ev.id)}
                      disabled={asistiendo[ev.id]}
                    >
                      {asistiendo[ev.id] ? 'Asistiendo' : 'Asistir'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de autenticación */}
      <Modal show={showAuthPrompt} onHide={() => setShowAuthPrompt(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Acción solo para usuarios registrados</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Debes iniciar sesión o registrarte para asistir a eventos.</p>
          <div className="d-flex gap-3 justify-content-center mt-3">
            <Button variant="primary" onClick={() => window.location.href = '/login'}>
              Iniciar sesión
            </Button>
            <Button variant="outline-primary" onClick={() => window.location.href = '/register'}>
              Registrarse
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventosNuevo;
