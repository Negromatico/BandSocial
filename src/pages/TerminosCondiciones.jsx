import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { FaFileContract, FaCheckCircle } from 'react-icons/fa';
import './InfoPages.css';

const TerminosCondiciones = () => {
  return (
    <div className="info-page">
      <Container>
        <div className="info-hero">
          <h1 className="info-title">
            <FaFileContract className="me-3" />
            Términos y Condiciones
          </h1>
          <p className="info-subtitle">
            Última actualización: Febrero 2026
          </p>
        </div>

        <Card className="info-card">
          <Card.Body>
            <section className="terms-section">
              <h2 className="section-heading">1. Aceptación de los Términos</h2>
              <p className="section-text">
                Al acceder y utilizar BandSocial, usted acepta estar sujeto a estos Términos y Condiciones, 
                todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de 
                todas las leyes locales aplicables. Si no está de acuerdo con alguno de estos términos, 
                tiene prohibido usar o acceder a este sitio.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">2. Uso de la Plataforma</h2>
              <h3 className="subsection-title">2.1 Registro de Cuenta</h3>
              <p className="section-text">
                Para acceder a ciertas funciones de BandSocial, debe registrarse y crear una cuenta. 
                Usted se compromete a:
              </p>
              <ul className="terms-list">
                <li><FaCheckCircle className="me-2 text-success" />Proporcionar información precisa, actual y completa</li>
                <li><FaCheckCircle className="me-2 text-success" />Mantener la seguridad de su contraseña</li>
                <li><FaCheckCircle className="me-2 text-success" />Notificar inmediatamente cualquier uso no autorizado de su cuenta</li>
                <li><FaCheckCircle className="me-2 text-success" />Ser responsable de todas las actividades que ocurran bajo su cuenta</li>
              </ul>

              <h3 className="subsection-title">2.2 Conducta del Usuario</h3>
              <p className="section-text">
                Al usar BandSocial, usted acepta NO:
              </p>
              <ul className="terms-list">
                <li>Publicar contenido ofensivo, difamatorio, obsceno o ilegal</li>
                <li>Acosar, intimidar o amenazar a otros usuarios</li>
                <li>Violar los derechos de propiedad intelectual de terceros</li>
                <li>Usar la plataforma para actividades fraudulentas o ilegales</li>
                <li>Intentar acceder a cuentas de otros usuarios sin autorización</li>
                <li>Distribuir virus, malware o cualquier código malicioso</li>
                <li>Realizar spam o publicidad no autorizada</li>
              </ul>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">3. Contenido del Usuario</h2>
              <h3 className="subsection-title">3.1 Propiedad del Contenido</h3>
              <p className="section-text">
                Usted conserva todos los derechos de propiedad sobre el contenido que publique en BandSocial. 
                Sin embargo, al publicar contenido, otorga a BandSocial una licencia mundial, no exclusiva, 
                libre de regalías para usar, reproducir, modificar, adaptar y distribuir dicho contenido en 
                conexión con el servicio.
              </p>

              <h3 className="subsection-title">3.2 Responsabilidad del Contenido</h3>
              <p className="section-text">
                Usted es el único responsable del contenido que publica. BandSocial no respalda ni garantiza 
                la exactitud, integridad o utilidad de cualquier contenido publicado por los usuarios.
              </p>

              <h3 className="subsection-title">3.3 Moderación de Contenido</h3>
              <p className="section-text">
                BandSocial se reserva el derecho de revisar, modificar o eliminar cualquier contenido que 
                viole estos términos o que consideremos inapropiado, sin previo aviso.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">4. MusicMarket - Compra y Venta</h2>
              <h3 className="subsection-title">4.1 Transacciones</h3>
              <p className="section-text">
                BandSocial facilita la conexión entre compradores y vendedores de instrumentos y equipos 
                musicales. Las transacciones se realizan directamente entre usuarios. BandSocial no es 
                parte de estas transacciones y no asume responsabilidad por:
              </p>
              <ul className="terms-list">
                <li>La calidad, seguridad o legalidad de los artículos anunciados</li>
                <li>La capacidad de los vendedores para vender artículos</li>
                <li>La capacidad de los compradores para pagar por artículos</li>
                <li>El cumplimiento de las transacciones</li>
              </ul>

              <h3 className="subsection-title">4.2 Responsabilidad del Usuario</h3>
              <p className="section-text">
                Los usuarios son responsables de verificar la autenticidad de los productos, negociar 
                precios y términos, y asegurar el cumplimiento de las leyes aplicables en sus transacciones.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">5. Eventos</h2>
              <p className="section-text">
                BandSocial permite a los usuarios crear y promocionar eventos musicales. Los organizadores 
                de eventos son responsables de:
              </p>
              <ul className="terms-list">
                <li>Obtener todos los permisos y licencias necesarios</li>
                <li>Cumplir con las regulaciones locales de eventos</li>
                <li>Garantizar la seguridad de los asistentes</li>
                <li>Proporcionar información precisa sobre el evento</li>
              </ul>
              <p className="section-text">
                BandSocial no es responsable de eventos organizados a través de la plataforma.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">6. Membresía Premium</h2>
              <p className="section-text">
                BandSocial ofrece planes de membresía premium con funciones adicionales. Los términos 
                específicos incluyen:
              </p>
              <ul className="terms-list">
                <li>Los pagos son procesados de forma segura a través de proveedores de pago terceros</li>
                <li>Las suscripciones se renuevan automáticamente a menos que se cancelen</li>
                <li>Las cancelaciones deben realizarse antes del próximo período de facturación</li>
                <li>No se ofrecen reembolsos por períodos parciales</li>
                <li>BandSocial se reserva el derecho de modificar los precios con previo aviso</li>
              </ul>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">7. Propiedad Intelectual</h2>
              <p className="section-text">
                El contenido, características y funcionalidad de BandSocial son propiedad de BandSocial 
                y están protegidos por derechos de autor, marcas comerciales y otras leyes de propiedad 
                intelectual. No puede copiar, modificar, distribuir o reproducir ningún contenido sin 
                permiso expreso.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">8. Limitación de Responsabilidad</h2>
              <p className="section-text">
                BandSocial se proporciona "tal cual" sin garantías de ningún tipo. No garantizamos que:
              </p>
              <ul className="terms-list">
                <li>El servicio será ininterrumpido o libre de errores</li>
                <li>Los resultados obtenidos serán precisos o confiables</li>
                <li>Los defectos serán corregidos</li>
              </ul>
              <p className="section-text">
                En ningún caso BandSocial será responsable por daños indirectos, incidentales, especiales, 
                consecuentes o punitivos, incluyendo pérdida de beneficios, datos o uso.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">9. Terminación</h2>
              <p className="section-text">
                Podemos terminar o suspender su cuenta y acceso a BandSocial inmediatamente, sin previo 
                aviso o responsabilidad, por cualquier motivo, incluyendo sin limitación si viola los 
                Términos y Condiciones.
              </p>
              <p className="section-text">
                Usted puede cancelar su cuenta en cualquier momento accediendo a la configuración de su 
                perfil.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">10. Modificaciones</h2>
              <p className="section-text">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Le notificaremos 
                sobre cambios significativos publicando los nuevos términos en esta página. Su uso continuado 
                del servicio después de dichos cambios constituye su aceptación de los nuevos términos.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">11. Ley Aplicable</h2>
              <p className="section-text">
                Estos términos se regirán e interpretarán de acuerdo con las leyes de Colombia, sin tener 
                en cuenta sus disposiciones sobre conflictos de leyes. Cualquier disputa relacionada con 
                estos términos estará sujeta a la jurisdicción exclusiva de los tribunales de Colombia.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">12. Contacto</h2>
              <p className="section-text">
                Si tiene preguntas sobre estos Términos y Condiciones, puede contactarnos a través de:
              </p>
              <ul className="terms-list">
                <li>Email: legal@bandsocial.com</li>
                <li>Formulario de contacto en nuestra página de Contacto</li>
              </ul>
            </section>

            <div className="acceptance-notice">
              <p className="text-center mb-0">
                <strong>Al usar BandSocial, usted reconoce que ha leído, entendido y acepta estar sujeto 
                a estos Términos y Condiciones.</strong>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default TerminosCondiciones;
