# 🏗️ Arquitectura del Proyecto - BandSocial

## Tabla de Contenidos
1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura de Componentes](#arquitectura-de-componentes)
4. [Estructura de Directorios](#estructura-de-directorios)
5. [Flujo de Datos](#flujo-de-datos)
6. [Patrones de Diseño](#patrones-de-diseño)
7. [Gestión de Estado](#gestión-de-estado)
8. [Routing y Navegación](#routing-y-navegación)
9. [Autenticación y Autorización](#autenticación-y-autorización)
10. [Base de Datos](#base-de-datos)

---

## 1. Visión General

BandSocial es una **Single Page Application (SPA)** construida con React que funciona como una red social especializada para músicos y bandas. La aplicación permite a los usuarios crear perfiles, publicar contenido, conectar con otros músicos, participar en eventos y comercializar instrumentos musicales.

### Características Principales

- 🎵 **Red Social Musical**: Publicaciones, comentarios, likes, seguimiento de usuarios
- 🎸 **Marketplace**: Compra/venta de instrumentos y equipos musicales
- 🎤 **Eventos**: Creación y gestión de eventos musicales
- 💬 **Mensajería**: Chat en tiempo real entre usuarios
- 👥 **Perfiles**: Perfiles personalizables para músicos y bandas
- 📊 **Estadísticas**: Dashboard administrativo con métricas avanzadas
- 🌙 **Modo Oscuro**: Tema claro/oscuro con persistencia

### Arquitectura General

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components  │  │    Pages     │  │   Contexts   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Services   │  │    Hooks     │  │    Utils     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Firebase   │  │  Cloudinary  │  │   EmailJS    │      │
│  │  (Backend)   │  │   (Media)    │  │   (Email)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Stack Tecnológico

### Frontend Core

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 19.1.0 | Librería principal para UI |
| **React DOM** | 19.1.0 | Renderizado en el DOM |
| **Vite** | 7.0.0 | Build tool y dev server |
| **React Router DOM** | 7.6.3 | Navegación y routing |

### UI y Estilos

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Bootstrap** | 5.3.7 | Framework CSS |
| **React Bootstrap** | 2.10.10 | Componentes Bootstrap para React |
| **Material-UI** | 7.1.2 | Componentes adicionales |
| **React Icons** | 5.5.0 | Iconos |
| **Bootstrap Icons** | 1.13.1 | Iconos adicionales |

### Backend y Servicios

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Firebase** | 11.9.1 | Backend as a Service |
| - Authentication | - | Autenticación de usuarios |
| - Firestore | - | Base de datos NoSQL |
| - Storage | - | Almacenamiento de archivos |
| **Cloudinary** | - | Gestión de imágenes |
| **EmailJS** | 4.4.1 | Envío de emails |

### Utilidades y Herramientas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Axios** | 1.10.0 | Cliente HTTP |
| **Chart.js** | 4.5.1 | Gráficos y visualizaciones |
| **React Chartjs 2** | 5.3.1 | Wrapper de Chart.js para React |
| **React Hook Form** | 7.59.0 | Gestión de formularios |
| **Yup** | 1.6.1 | Validación de esquemas |
| **React Select** | 5.10.1 | Selectores avanzados |
| **React Calendar** | 6.0.0 | Calendario |
| **React Image Crop** | 11.0.10 | Recorte de imágenes |

### Testing

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Vitest** | 4.0.18 | Framework de testing |
| **Testing Library** | 14.1.2 | Testing de componentes React |
| **Cypress** | 13.6.2 | Testing E2E |
| **jsdom** | 23.0.1 | DOM virtual para tests |

---

## 3. Arquitectura de Componentes

### Jerarquía de Componentes

```
App.jsx (Root)
├── ThemeContext.Provider
│   └── ChatDockContext.Provider
│       ├── Navbar
│       │   ├── NotificationCenter
│       │   └── ThemeToggle
│       ├── Router
│       │   ├── Public Routes
│       │   │   ├── Home
│       │   │   ├── Login
│       │   │   ├── Register
│       │   │   └── Info Pages
│       │   └── Protected Routes
│       │       ├── Profile
│       │       ├── Publicaciones
│       │       ├── Eventos
│       │       ├── Musicmarket
│       │       ├── Chat
│       │       ├── AdminDashboard
│       │       └── ...
│       ├── ChatDock
│       │   └── ChatWindow[]
│       ├── Footer
│       └── ScrollToTop
```

### Tipos de Componentes

#### 1. Componentes de Layout
- **Navbar.jsx**: Barra de navegación principal
- **Footer.jsx**: Pie de página
- **ScrollToTop.jsx**: Scroll automático al cambiar de ruta

#### 2. Componentes de Contexto
- **ThemeContext.jsx**: Gestión del tema (claro/oscuro)
- **ChatDockContext.jsx**: Gestión del estado del chat

#### 3. Componentes de UI Reutilizables
- **Toast.jsx**: Notificaciones temporales
- **ErrorBoundary.jsx**: Manejo de errores
- **AuthPromptModal.jsx**: Modal de autenticación
- **UpgradePremiumModal.jsx**: Modal de upgrade premium
- **ImageCropModal.jsx**: Modal de recorte de imágenes

#### 4. Componentes de Formularios
- **ProfileForm.jsx**: Formulario de perfil
- **PublicacionForm.jsx**: Formulario de publicaciones
- **HorariosField.jsx**: Campo de horarios
- **DateRangePicker.jsx**: Selector de rango de fechas

#### 5. Componentes de Funcionalidad
- **ChatDock.jsx**: Panel de chats flotante
- **ChatWindow.jsx**: Ventana de chat individual
- **NotificationCenter.jsx**: Centro de notificaciones
- **ComentariosPublicacion.jsx**: Sistema de comentarios
- **ReaccionesPublicacion.jsx**: Sistema de reacciones
- **EstadisticasAvanzadas.jsx**: Dashboard de estadísticas

#### 6. Componentes de Visualización
- **ProfileCard.jsx**: Tarjeta de perfil
- **EstadisticasCard.jsx**: Tarjeta de estadística
- **GraficoBarras.jsx**: Gráfico de barras
- **TablaEstadisticas.jsx**: Tabla de estadísticas

---

## 4. Estructura de Directorios

```
BandSocial/
├── public/                          # Archivos estáticos
│   ├── favicon.ico
│   ├── logo192.png
│   └── manifest.json
│
├── src/                             # Código fuente
│   ├── components/                  # Componentes reutilizables
│   │   ├── Estadisticas/           # Componentes de estadísticas
│   │   │   ├── EstadisticasCard.jsx
│   │   │   ├── GraficoBarras.jsx
│   │   │   └── TablaEstadisticas.jsx
│   │   ├── AuthPromptModal.jsx
│   │   ├── ChatDock.jsx
│   │   ├── ChatWindow.jsx
│   │   ├── ComentariosPublicacion.jsx
│   │   ├── EmailVerificationPrompt.jsx
│   │   ├── ErrorBoundary.jsx
│   │   ├── EstadisticasAvanzadas.jsx
│   │   ├── Footer.jsx
│   │   ├── ImageCropModal.jsx
│   │   ├── Navbar.jsx
│   │   ├── NotificationCenter.jsx
│   │   ├── ProfileCard.jsx
│   │   ├── ProfileForm.jsx
│   │   ├── PublicacionForm.jsx
│   │   ├── ReaccionesPublicacion.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── Toast.jsx
│   │   └── UpgradePremiumModal.jsx
│   │
│   ├── contexts/                    # Contextos de React
│   │   ├── ChatDockContext.jsx     # Estado global del chat
│   │   └── ThemeContext.jsx        # Estado global del tema
│   │
│   ├── data/                        # Datos estáticos
│   │   └── opciones.js             # Opciones de formularios
│   │
│   ├── hooks/                       # Custom Hooks
│   │   ├── useColombia.js          # Hook para API de Colombia
│   │   ├── useEstadisticas.js      # Hook para estadísticas
│   │   ├── useImageUpload.js       # Hook para subir imágenes
│   │   └── useNotifications.js     # Hook para notificaciones
│   │
│   ├── pages/                       # Páginas/Vistas
│   │   ├── AcercaDe.jsx            # Página Acerca de
│   │   ├── AdminDashboard.jsx      # Panel de administración
│   │   ├── Ayuda.jsx               # Página de ayuda
│   │   ├── Buscar.jsx              # Búsqueda de usuarios
│   │   ├── Chat.jsx                # Página de chat
│   │   ├── Contacto.jsx            # Formulario de contacto
│   │   ├── EmailVerificationHandler.jsx
│   │   ├── Eventos.jsx             # Lista de eventos
│   │   ├── EventosNuevo.jsx        # Crear evento
│   │   ├── Followers.jsx           # Seguidores/Siguiendo
│   │   ├── Home.jsx                # Página principal
│   │   ├── Login.jsx               # Inicio de sesión
│   │   ├── Membership.jsx          # Membresías premium
│   │   ├── MisPublicaciones.jsx    # Mis publicaciones
│   │   ├── Musicmarket.jsx         # Marketplace
│   │   ├── MusicmarketNuevo.jsx    # Crear producto
│   │   ├── Notifications.jsx       # Notificaciones
│   │   ├── PoliticaPrivacidad.jsx  # Política de privacidad
│   │   ├── Profile.jsx             # Perfil propio
│   │   ├── ProfileViewNew.jsx      # Ver perfil de otros
│   │   ├── Publicaciones.jsx       # Feed de publicaciones
│   │   ├── PublicacionesNuevo.jsx  # Crear publicación
│   │   ├── Register.jsx            # Registro
│   │   └── TerminosCondiciones.jsx # Términos y condiciones
│   │
│   ├── services/                    # Servicios y APIs
│   │   ├── cloudinary.js           # Servicio de Cloudinary
│   │   ├── colombiaAPI.js          # API de Colombia
│   │   ├── emailService.js         # Servicio de EmailJS
│   │   ├── estadisticasAvanzadas.js # Estadísticas avanzadas
│   │   ├── estadisticasService.js  # Servicio de estadísticas
│   │   ├── firebase.js             # Configuración de Firebase
│   │   ├── notificationService.js  # Servicio de notificaciones
│   │   └── premiumService.js       # Servicio de membresías
│   │
│   ├── styles/                      # Estilos globales
│   │   ├── theme.css               # Variables de tema
│   │   └── animations.css          # Animaciones
│   │
│   ├── utils/                       # Utilidades
│   │   ├── premiumCheck.js         # Verificación de premium
│   │   └── validators.js           # Validadores
│   │
│   ├── __tests__/                   # Tests
│   │   ├── ProfileForm.test.jsx
│   │   └── PublicacionForm.test.jsx
│   │
│   ├── App.jsx                      # Componente raíz
│   ├── main.jsx                     # Punto de entrada
│   ├── global.css                   # Estilos globales
│   └── custom-bootstrap.css         # Customización de Bootstrap
│
├── documentacion/                   # Documentación del proyecto
│   ├── CONFIGURACION_ADMIN.md
│   └── DIAGRAMAS_UML.md
│
├── documentacion-tecnica/           # Documentación técnica
│   ├── MANUAL_INSTALACION.md
│   └── ARQUITECTURA_PROYECTO.md
│
├── cypress/                         # Tests E2E
│   ├── e2e/
│   ├── fixtures/
│   └── support/
│
├── .env.example                     # Ejemplo de variables de entorno
├── .gitignore                       # Archivos ignorados por Git
├── firestore.rules                  # Reglas de seguridad de Firestore
├── firestore.indexes.json           # Índices de Firestore
├── index.html                       # HTML principal
├── package.json                     # Dependencias y scripts
├── vite.config.js                   # Configuración de Vite
├── vitest.config.js                 # Configuración de Vitest
└── README.md                        # Documentación principal
```

---

## 5. Flujo de Datos

### Arquitectura de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                      COMPONENTES REACT                       │
│                                                               │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐              │
│  │  Pages   │───▶│Components│───▶│  Hooks   │              │
│  └──────────┘    └──────────┘    └──────────┘              │
│       │                │                │                    │
│       └────────────────┴────────────────┘                    │
│                        │                                     │
└────────────────────────┼─────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE SERVICIOS                         │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Firebase   │  │  Cloudinary  │  │   EmailJS    │      │
│  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         │                 │                  │               │
└─────────┼─────────────────┼──────────────────┼───────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICIOS EXTERNOS                        │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Firestore   │  │  Cloudinary  │  │   EmailJS    │      │
│  │   Database   │  │     CDN      │  │     API      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Autenticación

```
Usuario → Login.jsx
    ↓
firebase.auth().signInWithEmailAndPassword()
    ↓
Firebase Authentication
    ↓
onAuthStateChanged listener
    ↓
Actualizar estado global (auth.currentUser)
    ↓
Redirigir a /publicaciones
    ↓
Cargar perfil desde Firestore
```

### Flujo de Publicación

```
Usuario → PublicacionesNuevo.jsx
    ↓
Subir imagen → uploadToCloudinary()
    ↓
Cloudinary CDN (retorna URL)
    ↓
Crear documento en Firestore
    ↓
collection('publicaciones').addDoc()
    ↓
Notificar seguidores → notificationService
    ↓
Redirigir a /publicaciones
```

### Flujo de Chat en Tiempo Real

```
Usuario A → ChatWindow.jsx
    ↓
Enviar mensaje → handleSend()
    ↓
addDoc(collection('chats', chatId, 'messages'))
    ↓
Firestore (almacena mensaje)
    ↓
onSnapshot listener (Usuario B)
    ↓
ChatWindow.jsx (Usuario B) actualiza UI
    ↓
Notificación push → notificationService
```

---

## 6. Patrones de Diseño

### 1. Container/Presentational Pattern

**Componentes Container:**
- Manejan lógica y estado
- Conectan con servicios
- Ejemplo: `Profile.jsx`, `Publicaciones.jsx`

**Componentes Presentational:**
- Solo reciben props
- Renderizado puro
- Ejemplo: `ProfileCard.jsx`, `EstadisticasCard.jsx`

### 2. Custom Hooks Pattern

Encapsular lógica reutilizable:

```javascript
// useEstadisticas.js
export const useEstadisticas = (userId) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchEstadisticas(userId).then(setStats);
  }, [userId]);
  
  return { stats, loading };
};
```

### 3. Context Pattern

Compartir estado global sin prop drilling:

```javascript
// ThemeContext.jsx
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
```

### 4. Higher-Order Component (HOC) Pattern

```javascript
// ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }
  
  render() {
    return this.props.children;
  }
}
```

### 5. Render Props Pattern

```javascript
// DateRangePicker.jsx
<DateRangePicker
  render={({ startDate, endDate }) => (
    <div>
      {startDate} - {endDate}
    </div>
  )}
/>
```

### 6. Compound Components Pattern

```javascript
// EstadisticasAvanzadas.jsx
<Estadisticas>
  <Estadisticas.Header />
  <Estadisticas.Body>
    <Estadisticas.Chart />
    <Estadisticas.Table />
  </Estadisticas.Body>
</Estadisticas>
```

---

## 7. Gestión de Estado

### Estado Local (useState)

Usado para estado de componente específico:
- Formularios
- Modales abiertos/cerrados
- Tabs activos
- Loading states

```javascript
const [showModal, setShowModal] = useState(false);
const [formData, setFormData] = useState({});
```

### Estado Global (Context API)

**ThemeContext:**
- Tema actual (light/dark)
- Función para cambiar tema
- Persistencia en localStorage

**ChatDockContext:**
- Chats abiertos
- Función para abrir/cerrar chats
- Estado de minimizado

### Estado del Servidor (Firebase)

**Firestore Realtime Listeners:**
```javascript
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(db, 'publicaciones'),
    (snapshot) => {
      setPublicaciones(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })));
    }
  );
  return unsubscribe;
}, []);
```

### Estado de Autenticación

```javascript
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(user => {
    setCurrentUser(user);
  });
  return unsubscribe;
}, []);
```

---

## 8. Routing y Navegación

### Configuración de Rutas

```javascript
// App.jsx
<BrowserRouter>
  <Routes>
    {/* Rutas Públicas */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    
    {/* Rutas Protegidas */}
    <Route path="/publicaciones" element={
      <ProtectedRoute>
        <Publicaciones />
      </ProtectedRoute>
    } />
    
    {/* Rutas de Admin */}
    <Route path="/admin" element={
      <AdminRoute>
        <AdminDashboard />
      </AdminRoute>
    } />
  </Routes>
</BrowserRouter>
```

### Tipos de Rutas

1. **Rutas Públicas**: Accesibles sin autenticación
2. **Rutas Protegidas**: Requieren autenticación
3. **Rutas de Admin**: Requieren rol de administrador

### Navegación Programática

```javascript
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();
navigate('/publicaciones');
navigate(-1); // Volver atrás
```

---

## 9. Autenticación y Autorización

### Sistema de Autenticación

**Métodos soportados:**
- Email/Password
- Google OAuth (opcional)
- Verificación de email

**Flujo de autenticación:**
1. Usuario ingresa credenciales
2. Firebase Authentication valida
3. Token JWT generado automáticamente
4. Token almacenado en localStorage
5. Listener `onAuthStateChanged` actualiza estado

### Sistema de Autorización

**Roles:**
- **Usuario Regular**: Acceso básico
- **Usuario Premium**: Funcionalidades adicionales
- **Administrador**: Acceso total

**Verificación de permisos:**
```javascript
// premiumCheck.js
export const esPremium = async (uid) => {
  const perfil = await getDoc(doc(db, 'perfiles', uid));
  return perfil.data()?.premium === true;
};

// Verificar admin
const ADMIN_UIDS = import.meta.env.VITE_ADMIN_UIDS.split(',');
const esAdmin = ADMIN_UIDS.includes(currentUser.uid);
```

---

## 10. Base de Datos

### Estructura de Firestore

```
firestore/
├── perfiles/                    # Perfiles de usuarios
│   └── {userId}/
│       ├── nombre
│       ├── email
│       ├── fotoPerfil
│       ├── bio
│       ├── instrumentos[]
│       ├── generos[]
│       ├── premium
│       └── createdAt
│
├── publicaciones/               # Publicaciones
│   └── {publicacionId}/
│       ├── usuarioId
│       ├── contenido
│       ├── imagenesUrl[]
│       ├── likes[]
│       ├── comentarios
│       └── createdAt
│
├── eventos/                     # Eventos
│   └── {eventoId}/
│       ├── creadorId
│       ├── nombre
│       ├── descripcion
│       ├── fecha
│       ├── ubicacion
│       ├── participantes[]
│       └── createdAt
│
├── productos/                   # Marketplace
│   └── {productoId}/
│       ├── vendedorUid
│       ├── nombre
│       ├── precio
│       ├── categoria
│       ├── imagenesUrl[]
│       └── createdAt
│
├── chats/                       # Chats
│   └── {chatId}/
│       └── messages/
│           └── {messageId}/
│               ├── from
│               ├── to
│               ├── text
│               └── createdAt
│
├── notificaciones/              # Notificaciones
│   └── {notificacionId}/
│       ├── usuarioId
│       ├── tipo
│       ├── origenUid
│       ├── mensaje
│       ├── leida
│       └── createdAt
│
└── userChats/                   # Metadata de chats
    └── {userId}/
        └── chats/
            └── {chatId}/
                ├── lastMsg
                ├── lastAt
                └── lastRead
```

### Índices Compuestos

Definidos en `firestore.indexes.json`:
- Publicaciones por usuario y fecha
- Eventos por fecha y ubicación
- Productos por categoría y precio
- Notificaciones por usuario y estado

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026
