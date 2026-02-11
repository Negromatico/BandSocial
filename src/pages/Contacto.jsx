import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import emailjs from '@emailjs/browser';
import './InfoPages.css';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  });
  const [sending, setSending] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setAlert({ show: false, type: '', message: '' });

    try {
      // Configuración de EmailJS (debes configurar tu cuenta en emailjs.com)
      await emailjs.send(
        'YOUR_SERVICE_ID', // Reemplazar con tu Service ID
        'YOUR_TEMPLATE_ID', // Reemplazar con tu Template ID
        {
          from_name: formData.nombre,
          from_email: formData.email,
          subject: formData.asunto,
          message: formData.mensaje,
          to_email: 'contacto@bandsocial.com'
        },
        'YOUR_PUBLIC_KEY' // Reemplazar con tu Public Key
      );

      setAlert({
        show: true,
        type: 'success',
        message: '¡Mensaje enviado exitosamente! Nos pondremos en contacto contigo pronto.'
      });
      
      setFormData({
        nombre: '',
        email: '',
        asunto: '',
        mensaje: ''
      });
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      setAlert({
        show: true,
        type: 'danger',
        message: 'Hubo un error al enviar tu mensaje. Por favor, intenta de nuevo o contáctanos directamente por email.'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="info-page">
      <Container>
        <div className="info-hero">
          <h1 className="info-title">
            <FaEnvelope className="me-3" />
            Contacto
          </h1>
          <p className="info-subtitle">
            ¿Tienes preguntas? Estamos aquí para ayudarte
          </p>
        </div>

        <Row>
          {/* Formulario de Contacto */}
          <Col lg={8} className="mb-4">
            <Card className="info-card">
              <Card.Body>
                <h2 className="section-heading mb-4">Envíanos un Mensaje</h2>
                
                {alert.show && (
                  <Alert variant={alert.type} onClose={() => setAlert({ ...alert, show: false })} dismissible>
                    {alert.message}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Nombre Completo *</Form.Label>
                        <Form.Control
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleChange}
                          placeholder="Tu nombre"
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="tu@email.com"
                          required
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label>Asunto *</Form.Label>
                    <Form.Select
                      name="asunto"
                      value={formData.asunto}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Selecciona un asunto</option>
                      <option value="Soporte Técnico">Soporte Técnico</option>
                      <option value="Consulta General">Consulta General</option>
                      <option value="Reportar Problema">Reportar Problema</option>
                      <option value="Sugerencia">Sugerencia</option>
                      <option value="Membresía Premium">Membresía Premium</option>
                      <option value="MusicMarket">MusicMarket</option>
                      <option value="Eventos">Eventos</option>
                      <option value="Privacidad y Seguridad">Privacidad y Seguridad</option>
                      <option value="Colaboración/Alianzas">Colaboración/Alianzas</option>
                      <option value="Otro">Otro</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Mensaje *</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleChange}
                      placeholder="Cuéntanos cómo podemos ayudarte..."
                      required
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    size="lg"
                    disabled={sending}
                    className="w-100"
                  >
                    {sending ? (
                      <>Enviando...</>
                    ) : (
                      <>
                        <FaPaperPlane className="me-2" />
                        Enviar Mensaje
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Información de Contacto */}
          <Col lg={4}>
            <Card className="info-card mb-4">
              <Card.Body>
                <h3 className="section-heading mb-4">Información de Contacto</h3>
                
                <div className="contact-info-item mb-4">
                  <div className="contact-icon">
                    <FaEnvelope />
                  </div>
                  <div>
                    <h5>Email</h5>
                    <p className="mb-0">
                      <a href="mailto:contacto@bandsocial.com">contacto@bandsocial.com</a>
                    </p>
                    <p className="mb-0 text-muted small">
                      <a href="mailto:soporte@bandsocial.com">soporte@bandsocial.com</a>
                    </p>
                  </div>
                </div>

                <div className="contact-info-item mb-4">
                  <div className="contact-icon">
                    <FaPhone />
                  </div>
                  <div>
                    <h5>Teléfono</h5>
                    <p className="mb-0">+57 (1) 234-5678</p>
                    <p className="mb-0 text-muted small">Lun - Vie: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div className="contact-info-item mb-4">
                  <div className="contact-icon">
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h5>Ubicación</h5>
                    <p className="mb-0">Bogotá, Colombia</p>
                    <p className="mb-0 text-muted small">Calle 123 #45-67</p>
                  </div>
                </div>

                <hr />

                <h5 className="mb-3">Síguenos</h5>
                <div className="social-links-contact">
                  <a href="https://facebook.com/bandsocial" target="_blank" rel="noopener noreferrer" className="social-link-contact">
                    <FaFacebook />
                  </a>
                  <a href="https://twitter.com/bandsocial" target="_blank" rel="noopener noreferrer" className="social-link-contact">
                    <FaTwitter />
                  </a>
                  <a href="https://instagram.com/bandsocial" target="_blank" rel="noopener noreferrer" className="social-link-contact">
                    <FaInstagram />
                  </a>
                </div>
              </Card.Body>
            </Card>

            <Card className="info-card">
              <Card.Body>
                <h5 className="mb-3">Horario de Atención</h5>
                <div className="schedule-item">
                  <strong>Lunes - Viernes:</strong>
                  <span>9:00 AM - 6:00 PM</span>
                </div>
                <div className="schedule-item">
                  <strong>Sábados:</strong>
                  <span>10:00 AM - 2:00 PM</span>
                </div>
                <div className="schedule-item">
                  <strong>Domingos:</strong>
                  <span>Cerrado</span>
                </div>
                <p className="text-muted small mt-3 mb-0">
                  * Tiempo de respuesta promedio: 24-48 horas
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Preguntas Frecuentes Rápidas */}
        <Row className="mt-5">
          <Col>
            <Card className="info-card">
              <Card.Body>
                <h2 className="section-heading mb-4">Preguntas Frecuentes</h2>
                <Row>
                  <Col md={6}>
                    <div className="faq-quick-item mb-3">
                      <h5>¿Cómo creo una cuenta?</h5>
                      <p>Haz clic en "Registrarse" en la página principal y completa el formulario con tu información.</p>
                    </div>
                    <div className="faq-quick-item mb-3">
                      <h5>¿Es gratis usar BandSocial?</h5>
                      <p>Sí, BandSocial es gratis. También ofrecemos una membresía premium con funciones adicionales.</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="faq-quick-item mb-3">
                      <h5>¿Cómo publico un evento?</h5>
                      <p>Ve a la sección "Eventos" y haz clic en "Crear Evento". Completa la información y publica.</p>
                    </div>
                    <div className="faq-quick-item mb-3">
                      <h5>¿Necesitas más ayuda?</h5>
                      <p>Visita nuestra <a href="/ayuda">página de Ayuda</a> para más información detallada.</p>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Contacto;
