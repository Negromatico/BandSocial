import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaMusic, FaHeart } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <Container>
        <Row className="footer-content">
          {/* Sección Acerca de */}
          <Col md={4} className="footer-section">
            <h5 className="footer-title">
              <FaMusic className="me-2" />
              BandSocial
            </h5>
            <p className="footer-description">
              La red social musical de Colombia. Conecta con músicos, bandas, encuentra eventos y compra/vende instrumentos.
            </p>
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaFacebook />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaTwitter />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaInstagram />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-link">
                <FaYoutube />
              </a>
            </div>
          </Col>

          {/* Sección Enlaces Rápidos */}
          <Col md={4} className="footer-section">
            <h5 className="footer-title">Enlaces Rápidos</h5>
            <ul className="footer-links">
              <li><Link to="/publicaciones">Inicio</Link></li>
              <li><Link to="/eventos">Eventos</Link></li>
              <li><Link to="/musicmarket">MusicMarket</Link></li>
              <li><Link to="/membership">Membresía</Link></li>
              <li><Link to="/buscar">Buscar</Link></li>
            </ul>
          </Col>

          {/* Sección Información */}
          <Col md={4} className="footer-section">
            <h5 className="footer-title">Información</h5>
            <ul className="footer-links">
              <li><Link to="/acerca-de">Acerca de</Link></li>
              <li><Link to="/terminos">Términos y Condiciones</Link></li>
              <li><Link to="/privacidad">Política de Privacidad</Link></li>
              <li><Link to="/contacto">Contacto</Link></li>
              <li><Link to="/ayuda">Ayuda</Link></li>
            </ul>
          </Col>
        </Row>

        {/* Copyright */}
        <Row className="footer-bottom">
          <Col className="text-center">
            <p className="copyright">
              © {currentYear} BandSocial. Todos los derechos reservados. 
              <span className="made-with">
                {' '}Hecho con <FaHeart className="heart-icon" /> para la comunidad musical de Colombia
              </span>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
