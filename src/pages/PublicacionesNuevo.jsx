import React, { useEffect, useState, useContext } from 'react';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, getDoc, where, updateDoc, arrayUnion, arrayRemove, onSnapshot } from 'firebase/firestore';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaImage, FaVideo, FaHeart, FaComment, FaShare, FaUser, FaTag, FaUsers, FaCalendarAlt, FaMusic } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import PublicacionForm from '../components/PublicacionForm';
import ComentariosPublicacion from '../components/ComentariosPublicacion';
import ReaccionesPublicacion from '../components/ReaccionesPublicacion';
import ContadorComentarios from '../components/ContadorComentarios';
import AuthPromptModal from '../components/AuthPromptModal';
import { notificarNuevoSeguidor } from '../services/notificationService';
import { GuestContext } from '../App';
import { useChatDock } from '../contexts/ChatDockContext';
import './Publicaciones.css';

const PublicacionesNuevo = () => {
  const guestContext = useContext(GuestContext);
  const isGuest = guestContext?.isGuest || false;
  const { openChat } = useChatDock();
  const location = useLocation();
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [userProfile, setUserProfile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [chatsActivos, setChatsActivos] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [seguidores, setSeguidores] = useState(0);
  const [siguiendo, setSiguiendo] = useState(0);
  const [siguiendoList, setSiguiendoList] = useState([]);
  const [loadingFollow, setLoadingFollow] = useState({});

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchSugerencias();
      fetchSeguidoresStats();
      
      // Listener en tiempo real para mensajes recientes
      const unsubChats = onSnapshot(
        collection(db, 'userChats', user.uid, 'chats'),
        async (snapshot) => {
          const chatsData = [];
          
          for (const chatDoc of snapshot.docs) {
            const chat = chatDoc.data();
            if (chat.with) {
              const perfilSnap = await getDoc(doc(db, 'perfiles', chat.with));
              let nombre = chat.withNombre || chat.withEmail || 'Usuario';
              let foto = null;
              
              if (perfilSnap.exists()) {
                const perfil = perfilSnap.data();
                nombre = perfil.nombre || perfil.email || nombre;
                foto = perfil.fotoPerfil;
              }
              
              // Detectar si hay mensajes no leídos
              const noLeido = chat.lastFrom && chat.lastFrom !== user.uid && !chat.lastRead;
              
              chatsData.push({
                id: chat.chatId,
                otroUsuarioId: chat.with,
                nombre: nombre,
                mensaje: chat.lastMsg || 'Inicia una conversación',
                online: false,
                foto: foto,
                timestamp: chat.lastAt || new Date().toISOString(),
                noLeido: noLeido
              });
            }
          }
          
          // Ordenar por timestamp
          chatsData.sort((a, b) => {
            const timeA = new Date(a.timestamp);
            const timeB = new Date(b.timestamp);
            return timeB - timeA;
          });
          
          setChatsActivos(chatsData.slice(0, 5));
        },
        (error) => {
          console.error('Error listening to chats:', error);
          setChatsActivos([]);
        }
      );
      
      return () => unsubChats();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const docSnap = await getDoc(doc(db, 'perfiles', user.uid));
      if (docSnap.exists()) {
        setUserProfile(docSnap.data());
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchSugerencias = async () => {
    if (!user) return;
    try {
      // Obtener perfiles aleatorios que no sean el usuario actual
      const perfilesQuery = query(collection(db, 'perfiles'));
      const perfilesSnap = await getDocs(perfilesQuery);
      const perfilesData = [];
      
      perfilesSnap.docs.forEach(docSnap => {
        if (docSnap.id !== user.uid) {
          const perfil = docSnap.data();
          perfilesData.push({
            id: docSnap.id,
            nombre: perfil.nombre || perfil.email || 'Usuario',
            tipo: perfil.type || 'Músico',
            foto: perfil.fotoPerfil
          });
        }
      });
      
      // Seleccionar 3 aleatorios
      const sugerenciasAleatorias = perfilesData
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      setSugerencias(sugerenciasAleatorias);
    } catch (error) {
      console.error('Error fetching sugerencias:', error);
    }
  };

  const fetchSeguidoresStats = async () => {
    if (!user) return;
    try {
      const perfilSnap = await getDoc(doc(db, 'perfiles', user.uid));
      if (perfilSnap.exists()) {
        const perfil = perfilSnap.data();
        setSeguidores(perfil.seguidores?.length || 0);
        setSiguiendo(perfil.siguiendo?.length || 0);
        setSiguiendoList(perfil.siguiendo || []);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSeguir = async (userId) => {
    if (!user) {
      alert('Debes iniciar sesión para seguir a otros usuarios');
      return;
    }

    setLoadingFollow(prev => ({ ...prev, [userId]: true }));
    
    try {
      const currentUserRef = doc(db, 'perfiles', user.uid);
      const otherUserRef = doc(db, 'perfiles', userId);
      
      const estaSiguiendo = siguiendoList.includes(userId);

      if (estaSiguiendo) {
        // Dejar de seguir
        await updateDoc(currentUserRef, {
          siguiendo: arrayRemove(userId)
        });
        await updateDoc(otherUserRef, {
          seguidores: arrayRemove(user.uid)
        });
        setSiguiendoList(prev => prev.filter(id => id !== userId));
        setSiguiendo(prev => prev - 1);
      } else {
        // Seguir
        await updateDoc(currentUserRef, {
          siguiendo: arrayUnion(userId)
        });
        await updateDoc(otherUserRef, {
          seguidores: arrayUnion(user.uid)
        });
        setSiguiendoList(prev => [...prev, userId]);
        setSiguiendo(prev => prev + 1);
        
        // Enviar notificación
        await notificarNuevoSeguidor(user.uid, userId);
      }
    } catch (error) {
      console.error('Error al seguir/dejar de seguir:', error);
      alert('Error al actualizar. Intenta de nuevo.');
    } finally {
      setLoadingFollow(prev => ({ ...prev, [userId]: false }));
    }
  };

  const fetchPublicaciones = async () => {
    setLoading(true);
    const q = query(collection(db, 'publicaciones'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    let pubs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Buscar nombres de autor y contar comentarios
    await Promise.all(pubs.map(async pub => {
      // Obtener nombre del autor
      if (!pub.autorNombre && pub.autorUid) {
        try {
          const perfilSnap = await getDoc(doc(db, 'perfiles', pub.autorUid));
          if (perfilSnap.exists()) {
            pub.autorNombre = perfilSnap.data().nombre || perfilSnap.data().email || pub.autorUid;
            pub.autorFoto = perfilSnap.data().fotoPerfil;
          } else {
            pub.autorNombre = pub.autorUid;
          }
        } catch {
          pub.autorNombre = pub.autorUid;
        }
      }
    }));
    
    setPublicaciones(pubs);
    setLoading(false);
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

  // Scroll automático a publicación específica desde notificación
  useEffect(() => {
    if (location.state?.scrollToPublicacion && publicaciones.length > 0) {
      const publicacionId = location.state.scrollToPublicacion;
      setTimeout(() => {
        const element = document.getElementById(`publicacion-${publicacionId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.style.animation = 'highlight 2s ease-in-out';
        }
      }, 500);
    }
  }, [location.state, publicaciones]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatDate = (timestamp) => {
    if (!timestamp || !timestamp.toDate) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Ahora';
    if (diff < 3600) return `Hace ${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `Hace ${Math.floor(diff / 3600)}h`;
    return `Hace ${Math.floor(diff / 86400)}d`;
  };


  return (
    <>
      <AuthPromptModal user={user} isGuest={isGuest} />
      <div className="publicaciones-layout">
        {/* Sidebar Izquierdo - Perfil (Solo si hay usuario) */}
        {user && (
          <aside className="sidebar-left">
          <div className="profile-card">
            <div className="profile-avatar">
              {userProfile?.fotoPerfil ? (
                <img src={userProfile.fotoPerfil} alt={userProfile.nombre} />
              ) : (
                getInitials(userProfile?.nombre || user?.email)
              )}
            </div>
            <div className="profile-name" style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center', flexWrap: 'nowrap' }}>
              {userProfile?.nombre || 'Usuario'}
              {(userProfile?.planActual === 'premium' || userProfile?.membershipPlan === 'premium') && (
                <span style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                  color: '#000',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '10px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  boxShadow: '0 2px 4px rgba(255, 215, 0, 0.3)',
                  letterSpacing: '0.3px',
                  flexShrink: 0
                }}>
                  PRO
                </span>
              )}
            </div>
            <div className="profile-type">{userProfile?.type || 'Músico Profesional'}</div>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{seguidores}</span>
                <span className="stat-label">Seguidores</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{siguiendo}</span>
                <span className="stat-label">Siguiendo</span>
              </div>
            </div>
          </div>

          <div className="quick-access">
            <div className="quick-access-title">Accesos Rápidos</div>
            <Link to="/profile" className="quick-access-item">
              <FaUser className="quick-access-icon" />
              <span>Mi Perfil</span>
            </Link>
            <Link to="/musicmarket" className="quick-access-item">
              <FaTag className="quick-access-icon" />
              <span>Mis Ventas</span>
            </Link>
            <Link to="/eventos" className="quick-access-item">
              <FaCalendarAlt className="quick-access-icon" />
              <span>Eventos</span>
            </Link>
            <Link to="/juego" className="quick-access-item">
              <FaMusic className="quick-access-icon" />
              <span>Piano Tiles</span>
            </Link>
          </div>
        </aside>
        )}

      {/* Feed Central */}
      <main className="feed-container">
        {/* Crear Publicación - Solo si hay usuario */}
        {user && (
          <div className="create-post-box">
            <div className="create-post-header">
              <div className="create-post-avatar">
                {userProfile?.fotoPerfil ? (
                  <img src={userProfile.fotoPerfil} alt={userProfile.nombre} />
                ) : (
                  getInitials(userProfile?.nombre || user?.email)
                )}
              </div>
              <div
                className="create-post-input"
                onClick={() => setShowCreateModal(true)}
              >
                ¿Que quieres publicar el día de hoy?
              </div>
            </div>
            <div className="create-post-actions">
              <button className="post-action-btn" onClick={() => setShowCreateModal(true)}>
                <FaImage className="post-action-icon" />
                Foto
              </button>
              <button className="post-action-btn" onClick={() => setShowCreateModal(true)}>
                <FaVideo className="post-action-icon" />
                Video
              </button>
              <button className="post-action-btn publish-btn" onClick={() => setShowCreateModal(true)}>
                Publicar
              </button>
            </div>
          </div>
        )}

        {/* Lista de Publicaciones */}
        {loading ? (
          <div className="text-center">Cargando publicaciones...</div>
        ) : publicaciones.length === 0 ? (
          <div className="text-center">No hay publicaciones aún.</div>
        ) : (
          publicaciones.map((pub, index) => (
            <React.Fragment key={pub.id}>
              <div className="post-card" id={`publicacion-${pub.id}`}>
              <div className="post-header">
                <Link to={`/profile/${pub.autorUid}`} className="post-avatar" style={{ textDecoration: 'none' }}>
                  {pub.autorFoto ? (
                    <img src={pub.autorFoto} alt={pub.autorNombre} />
                  ) : (
                    getInitials(pub.autorNombre)
                  )}
                </Link>
                <div className="post-author-info">
                  <Link to={`/profile/${pub.autorUid}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="post-author-name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {pub.autorNombre}
                      {(pub.autorInfo?.planActual === 'premium' || pub.autorInfo?.membershipPlan === 'premium') && (
                        <span style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: '#000',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontSize: '9px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          boxShadow: '0 1px 3px rgba(255, 215, 0, 0.3)',
                          letterSpacing: '0.3px'
                        }}>
                          PRO
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="post-meta">
                    {pub.tipo} • {pub.ciudad} • {formatDate(pub.createdAt)}
                  </div>
                </div>
              </div>

              <div className="post-content">
                <div className="post-text">{pub.descripcion}</div>
                {pub.imagenesUrl && pub.imagenesUrl.length > 0 && (
                  <img src={pub.imagenesUrl[0]} alt="Post" className="post-image" />
                )}
              </div>

              <div className="post-actions">
                <ReaccionesPublicacion publicacionId={pub.id} user={user} />
                <ContadorComentarios publicacionId={pub.id} />
              </div>

              <ComentariosPublicacion 
                publicacionId={pub.id} 
                user={user}
              />
            </div>
          </React.Fragment>
          ))
        )}
      </main>

      {/* Sidebar Derecho - Solo si hay usuario */}
      {user && (
        <aside className="sidebar-right">
          {/* Mensajes Recientes */}
          <div className="chats-activos">
            <div className="sidebar-title">Mensajes Recientes</div>
            {chatsActivos.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '20px 0' }}>
                No hay mensajes recientes
              </div>
            ) : (
              chatsActivos.map(chat => (
                <div
                  key={chat.id}
                  className="chat-item"
                  style={{ 
                    textDecoration: 'none', 
                    cursor: 'pointer',
                    background: chat.noLeido ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.1))' : 'transparent',
                    borderLeft: chat.noLeido ? '3px solid #667eea' : '3px solid transparent',
                    fontWeight: chat.noLeido ? '600' : 'normal',
                    position: 'relative'
                  }}
                  onClick={() => openChat({
                    with: chat.otroUsuarioId,
                    withEmail: chat.nombre,
                    withNombre: chat.nombre,
                    chatId: chat.id,
                    avatar: chat.foto
                  })}
                >
                  <div className="chat-avatar" style={{ position: 'relative' }}>
                    {chat.foto ? (
                      <img src={chat.foto} alt={chat.nombre} />
                    ) : (
                      getInitials(chat.nombre)
                    )}
                    {chat.online && <div className="chat-status" />}
                    {chat.noLeido && (
                      <div style={{
                        position: 'absolute',
                        top: -2,
                        right: -2,
                        width: 12,
                        height: 12,
                        background: '#ef4444',
                        borderRadius: '50%',
                        border: '2px solid white',
                        boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)'
                      }} />
                    )}
                  </div>
                  <div className="chat-info" style={{ flex: 1 }}>
                    <div className="chat-name" style={{ 
                      color: chat.noLeido ? '#667eea' : 'inherit',
                      fontWeight: chat.noLeido ? '700' : 'inherit'
                    }}>
                      {chat.nombre}
                    </div>
                    <div className="chat-preview" style={{
                      color: chat.noLeido ? '#1f2937' : 'inherit',
                      fontWeight: chat.noLeido ? '600' : 'inherit'
                    }}>
                      {chat.mensaje}
                    </div>
                  </div>
                  {chat.noLeido && (
                    <div style={{
                      background: '#ef4444',
                      borderRadius: '50%',
                      width: 10,
                      height: 10,
                      boxShadow: '0 2px 4px rgba(239, 68, 68, 0.4)',
                      marginLeft: 'auto',
                      flexShrink: 0
                    }} />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Sugerencias */}
          <div className="sugerencias">
            <div className="sidebar-title">Sugerencias</div>
            {sugerencias.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '20px 0' }}>
                No hay sugerencias
              </div>
            ) : (
              sugerencias.map(sug => (
                <div key={sug.id} className="sugerencia-item">
                  <Link to={`/profile/${sug.id}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <div className="sugerencia-avatar">
                      {sug.foto ? (
                        <img src={sug.foto} alt={sug.nombre} />
                      ) : (
                        getInitials(sug.nombre)
                      )}
                    </div>
                    <div className="sugerencia-info">
                      <div className="sugerencia-name">{sug.nombre}</div>
                      <div className="sugerencia-type">{sug.tipo}</div>
                    </div>
                  </Link>
                  <button 
                    className="seguir-btn"
                    onClick={() => handleSeguir(sug.id)}
                    disabled={loadingFollow[sug.id]}
                    style={{
                      background: siguiendoList.includes(sug.id) ? '#e5e7eb' : '#667eea',
                      color: siguiendoList.includes(sug.id) ? '#6b7280' : 'white'
                    }}
                  >
                    {loadingFollow[sug.id] ? '...' : (siguiendoList.includes(sug.id) ? 'Siguiendo' : 'Seguir')}
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>
      )}

        {/* Modal para crear publicación */}
        <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title>Crear Publicación</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PublicacionForm
              onCreated={() => {
                setShowCreateModal(false);
                fetchPublicaciones();
              }}
            />
          </Modal.Body>
        </Modal>
      </div>
    </>
  );
};

export default PublicacionesNuevo;
