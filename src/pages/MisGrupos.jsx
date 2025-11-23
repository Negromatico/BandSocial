import React, { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { Button, Modal, Form, Card } from 'react-bootstrap';
import { FaUsers, FaPlus, FaGuitar, FaMusic, FaMapMarkerAlt, FaCrown, FaUserPlus, FaSignOutAlt, FaImage } from 'react-icons/fa';
import { uploadToCloudinary } from '../services/cloudinary';
import '../styles/ModernModal.css';
import './MisGrupos.css';

const MisGrupos = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCrearGrupo, setShowCrearGrupo] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const user = auth.currentUser;

  // Estado del formulario
  const [nuevoGrupo, setNuevoGrupo] = useState({
    nombre: '',
    descripcion: '',
    genero: '',
    ciudad: '',
    imagen: ''
  });

  // Estados para subida de imagen
  const [imagenFile, setImagenFile] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [uploadingImagen, setUploadingImagen] = useState(false);

  const generos = ['Rock', 'Pop', 'Jazz', 'Hip Hop', 'Indie', 'Salsa', 'Reggae', 'Metal', 'Electrónica', 'Otro'];

  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchGrupos();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const docSnap = await getDocs(query(collection(db, 'perfiles'), where('__name__', '==', user.uid)));
      if (!docSnap.empty) {
        setUserProfile(docSnap.docs[0].data());
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    }
  };

  const fetchGrupos = async () => {
    setLoading(true);
    try {
      // Obtener grupos donde el usuario es miembro
      const q = query(
        collection(db, 'grupos'),
        where('miembros', 'array-contains', user.uid)
      );
      const snapshot = await getDocs(q);
      const gruposData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setGrupos(gruposData);
    } catch (error) {
      console.error('Error al cargar grupos:', error);
    } finally {
      setLoading(false);
    }
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

  const handleCrearGrupo = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('Debes iniciar sesión para crear un grupo');
      return;
    }

    try {
      setUploadingImagen(true);

      // Subir imagen a Cloudinary si hay una seleccionada
      let imagenUrl = nuevoGrupo.imagen;
      if (imagenFile) {
        imagenUrl = await uploadToCloudinary(imagenFile, 'bandsocial_grupos', 'grupos');
      }

      const grupoData = {
        ...nuevoGrupo,
        imagen: imagenUrl,
        creadorUid: user.uid,
        creadorNombre: userProfile?.nombre || 'Usuario',
        miembros: [user.uid],
        admin: [user.uid],
        createdAt: serverTimestamp(),
        estado: 'activo'
      };

      await addDoc(collection(db, 'grupos'), grupoData);
      
      alert('¡Grupo creado exitosamente!');
      setShowCrearGrupo(false);
      
      // Resetear formulario
      setNuevoGrupo({
        nombre: '',
        descripcion: '',
        genero: '',
        ciudad: '',
        imagen: ''
      });
      setImagenFile(null);
      setImagenPreview('');

      // Recargar grupos
      fetchGrupos();
    } catch (error) {
      console.error('Error al crear grupo:', error);
      alert('Error al crear el grupo. Intenta de nuevo.');
    } finally {
      setUploadingImagen(false);
    }
  };

  const handleSalirGrupo = async (grupoId) => {
    if (!window.confirm('¿Estás seguro de que quieres salir de este grupo?')) {
      return;
    }

    try {
      const grupoRef = doc(db, 'grupos', grupoId);
      await updateDoc(grupoRef, {
        miembros: arrayRemove(user.uid),
        admin: arrayRemove(user.uid)
      });

      alert('Has salido del grupo');
      fetchGrupos();
    } catch (error) {
      console.error('Error al salir del grupo:', error);
      alert('Error al salir del grupo');
    }
  };

  if (loading) {
    return (
      <div className="grupos-container">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grupos-container">
      {/* Header */}
      <div className="grupos-header">
        <div>
          <h1 className="grupos-title">
            <FaUsers /> Mis Grupos
          </h1>
          <p className="grupos-subtitle">
            Gestiona tus grupos musicales y colabora con otros artistas
          </p>
        </div>
        <Button className="btn-crear-grupo" onClick={() => setShowCrearGrupo(true)}>
          <FaPlus /> Crear Grupo
        </Button>
      </div>

      {/* Lista de Grupos */}
      {grupos.length === 0 ? (
        <div className="empty-state-grupos">
          <FaUsers className="empty-icon" />
          <h3>No tienes grupos aún</h3>
          <p>Crea tu primer grupo musical y empieza a colaborar con otros artistas</p>
          <Button className="btn-crear-grupo" onClick={() => setShowCrearGrupo(true)}>
            <FaPlus /> Crear Mi Primer Grupo
          </Button>
        </div>
      ) : (
        <div className="grupos-grid">
          {grupos.map(grupo => (
            <Card key={grupo.id} className="grupo-card">
              {grupo.imagen && (
                <Card.Img variant="top" src={grupo.imagen} className="grupo-imagen" />
              )}
              <Card.Body>
                <div className="grupo-header-card">
                  <Card.Title className="grupo-nombre">
                    {grupo.nombre}
                    {grupo.admin?.includes(user.uid) && (
                      <FaCrown className="admin-badge" title="Administrador" />
                    )}
                  </Card.Title>
                </div>
                
                <Card.Text className="grupo-descripcion">
                  {grupo.descripcion || 'Sin descripción'}
                </Card.Text>

                <div className="grupo-info">
                  {grupo.genero && (
                    <div className="info-item">
                      <FaMusic /> {grupo.genero}
                    </div>
                  )}
                  {grupo.ciudad && (
                    <div className="info-item">
                      <FaMapMarkerAlt /> {grupo.ciudad}
                    </div>
                  )}
                  <div className="info-item">
                    <FaUsers /> {grupo.miembros?.length || 0} miembros
                  </div>
                </div>

                <div className="grupo-actions">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => window.location.href = `/grupos/${grupo.id}`}
                  >
                    Ver Grupo
                  </Button>
                  {!grupo.admin?.includes(user.uid) && (
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleSalirGrupo(grupo.id)}
                    >
                      <FaSignOutAlt /> Salir
                    </Button>
                  )}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Crear Grupo */}
      <Modal show={showCrearGrupo} onHide={() => setShowCrearGrupo(false)} size="lg" className="modern-modal">
        <Modal.Header closeButton>
          <Modal.Title>Crear Nuevo Grupo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearGrupo}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Grupo *</Form.Label>
              <Form.Control
                type="text"
                placeholder="Ej: Los Rockeros del Valle"
                value={nuevoGrupo.nombre}
                onChange={(e) => setNuevoGrupo({...nuevoGrupo, nombre: e.target.value})}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Describe tu grupo..."
                value={nuevoGrupo.descripcion}
                onChange={(e) => setNuevoGrupo({...nuevoGrupo, descripcion: e.target.value})}
              />
            </Form.Group>

            <div className="row">
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Género Musical</Form.Label>
                  <Form.Select
                    value={nuevoGrupo.genero}
                    onChange={(e) => setNuevoGrupo({...nuevoGrupo, genero: e.target.value})}
                  >
                    <option value="">Selecciona un género</option>
                    {generos.map(genero => (
                      <option key={genero} value={genero}>{genero}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-3">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej: Bogotá"
                    value={nuevoGrupo.ciudad}
                    onChange={(e) => setNuevoGrupo({...nuevoGrupo, ciudad: e.target.value})}
                  />
                </Form.Group>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label>Imagen del Grupo</Form.Label>
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
              <Button variant="secondary" onClick={() => setShowCrearGrupo(false)}>
                Cancelar
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                disabled={uploadingImagen}
              >
                {uploadingImagen ? 'Subiendo imagen...' : 'Crear Grupo'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default MisGrupos;
