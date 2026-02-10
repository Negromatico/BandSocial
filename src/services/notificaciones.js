import { db } from './firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

/**
 * Envía una notificación a un usuario
 * @param {string} userId - UID del usuario receptor
 * @param {object} noti - { type, text, link, extra }
 */
export async function enviarNotificacion(userId, { type, text, link = '', extra = {} }) {
  if (!userId) return;
  await addDoc(collection(db, 'notificaciones'), {
    usuarioId: userId,
    tipo: type,
    mensaje: text,
    link,
    createdAt: Timestamp.now(),
    leida: false,
    ...extra,
  });
}
