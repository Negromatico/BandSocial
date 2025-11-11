import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge } from 'react-bootstrap';
import { FaStar, FaMapMarkerAlt, FaFilter } from 'react-icons/fa';
import './Musicmarket.css';

// Datos de ejemplo de instrumentos
const instrumentosData = [
  {
    id: 1,
    nombre: 'Guitarra Acustica Yamaha FG850',
    descripcion: 'Guitarra acustica de marca sólida',
    precio: 8500,
    ubicacion: 'CDMX',
    rating: 5,
    resenas: 24,
    imagen: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400',
    categoria: 'Musica',
    estado: 'Nuevo'
  },
  {
    id: 2,
    nombre: 'Piano Antiguo',
    descripcion: 'Piano antiguo de grecia',
    precio: 7000000,
    ubicacion: 'Guatemala',
    rating: 4,
    resenas: 12,
    imagen: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400',
    categoria: 'Conciertos',
    estado: 'Usado'
  },
  {
    id: 3,
    nombre: 'Redoblante',
    descripcion: 'Redoblante de buena calidad',
    precio: 500000,
    ubicacion: 'Medellín',
    rating: 5,
    resenas: 58,
    imagen: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400',
    categoria: 'Jam Session',
    estado: 'Nuevo'
  },
  {
    id: 4,
    nombre: 'Guitarra Eléctrica Fender',
    descripcion: 'Guitarra eléctrica profesional',
    precio: 12000,
    ubicacion: 'CDMX',
    rating: 5,
    resenas: 45,
    imagen: 'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400',
    categoria: 'Musica',
    estado: 'Nuevo'
  },
  {
    id: 5,
    nombre: 'Batería Pearl Export',
    descripcion: 'Set completo de batería',
    precio: 25000,
    ubicacion: 'Guadalajara',
    rating: 4,
    resenas: 32,
    imagen: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?w=400',
    categoria: 'Conciertos',
    estado: 'Usado'
  },
  {
    id: 6,
    nombre: 'Piano Digital Yamaha',
    descripcion: 'Piano digital con 88 teclas',
    precio: 18000,
    ubicacion: 'Monterrey',
    rating: 5,
    resenas: 67,
    imagen: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=400',
    categoria: 'Musica',
    estado: 'Nuevo'
  }
];

const Musicmarket = () => {
  const [filtroCategoria, setFiltroCategoria] = useState('Todas las categorias');
  const [filtroPrecio, setFiltroPrecio] = useState('Cualquier precio');
  const [filtroEstado, setFiltroEstado] = useState('Cualquier estado');
  const [filtroUbicacion, setFiltroUbicacion] = useState('Todas las ubicaciones');
  const [ordenar, setOrdenar] = useState('Más recientes');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, index) => (
      <FaStar
        key={index}
        color={index < rating ? '#ffc107' : '#e0e0e0'}
        size={14}
      />
    ));
  };

  return (
    <div className="musicmarket-page">
      <Container fluid className="px-4 py-4">
        {/* Header con filtros */}
        <div className="market-header mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <h2 className="market-title mb-1">Instrumentos Musicales</h2>
              <p className="text-muted mb-0">1247 instrumentos encontrados</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">Ordenar por:</span>
              <Form.Select
                value={ordenar}
                onChange={(e) => setOrdenar(e.target.value)}
                className="ordenar-select"
              >
                <option>Más recientes</option>
                <option>Precio: Menor a Mayor</option>
                <option>Precio: Mayor a Menor</option>
                <option>Mejor valorados</option>
              </Form.Select>
            </div>
          </div>

          {/* Filtros rápidos */}
          <div className="filtros-rapidos mt-3">
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className="me-2"
            >
              <FaFilter className="me-2" />
              Filtros
            </Button>
            
            <Form.Select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="filtro-select me-2"
              size="sm"
            >
              <option>Todas las categorias</option>
              <option>Musica</option>
              <option>Conciertos</option>
              <option>Jam Session</option>
            </Form.Select>

            <Form.Select
              value={filtroPrecio}
              onChange={(e) => setFiltroPrecio(e.target.value)}
              className="filtro-select me-2"
              size="sm"
            >
              <option>Cualquier precio</option>
              <option>Menos de $5,000</option>
              <option>$5,000 - $10,000</option>
              <option>$10,000 - $20,000</option>
              <option>Más de $20,000</option>
            </Form.Select>

            <Form.Select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="filtro-select me-2"
              size="sm"
            >
              <option>Cualquier estado</option>
              <option>Nuevo</option>
              <option>Usado</option>
            </Form.Select>

            <Form.Select
              value={filtroUbicacion}
              onChange={(e) => setFiltroUbicacion(e.target.value)}
              className="filtro-select"
              size="sm"
            >
              <option>Todas las ubicaciones</option>
              <option>CDMX</option>
              <option>Guadalajara</option>
              <option>Monterrey</option>
              <option>Medellín</option>
            </Form.Select>

            <Button
              variant="primary"
              size="sm"
              className="ms-auto"
            >
              Aplicar Filtros
            </Button>
          </div>
        </div>

        {/* Grid de instrumentos */}
        <Row className="g-4">
          {instrumentosData.map((instrumento) => (
            <Col key={instrumento.id} xs={12} sm={6} md={4} lg={3}>
              <Card className="instrument-card h-100">
                <div className="card-image-wrapper">
                  {instrumento.estado === 'Nuevo' && (
                    <Badge bg="success" className="card-badge">
                      Nuevo
                    </Badge>
                  )}
                  <Card.Img
                    variant="top"
                    src={instrumento.imagen}
                    alt={instrumento.nombre}
                    className="card-image"
                  />
                </div>
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="instrument-name">
                    {instrumento.nombre}
                  </Card.Title>
                  <Card.Text className="instrument-description">
                    {instrumento.descripcion}
                  </Card.Text>
                  
                  <div className="rating-section mb-2">
                    <div className="stars">
                      {renderStars(instrumento.rating)}
                    </div>
                    <span className="resenas-count">
                      ({instrumento.resenas} reseñas)
                    </span>
                  </div>

                  <div className="price-section mb-2">
                    <span className="price">${instrumento.precio.toLocaleString()}</span>
                  </div>

                  <div className="ubicacion-section mb-3">
                    <FaMapMarkerAlt className="me-1" color="#666" />
                    <span className="text-muted">{instrumento.ubicacion}</span>
                  </div>

                  <Button variant="primary" className="w-100 mt-auto btn-ver-detalles">
                    Ver Detalles
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

      </Container>
    </div>
  );
};

export default Musicmarket;
