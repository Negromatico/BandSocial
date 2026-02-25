import React, { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, Timestamp, getDoc, doc as docFirestore } from 'firebase/firestore';
import { notificarComentario } from '../services/notificationService';

const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '';
  const now = new Date();
  const commentDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  const diffMs = now - commentDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'ahora';
  if (diffMins < 60) return `${diffMins} min`;
  if (diffHours < 24) return `${diffHours} h`;
  return `${diffDays} d`;
};

const ComentariosPublicacion = ({ publicacionId, user }) => {
  const [comentarios, setComentarios] = useState([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [respondiendo, setRespondiendo] = useState(null); // ID del comentario al que se está respondiendo
  const [textoRespuesta, setTextoRespuesta] = useState('');
  const [likesComentarios, setLikesComentarios] = useState({}); // { comentarioId: [uids] }

  useEffect(() => {
    const q = query(
      collection(db, 'publicaciones', publicacionId, 'comentarios'),
      orderBy('createdAt', 'asc')
    );
    const unsub = onSnapshot(q, (snap) => {
      const comentariosData = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComentarios(comentariosData);
      
      // Cargar likes de comentarios
      const likesData = {};
      comentariosData.forEach(com => {
        if (com.likes && Array.isArray(com.likes)) {
          likesData[com.id] = com.likes;
        }
      });
      setLikesComentarios(likesData);
    });
    return unsub;
  }, [publicacionId]);

  const handleComentar = async (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    setLoading(true);
    try {
      // Obtener nombre real del perfil
      let perfilNombre = 'Usuario';
      try {
        const perfilSnap = await import('firebase/firestore').then(({ getDoc, doc: docFirestore }) =>
          getDoc(docFirestore(db, 'perfiles', user.uid))
        );
        if (perfilSnap && perfilSnap.exists()) {
          const data = perfilSnap.data();
          perfilNombre = data.nombre || data.nombreCompleto || 'Usuario';
        }
      } catch (e) { /* Si falla, sigue con 'Usuario' */ }
      await addDoc(collection(db, 'publicaciones', publicacionId, 'comentarios'), {
        texto: nuevoComentario,
        autorUid: user.uid,
        autorNombre: perfilNombre,
        createdAt: Timestamp.now(),
        likes: [],
        respuestas: []
      });
      // Notificación al dueño de la publicación
      const pubSnap = await getDoc(docFirestore(db, 'publicaciones', publicacionId));
      if (pubSnap.exists()) {
        const pub = pubSnap.data();
        if (pub.autorUid && pub.autorUid !== user.uid) {
          await notificarComentario(user.uid, pub.autorUid, publicacionId);
        }
      }
      setNuevoComentario('');
      setLoading(false);
    } catch (err) {
      console.error('Error al comentar:', err);
      alert('Error al comentar: ' + (err && err.message ? err.message : err));
      setLoading(false);
    }
  };

  const handleResponder = async (e, comentarioId, comentarioAutorUid) => {
    e.preventDefault();
    if (!textoRespuesta.trim()) return;
    setLoading(true);
    try {
      // Obtener nombre real del perfil
      let perfilNombre = 'Usuario';
      try {
        const perfilSnap = await getDoc(docFirestore(db, 'perfiles', user.uid));
        if (perfilSnap && perfilSnap.exists()) {
          const data = perfilSnap.data();
          perfilNombre = data.nombre || data.nombreCompleto || 'Usuario';
        }
      } catch (e) { /* Si falla, sigue con 'Usuario' */ }

      // Agregar respuesta como un nuevo comentario con referencia al padre
      await addDoc(collection(db, 'publicaciones', publicacionId, 'comentarios'), {
        texto: textoRespuesta,
        autorUid: user.uid,
        autorNombre: perfilNombre,
        createdAt: Timestamp.now(),
        likes: [],
        respuestaA: comentarioId, // Referencia al comentario padre
        respuestas: []
      });

      setTextoRespuesta('');
      setRespondiendo(null);
      setLoading(false);
    } catch (err) {
      console.error('Error al responder:', err);
      alert('Error al responder: ' + (err && err.message ? err.message : err));
      setLoading(false);
    }
  };

  const handleLikeComentario = async (comentarioId) => {
    if (!user) return;
    
    try {
      const comentarioRef = docFirestore(db, 'publicaciones', publicacionId, 'comentarios', comentarioId);
      const comentarioSnap = await getDoc(comentarioRef);
      
      if (!comentarioSnap.exists()) return;
      
      const comentarioData = comentarioSnap.data();
      const likes = comentarioData.likes || [];
      const hasLiked = likes.includes(user.uid);
      
      const { updateDoc, arrayUnion, arrayRemove } = await import('firebase/firestore');
      
      if (hasLiked) {
        await updateDoc(comentarioRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        await updateDoc(comentarioRef, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (err) {
      console.error('Error al dar like al comentario:', err);
    }
  };

  const handleEliminarComentario = async (comentarioId, autorUid) => {
    if (!user) return;
    
    // Verificar si el usuario es el autor del comentario
    if (user.uid !== autorUid) {
      // Verificar si el usuario es el dueño de la publicación
      try {
        const pubSnap = await getDoc(docFirestore(db, 'publicaciones', publicacionId));
        if (!pubSnap.exists() || pubSnap.data().autorUid !== user.uid) {
          alert('No tienes permiso para eliminar este comentario');
          return;
        }
      } catch (err) {
        console.error('Error verificando permisos:', err);
        return;
      }
    }

    if (!window.confirm('¿Estás seguro de que quieres eliminar este comentario?')) {
      return;
    }

    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(docFirestore(db, 'publicaciones', publicacionId, 'comentarios', comentarioId));
      
      // También eliminar las respuestas a este comentario
      const respuestas = comentarios.filter(c => c.respuestaA === comentarioId);
      for (const resp of respuestas) {
        await deleteDoc(docFirestore(db, 'publicaciones', publicacionId, 'comentarios', resp.id));
      }
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
      alert('Error al eliminar el comentario. Intenta de nuevo.');
    }
  };

  return (
    <div style={{ 
      marginTop: '12px',
      borderTop: '1px solid var(--border-color, #e4e6eb)',
      paddingTop: '12px'
    }}>
      {/* Lista de comentarios */}
      {comentarios.length > 0 && (
        <div style={{ 
          marginBottom: '12px',
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          {comentarios.filter(com => !com.respuestaA).map(com => {
            const likesCount = likesComentarios[com.id]?.length || 0;
            const hasLiked = user && likesComentarios[com.id]?.includes(user.uid);
            const respuestas = comentarios.filter(r => r.respuestaA === com.id);
            const puedeEliminar = user && (user.uid === com.autorUid);
            
            return (
              <div key={com.id}>
                <div 
                  style={{ 
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '12px',
                    alignItems: 'flex-start'
                  }}
                >
                  {/* Avatar */}
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '14px',
                    flexShrink: 0
                  }}>
                    {com.autorNombre?.charAt(0)?.toUpperCase() || 'U'}
                  </div>

                  {/* Contenido del comentario */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Nombre y texto */}
                    <div style={{ 
                      fontSize: '14px',
                      lineHeight: '18px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ 
                          fontWeight: 600,
                          color: 'var(--text-primary, #050505)',
                          marginRight: '6px'
                        }}>
                          {com.autorNombre}
                        </span>
                        <span style={{ 
                          color: 'var(--text-primary, #050505)',
                          wordBreak: 'break-word'
                        }}>
                          {com.texto}
                        </span>
                      </div>
                      {puedeEliminar && (
                        <button
                          onClick={() => handleEliminarComentario(com.id, com.autorUid)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '2px 6px',
                            cursor: 'pointer',
                            color: 'var(--text-secondary, #65676b)',
                            fontSize: '16px',
                            lineHeight: 1,
                            flexShrink: 0
                          }}
                          title="Eliminar comentario"
                        >
                          ×
                        </button>
                      )}
                    </div>

                    {/* Tiempo y acciones */}
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      fontSize: '12px',
                      color: 'var(--text-secondary, #65676b)',
                      fontWeight: 500,
                      marginBottom: '8px'
                    }}>
                      <span>{formatTimeAgo(com.createdAt)}</span>
                      {likesCount > 0 && (
                        <span style={{ fontWeight: 600 }}>
                          {likesCount} Me gusta
                        </span>
                      )}
                      {user && (
                        <button 
                          onClick={() => setRespondiendo(respondiendo === com.id ? null : com.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            color: 'var(--text-secondary, #65676b)',
                            fontWeight: 600,
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Responder
                        </button>
                      )}
                    </div>

                    {/* Formulario de respuesta */}
                    {respondiendo === com.id && user && (
                      <form 
                        onSubmit={(e) => handleResponder(e, com.id, com.autorUid)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '8px',
                          marginBottom: '12px'
                        }}
                      >
                        <input
                          type="text"
                          placeholder={`Responder a ${com.autorNombre}...`}
                          value={textoRespuesta}
                          onChange={e => setTextoRespuesta(e.target.value)}
                          disabled={loading}
                          maxLength={150}
                          autoFocus
                          style={{
                            flex: 1,
                            border: '1px solid var(--border-color, #e4e6eb)',
                            borderRadius: '20px',
                            outline: 'none',
                            background: 'var(--card-bg, #fff)',
                            fontSize: '13px',
                            color: 'var(--text-primary, #050505)',
                            padding: '6px 12px',
                            fontFamily: 'inherit'
                          }}
                        />
                        {textoRespuesta.trim() && (
                          <button
                            type="submit"
                            disabled={loading}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#0095f6',
                              fontWeight: 600,
                              fontSize: '13px',
                              cursor: loading ? 'wait' : 'pointer',
                              padding: '0',
                              opacity: loading ? 0.5 : 1
                            }}
                          >
                            Publicar
                          </button>
                        )}
                      </form>
                    )}

                    {/* Respuestas anidadas */}
                    {respuestas.length > 0 && (
                      <div style={{ marginTop: '12px' }}>
                        {respuestas.map(resp => {
                          const respLikesCount = likesComentarios[resp.id]?.length || 0;
                          const respHasLiked = user && likesComentarios[resp.id]?.includes(user.uid);
                          const respPuedeEliminar = user && (user.uid === resp.autorUid);
                          
                          return (
                            <div 
                              key={resp.id}
                              style={{ 
                                display: 'flex',
                                gap: '12px',
                                marginBottom: '12px',
                                alignItems: 'flex-start'
                              }}
                            >
                              {/* Avatar respuesta */}
                              <div style={{
                                width: '24px',
                                height: '24px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '11px',
                                flexShrink: 0
                              }}>
                                {resp.autorNombre?.charAt(0)?.toUpperCase() || 'U'}
                              </div>

                              {/* Contenido respuesta */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ 
                                  fontSize: '13px',
                                  lineHeight: '16px',
                                  marginBottom: '6px',
                                  display: 'flex',
                                  alignItems: 'flex-start',
                                  gap: '6px'
                                }}>
                                  <div style={{ flex: 1 }}>
                                    <span style={{ 
                                      fontWeight: 600,
                                      color: 'var(--text-primary, #050505)',
                                      marginRight: '6px'
                                    }}>
                                      {resp.autorNombre}
                                    </span>
                                    <span style={{ 
                                      color: 'var(--text-primary, #050505)',
                                      wordBreak: 'break-word'
                                    }}>
                                      {resp.texto}
                                    </span>
                                  </div>
                                  {respPuedeEliminar && (
                                    <button
                                      onClick={() => handleEliminarComentario(resp.id, resp.autorUid)}
                                      style={{
                                        background: 'none',
                                        border: 'none',
                                        padding: '2px 4px',
                                        cursor: 'pointer',
                                        color: 'var(--text-secondary, #65676b)',
                                        fontSize: '14px',
                                        lineHeight: 1,
                                        flexShrink: 0
                                      }}
                                      title="Eliminar respuesta"
                                    >
                                      ×
                                    </button>
                                  )}
                                </div>

                                <div style={{
                                  display: 'flex',
                                  gap: '12px',
                                  fontSize: '11px',
                                  color: 'var(--text-secondary, #65676b)',
                                  fontWeight: 500
                                }}>
                                  <span>{formatTimeAgo(resp.createdAt)}</span>
                                  {respLikesCount > 0 && (
                                    <span style={{ fontWeight: 600 }}>
                                      {respLikesCount} Me gusta
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Like respuesta */}
                              {user && (
                                <button 
                                  onClick={() => handleLikeComentario(resp.id)}
                                  style={{
                                    background: 'none',
                                    border: 'none',
                                    padding: '4px',
                                    cursor: 'pointer',
                                    flexShrink: 0
                                  }}
                                >
                                  <svg 
                                    width="10" 
                                    height="10" 
                                    viewBox="0 0 24 24" 
                                    fill={respHasLiked ? '#ed4956' : 'none'}
                                    stroke={respHasLiked ? '#ed4956' : 'var(--text-secondary, #65676b)'}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                  </svg>
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Icono de corazón comentario principal */}
                  {user && (
                    <button 
                      onClick={() => handleLikeComentario(com.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        flexShrink: 0
                      }}
                    >
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill={hasLiked ? '#ed4956' : 'none'}
                        stroke={hasLiked ? '#ed4956' : 'var(--text-secondary, #65676b)'}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Input de comentario */}
      {user && (
        <form 
          onSubmit={handleComentar}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            borderTop: comentarios.length > 0 ? '1px solid var(--border-color, #e4e6eb)' : 'none',
            paddingTop: comentarios.length > 0 ? '12px' : '0'
          }}
        >
          <input
            type="text"
            placeholder="Añade un comentario..."
            value={nuevoComentario}
            onChange={e => setNuevoComentario(e.target.value)}
            disabled={loading}
            maxLength={150}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '14px',
              color: 'var(--text-primary, #050505)',
              padding: '8px 0',
              fontFamily: 'inherit'
            }}
          />
          {nuevoComentario.trim() && (
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'none',
                border: 'none',
                color: '#0095f6',
                fontWeight: 600,
                fontSize: '14px',
                cursor: loading ? 'wait' : 'pointer',
                padding: '0',
                opacity: loading ? 0.5 : 1
              }}
            >
              Publicar
            </button>
          )}
        </form>
      )}
    </div>
  );
};

export default ComentariosPublicacion;
