import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { FaMusic, FaUsers, FaCalendarAlt, FaShoppingCart, FaHeart, FaGuitar, FaDrum, FaMicrophone } from 'react-icons/fa';
import './InfoPages.css';

const AcercaDe = () => {
  return (
    <div className="info-page">
      <Container>
        {/* Hero Section */}
        <div className="info-hero">
          <h1 className="info-title">
            <FaMusic className="me-3" />
            Acerca de BandSocial
          </h1>
          <p className="info-subtitle">
            La red social musical que conecta a la comunidad artística de Colombia
          </p>
        </div>

        {/* Misión y Visión */}
        <Row className="mb-5">
          <Col md={6}>
            <Card className="info-card">
              <Card.Body>
                <h3 className="section-title">
                  <FaHeart className="me-2 text-danger" />
                  Nuestra Misión
                </h3>
                <p className="section-text">
                  Facilitar la conexión, colaboración y crecimiento de músicos y bandas 
                  en Colombia mediante una plataforma digital integral que transforma la 
                  forma en que la comunidad musical interactúa y prospera.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={6}>
            <Card className="info-card">
              <Card.Body>
                <h3 className="section-title">
                  <FaUsers className="me-2 text-primary" />
                  Nuestra Visión
                </h3>
                <p className="section-text">
                  Consolidarnos como la plataforma líder en Latinoamérica para la 
                  comunidad musical en los próximos 5 años, expandiendo las 
                  oportunidades de crecimiento profesional para cada músico.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Qué Ofrecemos */}
        <div className="mb-5">
          <h2 className="section-heading text-center mb-4">¿Qué Ofrecemos?</h2>
          <Row>
            <Col md={3} sm={6} className="mb-4">
              <div className="feature-box">
                <div className="feature-icon">
                  <FaUsers />
                </div>
                <h4>Red Social Musical</h4>
                <p>Conecta con músicos, bandas y productores. Comparte tu música, proyectos y experiencias.</p>
              </div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <div className="feature-box">
                <div className="feature-icon">
                  <FaCalendarAlt />
                </div>
                <h4>Eventos Musicales</h4>
                <p>Descubre y organiza conciertos, jam sessions, talleres y eventos musicales en tu ciudad.</p>
              </div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <div className="feature-box">
                <div className="feature-icon">
                  <FaShoppingCart />
                </div>
                <h4>MusicMarket</h4>
                <p>Compra y vende instrumentos, equipos de audio y accesorios musicales de forma segura.</p>
              </div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <div className="feature-box">
                <div className="feature-icon">
                  <FaMusic />
                </div>
                <h4>Colaboraciones</h4>
                <p>Encuentra músicos para formar bandas, colaborar en proyectos o sesiones de grabación.</p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Nuestra Historia */}
        <div className="mb-5">
          <Card className="info-card">
            <Card.Body>
              <h2 className="section-heading mb-4">Nuestra Historia</h2>
              <p className="section-text">
                BandSocial nació en 2026 con la visión de crear un espacio único para la comunidad musical 
                colombiana. Reconociendo la necesidad de una plataforma que no solo permitiera la conexión 
                entre músicos, sino que también facilitara la organización de eventos, la compra-venta de 
                equipos y la colaboración en proyectos musicales.
              </p>
              <p className="section-text">
                Desde nuestros inicios, hemos trabajado para construir una comunidad inclusiva donde músicos 
                de todos los géneros y niveles de experiencia puedan encontrar su lugar. Ya seas un músico 
                profesional, un estudiante de música, un productor o simplemente un apasionado por la música, 
                BandSocial es tu hogar digital.
              </p>
            </Card.Body>
          </Card>
        </div>

        {/* Valores */}
        <div className="mb-5">
          <h2 className="section-heading text-center mb-4">Nuestros Valores</h2>
          <Row>
            <Col md={4} className="mb-3">
              <div className="value-item">
                <FaGuitar className="value-icon" />
                <h4>Pasión Musical</h4>
                <p>La música es nuestra razón de ser. Celebramos la diversidad musical y el talento en todas sus formas.</p>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="value-item">
                <FaUsers className="value-icon" />
                <h4>Comunidad</h4>
                <p>Creemos en el poder de la colaboración y el apoyo mutuo entre músicos.</p>
              </div>
            </Col>
            <Col md={4} className="mb-3">
              <div className="value-item">
                <FaDrum className="value-icon" />
                <h4>Innovación</h4>
                <p>Constantemente mejoramos nuestra plataforma para ofrecer las mejores herramientas a nuestros usuarios.</p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Estadísticas */}
        <div className="stats-section mb-5">
          <h2 className="section-heading text-center mb-4">BandSocial en Números</h2>
          <Row className="text-center">
            <Col md={3} sm={6} className="mb-4">
              <div className="stat-box">
                <div className="stat-number">1000+</div>
                <div className="stat-label">Músicos Registrados</div>
              </div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <div className="stat-box">
                <div className="stat-number">500+</div>
                <div className="stat-label">Bandas Activas</div>
              </div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <div className="stat-box">
                <div className="stat-number">200+</div>
                <div className="stat-label">Eventos Organizados</div>
              </div>
            </Col>
            <Col md={3} sm={6} className="mb-4">
              <div className="stat-box">
                <div className="stat-number">300+</div>
                <div className="stat-label">Productos en Venta</div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Call to Action */}
        <div className="cta-section text-center">
          <h2 className="mb-3">¿Listo para unirte a la comunidad?</h2>
          <p className="mb-4">Crea tu perfil gratis y comienza a conectar con músicos de toda Colombia</p>
          <a href="/register" className="btn btn-primary btn-lg">
            <FaMicrophone className="me-2" />
            Únete Ahora
          </a>
        </div>
      </Container>
    </div>
  );
};

export default AcercaDe;
