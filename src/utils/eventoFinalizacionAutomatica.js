import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { enviarNotificacion } from '../services/notificaciones';
import { db } from '../services/firebase';

// Marca eventos vencidos como finalizados y notifica asistentes
export async function finalizarEventosVencidos() {
  const eventosRef = collection(db, 'eventos');
  const snapshot = await getDocs(eventosRef);
  const now = new Date();

  for (const d of snapshot.docs) {
    const ev = d.data();
    if (!ev.finalizado && ev.fecha && ev.hora) {
      const fechaHora = new Date(ev.fecha + 'T' + (ev.hora || '00:00'));
      if (fechaHora <= now) {
        // Marcar como finalizado
        await updateDoc(doc(db, 'eventos', d.id), { finalizado: true });
        // Notificar a asistentes (excepto creador)
        if (Array.isArray(ev.asistentes)) {
          for (const uid of ev.asistentes) {
            if (uid !== ev.creador) {
              await enviarNotificacion(uid, {
                type: 'event_finalized',
                text: `El evento "${ev.titulo}" ha finalizado automáticamente.`,
                link: `/eventos/${d.id}`
              });
            }
          }
        }
      }
    }
  }
}
