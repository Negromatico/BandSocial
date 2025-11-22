// Servicio de envío de emails de recuperación de contraseña
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'BandSocial';
const EMAILJS_TEMPLATE_PASSWORD_RESET = import.meta.env.VITE_EMAILJS_TEMPLATE_PASSWORD_RESET || 'template_pcsm0g5';

/**
 * Envía email de recuperación de contraseña
 * @param {Object} data - Datos del usuario
 * @param {string} data.userEmail - Email del usuario
 * @param {string} data.userName - Nombre del usuario
 * @param {string} data.resetLink - Enlace de recuperación de Firebase
 */
export const sendPasswordResetEmail = async (data) => {
  try {
    const templateParams = {
      to_email: data.userEmail,
      user_name: data.userName || 'Usuario',
      reset_link: data.resetLink,
    };

    console.log('📧 Enviando email de recuperación de contraseña a:', data.userEmail);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_PASSWORD_RESET,
      templateParams
    );

    console.log('✅ Email de recuperación enviado exitosamente:', response);

    return {
      success: true,
      message: 'Email de recuperación enviado exitosamente',
      response
    };
  } catch (error) {
    console.error('❌ Error enviando email de recuperación:', error);
    
    return {
      success: false,
      message: 'No se pudo enviar el email de recuperación',
      error: error.message
    };
  }
};

/**
 * Genera el enlace de recuperación de contraseña
 * @param {string} actionCode - Código de acción de Firebase
 * @returns {string} URL completa de recuperación
 */
export const generateResetLink = (actionCode) => {
  const baseUrl = 'https://bandsociall.netlify.app';
  return `${baseUrl}/reset-password?oobCode=${actionCode}`;
};

/**
 * NOTA IMPORTANTE:
 * 
 * Firebase Auth envía automáticamente un email cuando usas sendPasswordResetEmail().
 * Este servicio (EmailJS) es para enviar un email PERSONALIZADO adicional.
 * 
 * PROBLEMA: Firebase no nos da el enlace de reset directamente.
 * 
 * SOLUCIONES:
 * 
 * 1. USAR SOLO FIREBASE AUTH (Recomendado):
 *    - Firebase envía el email automáticamente
 *    - Personaliza el template en Firebase Console
 *    - Ve a: Firebase Console → Authentication → Templates
 * 
 * 2. USAR SOLO EMAILJS (Requiere configuración):
 *    - No uses sendPasswordResetEmail de Firebase
 *    - Genera tu propio token de reset
 *    - Guárdalo en Firestore con expiración
 *    - Envía el email con EmailJS
 * 
 * 3. HÍBRIDO (Actual):
 *    - Firebase envía su email (con enlace funcional)
 *    - EmailJS envía email personalizado (sin enlace funcional)
 *    - Usuario recibe 2 emails
 */
