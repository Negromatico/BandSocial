import React, { useState } from 'react';
import { Container, Row, Col, Card, Accordion, Form, InputGroup } from 'react-bootstrap';
import { FaQuestionCircle, FaSearch, FaUser, FaCalendarAlt, FaShoppingCart, FaCreditCard, FaShieldAlt, FaMusic, FaEnvelope } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './InfoPages.css';

const Ayuda = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const faqCategories = [
    {
      title: 'Cuenta y Perfil',
      icon: <FaUser />,
      questions: [
        {
          q: '¿Cómo creo una cuenta en BandSocial?',
          a: 'Para crear una cuenta, haz clic en el botón "Registrarse" en la página principal. Completa el formulario con tu nombre, email, contraseña y selecciona el tipo de perfil (músico, banda, productor, etc.). Recibirás un email de confirmación para activar tu cuenta.'
        },
        {
          q: '¿Cómo edito mi perfil?',
          a: 'Ve a tu perfil haciendo clic en tu foto de perfil en la esquina superior derecha, luego selecciona "Editar Perfil". Allí podrás actualizar tu foto, biografía, ciudad, géneros musicales, instrumentos y más información.'
        },
        {
          q: '¿Puedo cambiar mi tipo de perfil después de registrarme?',
          a: 'Sí, puedes cambiar tu tipo de perfil en la configuración de tu cuenta. Ve a "Configuración" > "Tipo de Perfil" y selecciona el nuevo tipo que mejor te represente.'
        },
        {
          q: '¿Cómo recupero mi contraseña?',
          a: 'En la página de inicio de sesión, haz clic en "¿Olvidaste tu contraseña?". Ingresa tu email registrado y recibirás un enlace para restablecer tu contraseña.'
        },
        {
          q: '¿Cómo elimino mi cuenta?',
          a: 'Ve a "Configuración" > "Cuenta" > "Eliminar Cuenta". Ten en cuenta que esta acción es permanente y eliminará toda tu información, publicaciones y conexiones.'
        },
        {
          q: '¿Puedo tener múltiples perfiles?',
          a: 'Cada usuario puede tener una cuenta personal. Si tienes una banda, puedes crear un perfil de banda separado con un email diferente, o agregar información de tu banda en tu perfil personal.'
        }
      ]
    },
    {
      title: 'Publicaciones y Contenido',
      icon: <FaMusic />,
      questions: [
        {
          q: '¿Cómo creo una publicación?',
          a: 'En la página de inicio, verás un cuadro que dice "¿Qué quieres publicar el día de hoy?". Haz clic allí, escribe tu mensaje, agrega fotos o videos si deseas, y presiona "Publicar".'
        },
        {
          q: '¿Qué tipo de contenido puedo compartir?',
          a: 'Puedes compartir texto, fotos, videos, enlaces a tu música, anuncios de conciertos, colaboraciones que buscas, y cualquier contenido relacionado con la música que respete nuestros términos de uso.'
        },
        {
          q: '¿Puedo editar o eliminar una publicación después de publicarla?',
          a: 'Sí, haz clic en los tres puntos en la esquina superior derecha de tu publicación y selecciona "Editar" o "Eliminar".'
        },
        {
          q: '¿Cómo reacciono o comento en publicaciones?',
          a: 'Debajo de cada publicación encontrarás botones para dar "Me gusta" (corazón) y "Comentar". Haz clic en el botón correspondiente para interactuar.'
        },
        {
          q: '¿Puedo compartir música directamente en mi perfil?',
          a: 'Sí, puedes compartir enlaces de plataformas como YouTube, SoundCloud, Spotify, etc. También puedes subir videos directamente a tus publicaciones.'
        }
      ]
    },
    {
      title: 'Eventos',
      icon: <FaCalendarAlt />,
      questions: [
        {
          q: '¿Cómo creo un evento?',
          a: 'Ve a la sección "Eventos" y haz clic en "Crear Evento". Completa la información: nombre del evento, fecha, hora, ubicación, descripción, precio (si aplica) y sube una imagen. Luego publica tu evento.'
        },
        {
          q: '¿Puedo editar un evento después de crearlo?',
          a: 'Sí, ve a tu evento y haz clic en "Editar Evento". Puedes modificar cualquier información. Los usuarios que marcaron asistencia recibirán una notificación de los cambios.'
        },
        {
          q: '¿Cómo me registro para asistir a un evento?',
          a: 'En la página del evento, haz clic en el botón "Asistiré" o "Me interesa". Recibirás notificaciones sobre actualizaciones del evento.'
        },
        {
          q: '¿Puedo cancelar un evento?',
          a: 'Sí, como organizador puedes cancelar un evento desde la página de edición. Todos los usuarios registrados recibirán una notificación de cancelación.'
        },
        {
          q: '¿Los eventos son gratuitos o de pago?',
          a: 'Puedes crear tanto eventos gratuitos como de pago. Para eventos de pago, especifica el precio en la descripción. Las transacciones se manejan directamente entre organizadores y asistentes.'
        }
      ]
    },
    {
      title: 'MusicMarket',
      icon: <FaShoppingCart />,
      questions: [
        {
          q: '¿Cómo vendo un instrumento o equipo?',
          a: 'Ve a "MusicMarket" y haz clic en "Vender Producto". Completa el formulario con fotos, descripción, precio, condición del artículo y tu información de contacto. Publica tu anuncio.'
        },
        {
          q: '¿Cómo compro un producto?',
          a: 'Navega por MusicMarket, encuentra el producto que te interesa y haz clic en "Contactar Vendedor". Podrás enviar un mensaje directo al vendedor para coordinar la compra.'
        },
        {
          q: '¿BandSocial procesa los pagos?',
          a: 'No, BandSocial es una plataforma de conexión. Las transacciones y pagos se realizan directamente entre compradores y vendedores. Recomendamos usar métodos de pago seguros y verificar los productos antes de comprar.'
        },
        {
          q: '¿Puedo reportar un producto sospechoso?',
          a: 'Sí, en cada anuncio hay un botón "Reportar". Si encuentras algo sospechoso o que viole nuestros términos, repórtalo y nuestro equipo lo revisará.'
        },
        {
          q: '¿Hay comisiones por vender en MusicMarket?',
          a: 'No, publicar y vender en MusicMarket es completamente gratis para todos los usuarios.'
        }
      ]
    },
    {
      title: 'Membresía Premium',
      icon: <FaCreditCard />,
      questions: [
        {
          q: '¿Qué beneficios ofrece la membresía Premium?',
          a: 'La membresía Premium incluye: perfil destacado con insignia PRO, mayor visibilidad en búsquedas, publicaciones destacadas, acceso prioritario a eventos, estadísticas avanzadas de perfil, y más funciones exclusivas.'
        },
        {
          q: '¿Cuánto cuesta la membresía Premium?',
          a: 'Ofrecemos planes mensuales y anuales. Visita la sección "Membresía" para ver los precios actuales y opciones de pago.'
        },
        {
          q: '¿Cómo me suscribo a Premium?',
          a: 'Ve a "Membresía" en el menú principal, selecciona el plan que prefieras y completa el proceso de pago seguro. Tu membresía se activará inmediatamente.'
        },
        {
          q: '¿Puedo cancelar mi suscripción Premium?',
          a: 'Sí, puedes cancelar en cualquier momento desde "Configuración" > "Membresía". Tu acceso Premium continuará hasta el final del período pagado.'
        },
        {
          q: '¿Ofrecen reembolsos?',
          a: 'Las suscripciones no son reembolsables, pero puedes cancelar en cualquier momento para evitar cargos futuros.'
        }
      ]
    },
    {
      title: 'Privacidad y Seguridad',
      icon: <FaShieldAlt />,
      questions: [
        {
          q: '¿Mi información está segura?',
          a: 'Sí, usamos encriptación SSL/TLS y medidas de seguridad avanzadas para proteger tu información. Lee nuestra Política de Privacidad para más detalles.'
        },
        {
          q: '¿Quién puede ver mi perfil?',
          a: 'Por defecto, tu perfil es público y visible para todos los usuarios. Puedes ajustar la privacidad en "Configuración" > "Privacidad" para controlar qué información es visible.'
        },
        {
          q: '¿Cómo reporto un usuario o contenido inapropiado?',
          a: 'Haz clic en los tres puntos en cualquier publicación o perfil y selecciona "Reportar". Nuestro equipo revisará el reporte en 24-48 horas.'
        },
        {
          q: '¿Cómo bloqueo a un usuario?',
          a: 'Ve al perfil del usuario que deseas bloquear, haz clic en los tres puntos y selecciona "Bloquear". No podrán ver tu perfil ni contactarte.'
        },
        {
          q: '¿Puedo controlar quién me envía mensajes?',
          a: 'Sí, en "Configuración" > "Privacidad" > "Mensajes" puedes elegir si todos pueden enviarte mensajes o solo tus conexiones.'
        }
      ]
    }
  ];

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(
      item =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="info-page">
      <Container>
        <div className="info-hero">
          <h1 className="info-title">
            <FaQuestionCircle className="me-3" />
            Centro de Ayuda
          </h1>
          <p className="info-subtitle">
            Encuentra respuestas a tus preguntas sobre BandSocial
          </p>
        </div>

        {/* Buscador */}
        <Row className="mb-5">
          <Col lg={8} className="mx-auto">
            <Card className="search-card">
              <Card.Body>
                <InputGroup size="lg">
                  <InputGroup.Text>
                    <FaSearch />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Busca tu pregunta aquí..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </InputGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Categorías de FAQ */}
        <Row>
          <Col>
            {filteredCategories.length === 0 ? (
              <Card className="info-card text-center">
                <Card.Body>
                  <p className="mb-0">No se encontraron resultados para "{searchTerm}"</p>
                  <p className="text-muted">Intenta con otros términos de búsqueda</p>
                </Card.Body>
              </Card>
            ) : (
              filteredCategories.map((category, idx) => (
                <Card className="info-card mb-4" key={idx}>
                  <Card.Body>
                    <h2 className="section-heading mb-4">
                      <span className="category-icon">{category.icon}</span>
                      {category.title}
                    </h2>
                    <Accordion>
                      {category.questions.map((item, qIdx) => (
                        <Accordion.Item eventKey={`${idx}-${qIdx}`} key={qIdx}>
                          <Accordion.Header>{item.q}</Accordion.Header>
                          <Accordion.Body>{item.a}</Accordion.Body>
                        </Accordion.Item>
                      ))}
                    </Accordion>
                  </Card.Body>
                </Card>
              ))
            )}
          </Col>
        </Row>

        {/* Recursos Adicionales */}
        <Row className="mt-5">
          <Col>
            <Card className="info-card">
              <Card.Body>
                <h2 className="section-heading mb-4">Recursos Adicionales</h2>
                <Row>
                  <Col md={4} className="mb-3">
                    <div className="resource-box">
                      <FaEnvelope className="resource-icon" />
                      <h4>Contacto</h4>
                      <p>¿No encontraste lo que buscabas? Contáctanos directamente.</p>
                      <Link to="/contacto" className="btn btn-outline-primary btn-sm">
                        Ir a Contacto
                      </Link>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="resource-box">
                      <FaShieldAlt className="resource-icon" />
                      <h4>Privacidad</h4>
                      <p>Conoce cómo protegemos tu información personal.</p>
                      <Link to="/privacidad" className="btn btn-outline-primary btn-sm">
                        Ver Política
                      </Link>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div className="resource-box">
                      <FaUser className="resource-icon" />
                      <h4>Términos</h4>
                      <p>Lee nuestros términos y condiciones de uso.</p>
                      <Link to="/terminos" className="btn btn-outline-primary btn-sm">
                        Ver Términos
                      </Link>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Soporte Directo */}
        <Row className="mt-4">
          <Col>
            <div className="support-cta text-center">
              <h3 className="mb-3">¿Aún necesitas ayuda?</h3>
              <p className="mb-4">Nuestro equipo de soporte está listo para ayudarte</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/contacto" className="btn btn-primary btn-lg">
                  <FaEnvelope className="me-2" />
                  Contactar Soporte
                </Link>
                <a href="mailto:soporte@bandsocial.com" className="btn btn-outline-primary btn-lg">
                  soporte@bandsocial.com
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Ayuda;
