import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, Modal } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaFilter, FaPlus } from 'react-icons/fa';
import { db, auth } from '../services/firebase';
import { collection, getDocs, addDoc, query, orderBy, doc, getDoc, Timestamp, where } from 'firebase/firestore';
import { uploadToCloudinary } from '../services/cloudinary';
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
  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(u => setUser(u));
    return unsub;
  }, []);

  useEffect(() => {
    fetchInstrumentos();
  }, []);

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
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setImagenPreview(URL.createObjectURL(file));
    }
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
        const planActual = perfil.planActual || 'estandar';
        
        // Contar productos del usuario
        const productosQuery = query(
          collection(db, 'productos'),
          where('vendedorUid', '==', user.uid)
        );
        const productosSnap = await getDocs(productosQuery);
        const cantidadProductos = productosSnap.size;
        
        // Verificar límites según plan
        if (planActual === 'estandar' && cantidadProductos >= 1) {
          alert('Has alcanzado el límite de productos de tu plan Estándar (1 producto). Actualiza a Premium para publicar sin límites.');
          setCreating(false);
          return;
        }
      }

      let imagenUrl = '';
      if (imagen) {
        imagenUrl = await uploadToCloudinary(imagen, 'Productos', 'productos/instrumentos');
      }

      await addDoc(collection(db, 'productos'), {
        ...nuevoProducto,
        precio: Number(nuevoProducto.precio),
        imagen: imagenUrl,
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
      setImagen(null);
      setImagenPreview('');
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

  return (
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

          <Form.Select 
            size="sm" 
            className="filtro-select"
            value={filtroUbicacion}
            onChange={(e) => setFiltroUbicacion(e.target.value)}
          >
            <option value="">Todas las ubicaciones</option>
            {[...new Set(instrumentos.map(i => i.ubicacion))].filter(Boolean).map(ubicacion => (
              <option key={ubicacion} value={ubicacion}>{ubicacion}</option>
            ))}
          </Form.Select>
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
                  <Card.Img 
                    variant="top" 
                    src={instrumento.imagen || 'https://via.placeholder.com/300x200?text=Sin+Imagen'} 
                    className="instrument-image"
                  />
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
                    <Button variant="primary" size="sm">Ver detalles</Button>
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
                  <Form.Label>Ubicación</Form.Label>
                  <Form.Control
                    type="text"
                    value={nuevoProducto.ubicacion}
                    onChange={(e) => setNuevoProducto({ ...nuevoProducto, ubicacion: e.target.value })}
                    required
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
              <Form.Label>Imagen del Producto</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImagenChange}
              />
              {imagenPreview && (
                <img 
                  src={imagenPreview} 
                  alt="Preview" 
                  className="mt-2" 
                  style={{ maxWidth: '200px', borderRadius: '8px' }} 
                />
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
    </Container>
  );
};

export default MusicmarketNuevo;
