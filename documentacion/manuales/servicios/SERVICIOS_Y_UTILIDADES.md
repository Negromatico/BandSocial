# 🔧 Servicios y Utilidades - BandSocial

## Tabla de Contenidos
1. [Servicios de Firebase](#servicios-de-firebase)
2. [Servicio de Cloudinary](#servicio-de-cloudinary)
3. [Servicio de Email](#servicio-de-email)
4. [Servicio de Notificaciones](#servicio-de-notificaciones)
5. [Servicio de Estadísticas](#servicio-de-estadísticas)
6. [API de Colombia](#api-de-colombia)
7. [Custom Hooks](#custom-hooks)
8. [Utilidades](#utilidades)

---

## 1. Servicios de Firebase

### firebase.js

**Ubicación:** `src/services/firebase.js`

**Propósito:** Configuración e inicialización de Firebase.

**Configuración:**
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar servicios
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
```

**Servicios exportados:**
- `auth`: Autenticación de Firebase
- `db`: Firestore Database
- `storage`: Firebase Storage
- `app`: Instancia de Firebase

**Uso:**
```javascript
import { auth, db } from '../services/firebase';

// Autenticación
const user = auth.currentUser;

// Firestore
const docRef = doc(db, 'perfiles', userId);
const docSnap = await getDoc(docRef);

// Storage
const storageRef = ref(storage, 'images/profile.jpg');
```

---

## 2. Servicio de Cloudinary

### cloudinary.js

**Ubicación:** `src/services/cloudinary.js`

**Propósito:** Subir imágenes a Cloudinary CDN.

**Configuración:**
```javascript
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const CLOUDINARY_API_KEY = import.meta.env.VITE_CLOUDINARY_API_KEY;
```

**Función principal:**
```javascript
/**
 * Sube una imagen a Cloudinary
 * @param {File} file - Archivo de imagen
 * @param {Object} options - Opciones de subida
 * @returns {Promise<string>} URL de la imagen subida
 */
export const uploadToCloudinary = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  
  // Opciones adicionales
  if (options.folder) {
    formData.append('folder', options.folder);
  }
  if (options.transformation) {
    formData.append('transformation', JSON.stringify(options.transformation));
  }
  
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!response.ok) {
      throw new Error('Error al subir imagen a Cloudinary');
    }
    
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error en uploadToCloudinary:', error);
    throw error;
  }
};
```

**Funciones auxiliares:**
```javascript
/**
 * Sube múltiples imágenes
 * @param {File[]} files - Array de archivos
 * @returns {Promise<string[]>} Array de URLs
 */
export const uploadMultipleToCloudinary = async (files) => {
  const uploadPromises = files.map(file => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};

/**
 * Elimina una imagen de Cloudinary
 * @param {string} publicId - ID público de la imagen
 * @returns {Promise<void>}
 */
export const deleteFromCloudinary = async (publicId) => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = generateSignature(publicId, timestamp);
  
  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('timestamp', timestamp);
  formData.append('api_key', CLOUDINARY_API_KEY);
  formData.append('signature', signature);
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: 'POST',
      body: formData
    }
  );
  
  return response.json();
};

/**
 * Genera URL de transformación
 * @param {string} url - URL original
 * @param {Object} transformations - Transformaciones
 * @returns {string} URL transformada
 */
export const getTransformedUrl = (url, transformations) => {
  const { width, height, crop = 'fill', quality = 'auto' } = transformations;
  
  const baseUrl = url.split('/upload/')[0];
  const imagePath = url.split('/upload/')[1];
  
  const transform = `w_${width},h_${height},c_${crop},q_${quality}`;
  
  return `${baseUrl}/upload/${transform}/${imagePath}`;
};
```

**Uso:**
```javascript
import { uploadToCloudinary, getTransformedUrl } from '../services/cloudinary';

// Subir imagen
const imageUrl = await uploadToCloudinary(file, {
  folder: 'perfiles',
  transformation: {
    width: 500,
    height: 500,
    crop: 'fill'
  }
});

// Obtener thumbnail
const thumbnailUrl = getTransformedUrl(imageUrl, {
  width: 150,
  height: 150,
  crop: 'thumb'
});
```

---

## 3. Servicio de Email

### emailService.js

**Ubicación:** `src/services/emailService.js`

**Propósito:** Enviar emails usando EmailJS.

**Configuración:**
```javascript
import emailjs from '@emailjs/browser';

const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_CONTACTO = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACTO;
const EMAILJS_TEMPLATE_BIENVENIDA = import.meta.env.VITE_EMAILJS_TEMPLATE_BIENVENIDA;

// Inicializar EmailJS
emailjs.init(EMAILJS_PUBLIC_KEY);
```

**Funciones:**
```javascript
/**
 * Envía email de contacto
 * @param {Object} data - Datos del formulario
 * @returns {Promise<void>}
 */
export const enviarEmailContacto = async (data) => {
  const { nombre, email, asunto, mensaje } = data;
  
  const templateParams = {
    from_name: nombre,
    from_email: email,
    subject: asunto,
    message: mensaje,
    to_email: 'contacto@bandsocial.com'
  };
  
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_CONTACTO,
      templateParams
    );
    
    console.log('Email enviado:', response.status);
    return response;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
};

/**
 * Envía email de bienvenida
 * @param {string} userEmail - Email del usuario
 * @param {string} userName - Nombre del usuario
 * @returns {Promise<void>}
 */
export const enviarEmailBienvenida = async (userEmail, userName) => {
  const templateParams = {
    to_email: userEmail,
    user_name: userName,
    app_name: 'BandSocial'
  };
  
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_BIENVENIDA,
      templateParams
    );
    
    return response;
  } catch (error) {
    console.error('Error al enviar email de bienvenida:', error);
    throw error;
  }
};

/**
 * Envía email de recuperación de contraseña
 * @param {string} userEmail - Email del usuario
 * @param {string} resetLink - Link de recuperación
 * @returns {Promise<void>}
 */
export const enviarEmailRecuperacion = async (userEmail, resetLink) => {
  const templateParams = {
    to_email: userEmail,
    reset_link: resetLink
  };
  
  try {
    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      'template_recuperacion',
      templateParams
    );
    
    return response;
  } catch (error) {
    console.error('Error al enviar email de recuperación:', error);
    throw error;
  }
};
```

**Uso:**
```javascript
import { enviarEmailContacto, enviarEmailBienvenida } from '../services/emailService';

// Email de contacto
await enviarEmailContacto({
  nombre: 'Juan Pérez',
  email: 'juan@example.com',
  asunto: 'Consulta',
  mensaje: 'Hola, tengo una pregunta...'
});

// Email de bienvenida
await enviarEmailBienvenida('nuevo@example.com', 'Nuevo Usuario');
```

---

## 4. Servicio de Notificaciones

### notificationService.js

**Ubicación:** `src/services/notificationService.js`

**Propósito:** Crear y gestionar notificaciones en Firestore.

**Funciones:**
```javascript
import { db } from './firebase';
import { collection, addDoc, serverTimestamp, getDoc, doc } from 'firebase/firestore';

/**
 * Crea una notificación genérica
 * @param {Object} notificationData - Datos de la notificación
 * @returns {Promise<string>} ID de la notificación creada
 */
const crearNotificacion = async (notificationData) => {
  try {
    const docRef = await addDoc(collection(db, 'notificaciones'), {
      ...notificationData,
      leida: false,
      createdAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error al crear notificación:', error);
    throw error;
  }
};

/**
 * Notifica cuando alguien da like a una publicación
 * @param {string} likerUid - UID del usuario que dio like
 * @param {string} publicacionId - ID de la publicación
 * @param {string} autorUid - UID del autor de la publicación
 */
export const notificarLike = async (likerUid, publicacionId, autorUid) => {
  // No notificar si el usuario se da like a sí mismo
  if (likerUid === autorUid) return;
  
  // Obtener nombre del usuario que dio like
  const likerDoc = await getDoc(doc(db, 'perfiles', likerUid));
  const likerNombre = likerDoc.data()?.nombre || 'Alguien';
  
  await crearNotificacion({
    tipo: 'like',
    usuarioId: autorUid,
    origenUid: likerUid,
    origenNombre: likerNombre,
    publicacionId,
    mensaje: `${likerNombre} le dio me gusta a tu publicación`
  });
};

/**
 * Notifica cuando alguien comenta una publicación
 * @param {string} comentadorUid - UID del usuario que comentó
 * @param {string} publicacionId - ID de la publicación
 * @param {string} autorUid - UID del autor de la publicación
 * @param {string} comentario - Texto del comentario
 */
export const notificarComentario = async (comentadorUid, publicacionId, autorUid, comentario) => {
  if (comentadorUid === autorUid) return;
  
  const comentadorDoc = await getDoc(doc(db, 'perfiles', comentadorUid));
  const comentadorNombre = comentadorDoc.data()?.nombre || 'Alguien';
  
  await crearNotificacion({
    tipo: 'comentario',
    usuarioId: autorUid,
    origenUid: comentadorUid,
    origenNombre: comentadorNombre,
    publicacionId,
    comentario: comentario.substring(0, 50),
    mensaje: `${comentadorNombre} comentó tu publicación: "${comentario.substring(0, 30)}..."`
  });
};

/**
 * Notifica cuando alguien te sigue
 * @param {string} seguidorUid - UID del nuevo seguidor
 * @param {string} seguidoUid - UID del usuario seguido
 */
export const notificarNuevoSeguidor = async (seguidorUid, seguidoUid) => {
  const seguidorDoc = await getDoc(doc(db, 'perfiles', seguidorUid));
  const seguidorNombre = seguidorDoc.data()?.nombre || 'Alguien';
  
  await crearNotificacion({
    tipo: 'seguidor',
    usuarioId: seguidoUid,
    origenUid: seguidorUid,
    origenNombre: seguidorNombre,
    mensaje: `${seguidorNombre} comenzó a seguirte`
  });
};

/**
 * Notifica cuando recibes un mensaje
 * @param {string} remitenteUid - UID del remitente
 * @param {string} destinatarioUid - UID del destinatario
 * @param {string} mensaje - Texto del mensaje
 */
export const notificarNuevoMensaje = async (remitenteUid, destinatarioUid, mensaje) => {
  const remitenteDoc = await getDoc(doc(db, 'perfiles', remitenteUid));
  const remitenteNombre = remitenteDoc.data()?.nombre || 'Alguien';
  
  await crearNotificacion({
    tipo: 'mensaje',
    usuarioId: destinatarioUid,
    origenUid: remitenteUid,
    origenNombre: remitenteNombre,
    mensaje: `${remitenteNombre} te envió un mensaje: "${mensaje.substring(0, 30)}..."`
  });
};

/**
 * Notifica cuando te invitan a un evento
 * @param {string} organizadorUid - UID del organizador
 * @param {string} invitadoUid - UID del invitado
 * @param {string} eventoId - ID del evento
 * @param {string} eventoNombre - Nombre del evento
 */
export const notificarInvitacionEvento = async (organizadorUid, invitadoUid, eventoId, eventoNombre) => {
  const organizadorDoc = await getDoc(doc(db, 'perfiles', organizadorUid));
  const organizadorNombre = organizadorDoc.data()?.nombre || 'Alguien';
  
  await crearNotificacion({
    tipo: 'evento',
    usuarioId: invitadoUid,
    origenUid: organizadorUid,
    origenNombre: organizadorNombre,
    eventoId,
    mensaje: `${organizadorNombre} te invitó al evento "${eventoNombre}"`
  });
};
```

**Uso:**
```javascript
import { 
  notificarLike, 
  notificarComentario, 
  notificarNuevoSeguidor 
} from '../services/notificationService';

// Al dar like
await notificarLike(currentUser.uid, publicacionId, autorUid);

// Al comentar
await notificarComentario(currentUser.uid, publicacionId, autorUid, comentario);

// Al seguir
await notificarNuevoSeguidor(currentUser.uid, perfilUid);
```

---

## 5. Servicio de Estadísticas

### estadisticasService.js

**Ubicación:** `src/services/estadisticasService.js`

**Propósito:** Calcular y obtener estadísticas de usuarios.

**Funciones:**
```javascript
import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc,
  orderBy,
  limit
} from 'firebase/firestore';

/**
 * Obtiene estadísticas básicas de un usuario
 * @param {string} userId - UID del usuario
 * @returns {Promise<Object>} Estadísticas del usuario
 */
export const obtenerEstadisticasUsuario = async (userId) => {
  try {
    // Obtener perfil
    const perfilDoc = await getDoc(doc(db, 'perfiles', userId));
    const perfil = perfilDoc.data();
    
    // Contar publicaciones
    const publicacionesQuery = query(
      collection(db, 'publicaciones'),
      where('usuarioId', '==', userId)
    );
    const publicacionesSnap = await getDocs(publicacionesQuery);
    const publicaciones = publicacionesSnap.size;
    
    // Contar eventos
    const eventosQuery = query(
      collection(db, 'eventos'),
      where('creadorId', '==', userId)
    );
    const eventosSnap = await getDocs(eventosQuery);
    const eventos = eventosSnap.size;
    
    // Contar productos
    const productosQuery = query(
      collection(db, 'productos'),
      where('vendedorUid', '==', userId)
    );
    const productosSnap = await getDocs(productosQuery);
    const productos = productosSnap.size;
    
    // Contar likes recibidos
    let totalLikes = 0;
    publicacionesSnap.forEach(doc => {
      const likes = doc.data().likes || [];
      totalLikes += likes.length;
    });
    
    // Contar comentarios recibidos
    let totalComentarios = 0;
    publicacionesSnap.forEach(doc => {
      totalComentarios += doc.data().comentarios || 0;
    });
    
    return {
      publicaciones,
      eventos,
      productos,
      seguidores: perfil?.seguidores?.length || 0,
      siguiendo: perfil?.siguiendo?.length || 0,
      likes: totalLikes,
      comentarios: totalComentarios
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    throw error;
  }
};

/**
 * Obtiene las publicaciones más populares de un usuario
 * @param {string} userId - UID del usuario
 * @param {number} limitCount - Número de publicaciones a obtener
 * @returns {Promise<Array>} Publicaciones ordenadas por likes
 */
export const obtenerPublicacionesPopulares = async (userId, limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'publicaciones'),
      where('usuarioId', '==', userId)
    );
    
    const snapshot = await getDocs(q);
    const publicaciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      likesCount: (doc.data().likes || []).length
    }));
    
    // Ordenar por likes
    publicaciones.sort((a, b) => b.likesCount - a.likesCount);
    
    return publicaciones.slice(0, limitCount);
  } catch (error) {
    console.error('Error al obtener publicaciones populares:', error);
    throw error;
  }
};

/**
 * Obtiene actividad del usuario por período
 * @param {string} userId - UID del usuario
 * @param {number} dias - Número de días hacia atrás
 * @returns {Promise<Object>} Actividad por día
 */
export const obtenerActividadPorPeriodo = async (userId, dias = 30) => {
  try {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);
    
    // Obtener publicaciones del período
    const q = query(
      collection(db, 'publicaciones'),
      where('usuarioId', '==', userId),
      where('createdAt', '>=', fechaInicio)
    );
    
    const snapshot = await getDocs(q);
    
    // Agrupar por día
    const actividadPorDia = {};
    snapshot.forEach(doc => {
      const fecha = doc.data().createdAt?.toDate();
      if (fecha) {
        const dia = fecha.toISOString().split('T')[0];
        actividadPorDia[dia] = (actividadPorDia[dia] || 0) + 1;
      }
    });
    
    return actividadPorDia;
  } catch (error) {
    console.error('Error al obtener actividad:', error);
    throw error;
  }
};
```

### estadisticasAvanzadas.js

**Ubicación:** `src/services/estadisticasAvanzadas.js`

**Propósito:** Estadísticas avanzadas para el panel de administración.

**Funciones:**
```javascript
/**
 * Obtiene estadísticas globales de la plataforma
 * @returns {Promise<Object>} Estadísticas globales
 */
export const obtenerEstadisticasGlobales = async () => {
  try {
    // Total de usuarios
    const usuariosSnap = await getDocs(collection(db, 'perfiles'));
    const totalUsuarios = usuariosSnap.size;
    
    // Total de publicaciones
    const publicacionesSnap = await getDocs(collection(db, 'publicaciones'));
    const totalPublicaciones = publicacionesSnap.size;
    
    // Total de eventos
    const eventosSnap = await getDocs(collection(db, 'eventos'));
    const totalEventos = eventosSnap.size;
    
    // Total de productos
    const productosSnap = await getDocs(collection(db, 'productos'));
    const totalProductos = productosSnap.size;
    
    // Usuarios activos (últimos 30 días)
    const hace30Dias = new Date();
    hace30Dias.setDate(hace30Dias.getDate() - 30);
    
    const usuariosActivosQuery = query(
      collection(db, 'perfiles'),
      where('lastActive', '>=', hace30Dias)
    );
    const usuariosActivosSnap = await getDocs(usuariosActivosQuery);
    const usuariosActivos = usuariosActivosSnap.size;
    
    return {
      totalUsuarios,
      totalPublicaciones,
      totalEventos,
      totalProductos,
      usuariosActivos,
      tasaActividad: ((usuariosActivos / totalUsuarios) * 100).toFixed(2)
    };
  } catch (error) {
    console.error('Error al obtener estadísticas globales:', error);
    throw error;
  }
};

/**
 * Obtiene distribución de usuarios por tipo
 * @returns {Promise<Object>} Distribución de usuarios
 */
export const obtenerDistribucionUsuarios = async () => {
  try {
    const usuariosSnap = await getDocs(collection(db, 'perfiles'));
    
    const distribucion = {
      musico: 0,
      banda: 0,
      premium: 0,
      regular: 0
    };
    
    usuariosSnap.forEach(doc => {
      const data = doc.data();
      
      if (data.type === 'musico') distribucion.musico++;
      if (data.type === 'banda') distribucion.banda++;
      if (data.premium) distribucion.premium++;
      else distribucion.regular++;
    });
    
    return distribucion;
  } catch (error) {
    console.error('Error al obtener distribución:', error);
    throw error;
  }
};

/**
 * Obtiene crecimiento de usuarios por mes
 * @param {number} meses - Número de meses hacia atrás
 * @returns {Promise<Array>} Crecimiento por mes
 */
export const obtenerCrecimientoUsuarios = async (meses = 12) => {
  try {
    const usuariosSnap = await getDocs(collection(db, 'perfiles'));
    
    const crecimientoPorMes = {};
    
    usuariosSnap.forEach(doc => {
      const createdAt = doc.data().createdAt?.toDate();
      if (createdAt) {
        const mes = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
        crecimientoPorMes[mes] = (crecimientoPorMes[mes] || 0) + 1;
      }
    });
    
    // Convertir a array y ordenar
    const crecimiento = Object.entries(crecimientoPorMes)
      .map(([mes, cantidad]) => ({ mes, cantidad }))
      .sort((a, b) => a.mes.localeCompare(b.mes))
      .slice(-meses);
    
    return crecimiento;
  } catch (error) {
    console.error('Error al obtener crecimiento:', error);
    throw error;
  }
};
```

**Uso:**
```javascript
import { 
  obtenerEstadisticasUsuario, 
  obtenerPublicacionesPopulares 
} from '../services/estadisticasService';

// Obtener estadísticas
const stats = await obtenerEstadisticasUsuario(userId);
console.log(`Publicaciones: ${stats.publicaciones}`);
console.log(`Likes: ${stats.likes}`);

// Obtener top publicaciones
const topPosts = await obtenerPublicacionesPopulares(userId, 5);
```

---

## 6. API de Colombia

### colombiaAPI.js

**Ubicación:** `src/services/colombiaAPI.js`

**Propósito:** Obtener datos de departamentos y ciudades de Colombia.

**Funciones:**
```javascript
const API_BASE_URL = 'https://api-colombia.com/api/v1';

/**
 * Obtiene todos los departamentos de Colombia
 * @returns {Promise<Array>} Lista de departamentos
 */
export const obtenerDepartamentos = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/Department`);
    const data = await response.json();
    
    return data.map(dept => ({
      id: dept.id,
      nombre: dept.name,
      codigo: dept.id
    }));
  } catch (error) {
    console.error('Error al obtener departamentos:', error);
    throw error;
  }
};

/**
 * Obtiene todas las ciudades de Colombia
 * @returns {Promise<Array>} Lista de ciudades
 */
export const obtenerCiudades = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/City`);
    const data = await response.json();
    
    return data.map(city => ({
      id: city.id,
      nombre: city.name,
      departamentoId: city.departmentId
    }));
  } catch (error) {
    console.error('Error al obtener ciudades:', error);
    throw error;
  }
};

/**
 * Obtiene ciudades de un departamento específico
 * @param {number} departamentoId - ID del departamento
 * @returns {Promise<Array>} Lista de ciudades del departamento
 */
export const obtenerCiudadesPorDepartamento = async (departamentoId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/Department/${departamentoId}/cities`);
    const data = await response.json();
    
    return data.map(city => ({
      id: city.id,
      nombre: city.name
    }));
  } catch (error) {
    console.error('Error al obtener ciudades del departamento:', error);
    throw error;
  }
};

/**
 * Busca ciudades por nombre
 * @param {string} query - Término de búsqueda
 * @returns {Promise<Array>} Ciudades que coinciden
 */
export const buscarCiudades = async (query) => {
  try {
    const ciudades = await obtenerCiudades();
    
    return ciudades.filter(ciudad =>
      ciudad.nombre.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error al buscar ciudades:', error);
    throw error;
  }
};
```

**Uso:**
```javascript
import { 
  obtenerDepartamentos, 
  obtenerCiudadesPorDepartamento 
} from '../services/colombiaAPI';

// Obtener departamentos
const departamentos = await obtenerDepartamentos();

// Obtener ciudades de un departamento
const ciudades = await obtenerCiudadesPorDepartamento(departamentoId);
```

---

## 7. Custom Hooks

### useColombia.js

**Ubicación:** `src/hooks/useColombia.js`

**Propósito:** Hook para gestionar datos de Colombia.

**Implementación:**
```javascript
import { useState, useEffect } from 'react';
import { 
  obtenerDepartamentos, 
  obtenerCiudadesPorDepartamento 
} from '../services/colombiaAPI';

export const useColombia = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [ciudades, setCiudades] = useState([]);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cargar departamentos al montar
  useEffect(() => {
    const cargarDepartamentos = async () => {
      try {
        setLoading(true);
        const data = await obtenerDepartamentos();
        setDepartamentos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    cargarDepartamentos();
  }, []);
  
  // Cargar ciudades cuando cambia el departamento
  useEffect(() => {
    if (!departamentoSeleccionado) {
      setCiudades([]);
      return;
    }
    
    const cargarCiudades = async () => {
      try {
        setLoading(true);
        const data = await obtenerCiudadesPorDepartamento(departamentoSeleccionado);
        setCiudades(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    cargarCiudades();
  }, [departamentoSeleccionado]);
  
  return {
    departamentos,
    ciudades,
    departamentoSeleccionado,
    setDepartamentoSeleccionado,
    loading,
    error
  };
};
```

**Uso:**
```javascript
import { useColombia } from '../hooks/useColombia';

const MiComponente = () => {
  const { 
    departamentos, 
    ciudades, 
    setDepartamentoSeleccionado 
  } = useColombia();
  
  return (
    <>
      <select onChange={(e) => setDepartamentoSeleccionado(e.target.value)}>
        {departamentos.map(dept => (
          <option key={dept.id} value={dept.id}>
            {dept.nombre}
          </option>
        ))}
      </select>
      
      <select>
        {ciudades.map(city => (
          <option key={city.id} value={city.nombre}>
            {city.nombre}
          </option>
        ))}
      </select>
    </>
  );
};
```

---

### useEstadisticas.js

**Ubicación:** `src/hooks/useEstadisticas.js`

**Propósito:** Hook para obtener estadísticas de usuario.

**Implementación:**
```javascript
import { useState, useEffect } from 'react';
import { obtenerEstadisticasUsuario } from '../services/estadisticasService';

export const useEstadisticas = (userId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (!userId) return;
    
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        const data = await obtenerEstadisticasUsuario(userId);
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    cargarEstadisticas();
  }, [userId]);
  
  const refrescar = async () => {
    try {
      setLoading(true);
      const data = await obtenerEstadisticasUsuario(userId);
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return { stats, loading, error, refrescar };
};
```

**Uso:**
```javascript
import { useEstadisticas } from '../hooks/useEstadisticas';

const PerfilEstadisticas = ({ userId }) => {
  const { stats, loading, error } = useEstadisticas(userId);
  
  if (loading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <p>Publicaciones: {stats.publicaciones}</p>
      <p>Seguidores: {stats.seguidores}</p>
      <p>Likes: {stats.likes}</p>
    </div>
  );
};
```

---

### useImageUpload.js

**Ubicación:** `src/hooks/useImageUpload.js`

**Propósito:** Hook para subir imágenes.

**Implementación:**
```javascript
import { useState } from 'react';
import { uploadToCloudinary } from '../services/cloudinary';

export const useImageUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  
  const uploadImage = async (file, options = {}) => {
    try {
      setUploading(true);
      setError(null);
      setProgress(0);
      
      // Simular progreso (Cloudinary no provee progreso real)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const url = await uploadToCloudinary(file, options);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      return url;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };
  
  const uploadMultiple = async (files, options = {}) => {
    const urls = [];
    
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i], options);
      urls.push(url);
    }
    
    return urls;
  };
  
  return {
    uploadImage,
    uploadMultiple,
    uploading,
    progress,
    error
  };
};
```

**Uso:**
```javascript
import { useImageUpload } from '../hooks/useImageUpload';

const SubirImagen = () => {
  const { uploadImage, uploading, progress } = useImageUpload();
  
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    const url = await uploadImage(file, {
      folder: 'perfiles'
    });
    
    console.log('Imagen subida:', url);
  };
  
  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {uploading && <ProgressBar now={progress} />}
    </div>
  );
};
```

---

### useNotifications.js

**Ubicación:** `src/hooks/useNotifications.js`

**Propósito:** Hook para gestionar notificaciones en tiempo real.

**Implementación:**
```javascript
import { useState, useEffect } from 'react';
import { db, auth } from '../services/firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  updateDoc,
  doc
} from 'firebase/firestore';

export const useNotifications = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    const q = query(
      collection(db, 'notificaciones'),
      where('usuarioId', '==', currentUser.uid),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setNotificaciones(notifs);
      setUnreadCount(notifs.filter(n => !n.leida).length);
      setLoading(false);
    });
    
    return unsubscribe;
  }, []);
  
  const marcarComoLeida = async (notifId) => {
    await updateDoc(doc(db, 'notificaciones', notifId), {
      leida: true
    });
  };
  
  const marcarTodasComoLeidas = async () => {
    const promises = notificaciones
      .filter(n => !n.leida)
      .map(n => marcarComoLeida(n.id));
    
    await Promise.all(promises);
  };
  
  return {
    notificaciones,
    unreadCount,
    loading,
    marcarComoLeida,
    marcarTodasComoLeidas
  };
};
```

**Uso:**
```javascript
import { useNotifications } from '../hooks/useNotifications';

const NotificationBell = () => {
  const { notificaciones, unreadCount, marcarComoLeida } = useNotifications();
  
  return (
    <div>
      <FaBell />
      {unreadCount > 0 && <span>{unreadCount}</span>}
      
      <div className="notifications-dropdown">
        {notificaciones.map(notif => (
          <div 
            key={notif.id}
            onClick={() => marcarComoLeida(notif.id)}
          >
            {notif.mensaje}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 8. Utilidades

### premiumCheck.js

**Ubicación:** `src/utils/premiumCheck.js`

**Propósito:** Verificar si un usuario es premium.

**Funciones:**
```javascript
import { db } from '../services/firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Verifica si un usuario es premium
 * @param {string} uid - UID del usuario
 * @returns {Promise<boolean>} True si es premium
 */
export const esPremium = async (uid) => {
  try {
    const perfilDoc = await getDoc(doc(db, 'perfiles', uid));
    
    if (!perfilDoc.exists()) return false;
    
    const perfil = perfilDoc.data();
    return perfil.premium === true;
  } catch (error) {
    console.error('Error al verificar premium:', error);
    return false;
  }
};

/**
 * Verifica límites de usuario regular
 * @param {string} uid - UID del usuario
 * @param {string} tipo - Tipo de contenido ('publicaciones', 'eventos', 'productos')
 * @returns {Promise<boolean>} True si puede crear más
 */
export const puedeCrearMas = async (uid, tipo) => {
  const isPremium = await esPremium(uid);
  
  // Usuarios premium no tienen límites
  if (isPremium) return true;
  
  // Límites para usuarios regulares
  const limites = {
    publicaciones: 50,
    eventos: 10,
    productos: 20
  };
  
  // Contar contenido actual
  const q = query(
    collection(db, tipo),
    where(tipo === 'publicaciones' ? 'usuarioId' : 
          tipo === 'eventos' ? 'creadorId' : 'vendedorUid', '==', uid)
  );
  
  const snapshot = await getDocs(q);
  const cantidad = snapshot.size;
  
  return cantidad < limites[tipo];
};
```

**Uso:**
```javascript
import { esPremium, puedeCrearMas } from '../utils/premiumCheck';

// Verificar si es premium
const isPremium = await esPremium(userId);

// Verificar si puede crear más publicaciones
const puedePublicar = await puedeCrearMas(userId, 'publicaciones');
if (!puedePublicar) {
  // Mostrar modal de upgrade
}
```

---

### validators.js

**Ubicación:** `src/utils/validators.js`

**Propósito:** Funciones de validación.

**Funciones:**
```javascript
/**
 * Valida un email
 * @param {string} email - Email a validar
 * @returns {boolean} True si es válido
 */
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida una contraseña
 * @param {string} password - Contraseña a validar
 * @returns {Object} { valida: boolean, errores: string[] }
 */
export const validarPassword = (password) => {
  const errores = [];
  
  if (password.length < 6) {
    errores.push('Debe tener al menos 6 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errores.push('Debe contener al menos una mayúscula');
  }
  if (!/[0-9]/.test(password)) {
    errores.push('Debe contener al menos un número');
  }
  
  return {
    valida: errores.length === 0,
    errores
  };
};

/**
 * Valida una URL
 * @param {string} url - URL a validar
 * @returns {boolean} True si es válida
 */
export const validarUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valida un número de teléfono colombiano
 * @param {string} telefono - Teléfono a validar
 * @returns {boolean} True si es válido
 */
export const validarTelefono = (telefono) => {
  // Formato: 3XX XXX XXXX
  const regex = /^3\d{9}$/;
  return regex.test(telefono.replace(/\s/g, ''));
};

/**
 * Sanitiza texto para prevenir XSS
 * @param {string} texto - Texto a sanitizar
 * @returns {string} Texto sanitizado
 */
export const sanitizarTexto = (texto) => {
  const map = {
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;'
  };
  
  return texto.replace(/[<>"'/]/g, (char) => map[char]);
};
```

**Uso:**
```javascript
import { validarEmail, validarPassword } from '../utils/validators';

// Validar email
if (!validarEmail(email)) {
  setError('Email inválido');
}

// Validar password
const { valida, errores } = validarPassword(password);
if (!valida) {
  setErrors(errores);
}
```

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026
