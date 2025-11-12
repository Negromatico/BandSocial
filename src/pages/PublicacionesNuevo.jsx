import React, { useEffect, useState } from 'react';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, getDoc, where, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { Modal, Button, Form } from 'react-bootstrap';
import { FaImage, FaVideo, FaHeart, FaComment, FaShare, FaUser, FaTag, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PublicacionForm from '../components/PublicacionForm';
import ComentariosPublicacion from '../components/ComentariosPublicacion';
import ReaccionesPublicacion from '../components/ReaccionesPublicacion';
import { notificarNuevoSeguidor } from '../services/notificationService';
import './Publicaciones.css';

const PublicacionesNuevo = () => {
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
      fetchChatsActivos();
      fetchSugerencias();
      fetchSeguidoresStats();
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

  const fetchChatsActivos = async () => {
    if (!user) return;
    try {
      // Obtener conversaciones del usuario con filtro where
      const chatsQuery = query(
        collection(db, 'conversaciones'),
        where('participantes', 'array-contains', user.uid),
        orderBy('ultimoMensaje', 'desc')
      );
      const chatsSnap = await getDocs(chatsQuery);
      const chatsData = [];
      
      for (const chatDoc of chatsSnap.docs) {
        const chat = chatDoc.data();
        const otroUsuarioId = chat.participantes.find(id => id !== user.uid);
        if (otroUsuarioId) {
          const perfilSnap = await getDoc(doc(db, 'perfiles', otroUsuarioId));
          if (perfilSnap.exists()) {
            const perfil = perfilSnap.data();
            chatsData.push({
              id: chatDoc.id,
              nombre: perfil.nombre || perfil.email || 'Usuario',
              mensaje: chat.ultimoMensajeTexto || 'Mensaje',
              online: false, // Puedes implementar lógica de presencia
              foto: perfil.fotoPerfil
            });
          }
        }
        if (chatsData.length >= 5) break;
      }
      setChatsActivos(chatsData);
    } catch (error) {
      console.error('Error fetching chats:', error);
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
      
      // Contar comentarios
      try {
        const comentariosSnap = await getDocs(collection(db, 'publicaciones', pub.id, 'comentarios'));
        pub.comentariosCount = comentariosSnap.size;
      } catch {
        pub.comentariosCount = 0;
      }
    }));
    
    setPublicaciones(pubs);
    setLoading(false);
  };

  useEffect(() => {
    fetchPublicaciones();
  }, []);

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
    <div className="publicaciones-layout">
      {/* Sidebar Izquierdo - Perfil */}
      <aside className="sidebar-left">
        <div className="profile-card">
          <div className="profile-avatar">
            {userProfile?.fotoPerfil ? (
              <img src={userProfile.fotoPerfil} alt={userProfile.nombre} />
            ) : (
              getInitials(userProfile?.nombre || user?.email)
            )}
          </div>
          <div className="profile-name">{userProfile?.nombre || 'Usuario'}</div>
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
          <Link to="/musicos" className="quick-access-item">
            <FaUsers className="quick-access-icon" />
            <span>Mis Grupos</span>
          </Link>
          <Link to="/eventos" className="quick-access-item">
            <FaCalendarAlt className="quick-access-icon" />
            <span>Eventos</span>
          </Link>
        </div>
      </aside>

      {/* Feed Central */}
      <main className="feed-container">
        {/* Crear Publicación */}
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

        {/* Lista de Publicaciones */}
        {loading ? (
          <div className="text-center">Cargando publicaciones...</div>
        ) : publicaciones.length === 0 ? (
          <div className="text-center">No hay publicaciones aún.</div>
        ) : (
          publicaciones.map(pub => (
            <div key={pub.id} className="post-card">
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
                    <div className="post-author-name">{pub.autorNombre}</div>
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
                <div className="post-action">
                  <FaComment className="post-action-icon" />
                  <span>{pub.comentariosCount || 0}</span>
                </div>
              </div>

              <ComentariosPublicacion 
                publicacionId={pub.id} 
                user={user}
                onCommentAdded={() => fetchPublicaciones()}
              />
            </div>
          ))
        )}
      </main>

      {/* Sidebar Derecho */}
      <aside className="sidebar-right">
        {/* Chats Activos */}
        <div className="chats-activos">
          <div className="sidebar-title">Chats Activos</div>
          {chatsActivos.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '20px 0' }}>
              No hay chats activos
            </div>
          ) : (
            chatsActivos.map(chat => (
              <Link key={chat.id} to="/chat" className="chat-item" style={{ textDecoration: 'none' }}>
                <div className="chat-avatar">
                  {chat.foto ? (
                    <img src={chat.foto} alt={chat.nombre} />
                  ) : (
                    getInitials(chat.nombre)
                  )}
                  {chat.online && <div className="chat-status" />}
                </div>
                <div className="chat-info">
                  <div className="chat-name">{chat.nombre}</div>
                  <div className="chat-preview">{chat.mensaje}</div>
                </div>
              </Link>
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

      {/* Modal para crear publicación */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear Publicación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <PublicacionForm
            onSuccess={() => {
              setShowCreateModal(false);
              fetchPublicaciones();
            }}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default PublicacionesNuevo;
