import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Container, Row, Col, Card, Tabs, Tab, Spinner } from 'react-bootstrap';
import { FaUser, FaMusic, FaCalendarAlt, FaGuitar, FaSearch } from 'react-icons/fa';
import './Buscar.css';

const Buscar = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({
    usuarios: [],
    publicaciones: [],
    eventos: [],
    productos: []
  });

  useEffect(() => {
    if (searchQuery.trim()) {
      performSearch(searchQuery);
    }
  }, [searchQuery]);

  const performSearch = async (query) => {
    setLoading(true);
    const searchTerm = query.toLowerCase().trim();

    try {
      // Buscar usuarios
      const usuariosRef = collection(db, 'perfiles');
      const usuariosSnap = await getDocs(usuariosRef);
      const usuarios = usuariosSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(user => 
          user.nombre?.toLowerCase().includes(searchTerm) ||
          user.email?.toLowerCase().includes(searchTerm) ||
          user.ciudad?.toLowerCase().includes(searchTerm)
        )
        .slice(0, 10);

      // Buscar publicaciones
      const publicacionesRef = collection(db, 'publicaciones');
      const publicacionesSnap = await getDocs(query(publicacionesRef, orderBy('createdAt', 'desc'), limit(20)));
      const publicaciones = publicacionesSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(pub => 
          pub.titulo?.toLowerCase().includes(searchTerm) ||
          pub.descripcion?.toLowerCase().includes(searchTerm) ||
          pub.tipo?.toLowerCase().includes(searchTerm)
        )
        .slice(0, 10);

      // Buscar eventos
      const eventosRef = collection(db, 'eventos');
      const eventosSnap = await getDocs(query(eventosRef, orderBy('fecha', 'desc'), limit(20)));
      const eventos = eventosSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(evento => 
          evento.titulo?.toLowerCase().includes(searchTerm) ||
          evento.lugar?.toLowerCase().includes(searchTerm) ||
          evento.tipo?.toLowerCase().includes(searchTerm)
        )
        .slice(0, 10);

      // Buscar productos
      const productosRef = collection(db, 'productos');
      const productosSnap = await getDocs(query(productosRef, orderBy('createdAt', 'desc'), limit(20)));
      const productos = productosSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(prod => 
          prod.nombre?.toLowerCase().includes(searchTerm) ||
          prod.descripcion?.toLowerCase().includes(searchTerm) ||
          prod.categoria?.toLowerCase().includes(searchTerm)
        )
        .slice(0, 10);

      setResults({ usuarios, publicaciones, eventos, productos });
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.usuarios.length + results.publicaciones.length + 
                       results.eventos.length + results.productos.length;

  if (!searchQuery.trim()) {
    return (
      <Container className="search-container py-5">
        <div className="text-center">
          <FaSearch size={60} color="#9ca3af" className="mb-3" />
          <h3>Buscar en BandSocial</h3>
          <p className="text-muted">Usa la barra de búsqueda para encontrar usuarios, publicaciones, eventos y productos</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="search-container py-4">
      <div className="search-header mb-4">
        <h2>Resultados de búsqueda</h2>
        <p className="text-muted">
          Buscando: <strong>"{searchQuery}"</strong> 
          {!loading && ` - ${totalResults} resultado${totalResults !== 1 ? 's' : ''} encontrado${totalResults !== 1 ? 's' : ''}`}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Buscando...</p>
        </div>
      ) : totalResults === 0 ? (
        <div className="no-results text-center py-5">
          <FaSearch size={60} color="#9ca3af" className="mb-3" />
          <h4>No se encontraron resultados</h4>
          <p className="text-muted">
            No encontramos resultados para "<strong>{searchQuery}</strong>"
          </p>
          <p className="text-muted">Intenta con otros términos de búsqueda</p>
        </div>
      ) : (
        <Tabs defaultActiveKey="todos" className="search-tabs mb-4">
          <Tab eventKey="todos" title={`Todos (${totalResults})`}>
            <AllResults results={results} />
          </Tab>
          <Tab eventKey="usuarios" title={`Usuarios (${results.usuarios.length})`}>
            <UsuariosResults usuarios={results.usuarios} />
          </Tab>
          <Tab eventKey="publicaciones" title={`Publicaciones (${results.publicaciones.length})`}>
            <PublicacionesResults publicaciones={results.publicaciones} />
          </Tab>
          <Tab eventKey="eventos" title={`Eventos (${results.eventos.length})`}>
            <EventosResults eventos={results.eventos} />
          </Tab>
          <Tab eventKey="productos" title={`Productos (${results.productos.length})`}>
            <ProductosResults productos={results.productos} />
          </Tab>
        </Tabs>
      )}
    </Container>
  );
};

// Componente para mostrar todos los resultados
const AllResults = ({ results }) => (
  <div>
    {results.usuarios.length > 0 && (
      <div className="mb-4">
        <h5 className="mb-3"><FaUser className="me-2" />Usuarios</h5>
        <UsuariosResults usuarios={results.usuarios.slice(0, 3)} />
      </div>
    )}
    {results.publicaciones.length > 0 && (
      <div className="mb-4">
        <h5 className="mb-3"><FaMusic className="me-2" />Publicaciones</h5>
        <PublicacionesResults publicaciones={results.publicaciones.slice(0, 3)} />
      </div>
    )}
    {results.eventos.length > 0 && (
      <div className="mb-4">
        <h5 className="mb-3"><FaCalendarAlt className="me-2" />Eventos</h5>
        <EventosResults eventos={results.eventos.slice(0, 3)} />
      </div>
    )}
    {results.productos.length > 0 && (
      <div className="mb-4">
        <h5 className="mb-3"><FaGuitar className="me-2" />Productos</h5>
        <ProductosResults productos={results.productos.slice(0, 3)} />
      </div>
    )}
  </div>
);

// Componente para resultados de usuarios
const UsuariosResults = ({ usuarios }) => (
  <Row>
    {usuarios.map(usuario => (
      <Col key={usuario.id} md={6} lg={4} className="mb-3">
        <Card className="search-result-card">
          <Card.Body>
            <div className="d-flex align-items-center gap-3">
              <div className="user-avatar">
                {usuario.fotoPerfil ? (
                  <img src={usuario.fotoPerfil} alt={usuario.nombre} />
                ) : (
                  <FaUser />
                )}
              </div>
              <div className="flex-grow-1">
                <Link to={`/profile/${usuario.id}`} className="user-name">
                  {usuario.nombre || usuario.email}
                </Link>
                <p className="user-type mb-0">{usuario.type || 'Músico'}</p>
                {usuario.ciudad && <small className="text-muted">{usuario.ciudad}</small>}
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>
);

// Componente para resultados de publicaciones
const PublicacionesResults = ({ publicaciones }) => (
  <Row>
    {publicaciones.map(pub => (
      <Col key={pub.id} md={12} className="mb-3">
        <Card className="search-result-card">
          <Card.Body>
            <h6>{pub.titulo || 'Publicación'}</h6>
            <p className="text-muted mb-2">{pub.descripcion?.substring(0, 150)}...</p>
            <small className="text-muted">{pub.tipo} • {pub.ciudad}</small>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>
);

// Componente para resultados de eventos
const EventosResults = ({ eventos }) => (
  <Row>
    {eventos.map(evento => (
      <Col key={evento.id} md={6} className="mb-3">
        <Card className="search-result-card">
          <Card.Body>
            <h6>{evento.titulo}</h6>
            <p className="text-muted mb-2">
              <FaCalendarAlt className="me-2" />
              {evento.fecha} • {evento.hora}
            </p>
            <small className="text-muted">{evento.lugar}</small>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>
);

// Componente para resultados de productos
const ProductosResults = ({ productos }) => (
  <Row>
    {productos.map(producto => (
      <Col key={producto.id} md={6} lg={4} className="mb-3">
        <Card className="search-result-card">
          {producto.imagen && (
            <Card.Img variant="top" src={producto.imagen} style={{ height: '150px', objectFit: 'cover' }} />
          )}
          <Card.Body>
            <h6>{producto.nombre}</h6>
            <p className="text-primary mb-2 fw-bold">
              ${producto.precio?.toLocaleString('es-CO')} COP
            </p>
            <small className="text-muted">{producto.ubicacion}</small>
          </Card.Body>
        </Card>
      </Col>
    ))}
  </Row>
);

export default Buscar;
