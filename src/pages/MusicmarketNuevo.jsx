import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal, Carousel } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaFilter, FaPlus } from 'react-icons/fa';
import { db, auth } from '../services/firebase';
import { collection, getDocs, addDoc, query, orderBy, doc, getDoc, Timestamp, where, updateDoc } from 'firebase/firestore';
import { uploadToCloudinary } from '../services/cloudinary';
import UpgradePremiumModal from '../components/UpgradePremiumModal';
import { useToast } from '../components/Toast';
import { esPremium } from '../utils/premiumCheck';
import Select from 'react-select';
import './Musicmarket.css';

const MusicmarketNuevo = () => {
  const [instrumentos, setInstrumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(auth.currentUser);
  const [showModal, setShowModal] = useState(false);
  const [ordenar, setOrdenar] = useState('recientes');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  const [filtroPrecio, setFiltroPrecio] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroUbicacion, setFiltroUbicacion] = useState('');

  // Form state
  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    ubicacion: '',
    categoria: 'Musica',
    estado: 'Nuevo'
  });
  const [imagenes, setImagenes] = useState([]);
  const [imagenesPreviews, setImagenesPreviews] = useState([]);
  const [creating, setCreating] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  // Estados para valoración
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comentarioResena, setComentarioResena] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);
  
  // API de ciudades
  const [ciudadesOptions, setCiudadesOptions] = useState([]);
  
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    fetchInstrumentos();
    fetchCiudades();
  }, []);

  const fetchCiudades = async () => {
    try {
      const response = await fetch('https://api-colombia.com/api/v1/City');
      const data = await response.json();
      const ciudades = data.map(city => ({
        value: city.name,
        label: city.name
      }));
      setCiudadesOptions(ciudades);
    } catch (error) {
      console.error('Error fetching ciudades:', error);
    }
  };

  const fetchInstrumentos = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'productos'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const productosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Obtener nombres de vendedores si faltan
      await Promise.all(productosData.map(async producto => {
        if (!producto.vendedorNombre && producto.vendedorUid) {
          try {
            const perfilSnap = await getDoc(doc(db, 'perfiles', producto.vendedorUid));
            if (perfilSnap.exists()) {
              producto.vendedorNombre = perfilSnap.data().nombre || perfilSnap.data().email || 'Vendedor';
            }
          } catch (error) {
            console.error('Error fetching vendedor:', error);
          }
        }
      }));

      setInstrumentos(productosData);
    } catch (error) {
      console.error('Error fetching productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImagenChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Limitar a máximo 5 imágenes
      const maxFiles = files.slice(0, 5);
      setImagenes(maxFiles);
      
      // Crear previews para cada imagen
      const previews = maxFiles.map(file => URL.createObjectURL(file));
      setImagenesPreviews(previews);
    }
  };

  const handleRemoveImage = (index) => {
    const newImagenes = imagenes.filter((_, i) => i !== index);
    const newPreviews = imagenesPreviews.filter((_, i) => i !== index);
    setImagenes(newImagenes);
    setImagenesPreviews(newPreviews);
  };

  const handleCrearProducto = async (e) => {
    e.preventDefault();
    if (!user) {
      alert('Debes iniciar sesión para publicar un producto');
      return;
    }

    setCreating(true);
    try {
      // Obtener perfil y verificar plan
      const perfilSnap = await getDoc(doc(db, 'perfiles', user.uid));
      const vendedorNombre = perfilSnap.exists() 
        ? (perfilSnap.data().nombre || perfilSnap.data().email || 'Vendedor')
        : 'Vendedor';
      
      if (perfilSnap.exists()) {
        const perfil = perfilSnap.data();
        
        // Solo verificar límites si NO es premium
        if (!esPremium(perfil)) {
          // Contar productos del usuario
          const productosQuery = query(
            collection(db, 'productos'),
            where('vendedorUid', '==', user.uid)
          );
          const productosSnap = await getDocs(productosQuery);
          const cantidadProductos = productosSnap.size;
          
          // Verificar límites para usuarios estándar (máximo 1 producto)
          if (cantidadProductos >= 1) {
            setCreating(false);
            setShowUpgradeModal(true);
            return;
          }
        }
      }

      // Subir todas las imágenes a Cloudinary
      let imagenesUrls = [];
      if (imagenes.length > 0) {
        const uploadPromises = imagenes.map(img => 
          uploadToCloudinary(img, 'Bandas', 'productos')
        );
        imagenesUrls = await Promise.all(uploadPromises);
      }

      await addDoc(collection(db, 'productos'), {
        ...nuevoProducto,
        precio: Number(nuevoProducto.precio),
        imagen: imagenesUrls[0] || '', // Primera imagen como principal
        imagenes: imagenesUrls, // Array con todas las imágenes
        vendedorUid: user.uid,
        vendedorNombre: vendedorNombre,
        rating: 0,
        resenas: 0,
        createdAt: Timestamp.now()
      });

      setShowModal(false);
      setNuevoProducto({
        nombre: '',
        descripcion: '',
        precio: '',
        ubicacion: '',
        categoria: 'Musica',
        estado: 'Nuevo'
      });
      setImagenes([]);
      setImagenesPreviews([]);
      fetchInstrumentos();
      alert('Producto publicado exitosamente');
    } catch (error) {
      console.error('Error creating producto:', error);
      alert('Error al publicar el producto');
    } finally {
      setCreating(false);
    }
  };

  // Aplicar filtros
  const instrumentosFiltrados = instrumentos.filter(inst => {
    if (filtroCategoria && inst.categoria !== filtroCategoria) return false;
    if (filtroEstado && inst.estado !== filtroEstado) return false;
    if (filtroUbicacion && inst.ubicacion !== filtroUbicacion) return false;
    
    if (filtroPrecio) {
      const precio = inst.precio;
      if (filtroPrecio === 'bajo' && precio >= 5000) return false;
      if (filtroPrecio === 'medio' && (precio < 5000 || precio > 10000)) return false;
      if (filtroPrecio === 'alto' && (precio < 10000 || precio > 20000)) return false;
      if (filtroPrecio === 'muy-alto' && precio <= 20000) return false;
    }
    
    return true;
  });

  // Ordenar
  const instrumentosOrdenados = [...instrumentosFiltrados].sort((a, b) => {
    if (ordenar === 'recientes') {
      return b.createdAt?.toMillis() - a.createdAt?.toMillis();
    } else if (ordenar === 'precio-asc') {
      return a.precio - b.precio;
    } else if (ordenar === 'precio-desc') {
      return b.precio - a.precio;
    } else if (ordenar === 'rating') {
      return (b.rating || 0) - (a.rating || 0);
    }
    return 0;
  });

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} color={i < rating ? '#ffc107' : '#e0e0e0'} size={14} />
    ));
  };

  const handleOpenRatingModal = (producto) => {
    if (!user) {
      showToast('Debes iniciar sesión para valorar productos', 'warning');
      return;
    }
    setSelectedProduct(producto);
    setUserRating(0);
    setHoverRating(0);
    setComentarioResena('');
    setShowRatingModal(true);
  };

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      showToast('Por favor selecciona una calificación', 'warning');
      return;
    }

    setSubmittingRating(true);
    try {
      // Obtener el producto actual
      const productoRef = doc(db, 'productos', selectedProduct.id);
      const productoSnap = await getDoc(productoRef);
      
      if (!productoSnap.exists()) {
        showToast('Producto no encontrado', 'error');
        return;
      }

      const productoData = productoSnap.data();
      const ratingActual = productoData.rating || 0;
      const resenasActuales = productoData.resenas || 0;

      // Calcular nuevo rating promedio
      const nuevoTotalRating = (ratingActual * resenasActuales) + userRating;
      const nuevasResenas = resenasActuales + 1;
      const nuevoRatingPromedio = nuevoTotalRating / nuevasResenas;

      // Actualizar producto
      await updateDoc(productoRef, {
        rating: Math.round(nuevoRatingPromedio * 10) / 10, // Redondear a 1 decimal
        resenas: nuevasResenas
      });

      // Guardar reseña individual (opcional - para futuras funcionalidades)
      await addDoc(collection(db, 'resenas'), {
        productoId: selectedProduct.id,
        usuarioId: user.uid,
        rating: userRating,
        comentario: comentarioResena,
        createdAt: Timestamp.now()
      });

      // Actualizar lista local
      setInstrumentos(prev => prev.map(inst => 
        inst.id === selectedProduct.id 
          ? { ...inst, rating: Math.round(nuevoRatingPromedio * 10) / 10, resenas: nuevasResenas }
          : inst
      ));

      showToast('¡Valoración enviada exitosamente!', 'success');
      setShowRatingModal(false);
    } catch (error) {
      console.error('Error submitting rating:', error);
      showToast('Error al enviar la valoración', 'error');
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <>
      <ToastContainer />
      
      <UpgradePremiumModal 
        show={showUpgradeModal} 
        onHide={() => setShowUpgradeModal(false)}
        limitType="productos"
      />
      
      <Container fluid className="px-4 py-4">
        {/* Header */}
        <div className="market-header mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <h2 className="market-title mb-1">Instrumentos Musicales</h2>
            <p className="text-muted mb-0">{instrumentosOrdenados.length} instrumentos encontrados</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            {user && (
              <Button variant="primary" onClick={() => setShowModal(true)} className="me-3">
                <FaPlus className="me-2" />
                Publicar Producto
              </Button>
            )}
            <span className="text-muted">Ordenar por:</span>
            <Form.Select 
              className="ordenar-select"
              value={ordenar}
              onChange={(e) => setOrdenar(e.target.value)}
            >
              <option value="recientes">Más recientes</option>
              <option value="precio-asc">Precio: Menor a Mayor</option>
              <option value="precio-desc">Precio: Mayor a Menor</option>
              <option value="rating">Mejor valorados</option>
            </Form.Select>
          </div>
        </div>

        {/* Filtros */}
        <div className="filtros-rapidos mt-3">
          <Button variant="outline-primary" size="sm" className="me-2">
            <FaFilter className="me-2" />
            Filtros
          </Button>
          
          <Form.Select 
            size="sm" 
            className="filtro-select me-2"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="">Todas las categorias</option>
            <option value="Musica">Musica</option>
            <option value="Conciertos">Conciertos</option>
            <option value="Jam Session">Jam Session</option>
          </Form.Select>

          <Form.Select 
            size="sm" 
            className="filtro-select me-2"
            value={filtroPrecio}
            onChange={(e) => setFiltroPrecio(e.target.value)}
          >
            <option value="">Cualquier precio</option>
            <option value="bajo">Menos de $5,000</option>
            <option value="medio">$5,000 - $10,000</option>
            <option value="alto">$10,000 - $20,000</option>
            <option value="muy-alto">Más de $20,000</option>
          </Form.Select>

          <Form.Select 
            size="sm" 
            className="filtro-select me-2"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Cualquier estado</option>
            <option value="Nuevo">Nuevo</option>
            <option value="Usado">Usado</option>
          </Form.Select>

          <Select
            options={[
              { value: '', label: 'Todas las ciudades' },
              ...ciudadesOptions
            ]}
            value={filtroUbicacion ? ciudadesOptions.find(c => c.value === filtroUbicacion) : { value: '', label: 'Todas las ciudades' }}
            onChange={(selected) => setFiltroUbicacion(selected?.value || '')}
            placeholder="Filtrar por ciudad..."
            isClearable
            isSearchable
            styles={{
              control: (base) => ({
                ...base,
                minWidth: '200px',
                fontSize: '14px'
              }),
              menu: (base) => ({
                ...base,
                zIndex: 9999
              })
            }}
          />
        </div>
      </div>

      {/* Grid de productos */}
      {loading ? (
        <div className="text-center py-5">Cargando productos...</div>
      ) : instrumentosOrdenados.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted">No hay productos disponibles</p>
          {user && (
            <Button variant="primary" onClick={() => setShowModal(true)}>
              Publicar el primer producto
            </Button>
          )}
        </div>
      ) : (
        <Row>
          {instrumentosOrdenados.map(instrumento => (
            <Col key={instrumento.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
              <Card className="instrument-card h-100">
                <div className="instrument-image-container">
                  {instrumento.imagenes && instrumento.imagenes.length > 1 ? (
                    <Carousel interval={null} indicators={true} controls={true}>
                      {instrumento.imagenes.map((img, idx) => (
                        <Carousel.Item key={idx}>
                          <img
                            className="d-block w-100 instrument-image"
                            src={img || 'https://via.placeholder.com/300x200?text=Sin+Imagen'}
                            alt={`${instrumento.nombre} - ${idx + 1}`}
                            style={{ height: '250px', objectFit: 'cover' }}
                          />
                        </Carousel.Item>
                      ))}
                    </Carousel>
                  ) : (
                    <Card.Img 
                      variant="top" 
                      src={instrumento.imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
                      className="instrument-image"
                    />
                  )}
                  <Badge bg="success" className="estado-badge">{instrumento.estado}</Badge>
                </div>
                <Card.Body>
                  <Card.Title className="instrument-title">{instrumento.nombre}</Card.Title>
                  <Card.Text className="instrument-description text-muted">
                    {instrumento.descripcion}
                  </Card.Text>
                  <div className="d-flex align-items-center mb-2">
                    {renderStars(instrumento.rating || 0)}
                    <span className="ms-2 text-muted small">({instrumento.resenas || 0})</span>
                  </div>
                  <div className="d-flex align-items-center text-muted mb-2">
                    <FaMapMarkerAlt className="me-1" />
                    <small>{instrumento.ubicacion}</small>
                  </div>
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="instrument-price mb-0">
                      ${instrumento.precio?.toLocaleString('es-CO')} COP
                    </h5>
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleOpenRatingModal(instrumento)}
                    >
                      Valorar
                    </Button>
                  </div>
                  {instrumento.vendedorNombre && (
                    <small className="text-muted d-block mt-2">
                      Vendedor: {instrumento.vendedorNombre}
                    </small>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Modal para crear producto */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Publicar Instrumento</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleCrearProducto}>
            <Form.Group className="mb-3">
              <Form.Label>Nombre del Instrumento</Form.Label>
              <Form.Control
                type="text"
                value={nuevoProducto.nombre}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, nombre: e.target.value })}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={nuevoProducto.descripcion}
                onChange={(e) => setNuevoProducto({ ...nuevoProducto, descripcion: e.target.value })}
                required
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Precio (COP)</Form.Label>
                  <Form.Control
                    type="number"
                    value={nuevoProducto.precio}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, precio: e.target.value })}
                    placeholder="Ej: 500000"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ubicación (Ciudad)</Form.Label>
                  <Select
                    options={ciudadesOptions}
                    value={ciudadesOptions.find(c => c.value === nuevoProducto.ubicacion) || null}
                    onChange={(selected) => setNuevoProducto({ ...nuevoProducto, ubicacion: selected?.value || '' })}
                    placeholder="Selecciona una ciudad..."
                    isClearable
                    isSearchable
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderRadius: '8px',
                        padding: '2px'
                      })
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Categoría</Form.Label>
                  <Form.Select
                    value={nuevoProducto.categoria}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, categoria: e.target.value })}
                  >
                    <option value="Musica">Musica</option>
                    <option value="Conciertos">Conciertos</option>
                    <option value="Jam Session">Jam Session</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estado</Form.Label>
                  <Form.Select
                    value={nuevoProducto.estado}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, estado: e.target.value })}
                  >
                    <option value="Nuevo">Nuevo</option>
                    <option value="Usado">Usado</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Imágenes del Producto (máximo 5)</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                multiple
                onChange={handleImagenChange}
              />
              <Form.Text className="text-muted">
                Puedes seleccionar hasta 5 imágenes. La primera será la imagen principal.
              </Form.Text>
              {imagenesPreviews.length > 0 && (
                <div className="mt-3" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {imagenesPreviews.map((preview, index) => (
                    <div 
                      key={index} 
                      style={{ 
                        position: 'relative',
                        width: '120px',
                        height: '120px'
                      }}
                    >
                      <img 
                        src={preview} 
                        alt={`Preview ${index + 1}`} 
                        style={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: '8px',
                          border: index === 0 ? '3px solid #0d6efd' : '1px solid #ddd'
                        }} 
                      />
                      {index === 0 && (
                        <span 
                          style={{
                            position: 'absolute',
                            bottom: '5px',
                            left: '5px',
                            background: '#0d6efd',
                            color: 'white',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold'
                          }}
                        >
                          Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        style={{
                          position: 'absolute',
                          top: '5px',
                          right: '5px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '24px',
                          height: '24px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          lineHeight: 1,
                          fontWeight: 'bold'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={creating}>
                {creating ? 'Publicando...' : 'Publicar Producto'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de valoración */}
      <Modal show={showRatingModal} onHide={() => setShowRatingModal(false)} centered>
        <Modal.Header closeButton style={{ background: '#f0f2f5', borderBottom: '1px solid #e4e6eb' }}>
          <Modal.Title style={{ fontSize: 20, fontWeight: 700 }}>
            Valorar Producto
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: '24px' }}>
          {selectedProduct && (
            <>
              <div className="text-center mb-4">
                <h5 style={{ fontWeight: 600, marginBottom: 8 }}>{selectedProduct.nombre}</h5>
                <p className="text-muted mb-3">¿Qué te pareció este producto?</p>
                
                {/* Estrellas interactivas */}
                <div className="d-flex justify-content-center gap-2 mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar
                      key={star}
                      size={40}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      color={star <= (hoverRating || userRating) ? '#ffc107' : '#e0e0e0'}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setUserRating(star)}
                    />
                  ))}
                </div>
                
                {userRating > 0 && (
                  <p style={{ fontSize: 14, color: '#6366f1', fontWeight: 600 }}>
                    {userRating === 1 && 'Muy malo'}
                    {userRating === 2 && 'Malo'}
                    {userRating === 3 && 'Regular'}
                    {userRating === 4 && 'Bueno'}
                    {userRating === 5 && 'Excelente'}
                  </p>
                )}
              </div>

              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: 600, fontSize: 15 }}>
                  Comentario (opcional)
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={comentarioResena}
                  onChange={(e) => setComentarioResena(e.target.value)}
                  placeholder="Cuéntanos tu experiencia con este producto..."
                  style={{ borderRadius: '8px', padding: '12px' }}
                />
              </Form.Group>

              <div className="d-flex gap-2 justify-content-end">
                <Button 
                  variant="light" 
                  onClick={() => setShowRatingModal(false)}
                  style={{ borderRadius: '8px', padding: '10px 24px', fontWeight: 600 }}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="primary"
                  onClick={handleSubmitRating}
                  disabled={submittingRating || userRating === 0}
                  style={{ 
                    borderRadius: '8px', 
                    padding: '10px 24px', 
                    fontWeight: 600,
                    background: '#6366f1',
                    border: 'none'
                  }}
                >
                  {submittingRating ? 'Enviando...' : 'Enviar Valoración'}
                </Button>
              </div>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
    </>
  );
};

export default MusicmarketNuevo;
