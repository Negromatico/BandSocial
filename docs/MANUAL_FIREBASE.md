# MANUAL DE CONFIGURACIÓN FIREBASE - BANDSOCIAL

## 📋 INFORMACIÓN GENERAL

**Proyecto:** BandSocial  
**Firebase Project ID:** bandsocial-xxxxx  
**Región:** us-central1

---

## 🔥 SERVICIOS DE FIREBASE UTILIZADOS

1. **Authentication** - Autenticación de usuarios
2. **Firestore Database** - Base de datos NoSQL
3. **Storage** - Almacenamiento de archivos
4. **Hosting** - (Opcional, actualmente en Netlify)

---

## 🔐 FIREBASE AUTHENTICATION

### Métodos de Autenticación Habilitados

- **Email/Password** ✅ Activo
- Google (Deshabilitado)
- Facebook (Deshabilitado)

### Configuración

1. Ir a Firebase Console
2. Authentication > Sign-in method
3. Habilitar Email/Password
4. Configurar dominio autorizado: `bandsociall.netlify.app`

### Usuarios Especiales

**Administrador:**
- Email: `estebanber24@gmail.com`
- Permisos: Acceso total al panel de administrador

---

## 📊 FIRESTORE DATABASE

### Estructura de Colecciones

```
firestore/
├── perfiles/
│   └── {userId}/
│       ├── nombre: string
│       ├── email: string
│       ├── fotoPerfil: string
│       ├── type: string
│       ├── ciudad: string
│       ├── departamento: string
│       ├── generos: array
│       ├── instrumentos: array
│       ├── bio: string
│       ├── seguidores: array
│       ├── siguiendo: array
│       ├── planActual: string
│       ├── fechaPremium: timestamp
│       ├── baneado: boolean
│       ├── cuentaDesactivada: boolean
│       └── createdAt: timestamp
│
├── publicaciones/
│   └── {publicacionId}/
│       ├── autorUid: string
│       ├── autorNombre: string
│       ├── autorFoto: string
│       ├── contenido: string
│       ├── imagen: string
│       ├── tipo: string
│       ├── reacciones: map
│       ├── createdAt: timestamp
│       └── comentarios/ (subcolección)
│           └── {comentarioId}/
│               ├── autorUid: string
│               ├── autorNombre: string
│               ├── texto: string
│               └── createdAt: timestamp
│
├── eventos/
│   └── {eventoId}/
│       ├── titulo: string
│       ├── descripcion: string
│       ├── fecha: string
│       ├── hora: string
│       ├── lugar: string
│       ├── ciudad: string
│       ├── direccion: string
│       ├── precio: number
│       ├── tipo: string
│       ├── generos: array
│       ├── capacidad: number
│       ├── imagen: string
│       ├── creadorUid: string
│       ├── creadorNombre: string
│       ├── asistentes: array
│       └── createdAt: timestamp
│
├── productos/
│   └── {productoId}/
│       ├── nombre: string
│       ├── descripcion: string
│       ├── precio: number
│       ├── ubicacion: string
│       ├── categoria: string
│       ├── estado: string
│       ├── imagen: string
│       ├── vendedorUid: string
│       ├── vendedorNombre: string
│       ├── rating: number
│       ├── resenas: number
│       └── createdAt: timestamp
│
├── conversaciones/
│   └── {conversacionId}/
│       ├── participantes: array
│       ├── ultimoMensaje: string
│       ├── ultimoMensajeFecha: timestamp
│       ├── noLeidos: map
│       └── mensajes/ (subcolección)
│           └── {mensajeId}/
│               ├── remitenteUid: string
│               ├── texto: string
│               ├── leido: boolean
│               └── createdAt: timestamp
│
├── notificaciones/
│   └── {notificacionId}/
│       ├── usuarioId: string
│       ├── tipo: string
│       ├── mensaje: string
│       ├── origenUid: string
│       ├── origenNombre: string
│       ├── leida: boolean
│       ├── link: string
│       └── createdAt: timestamp
│
├── encuestasEliminacion/
│   └── {encuestaId}/
│       ├── usuarioId: string
│       ├── razon: string
│       ├── comentarios: string
│       ├── accion: string
│       ├── perfilTipo: string
│       ├── planActual: string
│       └── fecha: timestamp
│
├── grupos/
│   └── {grupoId}/
│       ├── nombre: string
│       ├── descripcion: string
│       ├── creadorUid: string
│       ├── miembros: array
│       └── createdAt: timestamp
│
└── pagos/
    └── {pagoId}/
        ├── usuarioId: string
        ├── monto: number
        ├── plan: string
        ├── estado: string
        ├── metodoPago: string
        └── fecha: timestamp
```

### Índices Compuestos Necesarios

Ver archivo `FIRESTORE_INDICES.md` para la lista completa de índices.

**Índices Principales:**

1. **publicaciones**
   - `createdAt` (DESC)

2. **eventos**
   - `ciudad` (ASC) + `fecha` (ASC)
   - `generos` (ARRAY) + `fecha` (ASC)
   - `tipo` (ASC) + `fecha` (ASC)

3. **productos**
   - `ciudad` (ASC) + `createdAt` (DESC)
   - `categoria` (ASC) + `precio` (ASC)
   - `estado` (ASC) + `createdAt` (DESC)

4. **notificaciones**
   - `usuarioId` (ASC) + `createdAt` (DESC)
   - `usuarioId` (ASC) + `leida` (ASC) + `createdAt` (DESC)

---

## 🔒 REGLAS DE SEGURIDAD FIRESTORE

### Archivo: `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Funciones auxiliares
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    function isAdmin() {
      return request.auth.token.email == 'estebanber24@gmail.com';
    }
    
    function hasRequiredFields(fields) {
      return request.resource.data.keys().hasAll(fields);
    }
    
    // PERFILES
    match /perfiles/{userId} {
      allow read: if true;
      allow create: if isAuthenticated() && isOwner(userId);
      allow update: if isAuthenticated() && (isOwner(userId) || isAdmin());
      allow delete: if isAuthenticated() && (isOwner(userId) || isAdmin());
    }
    
    // PUBLICACIONES
    match /publicaciones/{publicacionId} {
      allow read: if true;
      allow create: if isAuthenticated() 
        && request.resource.data.autorUid == request.auth.uid;
      allow update: if isAuthenticated() 
        && (resource.data.autorUid == request.auth.uid || isAdmin());
      allow delete: if isAuthenticated() 
        && (resource.data.autorUid == request.auth.uid || isAdmin());
      
      match /comentarios/{comentarioId} {
        allow read: if true;
        allow create: if isAuthenticated();
        allow update, delete: if isAuthenticated() 
          && resource.data.autorUid == request.auth.uid;
      }
    }
    
    // EVENTOS
    match /eventos/{eventoId} {
      allow read: if true;
      allow create: if isAuthenticated() 
        && request.resource.data.creadorUid == request.auth.uid;
      allow update: if isAuthenticated() 
        && (resource.data.creadorUid == request.auth.uid 
        || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['asistentes']));
      allow delete: if isAuthenticated() 
        && (resource.data.creadorUid == request.auth.uid || isAdmin());
    }
    
    // PRODUCTOS
    match /productos/{productoId} {
      allow read: if true;
      allow create: if isAuthenticated() 
        && request.resource.data.vendedorUid == request.auth.uid;
      allow update: if isAuthenticated() 
        && (resource.data.vendedorUid == request.auth.uid 
        || request.resource.data.diff(resource.data).affectedKeys().hasOnly(['rating', 'resenas']));
      allow delete: if isAuthenticated() 
        && (resource.data.vendedorUid == request.auth.uid || isAdmin());
    }
    
    // CONVERSACIONES
    match /conversaciones/{conversacionId} {
      allow read: if isAuthenticated() 
        && request.auth.uid in resource.data.participantes;
      allow create: if isAuthenticated() 
        && request.auth.uid in request.resource.data.participantes;
      allow update: if isAuthenticated() 
        && request.auth.uid in resource.data.participantes;
      
      match /mensajes/{mensajeId} {
        allow read: if isAuthenticated() 
          && request.auth.uid in get(/databases/$(database)/documents/conversaciones/$(conversacionId)).data.participantes;
        allow create: if isAuthenticated() 
          && request.auth.uid in get(/databases/$(database)/documents/conversaciones/$(conversacionId)).data.participantes;
      }
    }
    
    // NOTIFICACIONES
    match /notificaciones/{notificacionId} {
      allow read: if isAuthenticated() 
        && resource.data.usuarioId == request.auth.uid;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() 
        && resource.data.usuarioId == request.auth.uid;
      allow delete: if isAuthenticated() 
        && (resource.data.usuarioId == request.auth.uid || isAdmin());
    }
    
    // ENCUESTAS DE ELIMINACIÓN
    match /encuestasEliminacion/{encuestaId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated();
    }
    
    // GRUPOS
    match /grupos/{grupoId} {
      allow read: if true;
      allow create: if isAuthenticated();
      allow update: if isAuthenticated() 
        && (resource.data.creadorUid == request.auth.uid 
        || request.auth.uid in resource.data.miembros);
      allow delete: if isAuthenticated() 
        && (resource.data.creadorUid == request.auth.uid || isAdmin());
    }
    
    // PAGOS
    match /pagos/{pagoId} {
      allow read: if isAuthenticated() 
        && (resource.data.usuarioId == request.auth.uid || isAdmin());
      allow create: if isAuthenticated() 
        && request.resource.data.usuarioId == request.auth.uid;
      allow update: if isAdmin();
    }
  }
}
```

### Aplicar Reglas

1. Copiar contenido de `firestore.rules`
2. Ir a Firebase Console > Firestore Database > Rules
3. Pegar reglas
4. Hacer clic en "Publicar"

---

## 📦 FIREBASE STORAGE

### Estructura de Carpetas

```
storage/
├── perfiles/
│   └── {userId}/
│       ├── foto-perfil.jpg
│       └── banner.jpg
│
├── publicaciones/
│   └── {publicacionId}/
│       └── imagen.jpg
│
├── eventos/
│   └── {eventoId}/
│       └── portada.jpg
│
└── productos/
    └── {productoId}/
        ├── imagen1.jpg
        ├── imagen2.jpg
        └── imagen3.jpg
```

### Reglas de Storage

**Archivo: `storage.rules`**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isImageFile() {
      return request.resource.contentType.matches('image/.*');
    }
    
    function isValidSize(maxSizeMB) {
      return request.resource.size < maxSizeMB * 1024 * 1024;
    }
    
    // PERFILES
    match /perfiles/{userId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() 
        && request.auth.uid == userId 
        && isImageFile() 
        && isValidSize(5);
    }
    
    // PUBLICACIONES
    match /publicaciones/{publicacionId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() 
        && isImageFile() 
        && isValidSize(10);
    }
    
    // EVENTOS
    match /eventos/{eventoId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() 
        && isImageFile() 
        && isValidSize(5);
    }
    
    // PRODUCTOS
    match /productos/{productoId}/{fileName} {
      allow read: if true;
      allow write: if isAuthenticated() 
        && isImageFile() 
        && isValidSize(5);
    }
  }
}
```

### Aplicar Reglas de Storage

1. Copiar contenido de `storage.rules`
2. Ir a Firebase Console > Storage > Rules
3. Pegar reglas
4. Hacer clic en "Publicar"

---

## ⚙️ CONFIGURACIÓN DEL PROYECTO

### Variables de Entorno

**Archivo: `.env`**

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=your-preset
```

### Obtener Credenciales

1. Ir a Firebase Console
2. Project Settings > General
3. Scroll a "Your apps"
4. Seleccionar app web
5. Copiar configuración

---

## 🔧 MANTENIMIENTO

### Backup de Firestore

**Opción 1: Exportación Manual**
1. Ir a Firestore Database
2. Import/Export
3. Export data
4. Seleccionar colecciones
5. Especificar bucket de Storage

**Opción 2: Exportación Programada**
```bash
gcloud firestore export gs://[BUCKET_NAME]
```

### Monitoreo

1. **Firebase Console > Usage**
   - Lecturas/Escrituras de Firestore
   - Usuarios activos
   - Storage usado

2. **Firebase Console > Performance**
   - Tiempos de carga
   - Errores de red

3. **Firebase Console > Crashlytics**
   - Errores de aplicación
   - Stack traces

---

## 🚨 LÍMITES Y CUOTAS

### Firestore (Plan Spark - Gratis)

- **Lecturas:** 50,000/día
- **Escrituras:** 20,000/día
- **Eliminaciones:** 20,000/día
- **Storage:** 1 GB

### Storage (Plan Spark - Gratis)

- **Almacenamiento:** 5 GB
- **Descargas:** 1 GB/día
- **Subidas:** 1 GB/día

### Authentication

- **Usuarios:** Ilimitados
- **Verificaciones:** Ilimitadas

---

## 📊 OPTIMIZACIÓN

### Mejores Prácticas

1. **Usar índices compuestos** para queries complejas
2. **Limitar resultados** con `.limit()`
3. **Usar paginación** para listas largas
4. **Cachear datos** cuando sea posible
5. **Evitar lecturas innecesarias** con listeners
6. **Usar batch writes** para múltiples escrituras

### Ejemplo de Query Optimizada

```javascript
// ❌ Malo - Sin límite
const publicaciones = await getDocs(collection(db, 'publicaciones'));

// ✅ Bueno - Con límite y orden
const publicaciones = await getDocs(
  query(
    collection(db, 'publicaciones'),
    orderBy('createdAt', 'desc'),
    limit(20)
  )
);
```

---

## 🔐 SEGURIDAD

### Checklist de Seguridad

- ✅ Reglas de Firestore configuradas
- ✅ Reglas de Storage configuradas
- ✅ Dominios autorizados configurados
- ✅ API Keys restringidas
- ✅ Validación de datos en cliente y servidor
- ✅ Sanitización de inputs
- ✅ Rate limiting implementado

---

## 📝 COMANDOS ÚTILES

### Firebase CLI

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar proyecto
firebase init

# Desplegar reglas
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Ver logs
firebase functions:log
```

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0
