# MANUAL TÉCNICO - BANDSOCIAL
## Red Social Musical para Colombia

---

## 📋 INFORMACIÓN DEL PROYECTO

**Proyecto:** BandSocial  
**Ficha SENA:** 3035528  
**Centro:** Centro Tecnológico del Mobiliario - Itagüí, Antioquia  
**Versión:** 1.0  
**Fecha:** Febrero 2026  

**Equipo de Desarrollo:**
- Esteban Bermúdez Durango
- Juan Camilo Ángel
- Yeffry Ortiz
- Diego Alejandro Pino Mosquera

---

## 🎯 DESCRIPCIÓN DEL PROYECTO

BandSocial es una red social especializada para músicos, bandas y profesionales de la industria musical en Colombia. La plataforma permite a los usuarios conectarse, compartir contenido, organizar eventos musicales y comercializar instrumentos y equipos.

---

## 🏗️ ARQUITECTURA DEL SISTEMA

### **Arquitectura General**

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENTE (FRONTEND)                      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React 19.1.0 + Vite 7.0.0               │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │   Pages     │  │  Components  │  │  Services  │ │  │
│  │  │  (29 pág.)  │  │  (22 comp.)  │  │  (3 serv.) │ │  │
│  │  └─────────────┘  └──────────────┘  └────────────┘ │  │
│  │                                                       │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │  │
│  │  │   Hooks     │  │    Utils     │  │    Data    │ │  │
│  │  │  (2 hooks)  │  │  (1 util)    │  │  (1 file)  │ │  │
│  │  └─────────────┘  └──────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS EN LA NUBE                      │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐ │
│  │  Firebase 11.9.1 │  │   Cloudinary     │  │ Netlify  │ │
│  │                  │  │                  │  │          │ │
│  │  • Auth          │  │  • Imágenes      │  │ • Deploy │ │
│  │  • Firestore     │  │  • Optimización  │  │ • CDN    │ │
│  │  • Storage       │  │  • Transformación│  │ • SSL    │ │
│  └──────────────────┘  └──────────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### **Patrón de Arquitectura**

**Tipo:** Arquitectura de Componentes con Context API  
**Patrón:** MVC (Model-View-Controller) adaptado a React

- **Model:** Firestore Collections + Firebase Services
- **View:** React Components + Pages
- **Controller:** React Hooks + Context Providers

---

## 💻 STACK TECNOLÓGICO

### **Frontend**

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| React | 19.1.0 | Framework principal |
| Vite | 7.0.0 | Build tool y dev server |
| React Router DOM | 7.6.3 | Enrutamiento SPA |
| React Bootstrap | 2.10.10 | Componentes UI |
| React Icons | 5.5.0 | Iconografía |
| React Hook Form | 7.54.2 | Manejo de formularios |
| React Select | 5.9.0 | Selectores avanzados |

### **Backend as a Service (BaaS)**

| Servicio | Versión | Propósito |
|----------|---------|-----------|
| Firebase Auth | 11.9.1 | Autenticación de usuarios |
| Firestore | 11.9.1 | Base de datos NoSQL |
| Firebase Storage | 11.9.1 | Almacenamiento de archivos |

### **Servicios Externos**

| Servicio | Propósito |
|----------|-----------|
| Cloudinary | CDN y optimización de imágenes |
| Netlify | Hosting y despliegue continuo |

### **Herramientas de Desarrollo**

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| Vitest | - | Testing unitario |
| Cypress | - | Testing E2E |
| ESLint | - | Linting de código |
| Git | - | Control de versiones |

---

## 📊 ESTRUCTURA DE LA BASE DE DATOS

### **Modelo de Datos - Firestore (NoSQL)**

#### **Colección: `perfiles`**
```javascript
{
  uid: string,                    // ID único del usuario
  nombre: string,                 // Nombre completo
  email: string,                  // Correo electrónico
  type: string,                   // Tipo: "Músico", "Banda", "Productor", etc.
  fotoPerfil: string,             // URL de Cloudinary
  ciudad: string,                 // Ciudad de Colombia
  bio: string,                    // Biografía
  generos: array,                 // Géneros musicales
  instrumentos: array,            // Instrumentos que toca
  seguidores: array,              // UIDs de seguidores
  siguiendo: array,               // UIDs de usuarios seguidos
  fotos: array,                   // Galería de fotos
  planActual: string,             // "Estándar" o "Premium"
  redesSociales: {
    spotify: string,
    youtube: string,
    instagram: string
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### **Colección: `publicaciones`**
```javascript
{
  id: string,
  usuarioId: string,              // UID del creador
  usuarioNombre: string,
  usuarioFoto: string,
  contenido: string,              // Texto de la publicación
  imagen: string,                 // URL de imagen (opcional)
  tipo: string,                   // "texto", "imagen", "video"
  reacciones: {
    meGusta: array,               // UIDs de usuarios
    meEncanta: array,
    meImporta: array
  },
  comentarios: number,            // Contador
  createdAt: timestamp,
  
  // Subcolección: comentarios
  comentarios: [
    {
      id: string,
      usuarioId: string,
      usuarioNombre: string,
      usuarioFoto: string,
      contenido: string,
      createdAt: timestamp
    }
  ]
}
```

#### **Colección: `eventos`**
```javascript
{
  id: string,
  titulo: string,
  descripcion: string,
  fecha: string,                  // Formato: YYYY-MM-DD
  hora: string,                   // Formato: HH:MM
  lugar: string,
  ciudad: string,
  direccion: string,
  precio: number,                 // En pesos colombianos (COP)
  tipo: string,                   // "Concierto", "Jam Session", "Taller"
  generos: array,                 // Géneros musicales
  imagen: string,                 // URL de Cloudinary
  creadorUid: string,
  creadorNombre: string,
  asistentes: array,              // UIDs de asistentes confirmados
  capacidad: number,
  estado: string,                 // "Próximo", "En curso", "Finalizado"
  createdAt: timestamp
}
```

#### **Colección: `productos`**
```javascript
{
  id: string,
  nombre: string,
  descripcion: string,
  precio: number,                 // En pesos colombianos (COP)
  ubicacion: string,
  categoria: string,              // "Instrumentos", "Equipos", "Accesorios"
  estado: string,                 // "Nuevo", "Usado"
  imagen: array,                  // URLs de Cloudinary (múltiples imágenes)
  vendedorUid: string,
  vendedorNombre: string,
  vendedorFoto: string,
  rating: number,                 // Promedio de calificaciones
  resenas: number,                // Número de reseñas
  disponible: boolean,
  createdAt: timestamp
}
```

#### **Colección: `conversaciones`**
```javascript
{
  id: string,
  participantes: array,           // UIDs de los 2 participantes
  ultimoMensaje: string,
  ultimoMensajeFecha: timestamp,
  noLeidos: {
    [uid]: number                 // Contador por usuario
  },
  createdAt: timestamp,
  
  // Subcolección: mensajes
  mensajes: [
    {
      id: string,
      remitenteUid: string,
      contenido: string,
      leido: boolean,
      createdAt: timestamp
    }
  ]
}
```

#### **Colección: `notificaciones`**
```javascript
{
  id: string,
  usuarioId: string,              // UID del receptor
  tipo: string,                   // "seguidor", "like", "comentario", "mensaje"
  mensaje: string,
  origenUid: string,              // UID del usuario que generó la notificación
  origenNombre: string,
  origenFoto: string,
  leida: boolean,
  enlace: string,                 // URL de destino
  createdAt: timestamp
}
```

#### **Colección: `grupos`**
```javascript
{
  id: string,
  nombre: string,
  descripcion: string,
  imagen: string,
  creadorUid: string,
  miembros: array,                // UIDs de miembros
  tipo: string,                   // "Banda", "Comunidad", "Proyecto"
  generos: array,
  ciudad: string,
  publico: boolean,
  createdAt: timestamp
}
```

### **Diagrama Entidad-Relación**

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   PERFILES  │────────▶│PUBLICACIONES │◀────────│ COMENTARIOS │
│             │  crea   │              │ contiene│             │
│ • uid       │         │ • id         │         │ • id        │
│ • nombre    │         │ • usuarioId  │         │ • contenido │
│ • email     │         │ • contenido  │         └─────────────┘
│ • type      │         │ • imagen     │
│ • fotoPerfil│         │ • reacciones │
└─────────────┘         └──────────────┘
      │                        │
      │                        │
      │ crea                   │ asiste
      │                        │
      ▼                        ▼
┌─────────────┐         ┌──────────────┐
│   EVENTOS   │         │  PRODUCTOS   │
│             │         │              │
│ • id        │         │ • id         │
│ • titulo    │         │ • nombre     │
│ • fecha     │         │ • precio     │
│ • lugar     │         │ • categoria  │
│ • precio    │         │ • vendedorUid│
│ • asistentes│         └──────────────┘
└─────────────┘
      │
      │ participa
      │
      ▼
┌─────────────┐         ┌──────────────┐
│CONVERSACIONES│────────▶│   MENSAJES   │
│             │ contiene│              │
│ • id        │         │ • id         │
│ • participantes       │ • contenido  │
│ • ultimoMensaje       │ • remitenteUid│
└─────────────┘         └──────────────┘
```

---

## 📁 ESTRUCTURA DEL PROYECTO

```
BANDSOCIALCENTER/
│
├── public/                          # Archivos estáticos
│   ├── logo.png
│   └── Fondo_inicio.jpeg
│
├── src/
│   ├── assets/                      # Recursos multimedia
│   │   ├── logo.png
│   │   └── Fondo_inicio.jpeg
│   │
│   ├── components/                  # Componentes reutilizables (22)
│   │   ├── Navbar.jsx              # Barra de navegación principal
│   │   ├── Footer.jsx              # Pie de página
│   │   ├── ChatDock.jsx            # Chat flotante
│   │   ├── NotificationCenter.jsx  # Centro de notificaciones
│   │   ├── ProfileCard.jsx         # Tarjeta de perfil
│   │   ├── PublicacionForm.jsx     # Formulario de publicaciones
│   │   ├── AuthPromptModal.jsx     # Modal de autenticación
│   │   ├── UpgradePremiumModal.jsx # Modal upgrade premium
│   │   └── ...
│   │
│   ├── pages/                       # Páginas de la aplicación (29)
│   │   ├── Login.jsx               # Inicio de sesión
│   │   ├── Register.jsx            # Registro de usuarios
│   │   ├── Profile.jsx             # Perfil propio
│   │   ├── ProfileViewNew.jsx      # Ver perfil de otros
│   │   ├── PublicacionesNuevo.jsx  # Feed principal
│   │   ├── EventosNuevo.jsx        # Eventos musicales
│   │   ├── MusicmarketNuevo.jsx    # Marketplace
│   │   ├── Chat.jsx                # Mensajería
│   │   ├── Notifications.jsx       # Notificaciones
│   │   ├── Membership.jsx          # Planes de membresía
│   │   ├── Payment.jsx             # Pasarela de pagos
│   │   ├── Buscar.jsx              # Búsqueda global
│   │   ├── MisPublicaciones.jsx    # Gestión de publicaciones
│   │   ├── Followers.jsx           # Seguidores y siguiendo
│   │   └── ...
│   │
│   ├── services/                    # Servicios externos
│   │   ├── firebase.js             # Configuración Firebase
│   │   ├── cloudinary.js           # Servicio Cloudinary
│   │   └── notificationService.js  # Sistema de notificaciones
│   │
│   ├── contexts/                    # Context API
│   │   └── ThemeContext.jsx        # Tema claro/oscuro
│   │
│   ├── hooks/                       # Custom Hooks
│   │   ├── useNotifications.js     # Hook de notificaciones
│   │   └── useUnreadChats.js       # Hook de chats no leídos
│   │
│   ├── utils/                       # Utilidades
│   │   └── eventoFinalizacionAutomatica.js
│   │
│   ├── data/                        # Datos estáticos
│   │   └── opciones.js             # Instrumentos y géneros
│   │
│   ├── styles/                      # Estilos globales
│   │   └── theme.css               # Variables CSS del tema
│   │
│   ├── App.jsx                      # Componente raíz
│   ├── main.jsx                     # Punto de entrada
│   └── index.css                    # Estilos base
│
├── docs/                            # Documentación
│   ├── MANUAL_TECNICO.md
│   ├── MANUAL_USUARIO.md
│   └── MANUAL_INSTALACION.md
│
├── .env                             # Variables de entorno
├── .gitignore                       # Archivos ignorados por Git
├── package.json                     # Dependencias del proyecto
├── vite.config.js                   # Configuración de Vite
├── netlify.toml                     # Configuración de Netlify
└── README.md                        # Información del proyecto
```

---

## 🔐 SEGURIDAD

### **Autenticación y Autorización**

**Firebase Authentication:**
- Método: Email/Password
- Encriptación: Automática por Firebase (bcrypt)
- Tokens: JWT con vencimiento automático
- Sesiones: Persistentes con localStorage

**Reglas de Seguridad Firestore:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Perfiles: Lectura pública, escritura solo propietario
    match /perfiles/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
      allow update: if request.auth.uid == userId;
    }
    
    // Publicaciones: Lectura pública, escritura autenticados
    match /publicaciones/{postId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.usuarioId;
    }
    
    // Eventos: Lectura pública, escritura creador
    match /eventos/{eventId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.creadorUid;
    }
    
    // Productos: Lectura pública, escritura vendedor
    match /productos/{productId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth.uid == resource.data.vendedorUid;
    }
    
    // Conversaciones: Solo participantes
    match /conversaciones/{chatId} {
      allow read, write: if request.auth.uid in resource.data.participantes;
    }
    
    // Notificaciones: Solo propietario
    match /notificaciones/{notifId} {
      allow read, write: if request.auth.uid == resource.data.usuarioId;
    }
  }
}
```

### **Validaciones Frontend**

**Formularios:**
- React Hook Form para validación
- Validación en tiempo real
- Mensajes de error descriptivos
- Sanitización de inputs

**Seguridad de URLs:**
- Rutas protegidas con autenticación
- Redirección automática si no autenticado
- Validación de parámetros de URL

### **Protección de Datos Sensibles**

- Variables de entorno para API keys
- No se exponen credenciales en el código
- HTTPS obligatorio en producción
- CORS configurado en Firebase

---

## 🎨 SISTEMA DE DISEÑO

### **Identidad Visual**

**Colores Principales:**
```css
/* Modo Claro */
--primary-blue: #1877f2;
--primary-purple: #667eea;
--primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Modo Oscuro */
--dark-bg: #18191a;
--dark-card: #242526;
--dark-text: #e4e6eb;
```

**Tipografía:**
- Font Family: System fonts (San Francisco, Segoe UI, Roboto)
- Tamaños: 12px - 32px
- Pesos: 400 (Regular), 600 (Semi-bold), 700 (Bold)

### **Tema Claro/Oscuro**

**Implementación:**
- Context API (ThemeContext)
- Variables CSS personalizadas
- Persistencia en localStorage
- Cambio instantáneo sin recarga

**Variables CSS:**
```css
:root[data-theme="light"] {
  --bg-primary: #ffffff;
  --bg-secondary: #f0f2f5;
  --text-primary: #050505;
  --text-secondary: #65676b;
  --border-color: #e4e6eb;
}

:root[data-theme="dark"] {
  --bg-primary: #18191a;
  --bg-secondary: #242526;
  --text-primary: #e4e6eb;
  --text-secondary: #b0b3b8;
  --border-color: #3a3b3c;
}
```

### **Responsive Design**

**Breakpoints:**
```css
/* Mobile */
@media (max-width: 576px) { }

/* Tablet */
@media (max-width: 991px) { }

/* Desktop */
@media (min-width: 992px) { }
```

**Estrategia:**
- Mobile-first approach
- Grid y Flexbox para layouts
- Imágenes responsive
- Touch-friendly en móviles

---

## 🔄 FLUJO DE DATOS

### **Ciclo de Vida de una Publicación**

```
1. Usuario escribe publicación
   ↓
2. Validación en frontend (React Hook Form)
   ↓
3. Subida de imagen a Cloudinary (si aplica)
   ↓
4. Creación de documento en Firestore
   ↓
5. Notificación a seguidores
   ↓
6. Actualización en tiempo real del feed
   ↓
7. Indexación para búsqueda
```

### **Sistema de Notificaciones**

```javascript
// notificationService.js

export const notificarNuevoSeguidor = async (seguidorUid, seguidoUid) => {
  const seguidor = await getDoc(doc(db, 'perfiles', seguidorUid));
  
  await addDoc(collection(db, 'notificaciones'), {
    usuarioId: seguidoUid,
    tipo: 'seguidor',
    mensaje: `${seguidor.data().nombre} comenzó a seguirte`,
    origenUid: seguidorUid,
    origenNombre: seguidor.data().nombre,
    origenFoto: seguidor.data().fotoPerfil,
    leida: false,
    enlace: `/profile/${seguidorUid}`,
    createdAt: serverTimestamp()
  });
};
```

### **Chat en Tiempo Real**

```javascript
// Listener de mensajes nuevos
useEffect(() => {
  if (!conversacionId) return;
  
  const mensajesRef = collection(db, 'conversaciones', conversacionId, 'mensajes');
  const q = query(mensajesRef, orderBy('createdAt', 'asc'));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const nuevosMensajes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMensajes(nuevosMensajes);
  });
  
  return () => unsubscribe();
}, [conversacionId]);
```

---

## 📦 GESTIÓN DE ESTADO

### **Context API**

**ThemeContext:**
```javascript
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'light'
  );
  
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

**GuestContext:**
```javascript
export const GuestContext = createContext();

export const GuestProvider = ({ children }) => {
  const [isGuest, setIsGuest] = useState(() => 
    localStorage.getItem('guest') === 'true'
  );
  
  return (
    <GuestContext.Provider value={{ isGuest, setIsGuest }}>
      {children}
    </GuestContext.Provider>
  );
};
```

### **Custom Hooks**

**useNotifications:**
```javascript
const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user] = useState(auth.currentUser);
  
  useEffect(() => {
    if (!user) return;
    
    const notifRef = collection(db, 'notificaciones');
    const q = query(
      notifRef, 
      where('usuarioId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.leida).length);
    });
    
    return () => unsubscribe();
  }, [user]);
  
  return { notifications, unreadCount };
};
```

---

## 🚀 OPTIMIZACIONES

### **Performance**

**Lazy Loading:**
```javascript
// App.jsx
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Profile = lazy(() => import('./pages/Profile'));
// ... más componentes
```

**Code Splitting:**
- Vite automáticamente divide el código
- Chunks por ruta
- Vendor chunks separados

**Imágenes:**
- Cloudinary para optimización automática
- Lazy loading de imágenes
- Formatos modernos (WebP)
- Responsive images

### **Caché**

**Service Worker:**
- PWA instalable
- Caché de assets estáticos
- Offline fallback

**Firebase:**
- Caché automático de Firestore
- Persistencia local
- Sincronización automática

---

## 📊 MÉTRICAS Y MONITOREO

### **Analytics**

**Firebase Analytics:**
- Eventos personalizados
- Seguimiento de usuarios
- Conversiones
- Retención

**Métricas Clave:**
- Usuarios activos diarios (DAU)
- Usuarios activos mensuales (MAU)
- Tiempo de sesión promedio
- Tasa de rebote
- Conversión a Premium

### **Error Tracking**

**Error Boundary:**
```javascript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo);
    // Enviar a servicio de logging
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

---

## 🔧 MANTENIMIENTO

### **Actualizaciones**

**Dependencias:**
```bash
# Verificar actualizaciones
npm outdated

# Actualizar dependencias
npm update

# Actualizar dependencias mayores
npm install <package>@latest
```

**Firebase:**
- Revisar reglas de seguridad mensualmente
- Monitorear uso de cuota
- Optimizar índices de Firestore

**Cloudinary:**
- Revisar uso de almacenamiento
- Optimizar transformaciones
- Limpiar imágenes no utilizadas

### **Backup**

**Firestore:**
- Exportaciones automáticas programadas
- Backup diario de colecciones críticas
- Retención de 30 días

**Código:**
- Git con commits descriptivos
- Branches por feature
- Tags para releases

---

## 📈 ESCALABILIDAD

### **Límites Actuales**

**Firebase (Plan Spark - Gratuito):**
- 50,000 lecturas/día
- 20,000 escrituras/día
- 1 GB almacenamiento
- 10 GB transferencia/mes

**Cloudinary (Plan Free):**
- 25 créditos/mes
- 25 GB almacenamiento
- 25 GB ancho de banda

**Netlify (Plan Free):**
- 100 GB ancho de banda/mes
- 300 minutos build/mes

### **Plan de Escalamiento**

**Fase 1 (0-1,000 usuarios):**
- Plan actual suficiente
- Monitoreo de métricas

**Fase 2 (1,000-10,000 usuarios):**
- Upgrade a Firebase Blaze (pago por uso)
- Cloudinary Pro ($89/mes)
- Netlify Pro ($19/mes)

**Fase 3 (10,000+ usuarios):**
- Firebase con presupuesto mensual
- CDN adicional
- Load balancing
- Caché distribuido

---

## 🐛 DEBUGGING

### **Herramientas**

**React DevTools:**
- Inspección de componentes
- Profiler de rendimiento
- Hooks debugging

**Firebase Emulator:**
```bash
firebase emulators:start
```

**Console Logs:**
```javascript
// Desarrollo
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

### **Errores Comunes**

**Error: Permission Denied**
- Verificar reglas de Firestore
- Confirmar autenticación del usuario

**Error: Network Request Failed**
- Verificar conexión a internet
- Revisar configuración de Firebase

**Error: Quota Exceeded**
- Revisar límites del plan
- Optimizar consultas

---

## 📚 REFERENCIAS

### **Documentación Oficial**

- React: https://react.dev
- Vite: https://vitejs.dev
- Firebase: https://firebase.google.com/docs
- Cloudinary: https://cloudinary.com/documentation
- Netlify: https://docs.netlify.com

### **Recursos Adicionales**

- React Router: https://reactrouter.com
- React Bootstrap: https://react-bootstrap.github.io
- React Hook Form: https://react-hook-form.com

---

## 📞 SOPORTE TÉCNICO

**Equipo de Desarrollo:**
- Esteban Bermúdez Durango - Líder Técnico
- Juan Camilo Ángel - Frontend Developer
- Yeffry Ortiz - Backend Developer
- Diego Alejandro Pino Mosquera - UI/UX Developer

**Repositorio:**
- GitHub: https://github.com/Negromatico/BandSocial

**Producción:**
- URL: https://bandsociall.netlify.app

---

**Última actualización:** Febrero 2026  
**Versión del documento:** 1.0
