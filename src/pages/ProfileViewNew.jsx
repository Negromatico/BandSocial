import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Button, Spinner } from 'react-bootstrap';
import { FaUserPlus, FaUserMinus, FaEnvelope, FaEllipsisH, FaMapMarkerAlt, FaCalendar, FaGuitar, FaUsers, FaMusic, FaExternalLinkAlt } from 'react-icons/fa';
import ChatModal from '../components/ChatModal';
import { notificarNuevoSeguidor } from '../services/notificationService';
import './ProfileViewNew.css';

const ProfileViewNew = () => {
  const { uid } = useParams();
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [siguiendo, setSiguiendo] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const [activeTab, setActiveTab] = useState('publicaciones');
  const [stats, setStats] = useState({ seguidores: 0, siguiendo: 0, eventos: 0, publicaciones: 0 });
  const [publicaciones, setPublicaciones] = useState([]);
  const [eventos, setEventos] = useState([]);
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchPerfil = async () => {
      setLoading(true);
      const docSnap = await getDoc(doc(db, 'perfiles', uid));
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('📸 Datos del perfil:', data);
        console.log('📸 Foto de perfil:', data.fotoPerfil || 'No tiene foto');
        console.log('📸 Nombre:', data.nombre);
        console.log('📸 Type:', data.type, typeof data.type);
        console.log('📸 Instrumentos:', data.instrumentos);
        console.log('📸 Géneros:', data.generos);
        
        // Función para limpiar valores que podrían ser objetos
        const cleanValue = (value) => {
          if (value === null || value === undefined) return value;
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return value;
          if (Array.isArray(value)) {
            return value.map(item => {
              if (typeof item === 'object' && item !== null) {
                return item.label || item.value || JSON.stringify(item);
              }
              return item;
            });
          }
          if (typeof value === 'object') {
            return value.label || value.value || value.nombre || '';
          }
          return value;
        };

        // Limpiar TODOS los campos del perfil
        const cleanedData = {};
        for (const key in data) {
          cleanedData[key] = cleanValue(data[key]);
        }
        cleanedData.uid = uid;
        
        console.log('✅ Datos limpiados:', cleanedData);
        setPerfil(cleanedData);
        
        // Verificar si el usuario actual sigue a este perfil
        if (currentUser) {
          const currentUserSnap = await getDoc(doc(db, 'perfiles', currentUser.uid));
          if (currentUserSnap.exists()) {
            const siguiendoList = currentUserSnap.data().siguiendo || [];
            setSiguiendo(siguiendoList.includes(uid));
          }
        }

        // Obtener estadísticas
        setStats({
          seguidores: data.seguidores?.length || 0,
          siguiendo: data.siguiendo?.length || 0,
          eventos: 0,
          publicaciones: 0
        });

        // Obtener publicaciones
        try {
          const pubQuery = query(collection(db, 'publicaciones'), where('autorUid', '==', uid), orderBy('createdAt', 'desc'));
          const pubSnap = await getDocs(pubQuery);
          setPublicaciones(pubSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setStats(prev => ({ ...prev, publicaciones: pubSnap.size }));
        } catch (error) {
          console.error('⚠️ Error cargando publicaciones (probablemente falta índice):', error.message);
          console.log('💡 Crea el índice en Firebase Console o revisa CREAR_INDICE_FIRESTORE.md');
        }

        // Obtener eventos
        try {
          const eventQuery = query(collection(db, 'eventos'), where('creadorUid', '==', uid), orderBy('fecha', 'desc'));
          const eventSnap = await getDocs(eventQuery);
          setEventos(eventSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          setStats(prev => ({ ...prev, eventos: eventSnap.size }));
        } catch (error) {
          console.error('⚠️ Error cargando eventos:', error.message);
        }
      }
      setLoading(false);
    };
    fetchPerfil();
  }, [uid, currentUser]);

  const handleSeguir = async () => {
    if (!currentUser) {
      alert('Debes iniciar sesión para seguir a otros usuarios');
      return;
    }

    setLoadingFollow(true);
    try {
      const currentUserRef = doc(db, 'perfiles', currentUser.uid);
      const otherUserRef = doc(db, 'perfiles', uid);

      if (siguiendo) {
        await updateDoc(currentUserRef, {
          siguiendo: arrayRemove(uid)
        });
        await updateDoc(otherUserRef, {
          seguidores: arrayRemove(currentUser.uid)
        });
        setSiguiendo(false);
        setStats(prev => ({ ...prev, seguidores: prev.seguidores - 1 }));
      } else {
        await updateDoc(currentUserRef, {
          siguiendo: arrayUnion(uid)
        });
        await updateDoc(otherUserRef, {
          seguidores: arrayUnion(currentUser.uid)
        });
        setSiguiendo(true);
        setStats(prev => ({ ...prev, seguidores: prev.seguidores + 1 }));
        await notificarNuevoSeguidor(currentUser.uid, uid);
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
    } finally {
      setLoadingFollow(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num;
  };

  if (loading) return <div className="loading-container"><Spinner animation="border" /></div>;
  if (!perfil) return <div className="error-container">Perfil no encontrado.</div>;

  return (
    <div className="profile-view-new">
      {/* Banner de Portada */}
      <div className="profile-banner">
        {perfil.bannerUrl ? (
          <img src={perfil.bannerUrl} alt="Banner" />
        ) : (
          <div className="default-banner" />
        )}
      </div>

      {/* Header del Perfil */}
      <div className="profile-header-container">
        <div className="profile-header-content">
          {/* Avatar */}
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large">
              {perfil.fotoPerfil ? (
                <img src={perfil.fotoPerfil} alt={perfil.nombre} />
              ) : (
                <div className="avatar-placeholder">
                  {perfil.nombre?.charAt(0)?.toUpperCase() || '?'}
                </div>
              )}
            </div>
          </div>

          {/* Información Principal */}
          <div className="profile-main-info">
            <div className="profile-name-section">
              <h1 className="profile-name">
                {perfil.nombre}
                {(perfil.planActual === 'premium' || perfil.membershipPlan === 'premium') && (
                  <span className="badge-premium">PREMIUM</span>
                )}
              </h1>
              <p className="profile-type">
                {perfil.type === 'banda' ? 'Banda de Rock Alternativo' : 'Músico Profesional'}
              </p>
              <div className="profile-location">
                <FaMapMarkerAlt /> {perfil.ciudad || 'Colombia'}
                <span className="separator">•</span>
                <FaCalendar /> Miembro desde {(() => {
                  if (perfil.createdAt) {
                    // Si es un timestamp de Firestore
                    if (perfil.createdAt.seconds) {
                      return new Date(perfil.createdAt.seconds * 1000).getFullYear();
                    }
                    // Si es un string o Date
                    return new Date(perfil.createdAt).getFullYear();
                  }
                  return '2025';
                })()}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="profile-actions">
              {currentUser && currentUser.uid !== uid && (
                <>
                  <Button
                    className={`btn-seguir ${siguiendo ? 'siguiendo' : ''}`}
                    onClick={handleSeguir}
                    disabled={loadingFollow}
                  >
                    {loadingFollow ? (
                      <Spinner animation="border" size="sm" />
                    ) : siguiendo ? (
                      <><FaUserMinus /> Siguiendo</>
                    ) : (
                      <><FaUserPlus /> Seguir</>
                    )}
                  </Button>
                  <Button
                    className="btn-mensaje"
                    onClick={() => setShowChat(true)}
                  >
                    <FaEnvelope /> Mensaje
                  </Button>
                </>
              )}
              <Button className="btn-more">
                <FaEllipsisH />
              </Button>
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-value">{formatNumber(stats.seguidores)}</div>
            <div className="stat-label">Seguidores</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatNumber(stats.siguiendo)}</div>
            <div className="stat-label">Siguiendo</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.eventos}</div>
            <div className="stat-label">Eventos</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{formatNumber(stats.publicaciones)}</div>
            <div className="stat-label">Publicaciones</div>
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="profile-tabs">
          <button
            className={`tab-btn ${activeTab === 'publicaciones' ? 'active' : ''}`}
            onClick={() => setActiveTab('publicaciones')}
          >
            <FaMusic /> Publicaciones
          </button>
          <button
            className={`tab-btn ${activeTab === 'acerca' ? 'active' : ''}`}
            onClick={() => setActiveTab('acerca')}
          >
            Acerca de
          </button>
          <button
            className={`tab-btn ${activeTab === 'galeria' ? 'active' : ''}`}
            onClick={() => setActiveTab('galeria')}
          >
            Galería
          </button>
          <button
            className={`tab-btn ${activeTab === 'eventos' ? 'active' : ''}`}
            onClick={() => setActiveTab('eventos')}
          >
            Eventos
          </button>
          <button
            className={`tab-btn ${activeTab === 'musica' ? 'active' : ''}`}
            onClick={() => setActiveTab('musica')}
          >
            Música
          </button>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="profile-content-wrapper">
        {/* Sidebar Izquierdo */}
        <aside className="profile-sidebar-left">
          {/* Acerca de */}
          <div className="sidebar-card">
            <h3 className="sidebar-title">Acerca de</h3>
            <div className="sidebar-content">
              <p className="bio-text">
                {perfil.bio || 'Músico apasionado por crear y compartir música. Conectando con otros artistas para hacer grandes proyectos.'}
              </p>
              <div className="info-item">
                <FaGuitar className="info-icon" />
                <span>
                  {perfil.instrumentos && Array.isArray(perfil.instrumentos) && perfil.instrumentos.length > 0
                    ? perfil.instrumentos.join(', ')
                    : perfil.miembros || '4 Miembros'
                  }
                </span>
              </div>
              {perfil.spotify && (
                <div className="info-item">
                  <FaMusic className="info-icon" />
                  <a href={perfil.spotify} target="_blank" rel="noopener noreferrer">
                    {perfil.spotify}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="sidebar-card">
            <h3 className="sidebar-title">Redes Sociales</h3>
            <div className="sidebar-content">
              {perfil.spotify && (
                <a href={perfil.spotify} target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon spotify">♫</span>
                  <span>Spotify</span>
                  <FaExternalLinkAlt className="external-icon" />
                </a>
              )}
              {perfil.youtube && (
                <a href={perfil.youtube} target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon youtube">▶</span>
                  <span>YouTube</span>
                  <FaExternalLinkAlt className="external-icon" />
                </a>
              )}
              {perfil.instagram && (
                <a href={perfil.instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                  <span className="social-icon instagram">📷</span>
                  <span>Instagram</span>
                  <FaExternalLinkAlt className="external-icon" />
                </a>
              )}
            </div>
          </div>

          {/* Próximos Eventos */}
          {eventos.length > 0 && (
            <div className="sidebar-card">
              <h3 className="sidebar-title">Próximos Eventos</h3>
              <div className="sidebar-content">
                {eventos.slice(0, 2).map(evento => (
                  <div key={evento.id} className="evento-mini">
                    <div className="evento-date">
                      <div className="date-month">MAR</div>
                      <div className="date-day">15</div>
                    </div>
                    <div className="evento-info">
                      <div className="evento-title">{evento.titulo}</div>
                      <div className="evento-location">{evento.lugar}</div>
                      <div className="evento-time">{evento.hora}</div>
                    </div>
                  </div>
                ))}
                <Link to="/eventos" className="ver-mas-link">
                  Ver todos los eventos →
                </Link>
              </div>
            </div>
          )}
        </aside>

        {/* Contenido Central */}
        <main className="profile-main-content">
          {activeTab === 'publicaciones' && (
            <div className="publicaciones-section">
              {/* Crear Publicación (solo si es el usuario actual) */}
              {currentUser && currentUser.uid === uid && (
                <div className="create-post-card">
                  <div className="create-post-header">
                    <div className="create-post-avatar">
                      {perfil.fotoPerfil ? (
                        <img src={perfil.fotoPerfil} alt={perfil.nombre} />
                      ) : (
                        <div className="avatar-placeholder-small">
                          {perfil.nombre?.charAt(0)?.toUpperCase()}
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder="¿Qué estás pensando?"
                      className="create-post-input"
                      readOnly
                    />
                  </div>
                  <div className="create-post-actions">
                    <button className="post-action-btn">
                      <span className="action-icon">📷</span> Foto
                    </button>
                    <button className="post-action-btn">
                      <span className="action-icon">🎥</span> Video
                    </button>
                    <button className="post-action-btn">
                      <span className="action-icon">🎵</span> Audio
                    </button>
                    <button className="btn-publicar-primary">Publicar</button>
                  </div>
                </div>
              )}

              {/* Lista de Publicaciones */}
              {publicaciones.length === 0 ? (
                <div className="empty-state">
                  <p>No hay publicaciones aún</p>
                </div>
              ) : (
                publicaciones.map(pub => (
                  <div key={pub.id} className="post-card-new">
                    <div className="post-header-new">
                      <div className="post-avatar">
                        {perfil.fotoPerfil ? (
                          <img src={perfil.fotoPerfil} alt={perfil.nombre} />
                        ) : (
                          <div className="avatar-placeholder-small">
                            {perfil.nombre?.charAt(0)?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="post-info">
                        <div className="post-author">{perfil.nombre}</div>
                        <div className="post-time">Hace 2 horas</div>
                      </div>
                      <button className="post-menu-btn">
                        <FaEllipsisH />
                      </button>
                    </div>

                    <div className="post-content-new">
                      <p className="post-text">{pub.descripcion || pub.contenido}</p>
                      {pub.imagenesUrl && pub.imagenesUrl[0] && (
                        <img src={pub.imagenesUrl[0]} alt="Post" className="post-image-new" />
                      )}
                    </div>

                    <div className="post-stats">
                      <span className="stat-likes">❤️ {pub.likes?.length || 0}</span>
                      <span className="stat-comments">💬 {pub.comentarios || 0}</span>
                      <span className="stat-shares">🔗 {pub.compartidos || 0}</span>
                    </div>

                    <div className="post-actions-new">
                      <button className="action-btn-new">
                        ❤️ Me gusta
                      </button>
                      <button className="action-btn-new">
                        💬 Comentar
                      </button>
                      <button className="action-btn-new">
                        🔗 Compartir
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'acerca' && (
            <div className="acerca-section">
              <div className="info-card">
                <h3>Información</h3>
                <p>{perfil.bio || 'Sin información disponible'}</p>
              </div>
            </div>
          )}

          {activeTab === 'galeria' && (
            <div className="galeria-section">
              <div className="gallery-grid">
                {perfil.fotos && perfil.fotos.length > 0 ? (
                  perfil.fotos.map((foto, index) => (
                    <div key={index} className="gallery-item">
                      <img src={foto} alt={`Foto ${index + 1}`} />
                    </div>
                  ))
                ) : (
                  <div className="empty-state">No hay fotos en la galería</div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'eventos' && (
            <div className="eventos-section">
              {/* Botón para crear evento (solo si es tu perfil) - SIEMPRE VISIBLE */}
              {(() => {
                console.log('🔍 Verificando botón crear evento:');
                console.log('   currentUser:', currentUser);
                console.log('   currentUser.uid:', currentUser?.uid);
                console.log('   uid del perfil:', uid);
                console.log('   ¿Son iguales?:', currentUser?.uid === uid);
                
                const isOwnProfile = currentUser && currentUser.uid === uid;
                
                if (isOwnProfile) {
                  return (
                    <div className="create-event-card">
                      <Button 
                        className="btn-crear-evento"
                        onClick={() => window.location.href = '/eventos'}
                      >
                        + Crear Nuevo Evento
                      </Button>
                    </div>
                  );
                }
                return null;
              })()}

              {eventos.length === 0 ? (
                <div className="empty-state">
                  {currentUser && currentUser.uid === uid 
                    ? 'Aún no has creado eventos. ¡Crea tu primer evento!'
                    : 'No hay eventos próximos'
                  }
                </div>
              ) : (
                eventos.map(evento => (
                  <div key={evento.id} className="evento-card-profile">
                    <h4>{evento.titulo}</h4>
                    <div className="evento-details">
                      <div className="evento-detail-item">
                        <FaCalendar className="evento-icon" />
                        <span>{evento.fecha} • {evento.hora}</span>
                      </div>
                      <div className="evento-detail-item">
                        <FaMapMarkerAlt className="evento-icon" />
                        <span>{evento.lugar}</span>
                      </div>
                      {evento.precio && (
                        <div className="evento-detail-item">
                          <span className="evento-precio">${evento.precio.toLocaleString('es-CO')} COP</span>
                        </div>
                      )}
                    </div>
                    {evento.descripcion && (
                      <p className="evento-descripcion">{evento.descripcion}</p>
                    )}
                    <div className="evento-footer">
                      <span className="evento-asistentes">
                        <FaUsers /> {evento.asistentes?.length || 0} asistentes
                      </span>
                      <Button 
                        className="btn-ver-evento"
                        onClick={() => window.location.href = '/eventos'}
                      >
                        Ver Detalles
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'musica' && (
            <div className="musica-section">
              <div className="empty-state">Sección de música próximamente</div>
            </div>
          )}
        </main>
      </div>

      {/* Chat Modal */}
      {showChat && (
        <ChatModal
          show={showChat}
          onHide={() => setShowChat(false)}
          otherUserId={uid}
          otherUserName={perfil.nombre}
          otherUserPhoto={perfil.fotoPerfil}
        />
      )}
    </div>
  );
};

export default ProfileViewNew;
