import { db } from './firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';

/**
 * Crear una notificación en Firestore
 * @param {string} usuarioId - UID del usuario que recibirá la notificación
 * @param {string} tipo - Tipo de notificación (seguidor, like, comentario, producto, evento)
 * @param {string} mensaje - Mensaje de la notificación
 * @param {string} origenUid - UID del usuario que generó la notificación
 * @param {string} referenciaId - ID del documento relacionado (opcional)
 */
export const crearNotificacion = async (usuarioId, tipo, mensaje, origenUid, referenciaId = null) => {
  try {
    // No crear notificación si el usuario se notifica a sí mismo
    if (usuarioId === origenUid) {
      return null;
    }

    const notificacion = {
      usuarioId,
      tipo,
      mensaje,
      origenUid,
      referenciaId,
      leida: false,
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'notificaciones'), notificacion);
    return docRef.id;
  } catch (error) {
    console.error('Error creando notificación:', error);
    return null;
  }
};

/**
 * Crear notificación cuando alguien te sigue
 */
export const notificarNuevoSeguidor = async (seguidorUid, seguidoUid) => {
  try {
    // Obtener nombre del seguidor
    const seguidorSnap = await getDoc(doc(db, 'perfiles', seguidorUid));
    const seguidorNombre = seguidorSnap.exists() 
      ? (seguidorSnap.data().nombre || 'Alguien')
      : 'Alguien';

    const mensaje = `${seguidorNombre} ha comenzado a seguirte`;
    
    return await crearNotificacion(
      seguidoUid,
      'seguidor',
      mensaje,
      seguidorUid
    );
  } catch (error) {
    console.error('Error en notificarNuevoSeguidor:', error);
    return null;
  }
};

/**
 * Crear notificación cuando alguien le da like a tu publicación
 */
export const notificarLike = async (likerUid, publicacionAutorUid, publicacionId) => {
  try {
    const likerSnap = await getDoc(doc(db, 'perfiles', likerUid));
    const likerNombre = likerSnap.exists() 
      ? (likerSnap.data().nombre || 'Alguien')
      : 'Alguien';

    const mensaje = `A ${likerNombre} le gustó tu publicación`;
    
    return await crearNotificacion(
      publicacionAutorUid,
      'like',
      mensaje,
      likerUid,
      publicacionId
    );
  } catch (error) {
    console.error('Error en notificarLike:', error);
    return null;
  }
};

/**
 * Crear notificación cuando alguien comenta tu publicación
 */
export const notificarComentario = async (comentadorUid, publicacionAutorUid, publicacionId) => {
  try {
    const comentadorSnap = await getDoc(doc(db, 'perfiles', comentadorUid));
    const comentadorNombre = comentadorSnap.exists() 
      ? (comentadorSnap.data().nombre || 'Alguien')
      : 'Alguien';

    const mensaje = `${comentadorNombre} comentó tu publicación`;
    
    return await crearNotificacion(
      publicacionAutorUid,
      'comentario',
      mensaje,
      comentadorUid,
      publicacionId
    );
  } catch (error) {
    console.error('Error en notificarComentario:', error);
    return null;
  }
};

/**
 * Crear notificación cuando alguien publica un producto
 */
export const notificarNuevoProducto = async (vendedorUid, productoId, productoNombre) => {
  try {
    // Obtener seguidores del vendedor
    const vendedorSnap = await getDoc(doc(db, 'perfiles', vendedorUid));
    if (!vendedorSnap.exists()) return;

    const vendedorData = vendedorSnap.data();
    const seguidores = vendedorData.seguidores || [];
    const vendedorNombre = vendedorData.nombre || 'Un músico';

    // Crear notificación para cada seguidor
    const notificaciones = seguidores.map(seguidorUid => 
      crearNotificacion(
        seguidorUid,
        'producto',
        `${vendedorNombre} publicó un nuevo producto: ${productoNombre}`,
        vendedorUid,
        productoId
      )
    );

    await Promise.all(notificaciones);
  } catch (error) {
    console.error('Error en notificarNuevoProducto:', error);
  }
};

/**
 * Crear notificación cuando alguien crea un evento
 */
export const notificarNuevoEvento = async (creadorUid, eventoId, eventoNombre) => {
  try {
    // Obtener seguidores del creador
    const creadorSnap = await getDoc(doc(db, 'perfiles', creadorUid));
    if (!creadorSnap.exists()) return;

    const creadorData = creadorSnap.data();
    const seguidores = creadorData.seguidores || [];
    const creadorNombre = creadorData.nombre || 'Un músico';

    // Crear notificación para cada seguidor
    const notificaciones = seguidores.map(seguidorUid => 
      crearNotificacion(
        seguidorUid,
        'evento',
        `${creadorNombre} creó un nuevo evento: ${eventoNombre}`,
        creadorUid,
        eventoId
      )
    );

    await Promise.all(notificaciones);
  } catch (error) {
    console.error('Error en notificarNuevoEvento:', error);
  }
};
