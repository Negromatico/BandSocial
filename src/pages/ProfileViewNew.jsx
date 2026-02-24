import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth } from '../services/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove, collection, query, where, getDocs, orderBy, addDoc } from 'firebase/firestore';
import { Button, Spinner, Modal, Form } from 'react-bootstrap';
import { FaUserPlus, FaUserMinus, FaEnvelope, FaEllipsisH, FaMapMarkerAlt, FaCalendar, FaGuitar, FaUsers, FaMusic, FaExternalLinkAlt, FaInstagram, FaYoutube, FaSpotify } from 'react-icons/fa';
import ChatModal from '../components/ChatModal';
import { notificarNuevoSeguidor } from '../services/notificationService';
import { useChatDock } from '../contexts/ChatDockContext';
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
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [enviandoComentario, setEnviandoComentario] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPostToShare, setSelectedPostToShare] = useState(null);
  const [compartiendo, setCompartiendo] = useState(false);
  const { openChat } = useChatDock();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

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
        console.log('✅ Nombre del perfil:', cleanedData.nombre);
        console.log('✅ Ciudad:', cleanedData.ciudad);
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
          const pubQuery = query(collection(db, 'publicaciones'), where('autorUid', '==', uid));
          const pubSnap = await getDocs(pubQuery);
          let pubs = pubSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // Filtrar publicaciones eliminadas
          pubs = pubs.filter(p => !p.deleted);
          
          // Ordenar por fecha en el cliente
          pubs.sort((a, b) => {
            const dateA = a.createdAt?.toDate?.() || new Date(0);
            const dateB = b.createdAt?.toDate?.() || new Date(0);
            return dateB - dateA;
          });
          
          setPublicaciones(pubs);
          setStats(prev => ({ ...prev, publicaciones: pubs.length }));
        } catch (error) {
          console.error('Error cargando publicaciones:', error);
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

  const handleLike = async (postId) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para dar me gusta');
      return;
    }

    try {
      const postRef = doc(db, 'publicaciones', postId);
      const postSnap = await getDoc(postRef);
      
      if (postSnap.exists()) {
        const postData = postSnap.data();
        const likes = postData.likes || [];
        const hasLiked = likes.includes(currentUser.uid);

        if (hasLiked) {
          await updateDoc(postRef, {
            likes: arrayRemove(currentUser.uid)
          });
        } else {
          await updateDoc(postRef, {
            likes: arrayUnion(currentUser.uid)
          });
        }

        // Actualizar estado local
        setPublicaciones(prev => prev.map(pub => {
          if (pub.id === postId) {
            const newLikes = hasLiked 
              ? likes.filter(id => id !== currentUser.uid)
              : [...likes, currentUser.uid];
            return { ...pub, likes: newLikes };
          }
          return pub;
        }));
      }
    } catch (error) {
      console.error('Error al dar like:', error);
    }
  };

  const handleComment = async (post) => {
    if (!currentUser) {
      alert('Debes iniciar sesión para comentar');
      return;
    }
    setSelectedPost(post);
    setShowCommentModal(true);
    await cargarComentarios(post.id);
  };

  const cargarComentarios = async (postId) => {
    setLoadingComentarios(true);
    try {
      const comentariosRef = collection(db, 'publicaciones', postId, 'comentarios');
      const q = query(comentariosRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const comentariosData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComentarios(comentariosData);
    } catch (error) {
      console.error('Error cargando comentarios:', error);
      setComentarios([]);
    } finally {
      setLoadingComentarios(false);
    }
  };

  const handleEnviarComentario = async () => {
    if (!nuevoComentario.trim() || !selectedPost || !currentUser) return;

    setEnviandoComentario(true);
    try {
      // Obtener datos del usuario actual
      const userDoc = await getDoc(doc(db, 'perfiles', currentUser.uid));
      const userData = userDoc.data();

      // Agregar comentario a la subcolección
      const comentariosRef = collection(db, 'publicaciones', selectedPost.id, 'comentarios');
      const nuevoComentarioDoc = {
        texto: nuevoComentario.trim(),
        usuarioId: currentUser.uid,
        usuarioNombre: userData?.nombre || 'Usuario',
        usuarioFoto: userData?.fotoPerfil || null,
        createdAt: new Date(),
        likes: []
      };

      await addDoc(comentariosRef, nuevoComentarioDoc);

      // Actualizar contador de comentarios en la publicación
      const postRef = doc(db, 'publicaciones', selectedPost.id);
      const postSnap = await getDoc(postRef);
      const currentComentarios = postSnap.data()?.comentarios || 0;
      await updateDoc(postRef, {
        comentarios: currentComentarios + 1
      });

      // Limpiar input y recargar comentarios
      setNuevoComentario('');
      await cargarComentarios(selectedPost.id);

      // Actualizar el contador en la UI local
      setPublicaciones(prev => prev.map(pub => 
        pub.id === selectedPost.id 
          ? { ...pub, comentarios: (pub.comentarios || 0) + 1 }
          : pub
      ));
    } catch (error) {
      console.error('Error enviando comentario:', error);
      alert('Error al enviar el comentario');
    } finally {
      setEnviandoComentario(false);
    }
  };

  const handleCompartir = (post) => {
    setSelectedPostToShare(post);
    setShowShareModal(true);
  };

  const compartirEnRedes = async (red) => {
    if (!selectedPostToShare) return;

    const url = window.location.href;
    const texto = selectedPostToShare.descripcion || 'Mira esta publicación en BandSocial';
    
    let shareUrl = '';
    
    switch(red) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(texto + ' ' + url)}`;
        break;
      case 'telegram':
        shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(texto)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    
    // Actualizar contador de compartidos
    try {
      const postRef = doc(db, 'publicaciones', selectedPostToShare.id);
      const postSnap = await getDoc(postRef);
      const currentCompartidos = postSnap.data()?.compartidos || 0;
      await updateDoc(postRef, {
        compartidos: currentCompartidos + 1
      });
      
      // Actualizar UI local
      setPublicaciones(prev => prev.map(pub => 
        pub.id === selectedPostToShare.id 
          ? { ...pub, compartidos: (pub.compartidos || 0) + 1 }
          : pub
      ));
    } catch (error) {
      console.error('Error actualizando contador:', error);
    }
  };

  const copiarEnlace = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert('¡Enlace copiado al portapapeles!');
      
      // Actualizar contador
      if (selectedPostToShare) {
        const postRef = doc(db, 'publicaciones', selectedPostToShare.id);
        const postSnap = await getDoc(postRef);
        const currentCompartidos = postSnap.data()?.compartidos || 0;
        await updateDoc(postRef, {
          compartidos: currentCompartidos + 1
        });
        
        setPublicaciones(prev => prev.map(pub => 
          pub.id === selectedPostToShare.id 
            ? { ...pub, compartidos: (pub.compartidos || 0) + 1 }
            : pub
        ));
      }
      
      setShowShareModal(false);
    } catch (error) {
      console.error('Error copiando enlace:', error);
      alert('Error al copiar el enlace');
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
        {perfil.fotoPortada ? (
          <img src={perfil.fotoPortada} alt="Banner" />
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
                {perfil.nombre || 'Usuario de BandSocial'}
                {(perfil.planActual === 'premium' || perfil.membershipPlan === 'premium') && (
                  <span className="badge-premium">PREMIUM</span>
                )}
              </h1>
              <p className="profile-type">
                {perfil.type === 'banda' ? 'Banda Musical' : 
                 perfil.type === 'musico' ? 'Músico Profesional' : 
                 perfil.type === 'venue' ? 'Lugar de Eventos' : 
                 'Miembro de BandSocial'}
              </p>
              <div className="profile-location">
                <FaMapMarkerAlt /> {perfil.ciudad || 'Colombia'}
                {perfil.createdAt && (
                  <>
                    <span className="separator">•</span>
                    <FaCalendar /> Miembro desde {(() => {
                      // Si es un timestamp de Firestore
                      if (perfil.createdAt.seconds) {
                        return new Date(perfil.createdAt.seconds * 1000).getFullYear();
                      }
                      // Si es un string o Date
                      return new Date(perfil.createdAt).getFullYear();
                    })()}
                  </>
                )}
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="profile-actions" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {currentUser && currentUser.uid !== uid ? (
                <>
                  <button
                    className={`btn-seguir ${siguiendo ? 'siguiendo' : ''}`}
                    onClick={handleSeguir}
                    disabled={loadingFollow}
                    style={{
                      background: siguiendo ? '#e4e6eb' : '#1877f2',
                      color: siguiendo ? '#050505' : 'white',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '15px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: loadingFollow ? 'not-allowed' : 'pointer',
                      opacity: loadingFollow ? 0.6 : 1,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    {loadingFollow ? (
                      <Spinner animation="border" size="sm" />
                    ) : siguiendo ? (
                      <><FaUserMinus /> Siguiendo</>
                    ) : (
                      <><FaUserPlus /> Seguir</>
                    )}
                  </button>
                  <button
                    className="btn-mensaje"
                    onClick={() => {
                      const chatId = [currentUser.uid, uid].sort().join('_');
                      openChat({
                        with: uid,
                        withEmail: perfil?.email || 'Usuario',
                        withNombre: perfil?.nombre || 'Usuario',
                        chatId: chatId,
                        avatar: perfil?.fotoPerfil || ''
                      });
                    }}
                    style={{
                      background: '#e4e6eb',
                      color: '#050505',
                      border: 'none',
                      padding: '10px 24px',
                      borderRadius: 8,
                      fontWeight: 600,
                      fontSize: 15,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <FaEnvelope /> Mensaje
                  </button>
                  <button 
                    className="btn-more"
                    style={{
                      background: '#e4e6eb',
                      color: '#050505',
                      border: 'none',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <FaEllipsisH />
                  </button>
                </>
              ) : currentUser && currentUser.uid === uid ? (
                <button 
                  className="btn-mensaje"
                  onClick={() => window.location.href = '/profile'}
                  style={{
                    background: '#e4e6eb',
                    color: '#050505',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  Editar Perfil
                </button>
              ) : null}
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
                <a href={perfil.spotify} target="_blank" rel="noopener noreferrer" className="social-link" title="Spotify">
                  <span className="social-icon spotify">
                    <FaSpotify />
                  </span>
                </a>
              )}
              {perfil.youtube && (
                <a href={perfil.youtube} target="_blank" rel="noopener noreferrer" className="social-link" title="YouTube">
                  <span className="social-icon youtube">
                    <FaYoutube />
                  </span>
                </a>
              )}
              {perfil.instagram && (
                <a href={perfil.instagram} target="_blank" rel="noopener noreferrer" className="social-link" title="Instagram">
                  <span className="social-icon instagram">
                    <FaInstagram />
                  </span>
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
                      <button 
                        className="action-btn-new"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLike(pub.id);
                        }}
                        style={{
                          color: pub.likes?.includes(currentUser?.uid) ? '#1877f2' : 'inherit',
                          fontWeight: pub.likes?.includes(currentUser?.uid) ? '600' : 'normal'
                        }}
                      >
                        ❤️ Me gusta
                      </button>
                      <button 
                        className="action-btn-new"
                        onClick={() => handleComment(pub)}
                      >
                        💬 Comentar
                      </button>
                      <button 
                        className="action-btn-new"
                        onClick={() => handleCompartir(pub)}
                      >
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

      {/* Modal de Comentarios */}
      <Modal 
        show={showCommentModal} 
        onHide={() => {
          setShowCommentModal(false);
          setNuevoComentario('');
          setComentarios([]);
        }} 
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-color)' }}>
          <Modal.Title style={{ color: 'var(--text-primary)' }}>💬 Comentarios</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '500px', overflowY: 'auto', background: 'var(--bg-secondary)' }}>
          {/* Lista de Comentarios */}
          {loadingComentarios ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spinner animation="border" variant="primary" />
              <p style={{ marginTop: '10px', color: 'var(--text-secondary)' }}>Cargando comentarios...</p>
            </div>
          ) : comentarios.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>Aún no hay comentarios</p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: '14px' }}>Sé el primero en comentar</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {comentarios.map(comentario => (
                <div 
                  key={comentario.id} 
                  style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    background: 'var(--card-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    {comentario.usuarioFoto ? (
                      <img 
                        src={comentario.usuarioFoto} 
                        alt={comentario.usuarioNombre}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 700,
                        fontSize: '16px'
                      }}>
                        {comentario.usuarioNombre?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </div>
                  
                  {/* Contenido */}
                  <div style={{ flex: 1 }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                        {comentario.usuarioNombre}
                      </strong>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginLeft: '8px' }}>
                        {comentario.createdAt?.toDate ? 
                          new Date(comentario.createdAt.toDate()).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Ahora'
                        }
                      </span>
                    </div>
                    <p style={{ 
                      color: 'var(--text-primary)', 
                      fontSize: '14px', 
                      margin: 0,
                      lineHeight: '1.5'
                    }}>
                      {comentario.texto}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ 
          borderTop: '1px solid var(--border-color)',
          background: 'var(--card-bg)',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '12px'
        }}>
          {/* Input para nuevo comentario */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
            <Form.Control
              as="textarea"
              rows={2}
              placeholder="Escribe un comentario..."
              value={nuevoComentario}
              onChange={(e) => setNuevoComentario(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEnviarComentario();
                }
              }}
              disabled={enviandoComentario}
              style={{
                flex: 1,
                resize: 'none',
                border: '1px solid var(--border-color)',
                background: 'var(--input-bg)',
                color: 'var(--text-primary)',
                borderRadius: '8px',
                padding: '10px'
              }}
            />
            <Button 
              variant="primary"
              onClick={handleEnviarComentario}
              disabled={!nuevoComentario.trim() || enviandoComentario}
              style={{
                minWidth: '100px',
                borderRadius: '8px',
                fontWeight: 600
              }}
            >
              {enviandoComentario ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Enviando...
                </>
              ) : (
                'Comentar'
              )}
            </Button>
          </div>
          <small style={{ color: 'var(--text-tertiary)', fontSize: '12px', textAlign: 'center' }}>
            Presiona Enter para enviar, Shift+Enter para nueva línea
          </small>
        </Modal.Footer>
      </Modal>

      {/* Modal de Compartir */}
      <Modal 
        show={showShareModal} 
        onHide={() => setShowShareModal(false)} 
        centered
      >
        <Modal.Header closeButton style={{ borderBottom: '1px solid var(--border-color)' }}>
          <Modal.Title style={{ color: 'var(--text-primary)' }}>🔗 Compartir Publicación</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ background: 'var(--bg-secondary)', padding: '24px' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', textAlign: 'center' }}>
            Comparte esta publicación en tus redes sociales
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {/* Facebook */}
            <button
              onClick={() => compartirEnRedes('facebook')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: '#1877f2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>

            {/* Twitter */}
            <button
              onClick={() => compartirEnRedes('twitter')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: '#1DA1F2',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </button>

            {/* WhatsApp */}
            <button
              onClick={() => compartirEnRedes('whatsapp')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </button>

            {/* Telegram */}
            <button
              onClick={() => compartirEnRedes('telegram')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: '#0088cc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </button>
          </div>

          <div style={{ 
            marginTop: '20px', 
            padding: '12px', 
            background: 'var(--card-bg)', 
            borderRadius: '8px',
            border: '1px solid var(--border-color)'
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '8px' }}>
              O copia el enlace:
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                value={window.location.href}
                readOnly
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                  fontSize: '13px'
                }}
              />
              <Button
                variant="outline-primary"
                onClick={copiarEnlace}
                style={{
                  whiteSpace: 'nowrap',
                  fontWeight: 600
                }}
              >
                📋 Copiar
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProfileViewNew;
