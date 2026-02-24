import React, { useEffect, useState, useContext } from 'react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, query, orderBy, doc, getDoc, updateDoc, arrayUnion, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Button, Modal, Form } from 'react-bootstrap';
import { GuestContext } from '../App';
import { FaFilter, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaClock, FaThLarge, FaList, FaImage } from 'react-icons/fa';
import { uploadToCloudinary } from '../services/cloudinary';
import { useDepartamentos, useCiudades } from '../hooks/useColombia';
import { generosMusicales } from '../data/opciones';
import './Eventos.css';
import '../styles/ModernModal.css';

const EventosNuevo = () => {
  const guestContext = useContext(GuestContext);
  const isGuest = typeof guestContext === 'object' ? guestContext.isGuest : guestContext;
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [userProfile, setUserProfile] = useState(null);
  const [asistiendo, setAsistiendo] = useState({});
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' o 'list'
  const [sortBy, setSortBy] = useState('recent');
  
  // Modal crear evento
  const [showCrearEvento, setShowCrearEvento] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({
    titulo: '',
    descripcion: '',
    fecha: '',
    hora: '',
    lugar: '',
    ciudad: '',
    precio: '',
    tipo: '',
    generos: [],
    imagen: ''
  });
  const [creandoEvento, setCreandoEvento] = useState(false);
  const [erroresValidacion, setErroresValidacion] = useState([]);
  const [mensajeExito, setMensajeExito] = useState('');

  // Estados para subida de imagen
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [uploadingImagen, setUploadingImagen] = useState(false);
  const [ciudadesOptions, setCiudadesOptions] = useState([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState('');
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState('');

  // Filtros
  const [filtroGenero, setFiltroGenero] = useState([]);
  const [filtroCiudad, setFiltroCiudad] = useState('');
  const [filtroTipo, setFiltroTipo] = useState([]);
  
  const { departamentos } = useDepartamentos();
  const { ciudades } = useCiudades(departamentoSeleccionado);

  const generos = [
    'Rock',
    'Pop',
    'Jazz',
    'Hip Hop',
    'Indie',
    'Salsa',
    'Reggaeton',
    'Vallenato',
    'Cumbia',
    'Merengue',
    'Bachata',
    'Electrónica',
    'House',
    'Techno',
    'Reggae',
    'Blues',
    'Country',
    'Folk',
    'Metal',
    'Punk',
    'R&B',
    'Soul',
    'Funk',
    'Disco',
    'Tropical',
    'Ranchera',
    'Bolero',
    'Tango',
    'Flamenco',
    'Clásica',
    'Alternativo',
    'Experimental'
  ].sort();
  const tiposEvento = ['Conciertos', 'Festivales', 'Jam Sessions', 'Workshops'];

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        try {
          const docSnap = await getDoc(doc(db, 'perfiles', user.uid));
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          }
        } catch (error) {
          console.error('Error cargando perfil:', error);
        }
      };
      fetchUserProfile();
    }
  }, [user]);

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
    fetchCiudades();
  }, []);

  const fetchCiudades = async () => {
    try {
      const response = await fetch('https://api-colombia.com/api/v1/City');
      const data = await response.json();
      const uniqueCities = [...new Set(data.map(city => city.name))].sort();
      setCiudadesOptions(uniqueCities);
    } catch (error) {
      console.error('Error cargando ciudades:', error);
      setCiudadesOptions([]);
    }
  };

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

    try {
      const eventoRef = doc(db, 'eventos', eventoId);
      await updateDoc(eventoRef, {
        asistentes: arrayUnion(user.uid),
      });
      setAsistiendo((prev) => ({ ...prev, [eventoId]: true }));
    } catch (err) {
      console.error('Error al marcar asistencia:', err);
      alert('Error al marcar asistencia');
    }
  };

  const handleEliminarEvento = async (eventoId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este evento?')) return;
    
    try {
      await deleteDoc(doc(db, 'eventos', eventoId));
      setEventos(prev => prev.filter(e => e.id !== eventoId));
      alert('Evento eliminado exitosamente');
    } catch (error) {
      console.error('Error eliminando evento:', error);
      alert('Error al eliminar el evento');
    }
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

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagenFile(file);
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCrearEvento = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setErroresValidacion(['Debes iniciar sesión para crear un evento']);
      return;
    }

    // Validaciones detalladas
    const camposFaltantes = [];
    
    if (!nuevoEvento.titulo || nuevoEvento.titulo.trim() === '') {
      camposFaltantes.push('Título del Evento');
    }
    if (!nuevoEvento.fecha || nuevoEvento.fecha.trim() === '') {
      camposFaltantes.push('Fecha del Evento');
    }
    if (!nuevoEvento.hora || nuevoEvento.hora.trim() === '') {
      camposFaltantes.push('Hora del Evento');
    }
    if (!nuevoEvento.lugar || nuevoEvento.lugar.trim() === '') {
      camposFaltantes.push('Lugar del Evento');
    }
    if (!nuevoEvento.ciudad || nuevoEvento.ciudad.trim() === '') {
      camposFaltantes.push('Ciudad');
    }
    if (!nuevoEvento.tipo || nuevoEvento.tipo.trim() === '') {
      camposFaltantes.push('Tipo de Evento');
    }

    if (camposFaltantes.length > 0) {
      setErroresValidacion(camposFaltantes);
      return;
    }

    // Limpiar errores si todo está bien
    setErroresValidacion([]);
    setCreandoEvento(true);
    setUploadingImagen(true);

    try {
      // Subir imagen a Cloudinary si hay una seleccionada
      let imagenUrl = nuevoEvento.imagen;
      if (imagenFile) {
        imagenUrl = await uploadToCloudinary(imagenFile, 'Bandas', 'eventos');
      }

      const eventoData = {
        ...nuevoEvento,
        imagen: imagenUrl,
        imagenesUrl: imagenUrl ? [imagenUrl] : [],
        precio: nuevoEvento.precio ? parseFloat(nuevoEvento.precio) : 0,
        creadorUid: user.uid,
        creadorNombre: userProfile?.nombre || 'Usuario',
        asistentes: [],
        createdAt: serverTimestamp(),
        estado: 'activo'
      };

      await addDoc(collection(db, 'eventos'), eventoData);
      
      setMensajeExito('¡Evento creado exitosamente!');
      setShowCrearEvento(false);
      
      // Ocultar mensaje después de 5 segundos
      setTimeout(() => {
        setMensajeExito('');
      }, 5000);
      
      // Resetear formulario
      setNuevoEvento({
        titulo: '',
        descripcion: '',
        fecha: '',
        hora: '',
        lugar: '',
        ciudad: '',
        precio: '',
        tipo: '',
        generos: [],
        imagen: ''
      });
      setImagenFile(null);
      setImagenPreview('');

      // Recargar eventos
      fetchEventos();
    } catch (error) {
      console.error('Error al crear evento:', error);
      setErroresValidacion(['Error al crear el evento. Intenta de nuevo.']);
    } finally {
      setCreandoEvento(false);
      setUploadingImagen(false);
    }
  };

  return (
    <div className="eventos-container">
      {/* Notificación de éxito */}
      {mensajeExito && (
        <div 
          style={{
            position: 'fixed',
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
            border: '2px solid #10b981',
            borderRadius: '12px',
            padding: '16px 24px',
            boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            minWidth: '300px',
            animation: 'slideDown 0.3s ease-out'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'var(--success-color)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '20px'
          }}>
            ✓
          </div>
          <div style={{
            flex: 1,
            color: 'var(--success-color)',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            {mensajeExito}
          </div>
          <button
            onClick={() => setMensajeExito('')}
            className="btn-close-modal"
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      )}

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
          <div className="header-actions">
            {user && !isGuest && (
              <Button 
                className="btn-crear-evento-main"
                onClick={() => setShowCrearEvento(true)}
              >
                + Crear Evento
              </Button>
            )}
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
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center">Cargando eventos...</div>
        ) : eventosOrdenados.length === 0 ? (
          <div className="text-center">No hay eventos disponibles.</div>
        ) : (
          <div className="eventos-grid">
            {eventosOrdenados.map((ev, index) => {
              const { dia, mes } = formatFecha(ev.fecha);
              const numAsistentes = ev.asistentes?.length || 0;
              
              return (
                <React.Fragment key={ev.id}>
                  <div className="evento-card">
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
                    {user && ev.creadorUid === user.uid ? (
                      <button
                        className="asistir-btn"
                        style={{ background: 'var(--danger-color)' }}
                        onClick={() => handleEliminarEvento(ev.id)}
                      >
                        Eliminar
                      </button>
                    ) : (
                      <button
                        className={`asistir-btn ${asistiendo[ev.id] ? 'asistiendo' : ''}`}
                        onClick={() => handleAsistir(ev.id)}
                        disabled={asistiendo[ev.id]}
                      >
                        {asistiendo[ev.id] ? 'Asistiendo' : 'Asistir'}
                      </button>
                    )}
                  </div>
                </div>
              </React.Fragment>
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

      {/* Modal Crear Evento */}
      <Modal 
        show={showCrearEvento} 
        onHide={() => {
          setShowCrearEvento(false);
          setErroresValidacion([]);
        }} 
        size="lg" 
        className="modern-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Evento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearEvento}>
            {/* Sección de errores de validación */}
            {erroresValidacion.length > 0 && (
              <div 
                style={{
                  background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
                  border: '2px solid #ef4444',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '20px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: '12px',
                  gap: '8px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--danger-color)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '16px'
                  }}>
                    !
                  </div>
                  <h6 style={{ 
                    margin: 0, 
                    color: 'var(--danger-color)',
                    fontWeight: '700',
                    fontSize: '16px'
                  }}>
                    Por favor completa los siguientes campos:
                  </h6>
                </div>
                <ul style={{ 
                  margin: 0, 
                  paddingLeft: '20px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {erroresValidacion.map((error, index) => (
                    <li key={index} style={{ marginBottom: '6px' }}>
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label>Título del Evento *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Concierto de Rock en vivo"
                value={nuevoEvento.titulo}
                onChange={(e) => setNuevoEvento({...nuevoEvento, titulo: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe tu evento..."
                value={nuevoEvento.descripcion}
                onChange={(e) => setNuevoEvento({...nuevoEvento, descripcion: e.target.value})}
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Fecha del Evento *</Form.Label>
                  <div className="date-picker-container">
                    <div className="date-picker">
                      {/* Selector de Día */}
                      <div className="date-column">
                        <label className="date-label">DÍA</label>
                        <select 
                          className="date-select"
                          value={nuevoEvento.fecha.split('-')[2] || '01'}
                          onChange={(e) => {
                            const [year, month] = nuevoEvento.fecha.split('-');
                            setNuevoEvento({...nuevoEvento, fecha: `${year || '2025'}-${month || '01'}-${e.target.value}`});
                          }}
                          required
                        >
                          {Array.from({length: 31}, (_, i) => i + 1).map(d => (
                            <option key={d} value={d.toString().padStart(2, '0')}>
                              {d.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="date-separator">/</div>

                      {/* Selector de Mes */}
                      <div className="date-column">
                        <label className="date-label">MES</label>
                        <select 
                          className="date-select"
                          value={nuevoEvento.fecha.split('-')[1] || '01'}
                          onChange={(e) => {
                            const [year, , day] = nuevoEvento.fecha.split('-');
                            setNuevoEvento({...nuevoEvento, fecha: `${year || '2025'}-${e.target.value}-${day || '01'}`});
                          }}
                          required
                        >
                          {[
                            {value: '01', label: 'ENE'},
                            {value: '02', label: 'FEB'},
                            {value: '03', label: 'MAR'},
                            {value: '04', label: 'ABR'},
                            {value: '05', label: 'MAY'},
                            {value: '06', label: 'JUN'},
                            {value: '07', label: 'JUL'},
                            {value: '08', label: 'AGO'},
                            {value: '09', label: 'SEP'},
                            {value: '10', label: 'OCT'},
                            {value: '11', label: 'NOV'},
                            {value: '12', label: 'DIC'}
                          ].map(m => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                          ))}
                        </select>
                      </div>

                      <div className="date-separator">/</div>

                      {/* Selector de Año */}
                      <div className="date-column">
                        <label className="date-label">AÑO</label>
                        <select 
                          className="date-select"
                          value={nuevoEvento.fecha.split('-')[0] || '2025'}
                          onChange={(e) => {
                            const [, month, day] = nuevoEvento.fecha.split('-');
                            setNuevoEvento({...nuevoEvento, fecha: `${e.target.value}-${month || '01'}-${day || '01'}`});
                          }}
                          required
                        >
                          {Array.from({length: 5}, (_, i) => 2025 + i).map(y => (
                            <option key={y} value={y}>{y}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Hora del Evento *</Form.Label>
                  <div className="time-picker-container">
                    <div className="time-picker">
                      {/* Selector de Hora */}
                      <div className="time-column">
                        <label className="time-label">HORA</label>
                        <select 
                          className="time-select"
                          value={nuevoEvento.hora.split(':')[0] || '20'}
                          onChange={(e) => {
                            const minutos = nuevoEvento.hora.split(':')[1] || '00';
                            setNuevoEvento({...nuevoEvento, hora: `${e.target.value}:${minutos}`});
                          }}
                          required
                        >
                          {Array.from({length: 24}, (_, i) => i).map(h => (
                            <option key={h} value={h.toString().padStart(2, '0')}>
                              {h.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="time-separator">:</div>

                      {/* Selector de Minutos */}
                      <div className="time-column">
                        <label className="time-label">MINUTOS</label>
                        <select 
                          className="time-select"
                          value={nuevoEvento.hora.split(':')[1] || '00'}
                          onChange={(e) => {
                            const hora = nuevoEvento.hora.split(':')[0] || '20';
                            setNuevoEvento({...nuevoEvento, hora: `${hora}:${e.target.value}`});
                          }}
                          required
                        >
                          {['00', '15', '30', '45'].map(m => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Lugar *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Teatro Nacional"
                value={nuevoEvento.lugar}
                onChange={(e) => setNuevoEvento({...nuevoEvento, lugar: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Departamento *</Form.Label>
              <Form.Select
                value={departamentoSeleccionado}
                onChange={(e) => {
                  const deptId = e.target.value;
                  setDepartamentoSeleccionado(deptId);
                  setMunicipioSeleccionado('');
                  const deptNombre = departamentos.find(d => d.value === deptId)?.label || '';
                  setNuevoEvento({...nuevoEvento, departamento: deptId, municipio: '', ciudad: deptNombre});
                }}
                required
              >
                <option value="">Selecciona un departamento</option>
                {departamentos.map(dept => (
                  <option key={dept.value} value={dept.value}>{dept.label}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Municipio/Ciudad *</Form.Label>
              <Form.Select
                value={municipioSeleccionado}
                onChange={(e) => {
                  const munId = e.target.value;
                  setMunicipioSeleccionado(munId);
                  const munNombre = ciudades.find(c => c.value === munId)?.label || '';
                  setNuevoEvento({...nuevoEvento, municipio: munId, ciudad: munNombre});
                }}
                disabled={!departamentoSeleccionado}
                required
              >
                <option value="">Selecciona un municipio</option>
                {ciudades.map(city => (
                  <option key={city.value} value={city.value}>{city.label}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Precio (COP)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0 para evento gratuito"
                    value={nuevoEvento.precio}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, precio: e.target.value})}
                  />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Tipo de Evento</Form.Label>
                  <Form.Select
                    value={nuevoEvento.tipo}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, tipo: e.target.value})}
                  >
                    <option value="">Selecciona un tipo</option>
                    {tiposEvento.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Géneros Musicales</Form.Label>
              <div 
                className="border rounded p-3" 
                style={{ 
                  maxHeight: '200px', 
                  overflowY: 'auto',
                  backgroundColor: 'var(--card-bg)'
                }}
              >
                <div className="row g-3">
                  {generos.map(genero => (
                    <div key={genero} className="col-6 col-md-4 mb-1">
                      <div 
                        className="form-check p-2 rounded" 
                        style={{ 
                          cursor: 'pointer',
                          backgroundColor: nuevoEvento.generos.includes(genero) ? '#e7f3ff' : 'transparent',
                          border: nuevoEvento.generos.includes(genero) ? '1px solid #0d6efd' : '1px solid transparent',
                          transition: 'all 0.2s'
                        }}
                        onClick={() => {
                          if (nuevoEvento.generos.includes(genero)) {
                            setNuevoEvento({...nuevoEvento, generos: nuevoEvento.generos.filter(g => g !== genero)});
                          } else {
                            setNuevoEvento({...nuevoEvento, generos: [...nuevoEvento.generos, genero]});
                          }
                        }}
                      >
                        <Form.Check
                          type="checkbox"
                          id={`genero-${genero}`}
                          label={genero}
                          checked={nuevoEvento.generos.includes(genero)}
                          onChange={() => {}} // Manejado por el div padre
                          style={{ pointerEvents: 'none' }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <Form.Text className="text-muted">
                Selecciona uno o varios géneros haciendo clic
              </Form.Text>
              {nuevoEvento.generos.length > 0 && (
                <div className="mt-2">
                  <strong>Seleccionados ({nuevoEvento.generos.length}):</strong>{' '}
                  {nuevoEvento.generos.map((g) => (
                    <span key={g} className="badge bg-primary me-1 mb-1">
                      {g}
                      <button
                        type="button"
                        className="btn-close btn-close-white ms-1"
                        style={{ fontSize: '0.6rem' }}
                        onClick={() => setNuevoEvento({
                          ...nuevoEvento,
                          generos: nuevoEvento.generos.filter(gen => gen !== g)
                        })}
                        aria-label="Eliminar"
                      />
                    </span>
                  ))}
                </div>
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Imagen del Evento</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
              />
              <Form.Text className="text-muted">
                Sube una imagen desde tu ordenador (JPG, PNG, etc.)
              </Form.Text>
              
              {/* Preview de la imagen */}
              {imagenPreview && (
                <div className="mt-3">
                  <img 
                    src={imagenPreview} 
                    alt="Preview" 
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '12px',
                      objectFit: 'cover'
                    }}
                  />
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowCrearEvento(false)}>
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={creandoEvento || uploadingImagen}
              >
                {uploadingImagen ? 'Subiendo imagen...' : creandoEvento ? 'Creando...' : 'Crear Evento'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default EventosNuevo;
