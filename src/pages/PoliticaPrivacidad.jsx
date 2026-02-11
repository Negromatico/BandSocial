import React from 'react';
import { Container, Card } from 'react-bootstrap';
import { FaShieldAlt, FaLock, FaUserShield } from 'react-icons/fa';
import './InfoPages.css';

const PoliticaPrivacidad = () => {
  return (
    <div className="info-page">
      <Container>
        <div className="info-hero">
          <h1 className="info-title">
            <FaShieldAlt className="me-3" />
            Política de Privacidad
          </h1>
          <p className="info-subtitle">
            Tu privacidad es importante para nosotros - Última actualización: Febrero 2026
          </p>
        </div>

        <Card className="info-card">
          <Card.Body>
            <section className="terms-section">
              <h2 className="section-heading">
                <FaUserShield className="me-2" />
                Introducción
              </h2>
              <p className="section-text">
                En BandSocial, nos comprometemos a proteger su privacidad y sus datos personales. Esta 
                Política de Privacidad explica cómo recopilamos, usamos, compartimos y protegemos su 
                información cuando utiliza nuestra plataforma.
              </p>
              <p className="section-text">
                Al usar BandSocial, usted acepta las prácticas descritas en esta política. Si no está 
                de acuerdo con esta política, por favor no use nuestros servicios.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">1. Información que Recopilamos</h2>
              
              <h3 className="subsection-title">1.1 Información que Usted Proporciona</h3>
              <p className="section-text">Recopilamos información que usted nos proporciona directamente:</p>
              <ul className="terms-list">
                <li><strong>Información de Registro:</strong> Nombre, correo electrónico, contraseña, tipo de perfil (músico, banda, productor, etc.)</li>
                <li><strong>Información de Perfil:</strong> Foto de perfil, biografía, ciudad, géneros musicales, instrumentos, experiencia</li>
                <li><strong>Contenido Publicado:</strong> Publicaciones, comentarios, fotos, videos, música compartida</li>
                <li><strong>Información de Eventos:</strong> Eventos creados, asistencia a eventos</li>
                <li><strong>Información de MusicMarket:</strong> Productos publicados, descripciones, precios, fotos</li>
                <li><strong>Comunicaciones:</strong> Mensajes enviados a otros usuarios, consultas de soporte</li>
                <li><strong>Información de Pago:</strong> Datos de facturación para membresías premium (procesados por proveedores terceros seguros)</li>
              </ul>

              <h3 className="subsection-title">1.2 Información Recopilada Automáticamente</h3>
              <p className="section-text">Cuando usa BandSocial, recopilamos automáticamente:</p>
              <ul className="terms-list">
                <li><strong>Información de Uso:</strong> Páginas visitadas, funciones utilizadas, tiempo en la plataforma</li>
                <li><strong>Información del Dispositivo:</strong> Tipo de dispositivo, sistema operativo, navegador, dirección IP</li>
                <li><strong>Datos de Ubicación:</strong> Ubicación aproximada basada en dirección IP (si está habilitada)</li>
                <li><strong>Cookies y Tecnologías Similares:</strong> Usamos cookies para mejorar su experiencia</li>
              </ul>

              <h3 className="subsection-title">1.3 Información de Terceros</h3>
              <p className="section-text">
                Podemos recibir información sobre usted de terceros, como cuando inicia sesión usando 
                servicios de autenticación de terceros (Google, Facebook, etc.).
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">
                <FaLock className="me-2" />
                2. Cómo Usamos su Información
              </h2>
              <p className="section-text">Utilizamos la información recopilada para:</p>
              <ul className="terms-list">
                <li><strong>Proporcionar el Servicio:</strong> Crear y mantener su cuenta, mostrar su perfil, facilitar conexiones</li>
                <li><strong>Personalización:</strong> Recomendar músicos, eventos y productos relevantes para usted</li>
                <li><strong>Comunicación:</strong> Enviar notificaciones sobre actividad en su cuenta, mensajes, eventos</li>
                <li><strong>Seguridad:</strong> Detectar y prevenir fraude, abuso y actividades ilegales</li>
                <li><strong>Mejora del Servicio:</strong> Analizar el uso para mejorar funciones y experiencia del usuario</li>
                <li><strong>Marketing:</strong> Enviar información sobre nuevas funciones, eventos especiales (con su consentimiento)</li>
                <li><strong>Cumplimiento Legal:</strong> Cumplir con obligaciones legales y resolver disputas</li>
                <li><strong>Procesamiento de Pagos:</strong> Gestionar suscripciones y transacciones</li>
              </ul>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">3. Cómo Compartimos su Información</h2>
              
              <h3 className="subsection-title">3.1 Información Pública</h3>
              <p className="section-text">
                Cierta información de su perfil es pública por defecto y visible para otros usuarios:
              </p>
              <ul className="terms-list">
                <li>Nombre de usuario y foto de perfil</li>
                <li>Biografía y tipo de perfil</li>
                <li>Ciudad y géneros musicales</li>
                <li>Publicaciones y contenido compartido</li>
                <li>Eventos creados o a los que asiste</li>
                <li>Productos en MusicMarket</li>
              </ul>

              <h3 className="subsection-title">3.2 Con Otros Usuarios</h3>
              <p className="section-text">
                Compartimos información con otros usuarios según sus interacciones:
              </p>
              <ul className="terms-list">
                <li>Mensajes directos con usuarios específicos</li>
                <li>Información de contacto cuando acepta conectar con alguien</li>
                <li>Actividad en eventos</li>
              </ul>

              <h3 className="subsection-title">3.3 Con Proveedores de Servicios</h3>
              <p className="section-text">
                Compartimos información con proveedores terceros que nos ayudan a operar BandSocial:
              </p>
              <ul className="terms-list">
                <li>Servicios de hosting y almacenamiento en la nube (Firebase, Google Cloud)</li>
                <li>Procesadores de pago (para membresías premium)</li>
                <li>Servicios de análisis y métricas</li>
                <li>Servicios de email y notificaciones</li>
              </ul>
              <p className="section-text">
                Estos proveedores solo tienen acceso a la información necesaria para realizar sus funciones 
                y están obligados a proteger su información.
              </p>

              <h3 className="subsection-title">3.4 Por Razones Legales</h3>
              <p className="section-text">
                Podemos divulgar su información si es requerido por ley o si creemos de buena fe que es 
                necesario para:
              </p>
              <ul className="terms-list">
                <li>Cumplir con obligaciones legales</li>
                <li>Proteger los derechos y seguridad de BandSocial y sus usuarios</li>
                <li>Prevenir fraude o actividades ilegales</li>
                <li>Responder a solicitudes gubernamentales válidas</li>
              </ul>

              <h3 className="subsection-title">3.5 Transferencia de Negocio</h3>
              <p className="section-text">
                En caso de fusión, adquisición o venta de activos, su información puede ser transferida 
                como parte de esa transacción.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">4. Sus Derechos y Opciones</h2>
              <p className="section-text">Usted tiene los siguientes derechos sobre su información:</p>
              
              <h3 className="subsection-title">4.1 Acceso y Actualización</h3>
              <p className="section-text">
                Puede acceder y actualizar su información de perfil en cualquier momento desde la 
                configuración de su cuenta.
              </p>

              <h3 className="subsection-title">4.2 Eliminación de Cuenta</h3>
              <p className="section-text">
                Puede eliminar su cuenta en cualquier momento. Esto eliminará su perfil y la mayoría de 
                su información personal. Algunos datos pueden conservarse por razones legales o de seguridad.
              </p>

              <h3 className="subsection-title">4.3 Control de Privacidad</h3>
              <p className="section-text">
                Puede controlar la visibilidad de cierta información en la configuración de privacidad:
              </p>
              <ul className="terms-list">
                <li>Quién puede ver su perfil completo</li>
                <li>Quién puede enviarle mensajes</li>
                <li>Notificaciones que desea recibir</li>
              </ul>

              <h3 className="subsection-title">4.4 Cookies</h3>
              <p className="section-text">
                Puede controlar las cookies a través de la configuración de su navegador. Tenga en cuenta 
                que deshabilitar cookies puede afectar la funcionalidad de BandSocial.
              </p>

              <h3 className="subsection-title">4.5 Comunicaciones de Marketing</h3>
              <p className="section-text">
                Puede optar por no recibir comunicaciones de marketing haciendo clic en "cancelar suscripción" 
                en cualquier email o ajustando sus preferencias de notificación.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">5. Seguridad de Datos</h2>
              <p className="section-text">
                Implementamos medidas de seguridad técnicas y organizativas para proteger su información:
              </p>
              <ul className="terms-list">
                <li><strong>Encriptación:</strong> Usamos SSL/TLS para proteger datos en tránsito</li>
                <li><strong>Autenticación:</strong> Contraseñas encriptadas y autenticación segura</li>
                <li><strong>Acceso Limitado:</strong> Solo personal autorizado tiene acceso a datos personales</li>
                <li><strong>Monitoreo:</strong> Monitoreamos sistemas para detectar vulnerabilidades</li>
                <li><strong>Backups:</strong> Realizamos copias de seguridad regulares</li>
              </ul>
              <p className="section-text">
                Sin embargo, ningún método de transmisión por Internet es 100% seguro. No podemos garantizar 
                la seguridad absoluta de su información.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">6. Retención de Datos</h2>
              <p className="section-text">
                Conservamos su información personal mientras su cuenta esté activa o según sea necesario 
                para proporcionar servicios. Después de eliminar su cuenta:
              </p>
              <ul className="terms-list">
                <li>La mayoría de los datos se eliminan dentro de 30 días</li>
                <li>Algunos datos pueden conservarse por razones legales, de seguridad o prevención de fraude</li>
                <li>Las copias de seguridad pueden contener datos hasta 90 días</li>
                <li>Datos anónimos agregados pueden conservarse indefinidamente para análisis</li>
              </ul>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">7. Privacidad de Menores</h2>
              <p className="section-text">
                BandSocial está destinado a usuarios mayores de 13 años. No recopilamos intencionalmente 
                información de menores de 13 años. Si descubrimos que hemos recopilado información de un 
                menor de 13 años, eliminaremos esa información inmediatamente.
              </p>
              <p className="section-text">
                Los usuarios entre 13 y 18 años deben tener el consentimiento de sus padres o tutores para 
                usar BandSocial.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">8. Transferencias Internacionales</h2>
              <p className="section-text">
                Su información puede ser transferida y almacenada en servidores ubicados fuera de Colombia. 
                Al usar BandSocial, usted consiente estas transferencias. Nos aseguramos de que cualquier 
                transferencia cumpla con las leyes de protección de datos aplicables.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">9. Cambios a esta Política</h2>
              <p className="section-text">
                Podemos actualizar esta Política de Privacidad periódicamente. Le notificaremos sobre 
                cambios significativos mediante:
              </p>
              <ul className="terms-list">
                <li>Publicación de la nueva política en esta página</li>
                <li>Actualización de la fecha de "última actualización"</li>
                <li>Notificación por email o en la plataforma para cambios importantes</li>
              </ul>
              <p className="section-text">
                Su uso continuado de BandSocial después de los cambios constituye su aceptación de la 
                política actualizada.
              </p>
            </section>

            <section className="terms-section">
              <h2 className="section-heading">10. Contacto</h2>
              <p className="section-text">
                Si tiene preguntas, inquietudes o solicitudes relacionadas con esta Política de Privacidad 
                o el manejo de sus datos personales, puede contactarnos:
              </p>
              <ul className="terms-list">
                <li><strong>Email:</strong> privacidad@bandsocial.com</li>
                <li><strong>Formulario de Contacto:</strong> Disponible en nuestra página de Contacto</li>
                <li><strong>Configuración de Cuenta:</strong> Para solicitudes de acceso, corrección o eliminación de datos</li>
              </ul>
              <p className="section-text">
                Responderemos a su solicitud dentro de 30 días hábiles.
              </p>
            </section>

            <div className="acceptance-notice">
              <p className="text-center mb-0">
                <strong>
                  <FaShieldAlt className="me-2" />
                  Su privacidad es nuestra prioridad. Nos comprometemos a proteger sus datos y ser 
                  transparentes sobre cómo los usamos.
                </strong>
              </p>
            </div>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default PoliticaPrivacidad;
