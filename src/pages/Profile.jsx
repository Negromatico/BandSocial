import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { Container, Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { uploadToCloudinary } from '../services/cloudinary';
import Select from 'react-select';
import { instrumentos } from '../data/opciones';
import { useToast } from '../components/Toast';
import ImageCropModal from '../components/ImageCropModal';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(auth.currentUser);
  const [initialValues, setInitialValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showFotoModal, setShowFotoModal] = useState(false);
  const [editDraft, setEditDraft] = useState({});
  const [editStatus, setEditStatus] = useState('');
  const [stats, setStats] = useState({ publicaciones: 0, eventos: 0 });
  const [activeTab, setActiveTab] = useState('publicaciones');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [postImagePreview, setPostImagePreview] = useState('');
  const [postLoading, setPostLoading] = useState(false);
  const [postStatus, setPostStatus] = useState('');
  const [userPublicaciones, setUserPublicaciones] = useState([]);
  const [loadingPublicaciones, setLoadingPublicaciones] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [editPostContent, setEditPostContent] = useState('');
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageFile, setCropImageFile] = useState(null);
  const [cropImageType, setCropImageType] = useState(''); // 'banner' o 'perfil'
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => {
      setUser(u);
      if (!u) setShowAuthModal(true);
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchUserPublicaciones();
    }
  }, [user]);

  useEffect(() => {
    if (showEditModal) {
      setEditDraft({
        nombre: initialValues?.nombre || '',
        ciudad: initialValues?.ciudad || '',
        bio: initialValues?.bio || '',
        generos: Array.isArray(initialValues?.generos) ? initialValues.generos : [],
        instrumentos: Array.isArray(initialValues?.instrumentos) ? initialValues.instrumentos : [],
        miembros: initialValues?.miembros || '',
        spotify: initialValues?.spotify || '',
        youtube: initialValues?.youtube || '',
        instagram: initialValues?.instagram || '',
      });
      setEditStatus('');
    }
  }, [showEditModal, initialValues]);

  const fetchProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const docSnap = await getDoc(doc(db, 'perfiles', user.uid));
      if (docSnap.exists()) {
        setInitialValues(docSnap.data());
      }
    } catch (err) {
      console.error('Error cargando perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;
    try {
      // Contar publicaciones
      const pubQuery = query(collection(db, 'publicaciones'), where('autorUid', '==', user.uid));
      const pubSnap = await getDocs(pubQuery);
      
      // Contar eventos
      const eventQuery = query(collection(db, 'eventos'), where('creadorUid', '==', user.uid));
      const eventSnap = await getDocs(eventQuery);
      
      setStats({
        publicaciones: pubSnap.size,
        eventos: eventSnap.size
      });
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setEditStatus('Actualizando...');
    
    if (!editDraft.nombre?.trim()) {
      setEditStatus('El nombre no puede estar vacío.');
      return;
    }
    
    try {
      const dataToSave = {
        ...initialValues,
        nombre: editDraft.nombre.trim(),
        ciudad: editDraft.ciudad,
        bio: editDraft.bio?.trim() || '',
        generos: Array.isArray(editDraft.generos) ? editDraft.generos : [],
        instrumentos: Array.isArray(editDraft.instrumentos) ? editDraft.instrumentos : [],
        miembros: editDraft.miembros || '',
        spotify: editDraft.spotify || '',
        youtube: editDraft.youtube || '',
        instagram: editDraft.instagram || '',
        uid: user.uid,
        email: user.email,
        updatedAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'perfiles', user.uid), dataToSave);
      setInitialValues(dataToSave);
      setShowEditModal(false);
      setEditStatus('');
    } catch (err) {
      setEditStatus('Error actualizando perfil: ' + err.message);
    }
  };

  const handleChangeBanner = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCropImageFile(file);
    setCropImageType('banner');
    setShowCropModal(true);
  };

  const handleChangeFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCropImageFile(file);
    setCropImageType('perfil');
    setShowCropModal(true);
  };

  const handleCropComplete = async (croppedFile) => {
    try {
      if (cropImageType === 'banner') {
        const url = await uploadToCloudinary(croppedFile, 'Bandas', 'portadas');
        await updateDoc(doc(db, 'perfiles', user.uid), { fotoPortada: url });
        setInitialValues(prev => ({ ...prev, fotoPortada: url }));
        showToast('Banner actualizado exitosamente', 'success');
      } else if (cropImageType === 'perfil') {
        const url = await uploadToCloudinary(croppedFile, 'Bandas', 'perfiles');
        await updateDoc(doc(db, 'perfiles', user.uid), { fotoPerfil: url });
        setInitialValues(prev => ({ ...prev, fotoPerfil: url }));
        showToast('Foto de perfil actualizada exitosamente', 'success');
      }
    } catch (err) {
      console.error('Error subiendo imagen:', err);
      showToast('Error al subir la imagen', 'error');
    }
  };

  const handlePostImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPostImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchUserPublicaciones = async () => {
    if (!user) return;
    setLoadingPublicaciones(true);
    try {
      const q = query(
        collection(db, 'publicaciones'),
        where('autorUid', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const pubs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUserPublicaciones(pubs.filter(p => !p.deleted));
    } catch (error) {
      console.error('Error cargando publicaciones:', error);
    } finally {
      setLoadingPublicaciones(false);
    }
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setEditPostContent(post.descripcion || '');
    setShowEditPost(true);
  };

  const handleUpdatePost = async () => {
    if (!editPostContent.trim() || !editingPost) return;
    
    try {
      await updateDoc(doc(db, 'publicaciones', editingPost.id), {
        descripcion: editPostContent.trim(),
        titulo: editPostContent.split('\n')[0].substring(0, 60)
      });
      
      setShowEditPost(false);
      setEditingPost(null);
      setEditPostContent('');
      await fetchUserPublicaciones();
      showToast('Publicación actualizada exitosamente', 'success');
    } catch (error) {
      console.error('Error actualizando publicación:', error);
      showToast('Error al actualizar la publicación', 'error');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) return;
    
    try {
      await updateDoc(doc(db, 'publicaciones', postId), {
        deleted: true
      });
      await fetchUserPublicaciones();
      await fetchStats();
      showToast('Publicación eliminada exitosamente', 'success');
    } catch (error) {
      console.error('Error eliminando publicación:', error);
      showToast('Error al eliminar la publicación', 'error');
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) {
      setPostStatus('Por favor escribe algo');
      return;
    }
    
    setPostLoading(true);
    setPostStatus('');
    
    try {
      let imageUrl = '';
      if (postImage) {
        imageUrl = await uploadToCloudinary(postImage, 'Bandas', 'publicaciones');
      }

      const newPost = {
        titulo: postContent.split('\n')[0].substring(0, 60),
        descripcion: postContent,
        autorUid: user.uid,
        autorNombre: initialValues?.nombre || user.displayName || user.email,
        createdAt: serverTimestamp(),
        imagenesUrl: imageUrl ? [imageUrl] : [],
        tipo: 'otro',
        comentarios: 0
      };

      await addDoc(collection(db, 'publicaciones'), newPost);

      // Limpiar y cerrar
      setPostContent('');
      setPostImage(null);
      setPostImagePreview('');
      setShowCreatePost(false);
      setPostStatus('');
      
      // Recargar
      await fetchStats();
      await fetchUserPublicaciones();
      
      showToast('¡Publicación creada exitosamente!', 'success');
    } catch (err) {
      console.error('Error creando publicación:', err);
      setPostStatus('Error al publicar: ' + err.message);
      showToast('Error al crear la publicación', 'error');
    } finally {
      setPostLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f0f2f5' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <ToastContainer />
      
      {/* Modal de autenticación */}
      <Modal show={showAuthModal} centered backdrop="static" keyboard={false} className="auth-modal-profile">
        <Modal.Header style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          border: 'none',
          borderTopLeftRadius: '20px',
          borderTopRightRadius: '20px',
          padding: '1.5rem'
        }}>
          <Modal.Title style={{ fontWeight: 700, fontSize: '1.5rem' }}>
            ¡Únete a BandSocial!
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center" style={{ padding: '2rem' }}>
          <h5 style={{ color: '#333', fontWeight: 600, marginBottom: '1rem' }}>
            Accede a tu perfil musical
          </h5>
          <p style={{ color: '#666', marginBottom: '1.5rem' }}>
            Debes iniciar sesión o registrarte para editar tu perfil y disfrutar de todas las funcionalidades.
          </p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Button 
              variant="outline-primary" 
              size="lg" 
              onClick={() => navigate('/login')}
              style={{
                borderRadius: '10px',
                padding: '0.75rem 2rem',
                fontWeight: 500,
                border: '2px solid #667eea',
                color: '#667eea'
              }}
            >
              Iniciar sesión
            </Button>
            <Button 
              variant="primary" 
              size="lg" 
              onClick={() => navigate('/register')}
              style={{
                borderRadius: '10px',
                padding: '0.75rem 2rem',
                fontWeight: 500,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Registrarse Gratis
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Modal para ver foto */}
      <Modal show={showFotoModal} onHide={() => setShowFotoModal(false)} centered size="lg">
        <Modal.Body className="text-center p-0" style={{ background: '#000' }}>
          {initialValues?.fotoPerfil ? (
            <img src={initialValues.fotoPerfil} alt="avatar" style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', margin: '0 auto' }} />
          ) : (
            <div style={{ fontSize: 80, color: '#fff', padding: '40px' }}>Sin foto</div>
          )}
        </Modal.Body>
      </Modal>

      {/* Modal de edición de perfil */}
      <Modal 
        show={showEditModal} 
        onHide={() => setShowEditModal(false)} 
        centered 
        size="lg"
        className="edit-profile-modal"
      >
        <Modal.Header 
          closeButton 
          style={{ 
            background: '#fff', 
            borderBottom: '1px solid #e4e6eb',
            padding: '16px 20px'
          }}
        >
          <Modal.Title style={{ fontSize: 20, fontWeight: 700, color: '#050505' }}>
            Editar Perfil
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '20px', background: '#fff', maxHeight: '70vh', overflowY: 'auto' }}>
          <Form onSubmit={handleSaveEdit}>
            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 600, fontSize: 15, color: '#050505', marginBottom: 8 }}>
                Nombre
              </Form.Label>
              <Form.Control
                type="text"
                value={editDraft.nombre || ''}
                onChange={(e) => setEditDraft({ ...editDraft, nombre: e.target.value })}
                placeholder="Nombre de la banda o músico"
                style={{ 
                  borderRadius: '8px', 
                  padding: '12px', 
                  fontSize: 15,
                  border: '1px solid #e4e6eb',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1877f2'}
                onBlur={(e) => e.target.style.borderColor = '#e4e6eb'}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 600, fontSize: 15, color: '#050505', marginBottom: 8 }}>
                Ciudad
              </Form.Label>
              <Form.Control
                type="text"
                value={typeof editDraft.ciudad === 'object' ? editDraft.ciudad?.label : editDraft.ciudad || ''}
                onChange={(e) => setEditDraft({ ...editDraft, ciudad: e.target.value })}
                placeholder="Ej: Medellín, Bogotá, Cali..."
                style={{ 
                  borderRadius: '8px', 
                  padding: '12px', 
                  fontSize: 15,
                  border: '1px solid #e4e6eb',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1877f2'}
                onBlur={(e) => e.target.style.borderColor = '#e4e6eb'}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 600, fontSize: 15, color: '#050505', marginBottom: 8 }}>
                Biografía
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                value={editDraft.bio || ''}
                onChange={(e) => setEditDraft({ ...editDraft, bio: e.target.value })}
                placeholder="Cuéntanos sobre ti o tu banda..."
                style={{ 
                  borderRadius: '8px', 
                  padding: '12px', 
                  fontSize: 15,
                  border: '1px solid #e4e6eb',
                  transition: 'border-color 0.2s',
                  resize: 'vertical'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1877f2'}
                onBlur={(e) => e.target.style.borderColor = '#e4e6eb'}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 600, fontSize: 15, color: '#050505', marginBottom: 8 }}>
                Géneros Musicales
              </Form.Label>
              <Select
                isMulti
                value={(editDraft.generos || []).map(g => {
                  // Si g ya es un objeto, retornarlo; si es string, convertirlo
                  if (typeof g === 'object' && g.value && g.label) {
                    return g;
                  }
                  return { value: g, label: g };
                })}
                onChange={(selected) => setEditDraft({ ...editDraft, generos: (selected || []).map(s => s.value) })}
                options={[
                  { value: 'Rock', label: 'Rock' },
                  { value: 'Pop', label: 'Pop' },
                  { value: 'Jazz', label: 'Jazz' },
                  { value: 'Blues', label: 'Blues' },
                  { value: 'Metal', label: 'Metal' },
                  { value: 'Punk', label: 'Punk' },
                  { value: 'Indie', label: 'Indie' },
                  { value: 'Alternativo', label: 'Alternativo' },
                  { value: 'Electrónica', label: 'Electrónica' },
                  { value: 'Reggae', label: 'Reggae' },
                ]}
                placeholder="Selecciona géneros..."
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 600, fontSize: 15, color: '#050505', marginBottom: 8 }}>
                Instrumentos
              </Form.Label>
              <Select
                isMulti
                value={(editDraft.instrumentos || []).map(i => {
                  // Si i ya es un objeto, retornarlo; si es string, buscar en opciones
                  if (typeof i === 'object' && i.value && i.label) {
                    return i;
                  }
                  // Buscar el instrumento en las opciones
                  const found = instrumentos.find(inst => inst.value === i || inst.label === i);
                  return found || { value: i, label: i };
                })}
                onChange={(selected) => setEditDraft({ ...editDraft, instrumentos: (selected || []).map(s => s.value) })}
                options={instrumentos}
                placeholder="Selecciona instrumentos..."
              />
            </Form.Group>

            {initialValues?.type === 'banda' && (
              <Form.Group className="mb-4">
                <Form.Label style={{ fontWeight: 600, fontSize: 15, color: '#050505', marginBottom: 8 }}>
                  Número de Miembros
                </Form.Label>
                <Form.Control
                  type="text"
                  value={editDraft.miembros || ''}
                  onChange={(e) => setEditDraft({ ...editDraft, miembros: e.target.value })}
                  placeholder="Ej: 4"
                  style={{ 
                    borderRadius: '8px', 
                    padding: '12px', 
                    fontSize: 15,
                    border: '1px solid #e4e6eb',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1877f2'}
                  onBlur={(e) => e.target.style.borderColor = '#e4e6eb'}
                />
              </Form.Group>
            )}

            {/* Separador visual */}
            <div style={{ 
              borderTop: '1px solid #e4e6eb', 
              margin: '24px 0',
              paddingTop: 24
            }}>
              <h5 style={{ 
                fontWeight: 700, 
                fontSize: 17, 
                marginBottom: 16, 
                color: '#050505',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                🌐 Redes Sociales
              </h5>
            </div>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 600, fontSize: 15, color: '#050505', marginBottom: 8 }}>
                🎵 Spotify
              </Form.Label>
              <Form.Control
                type="url"
                value={editDraft.spotify || ''}
                onChange={(e) => setEditDraft({ ...editDraft, spotify: e.target.value })}
                placeholder="https://open.spotify.com/artist/..."
                style={{ 
                  borderRadius: '8px', 
                  padding: '12px', 
                  fontSize: 15,
                  border: '1px solid #e4e6eb',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#1DB954'}
                onBlur={(e) => e.target.style.borderColor = '#e4e6eb'}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 600, fontSize: 15, color: '#050505', marginBottom: 8 }}>
                📺 YouTube
              </Form.Label>
              <Form.Control
                type="url"
                value={editDraft.youtube || ''}
                onChange={(e) => setEditDraft({ ...editDraft, youtube: e.target.value })}
                placeholder="https://youtube.com/@..."
                style={{ 
                  borderRadius: '8px', 
                  padding: '12px', 
                  fontSize: 15,
                  border: '1px solid #e4e6eb',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF0000'}
                onBlur={(e) => e.target.style.borderColor = '#e4e6eb'}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label style={{ fontWeight: 600, fontSize: 15, color: '#050505', marginBottom: 8 }}>
                📸 Instagram
              </Form.Label>
              <Form.Control
                type="url"
                value={editDraft.instagram || ''}
                onChange={(e) => setEditDraft({ ...editDraft, instagram: e.target.value })}
                placeholder="https://instagram.com/..."
                style={{ 
                  borderRadius: '8px', 
                  padding: '12px', 
                  fontSize: 15,
                  border: '1px solid #e4e6eb',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#E1306C'}
                onBlur={(e) => e.target.style.borderColor = '#e4e6eb'}
              />
            </Form.Group>

            {editStatus && (
              <div 
                className={`alert ${editStatus.includes('Error') ? 'alert-danger' : 'alert-info'} mb-4`} 
                style={{ fontSize: 14, borderRadius: '8px' }}
              >
                {editStatus}
              </div>
            )}

            {/* Separador antes de botones */}
            <div style={{ borderTop: '1px solid #e4e6eb', margin: '20px -20px 20px -20px' }}></div>

            <div className="d-flex gap-3 justify-content-end" style={{ padding: '0 0 0 0' }}>
              <Button 
                variant="light" 
                onClick={() => setShowEditModal(false)}
                style={{ 
                  borderRadius: '8px', 
                  padding: '10px 24px', 
                  fontWeight: 600,
                  background: '#e4e6eb',
                  border: 'none',
                  color: '#050505',
                  fontSize: 15,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#d8dadf'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#e4e6eb'}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                style={{ 
                  borderRadius: '8px', 
                  padding: '10px 24px', 
                  fontWeight: 600,
                  background: '#1877f2',
                  border: 'none',
                  fontSize: 15,
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#166fe5'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#1877f2'}
              >
                Guardar Cambios
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de crear publicación */}
      <Modal 
        show={showCreatePost} 
        onHide={() => {
          setShowCreatePost(false);
          setPostContent('');
          setPostImage(null);
          setPostImagePreview('');
          setPostStatus('');
        }} 
        centered 
        size="lg"
        className="create-post-modal"
      >
        <Modal.Header 
          closeButton 
          style={{ 
            background: '#fff', 
            borderBottom: '1px solid #e4e6eb',
            padding: '16px 20px'
          }}
        >
          <Modal.Title style={{ fontSize: 20, fontWeight: 700, color: '#050505' }}>
            Crear Publicación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '0', background: '#fff' }}>
          {/* Información del usuario */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #e4e6eb' }}>
            <div className="d-flex align-items-center gap-3">
              <div style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: initialValues?.fotoPerfil ? 'transparent' : '#1877f2',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                overflow: 'hidden'
              }}>
                {initialValues?.fotoPerfil ? (
                  <img 
                    src={initialValues.fotoPerfil} 
                    alt="Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>
                    {initialValues?.nombre?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#050505', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {initialValues?.nombre || 'Usuario'}
                  {(initialValues?.planActual === 'premium' || initialValues?.membershipPlan === 'premium') && (
                    <span style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                      color: '#000',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      fontSize: '10px',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      letterSpacing: '0.3px'
                    }}>
                      PRO
                    </span>
                  )}
                </div>
                <div style={{ 
                  fontSize: 12, 
                  color: '#65676b',
                  background: '#e4e6eb',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginTop: 2
                }}>
                  🌍 Público
                </div>
              </div>
            </div>
          </div>

          {/* Área de contenido */}
          <div style={{ padding: '16px 20px' }}>
            <Form.Control
              as="textarea"
              rows={5}
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="¿Qué estás pensando?"
              style={{ 
                border: 'none', 
                fontSize: 24, 
                resize: 'none',
                outline: 'none',
                boxShadow: 'none',
                padding: 0,
                color: '#050505'
              }}
              autoFocus
            />
          </div>

          {/* Preview de imagen */}
          {postImagePreview && (
            <div style={{ padding: '0 20px 16px 20px' }}>
              <div style={{ 
                position: 'relative', 
                border: '1px solid #e4e6eb',
                borderRadius: '8px',
                overflow: 'hidden'
              }}>
                <img 
                  src={postImagePreview} 
                  alt="Preview" 
                  style={{ width: '100%', display: 'block' }}
                />
                <Button
                  variant="light"
                  size="sm"
                  onClick={() => {
                    setPostImage(null);
                    setPostImagePreview('');
                  }}
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    borderRadius: '50%',
                    width: 36,
                    height: 36,
                    padding: 0,
                    background: 'rgba(255,255,255,0.95)',
                    border: 'none',
                    fontSize: 18,
                    fontWeight: 600,
                    color: '#65676b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          {/* Agregar a tu publicación */}
          <div style={{ padding: '0 20px 16px 20px' }}>
            <div style={{ 
              border: '1px solid #e4e6eb', 
              borderRadius: '8px', 
              padding: '10px 16px'
            }}>
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ fontSize: 15, fontWeight: 600, color: '#050505' }}>
                  Agregar a tu publicación
                </span>
                <div className="d-flex gap-1">
                  <input
                    type="file"
                    id="post-image-input"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handlePostImageChange}
                  />
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => document.getElementById('post-image-input').click()}
                    style={{ 
                      borderRadius: '50%', 
                      width: 36, 
                      height: 36, 
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      fontSize: 20,
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📷
                  </Button>
                  <Button
                    variant="light"
                    size="sm"
                    onClick={() => {
                      setShowCreatePost(false);
                      navigate('/eventos');
                    }}
                    style={{ 
                      borderRadius: '50%', 
                      width: 36, 
                      height: 36, 
                      padding: 0,
                      border: 'none',
                      background: 'transparent',
                      fontSize: 20,
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    📅
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Mensaje de estado */}
          {postStatus && (
            <div style={{ padding: '0 20px 16px 20px' }}>
              <div className={`alert ${postStatus.includes('Error') ? 'alert-danger' : 'alert-info'} mb-0`} style={{ fontSize: 14 }}>
                {postStatus}
              </div>
            </div>
          )}

          {/* Botón publicar */}
          <div style={{ padding: '0 20px 16px 20px' }}>
            <Button
              variant="primary"
              onClick={handleCreatePost}
              disabled={postLoading || (!postContent.trim() && !postImage)}
              style={{
                width: '100%',
                borderRadius: '8px',
                padding: '10px',
                fontWeight: 600,
                fontSize: 15,
                background: postLoading || (!postContent.trim() && !postImage) ? '#e4e6eb' : '#1877f2',
                border: 'none',
                color: postLoading || (!postContent.trim() && !postImage) ? '#bcc0c4' : '#fff',
                cursor: postLoading || (!postContent.trim() && !postImage) ? 'not-allowed' : 'pointer'
              }}
            >
              {postLoading ? (
                <span>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Publicando...
                </span>
              ) : (
                'Publicar'
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {user && (
        <Container fluid className="p-0" style={{ maxWidth: '100%', margin: '0 auto', marginTop: 0, background: '#f0f2f5', minHeight: '100vh' }}>
          {/* Banner/Portada */}
          <div style={{ position: 'relative', width: '100%', height: 350, background: '#000', overflow: 'hidden' }}>
            {initialValues?.fotoPortada && (
              <img 
                src={initialValues.fotoPortada} 
                alt="Portada" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
            {/* Degradado inferior para integración suave */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '120px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.3) 40%, rgba(255,255,255,0.8) 80%, rgba(255,255,255,1) 100%)',
              pointerEvents: 'none',
              zIndex: 1
            }} />
            <input
              type="file"
              id="input-portada"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleChangeBanner}
            />
            <Button
              size="sm"
              variant="light"
              style={{ 
                position: 'absolute', 
                bottom: 20, 
                right: 20, 
                zIndex: 2, 
                fontWeight: 600, 
                borderRadius: '6px',
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.9)',
                border: 'none',
                fontSize: '15px'
              }}
              onClick={() => document.getElementById('input-portada').click()}
            >
              Cambiar Banner
            </Button>
          </div>
          
          {/* Contenedor blanco centrado */}
          <div style={{ maxWidth: '940px', margin: '0 auto', background: '#fff', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            {/* Sección de información del perfil */}
            <div style={{ padding: '20px 20px 0 20px', position: 'relative' }}>
              <div className="d-flex align-items-end justify-content-between" style={{ marginBottom: '16px' }}>
                <div className="d-flex align-items-end gap-3">
                  {/* Avatar con badge */}
                  <div style={{ position: 'relative', marginTop: '-50px' }}>
                    <input
                      type="file"
                      id="input-foto"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={handleChangeFoto}
                    />
                    <div
                      style={{
                        width: 168,
                        height: 168,
                        borderRadius: '50%',
                        border: '4px solid #fff',
                        background: '#1877f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        cursor: 'pointer'
                      }}
                      onClick={() => document.getElementById('input-foto').click()}
                    >
                      {initialValues?.fotoPerfil ? (
                        <img
                          src={initialValues.fotoPerfil}
                          alt="Avatar"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ fontSize: 64, color: '#fff', fontWeight: 700 }}>
                          {initialValues?.nombre?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    {/* Badge azul */}
                    <div style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: '#1877f2',
                      border: '3px solid #fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: '18px',
                      fontWeight: 700
                    }}>
                      ✓
                    </div>
                  </div>
                  
                  {/* Nombre y descripción */}
                  <div style={{ paddingBottom: '8px' }}>
                    <h1 style={{ fontSize: 32, fontWeight: 700, color: '#050505', marginBottom: 4, lineHeight: 1.2, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {initialValues?.nombre || 'Mi perfil'}
                      {(initialValues?.planActual === 'premium' || initialValues?.membershipPlan === 'premium') && (
                        <span style={{
                          background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                          color: '#000',
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '14px',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)',
                          letterSpacing: '0.5px'
                        }}>
                          PREMIUM
                        </span>
                      )}
                    </h1>
                    <p style={{ fontSize: 15, color: '#65676b', marginBottom: 4 }}>
                      {initialValues?.type === 'banda' ? 'Banda de Rock Alternativo' : 'Músico Profesional'}
                    </p>
                    <p style={{ fontSize: 13, color: '#65676b', marginBottom: 0 }}>
                      {typeof initialValues?.ciudad === 'object' ? initialValues?.ciudad?.label : initialValues?.ciudad || 'Los Angeles, CA'} • Miembro desde 2023
                    </p>
                  </div>
                </div>
                
                {/* Botones de acción */}
                <div className="d-flex gap-2" style={{ paddingBottom: '8px' }}>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowEditModal(true)}
                    style={{
                      borderRadius: '6px',
                      padding: '8px 16px',
                      fontWeight: 600,
                      background: '#1877f2',
                      border: 'none',
                      fontSize: '15px'
                    }}
                  >
                    Editar Perfil
                  </Button>
                  <Button 
                    variant="light"
                    style={{
                      borderRadius: '6px',
                      padding: '8px 12px',
                      fontWeight: 600,
                      background: '#e4e6eb',
                      border: 'none',
                      color: '#050505',
                      fontSize: '15px'
                    }}
                  >
                    ⋯
                  </Button>
                </div>
              </div>
              
              {/* Línea divisoria */}
              <div style={{ borderTop: '1px solid #e4e6eb', margin: '16px 0' }}></div>
              
              {/* Estadísticas */}
              <div className="d-flex gap-5" style={{ padding: '0 0 16px 0' }}>
                <div 
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => navigate('/followers')}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1877f2' }}>
                    {(initialValues?.seguidores || []).length}
                  </div>
                  <div style={{ fontSize: 12, color: '#65676b' }}>Seguidores</div>
                </div>
                <div 
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => navigate('/followers')}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1877f2' }}>
                    {(initialValues?.siguiendo || []).length}
                  </div>
                  <div style={{ fontSize: 12, color: '#65676b' }}>Siguiendo</div>
                </div>
                <div 
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => navigate('/eventos')}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1877f2' }}>
                    {stats.eventos}
                  </div>
                  <div style={{ fontSize: 12, color: '#65676b' }}>Eventos</div>
                </div>
                <div 
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => navigate('/mis-publicaciones')}
                >
                  <div style={{ fontSize: 20, fontWeight: 700, color: '#1877f2' }}>
                    {stats.publicaciones}
                  </div>
                  <div style={{ fontSize: 12, color: '#65676b' }}>Publicaciones</div>
                </div>
              </div>
              
              {/* Línea divisoria */}
              <div style={{ borderTop: '1px solid #e4e6eb' }}></div>
              
              {/* Tabs de navegación */}
              <div className="d-flex gap-3" style={{ padding: '0' }}>
                <button 
                  onClick={() => setActiveTab('publicaciones')}
                  style={{ 
                    padding: '12px 16px', 
                    border: 'none', 
                    background: 'none', 
                    borderBottom: activeTab === 'publicaciones' ? '3px solid #1877f2' : '3px solid transparent',
                    color: activeTab === 'publicaciones' ? '#1877f2' : '#65676b',
                    fontWeight: activeTab === 'publicaciones' ? 600 : 500,
                    cursor: 'pointer',
                    fontSize: '15px',
                    transition: 'all 0.2s'
                  }}
                >
                  Publicaciones
                </button>
                <button 
                  onClick={() => setActiveTab('acerca')}
                  style={{ 
                    padding: '12px 16px', 
                    border: 'none', 
                    background: 'none', 
                    borderBottom: activeTab === 'acerca' ? '3px solid #1877f2' : '3px solid transparent',
                    color: activeTab === 'acerca' ? '#1877f2' : '#65676b',
                    fontWeight: activeTab === 'acerca' ? 600 : 500,
                    cursor: 'pointer',
                    fontSize: '15px',
                    transition: 'all 0.2s'
                  }}
                >
                  Acerca de
                </button>
                <button 
                  onClick={() => setActiveTab('galeria')}
                  style={{ 
                    padding: '12px 16px', 
                    border: 'none', 
                    background: 'none', 
                    borderBottom: activeTab === 'galeria' ? '3px solid #1877f2' : '3px solid transparent',
                    color: activeTab === 'galeria' ? '#1877f2' : '#65676b',
                    fontWeight: activeTab === 'galeria' ? 600 : 500,
                    cursor: 'pointer',
                    fontSize: '15px',
                    transition: 'all 0.2s'
                  }}
                >
                  Galería
                </button>
                <button 
                  onClick={() => navigate('/eventos')}
                  style={{ 
                    padding: '12px 16px', 
                    border: 'none', 
                    background: 'none', 
                    borderBottom: '3px solid transparent',
                    color: '#65676b',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '15px',
                    transition: 'all 0.2s'
                  }}
                >
                  Eventos
                </button>
                <button 
                  onClick={() => setActiveTab('musica')}
                  style={{ 
                    padding: '12px 16px', 
                    border: 'none', 
                    background: 'none', 
                    borderBottom: activeTab === 'musica' ? '3px solid #1877f2' : '3px solid transparent',
                    color: activeTab === 'musica' ? '#1877f2' : '#65676b',
                    fontWeight: activeTab === 'musica' ? 600 : 500,
                    cursor: 'pointer',
                    fontSize: '15px',
                    transition: 'all 0.2s'
                  }}
                >
                  Música
                </button>
              </div>
            </div>
            
            {/* Contenido con sidebar y feed */}
            <div className="d-flex gap-3" style={{ padding: '16px', background: '#f0f2f5' }}>
              {/* Sidebar izquierdo */}
              <div style={{ width: '360px', flexShrink: 0 }}>
                {/* Acerca de */}
                <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Acerca de</h3>
                  <p style={{ fontSize: 15, color: '#050505', marginBottom: 12 }}>
                    {initialValues?.bio || 'Agrega una biografía para que otros conozcan más sobre ti.'}
                  </p>
                  {initialValues?.miembros && (
                    <div style={{ fontSize: 15, color: '#65676b', marginBottom: 8 }}>
                      <strong>{initialValues.miembros} Miembros</strong>
                    </div>
                  )}
                  {initialValues?.generos && initialValues.generos.length > 0 && (
                    <div style={{ fontSize: 15, color: '#65676b', marginBottom: 8 }}>
                      <strong>Géneros:</strong> {initialValues.generos.join(', ')}
                    </div>
                  )}
                  {initialValues?.instrumentos && initialValues.instrumentos.length > 0 && (
                    <div style={{ fontSize: 15, color: '#65676b', marginBottom: 8 }}>
                      <strong>Instrumentos:</strong> {initialValues.instrumentos.join(', ')}
                    </div>
                  )}
                </div>
                
                {/* Redes Sociales */}
                <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Redes Sociales</h3>
                  {initialValues?.spotify && (
                    <div 
                      onClick={() => window.open(initialValues.spotify, '_blank')}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1DB954', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>S</div>
                      <span style={{ fontSize: 15 }}>Spotify</span>
                    </div>
                  )}
                  {initialValues?.youtube && (
                    <div 
                      onClick={() => window.open(initialValues.youtube, '_blank')}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12, cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF0000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>Y</div>
                      <span style={{ fontSize: 15 }}>YouTube</span>
                    </div>
                  )}
                  {initialValues?.instagram && (
                    <div 
                      onClick={() => window.open(initialValues.instagram, '_blank')}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#E1306C', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>I</div>
                      <span style={{ fontSize: 15 }}>Instagram</span>
                    </div>
                  )}
                  {!initialValues?.spotify && !initialValues?.youtube && !initialValues?.instagram && (
                    <p style={{ fontSize: 14, color: '#65676b', textAlign: 'center', padding: '20px 0' }}>
                      Agrega tus redes sociales en Editar Perfil
                    </p>
                  )}
                </div>
                
                {/* Próximos Eventos */}
                <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>Próximos Eventos</h3>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 48, height: 48, background: '#1877f2', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>MAR</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>15</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>Rock Fest 2024</div>
                        <div style={{ fontSize: 13, color: '#65676b' }}>The Roxy Theatre</div>
                        <div style={{ fontSize: 13, color: '#65676b' }}>8:00 PM</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 48, height: 48, background: '#1877f2', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                        <div style={{ fontSize: 10, fontWeight: 600 }}>ABR</div>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>22</div>
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>Indie Night Live</div>
                        <div style={{ fontSize: 13, color: '#65676b' }}>TRO Outdoor</div>
                        <div style={{ fontSize: 13, color: '#65676b' }}>9:00 PM</div>
                      </div>
                    </div>
                  </div>
                  <div 
                    onClick={() => navigate('/eventos')}
                    style={{ fontSize: 15, color: '#1877f2', cursor: 'pointer', fontWeight: 600, transition: 'opacity 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '0.7'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                  >
                    Ver todos los eventos →
                  </div>
                </div>
              </div>
              
              {/* Feed central */}
              <div style={{ flex: 1 }}>
                {/* Crear publicación */}
                <div style={{ background: '#fff', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
                      {initialValues?.nombre?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <input 
                      type="text" 
                      placeholder="¿Qué estás pensando?"
                      onClick={() => setShowCreatePost(true)}
                      readOnly
                      style={{ 
                        flex: 1, 
                        border: 'none', 
                        background: '#f0f2f5', 
                        borderRadius: '20px', 
                        padding: '8px 16px',
                        fontSize: 15,
                        cursor: 'pointer'
                      }}
                    />
                  </div>
                  <div style={{ borderTop: '1px solid #e4e6eb', paddingTop: 8 }}>
                    <div className="d-flex justify-content-around">
                      <button 
                        onClick={() => {
                          setShowCreatePost(true);
                          setTimeout(() => document.getElementById('post-image-input')?.click(), 100);
                        }}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          color: '#65676b', 
                          fontSize: 15, 
                          fontWeight: 500, 
                          cursor: 'pointer', 
                          padding: '8px 12px',
                          transition: 'background 0.2s',
                          borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        📷 Foto
                      </button>
                      <button 
                        onClick={() => setShowCreatePost(true)}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          color: '#65676b', 
                          fontSize: 15, 
                          fontWeight: 500, 
                          cursor: 'pointer', 
                          padding: '8px 12px',
                          transition: 'background 0.2s',
                          borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        🎥 Video
                      </button>
                      <button 
                        onClick={() => navigate('/eventos')}
                        style={{ 
                          border: 'none', 
                          background: 'none', 
                          color: '#65676b', 
                          fontSize: 15, 
                          fontWeight: 500, 
                          cursor: 'pointer', 
                          padding: '8px 12px',
                          transition: 'background 0.2s',
                          borderRadius: '6px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f5'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                      >
                        📅 Evento
                      </button>
                      <Button 
                        variant="primary"
                        onClick={() => setShowCreatePost(true)}
                        style={{ background: '#1877f2', border: 'none', borderRadius: '6px', padding: '6px 16px', fontSize: 15, fontWeight: 600 }}
                      >
                        Publicar
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Publicación de ejemplo */}
                <div style={{ background: '#fff', borderRadius: '8px', padding: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.1)', marginBottom: '16px' }}>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#1877f2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700 }}>
                      {initialValues?.nombre?.charAt(0)?.toUpperCase() || 'T'}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 600, color: '#050505' }}>
                        {initialValues?.nombre || 'The Midnight Riders'}
                      </div>
                      <div style={{ fontSize: 13, color: '#65676b' }}>Hace 2 horas</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 15, color: '#050505', marginBottom: 12 }}>
                    Increíble noche en The Roxy! Gracias a todos los que vinieron a apoyarnos. Aquí algunas fotos del show.
                  </p>
                  {initialValues?.fotoPortada && (
                    <img 
                      src={initialValues.fotoPortada} 
                      alt="Publicación" 
                      style={{ width: '100%', borderRadius: '8px', marginBottom: 12 }}
                    />
                  )}
                  <div className="d-flex justify-content-between align-items-center" style={{ paddingTop: 8, borderTop: '1px solid #e4e6eb' }}>
                    <div style={{ fontSize: 13, color: '#65676b' }}>1.2K Me gusta • 85 comentarios • 34 compartidos</div>
                  </div>
                  <div className="d-flex justify-content-around" style={{ paddingTop: 8, borderTop: '1px solid #e4e6eb', marginTop: 8 }}>
                    <button 
                      onClick={() => navigate('/publicaciones')}
                      style={{ 
                        border: 'none', 
                        background: 'none', 
                        color: '#65676b', 
                        fontSize: 15, 
                        fontWeight: 500, 
                        cursor: 'pointer', 
                        padding: '8px 12px', 
                        flex: 1,
                        transition: 'background 0.2s',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      👍 Me gusta
                    </button>
                    <button 
                      onClick={() => navigate('/publicaciones')}
                      style={{ 
                        border: 'none', 
                        background: 'none', 
                        color: '#65676b', 
                        fontSize: 15, 
                        fontWeight: 500, 
                        cursor: 'pointer', 
                        padding: '8px 12px', 
                        flex: 1,
                        transition: 'background 0.2s',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      💬 Comentar
                    </button>
                    <button 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: initialValues?.nombre || 'BandSocial',
                            text: 'Mira mi perfil en BandSocial',
                            url: window.location.href
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.href);
                          alert('Link copiado al portapapeles');
                        }
                      }}
                      style={{ 
                        border: 'none', 
                        background: 'none', 
                        color: '#65676b', 
                        fontSize: 15, 
                        fontWeight: 500, 
                        cursor: 'pointer', 
                        padding: '8px 12px', 
                        flex: 1,
                        transition: 'background 0.2s',
                        borderRadius: '6px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f0f2f5'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                    >
                      🔗 Compartir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      )}

      {/* Modal de edición de imágenes */}
      <ImageCropModal
        show={showCropModal}
        onHide={() => setShowCropModal(false)}
        imageFile={cropImageFile}
        onCropComplete={handleCropComplete}
        aspectRatio={cropImageType === 'banner' ? 16 / 9 : 1}
        title={cropImageType === 'banner' ? 'Editar Banner' : 'Editar Foto de Perfil'}
      />

      <ToastContainer />
    </>
  );
};

export default Profile;
