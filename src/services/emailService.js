// Servicio de envío de correos electrónicos
// Usando EmailJS (GRATIS) para envío de correos
import emailjs from '@emailjs/browser';

// Configuración de EmailJS (GRATIS - hasta 200 emails/mes)
// Regístrate en: https://www.emailjs.com/
// Sigue las instrucciones en: EMAILJS_SETUP.md

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_bandsocial';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_subscription';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';

// Inicializar EmailJS si hay Public Key configurada
if (EMAILJS_PUBLIC_KEY && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log('✅ EmailJS inicializado correctamente');
} else {
  console.warn('⚠️ EmailJS no configurado. Configura las variables de entorno en .env');
  console.warn('📖 Lee EMAILJS_SETUP.md para instrucciones detalladas');
}

/**
 * Envía un correo de confirmación de suscripción Premium
 * @param {Object} data - Datos del usuario y suscripción
 * @param {string} data.userEmail - Email del usuario
 * @param {string} data.userName - Nombre del usuario
 * @param {string} data.planName - Nombre del plan (Premium)
 * @param {number} data.amount - Monto pagado
 * @param {string} data.startDate - Fecha de inicio
 * @param {string} data.endDate - Fecha de fin
 */
export const sendSubscriptionConfirmationEmail = async (data) => {
  try {
    // Preparar datos para el template de EmailJS
    const templateParams = {
      to_email: data.userEmail,
      to_name: data.userName,
      plan_name: data.planName,
      amount: `$${data.amount.toLocaleString('es-CO')} COP`,
      start_date: new Date(data.startDate).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      end_date: new Date(data.endDate).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      transaction_id: data.transactionId || `BS-${Date.now()}`,
      payment_method: data.paymentMethod || 'Tarjeta de Crédito',
      // HTML del correo
      message_html: generateSubscriptionEmailHTML(data)
    };

    console.log('📧 Enviando correo de confirmación a:', data.userEmail);
    console.log('🔍 Template Params:', templateParams);
    console.log('🔍 Service ID:', EMAILJS_SERVICE_ID);
    console.log('🔍 Template ID:', EMAILJS_TEMPLATE_ID);

    // Enviar email usando EmailJS
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams
    );

    console.log('✅ Correo enviado exitosamente:', response);

    return {
      success: true,
      message: 'Correo de confirmación enviado exitosamente',
      response
    };
  } catch (error) {
    console.error('❌ Error enviando correo:', error);
    
    // Si falla, al menos registrar en consola
    console.log('📋 Datos del correo que se intentó enviar:', {
      email: data.userEmail,
      plan: data.planName,
      amount: data.amount
    });

    return {
      success: false,
      message: 'No se pudo enviar el correo de confirmación',
      error: error.message
    };
  }
};

/**
 * Genera el HTML del correo de confirmación
 * @param {Object} data - Datos de la suscripción
 * @returns {string} HTML del correo
 */
export const generateSubscriptionEmailHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-label { font-weight: 600; color: #666; }
        .detail-value { color: #333; }
        .total { background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
        .benefits { background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .benefit-item { padding: 8px 0; display: flex; align-items: center; }
        .benefit-icon { color: #667eea; margin-right: 10px; font-size: 20px; }
        .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">🎸 BANDSOCIAL</div>
          <h2>¡Bienvenido a Premium! 👑</h2>
        </div>
        
        <div class="content">
          <h3>Hola ${data.userName},</h3>
          <p>¡Gracias por unirte a BandSocial Premium! Tu suscripción ha sido activada exitosamente.</p>
          
          <div class="card">
            <h4 style="margin-top: 0; color: #667eea;">📋 Detalles de tu Suscripción</h4>
            <div class="detail-row">
              <span class="detail-label">Plan:</span>
              <span class="detail-value">${data.planName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha de Inicio:</span>
              <span class="detail-value">${new Date(data.startDate).toLocaleDateString('es-CO')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Fecha de Renovación:</span>
              <span class="detail-value">${new Date(data.endDate).toLocaleDateString('es-CO')}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">ID de Transacción:</span>
              <span class="detail-value">${data.transactionId || `BS-${Date.now()}`}</span>
            </div>
            <div class="detail-row" style="border-bottom: none;">
              <span class="detail-label">Método de Pago:</span>
              <span class="detail-value">${data.paymentMethod || 'Tarjeta de Crédito'}</span>
            </div>
          </div>
          
          <div class="total">
            Total Pagado: $${data.amount.toLocaleString('es-CO')} COP
          </div>
          
          <div class="benefits">
            <h4 style="margin-top: 0; color: #667eea;">✨ Beneficios de tu Plan Premium</h4>
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <span>Publicaciones ilimitadas</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <span>Productos ilimitados en MusicMarket</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <span>Eventos ilimitados</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <span>Insignia Premium en tu perfil</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <span>Soporte prioritario</span>
            </div>
            <div class="benefit-item">
              <span class="benefit-icon">✓</span>
              <span>Acceso a funciones exclusivas</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="https://bandsociall.netlify.app/profile" class="button">
              Ver Mi Perfil Premium
            </a>
          </div>
          
          <p style="margin-top: 30px; color: #666; font-size: 14px;">
            <strong>Nota:</strong> Tu suscripción se renovará automáticamente el ${new Date(data.endDate).toLocaleDateString('es-CO')}. 
            Puedes cancelar en cualquier momento desde tu perfil.
          </p>
        </div>
        
        <div class="footer">
          <p>Este es un correo automático, por favor no responder.</p>
          <p>© 2025 BandSocial - Red Social Musical de Colombia</p>
          <p>¿Necesitas ayuda? Contáctanos en soporte@bandsocial.com</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
