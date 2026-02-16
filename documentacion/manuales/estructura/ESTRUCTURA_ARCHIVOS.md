# 📁 Estructura Completa de Archivos - BandSocial

## Árbol de Directorios Completo

```
BandSocial/
│
├── 📁 public/                                    # Archivos estáticos públicos
│   ├── favicon.ico                               # Ícono de la aplicación
│   ├── logo192.png                               # Logo 192x192
│   ├── logo512.png                               # Logo 512x512
│   ├── manifest.json                             # Manifest para PWA
│   └── robots.txt                                # Configuración para crawlers
│
├── 📁 src/                                       # Código fuente principal
│   │
│   ├── 📁 __tests__/                            # Tests unitarios
│   │   ├── ProfileForm.test.jsx                 # Tests del formulario de perfil
│   │   └── PublicacionForm.test.jsx             # Tests del formulario de publicaciones
│   │
│   ├── 📁 assets/                               # Recursos estáticos
│   │   ├── images/                              # Imágenes locales
│   │   └── icons/                               # Iconos personalizados
│   │
│   ├── 📁 components/                           # Componentes reutilizables
│   │   │
│   │   ├── 📁 Estadisticas/                     # Componentes de estadísticas
│   │   │   ├── EstadisticasCard.jsx            # Tarjeta de estadística individual
│   │   │   ├── GraficoBarras.jsx               # Gráfico de barras con Chart.js
│   │   │   └── TablaEstadisticas.jsx           # Tabla de estadísticas
│   │   │
│   │   ├── AuthPromptModal.jsx                  # Modal para solicitar autenticación
│   │   ├── ChatDock.jsx                         # Panel flotante de chats
│   │   ├── ChatModal.jsx                        # Modal de chat (legacy)
│   │   ├── ChatWindow.jsx                       # Ventana de chat individual
│   │   ├── ComentariosEvento.jsx                # Comentarios de eventos
│   │   ├── ComentariosPublicacion.jsx           # Sistema de comentarios de publicaciones
│   │   ├── ContadorComentarios.jsx              # Contador de comentarios
│   │   ├── DateRangePicker.jsx                  # Selector de rango de fechas
│   │   ├── EmailVerificationPrompt.jsx          # Prompt de verificación de email
│   │   ├── ErrorBoundary.jsx                    # Manejo de errores de React
│   │   ├── EstadisticasAvanzadas.jsx            # Dashboard completo de estadísticas
│   │   ├── Footer.jsx                           # Pie de página
│   │   ├── HorariosField.jsx                    # Campo de horarios
│   │   ├── ImageCropModal.jsx                   # Modal para recortar imágenes
│   │   ├── MessengerChat.jsx                    # Integración con Messenger (legacy)
│   │   ├── Navbar.jsx                           # Barra de navegación principal
│   │   ├── NotificationBell.jsx                 # Campana de notificaciones
│   │   ├── NotificationCenter.jsx               # Centro de notificaciones dropdown
│   │   ├── PianoTiles.jsx                       # Juego de piano (easter egg)
│   │   ├── ProfileCard.jsx                      # Tarjeta de perfil
│   │   ├── ProfileForm.jsx                      # Formulario de edición de perfil
│   │   ├── PublicacionForm.jsx                  # Formulario de creación de publicaciones
│   │   ├── ReaccionesPublicacion.jsx            # Sistema de reacciones (likes)
│   │   ├── ScrollToTop.jsx                      # Scroll automático al cambiar ruta
│   │   ├── Toast.jsx                            # Notificaciones temporales tipo toast
│   │   ├── UpgradePremiumModal.jsx              # Modal de upgrade a premium
│   │   └── UploadMedia.jsx                      # Componente de subida de archivos
│   │
│   ├── 📁 contexts/                             # Contextos de React (estado global)
│   │   ├── ChatDockContext.jsx                  # Contexto para gestión de chats
│   │   └── ThemeContext.jsx                     # Contexto para tema claro/oscuro
│   │
│   ├── 📁 data/                                 # Datos estáticos y configuración
│   │   └── opciones.js                          # Opciones para formularios (instrumentos, géneros, etc.)
│   │
│   ├── 📁 hooks/                                # Custom Hooks
│   │   ├── useColombia.js                       # Hook para API de Colombia
│   │   ├── useEstadisticas.js                   # Hook para estadísticas de usuario
│   │   ├── useImageUpload.js                    # Hook para subir imágenes
│   │   └── useNotifications.js                  # Hook para notificaciones en tiempo real
│   │
│   ├── 📁 pages/                                # Páginas/Vistas de la aplicación
│   │   ├── AcercaDe.jsx                         # Página "Acerca de"
│   │   ├── AdminDashboard.jsx                   # Panel de administración
│   │   ├── Ayuda.jsx                            # Página de ayuda y FAQ
│   │   ├── Buscar.jsx                           # Búsqueda de usuarios
│   │   ├── Chat.jsx                             # Página principal de chat
│   │   ├── Contacto.jsx                         # Formulario de contacto
│   │   ├── EmailVerificationHandler.jsx         # Handler de verificación de email
│   │   ├── Eventos.jsx                          # Lista de eventos
│   │   ├── EventosNuevo.jsx                     # Crear nuevo evento
│   │   ├── Followers.jsx                        # Seguidores y siguiendo
│   │   ├── GamePage.jsx                         # Página de juego (Piano Tiles)
│   │   ├── Home.jsx                             # Página de inicio (landing)
│   │   ├── Login.jsx                            # Inicio de sesión
│   │   ├── Membership.jsx                       # Página de membresías premium
│   │   ├── MisGrupos.jsx                        # Mis grupos
│   │   ├── MisPublicaciones.jsx                 # Mis publicaciones
│   │   ├── Musicmarket.jsx                      # Marketplace (lista de productos)
│   │   ├── MusicmarketNuevo.jsx                 # Crear nuevo producto
│   │   ├── Notifications.jsx                    # Página de notificaciones
│   │   ├── PoliticaPrivacidad.jsx               # Política de privacidad
│   │   ├── Profile.jsx                          # Perfil del usuario autenticado
│   │   ├── ProfileViewNew.jsx                   # Ver perfil de otros usuarios
│   │   ├── Publicaciones.jsx                    # Feed de publicaciones
│   │   ├── PublicacionesNuevo.jsx               # Crear nueva publicación
│   │   ├── Register.jsx                         # Registro de usuarios
│   │   └── TerminosCondiciones.jsx              # Términos y condiciones
│   │
│   ├── 📁 services/                             # Servicios y APIs
│   │   ├── cloudinary.js                        # Servicio de Cloudinary (subida de imágenes)
│   │   ├── colombiaAPI.js                       # API de Colombia (departamentos/ciudades)
│   │   ├── emailService.js                      # Servicio de EmailJS
│   │   ├── estadisticasAvanzadas.js             # Estadísticas globales
│   │   ├── estadisticasService.js               # Estadísticas de usuario
│   │   ├── firebase.js                          # Configuración de Firebase
│   │   ├── notificationService.js               # Servicio de notificaciones
│   │   └── premiumService.js                    # Servicio de membresías premium
│   │
│   ├── 📁 styles/                               # Estilos globales
│   │   ├── animations.css                       # Animaciones CSS
│   │   └── theme.css                            # Variables de tema (claro/oscuro)
│   │
│   ├── 📁 test/                                 # Configuración de tests
│   │   └── setup.js                             # Setup de Vitest
│   │
│   ├── 📁 utils/                                # Utilidades
│   │   ├── premiumCheck.js                      # Verificación de usuarios premium
│   │   └── validators.js                        # Funciones de validación
│   │
│   ├── App.jsx                                  # Componente raíz de la aplicación
│   ├── main.jsx                                 # Punto de entrada de React
│   ├── global.css                               # Estilos globales base
│   ├── custom-bootstrap.css                     # Customización de Bootstrap
│   └── animations.css                           # Animaciones adicionales
│
├── 📁 cypress/                                  # Tests E2E con Cypress
│   ├── 📁 e2e/                                  # Tests end-to-end
│   ├── 📁 fixtures/                             # Datos de prueba
│   └── 📁 support/                              # Comandos y configuración
│
├── 📁 documentacion/                            # Documentación del proyecto
│   ├── CONFIGURACION_ADMIN.md                   # Configuración de administradores
│   └── DIAGRAMAS_UML.md                         # Diagramas UML del sistema
│
├── 📁 documentacion-tecnica/                    # Documentación técnica completa
│   ├── README.md                                # Índice y resumen ejecutivo
│   ├── MANUAL_INSTALACION.md                    # Manual de instalación paso a paso
│   ├── ARQUITECTURA_PROYECTO.md                 # Arquitectura del proyecto
│   ├── COMPONENTES_DETALLADOS.md                # Documentación de componentes
│   ├── SERVICIOS_Y_UTILIDADES.md                # Documentación de servicios
│   └── ESTRUCTURA_ARCHIVOS.md                   # Este archivo
│
├── 📁 node_modules/                             # Dependencias (generado por npm)
│
├── .env                                         # Variables de entorno (NO subir a Git)
├── .env.example                                 # Ejemplo de variables de entorno
├── .eslintrc.json                               # Configuración de ESLint
├── .gitignore                                   # Archivos ignorados por Git
├── cypress.config.js                            # Configuración de Cypress
├── firestore.indexes.json                       # Índices de Firestore
├── firestore.rules                              # Reglas de seguridad de Firestore
├── index.html                                   # HTML principal
├── package.json                                 # Dependencias y scripts
├── package-lock.json                            # Lock de dependencias
├── README.md                                    # Documentación principal del proyecto
├── vite.config.js                               # Configuración de Vite
└── vitest.config.js                             # Configuración de Vitest
```

---

## Descripción Detallada por Carpeta

### 📁 public/
Archivos estáticos que se sirven directamente sin procesamiento.

**Archivos clave:**
- `manifest.json`: Configuración para Progressive Web App (PWA)
- `favicon.ico`: Ícono que aparece en la pestaña del navegador
- `robots.txt`: Instrucciones para bots de búsqueda

---

### 📁 src/components/
Componentes reutilizables de React organizados por funcionalidad.

**Subcarpetas:**
- `Estadisticas/`: Componentes especializados en visualización de datos

**Componentes principales:**
- **Layout:** `Navbar.jsx`, `Footer.jsx`, `ScrollToTop.jsx`
- **Chat:** `ChatDock.jsx`, `ChatWindow.jsx`
- **Notificaciones:** `NotificationCenter.jsx`, `NotificationBell.jsx`
- **Formularios:** `ProfileForm.jsx`, `PublicacionForm.jsx`, `HorariosField.jsx`
- **UI:** `Toast.jsx`, `ErrorBoundary.jsx`, `AuthPromptModal.jsx`

---

### 📁 src/contexts/
Contextos de React para gestión de estado global.

**Contextos:**
1. **ThemeContext.jsx**
   - Gestiona tema claro/oscuro
   - Persiste preferencia en localStorage
   - Provee función `toggleTheme()`

2. **ChatDockContext.jsx**
   - Gestiona chats abiertos
   - Funciones: `openChat()`, `closeChat()`, `minimizeChat()`
   - Estado de ventanas de chat

---

### 📁 src/data/
Datos estáticos y configuración.

**opciones.js:**
```javascript
export const instrumentos = [
  'Guitarra', 'Bajo', 'Batería', 'Piano', 'Voz', 
  'Saxofón', 'Trompeta', 'Violín', 'Flauta', 'Otros'
];

export const generos = [
  'Rock', 'Pop', 'Jazz', 'Blues', 'Metal', 
  'Reggae', 'Hip Hop', 'Electrónica', 'Clásica', 'Salsa'
];

export const categorias = [
  'Instrumentos de Cuerda', 'Instrumentos de Viento',
  'Instrumentos de Percusión', 'Equipos de Audio',
  'Accesorios', 'Otros'
];
```

---

### 📁 src/hooks/
Custom Hooks para lógica reutilizable.

**Hooks disponibles:**

1. **useColombia.js**
   - Obtiene departamentos y ciudades de Colombia
   - Gestiona selección de ubicación
   - Retorna: `{ departamentos, ciudades, loading }`

2. **useEstadisticas.js**
   - Obtiene estadísticas de usuario
   - Actualización automática
   - Retorna: `{ stats, loading, error, refrescar }`

3. **useImageUpload.js**
   - Sube imágenes a Cloudinary
   - Muestra progreso
   - Retorna: `{ uploadImage, uploading, progress }`

4. **useNotifications.js**
   - Notificaciones en tiempo real
   - Contador de no leídas
   - Retorna: `{ notificaciones, unreadCount, marcarComoLeida }`

---

### 📁 src/pages/
Páginas principales de la aplicación (rutas).

**Categorías:**

**Autenticación:**
- `Login.jsx`, `Register.jsx`, `EmailVerificationHandler.jsx`

**Perfil:**
- `Profile.jsx` (perfil propio)
- `ProfileViewNew.jsx` (perfil de otros)
- `Followers.jsx` (seguidores/siguiendo)

**Contenido:**
- `Publicaciones.jsx` (feed)
- `PublicacionesNuevo.jsx` (crear)
- `MisPublicaciones.jsx` (mis publicaciones)

**Eventos:**
- `Eventos.jsx` (lista)
- `EventosNuevo.jsx` (crear)

**Marketplace:**
- `Musicmarket.jsx` (lista de productos)
- `MusicmarketNuevo.jsx` (crear producto)

**Comunicación:**
- `Chat.jsx` (página de chat)
- `Notifications.jsx` (notificaciones)

**Información:**
- `Home.jsx` (landing page)
- `AcercaDe.jsx`, `Ayuda.jsx`, `Contacto.jsx`
- `PoliticaPrivacidad.jsx`, `TerminosCondiciones.jsx`

**Administración:**
- `AdminDashboard.jsx` (panel de admin)

**Otros:**
- `Buscar.jsx` (búsqueda de usuarios)
- `Membership.jsx` (membresías premium)
- `GamePage.jsx` (juego de piano)
- `MisGrupos.jsx` (grupos)

---

### 📁 src/services/
Servicios para interactuar con APIs externas.

**Servicios:**

1. **firebase.js**
   - Configuración de Firebase
   - Exporta: `auth`, `db`, `storage`

2. **cloudinary.js**
   - Subida de imágenes
   - Funciones: `uploadToCloudinary()`, `deleteFromCloudinary()`

3. **emailService.js**
   - Envío de emails con EmailJS
   - Funciones: `enviarEmailContacto()`, `enviarEmailBienvenida()`

4. **notificationService.js**
   - Creación de notificaciones
   - Funciones: `notificarLike()`, `notificarComentario()`, etc.

5. **estadisticasService.js**
   - Estadísticas de usuario
   - Función: `obtenerEstadisticasUsuario()`

6. **estadisticasAvanzadas.js**
   - Estadísticas globales (admin)
   - Funciones: `obtenerEstadisticasGlobales()`, `obtenerCrecimientoUsuarios()`

7. **colombiaAPI.js**
   - API de Colombia
   - Funciones: `obtenerDepartamentos()`, `obtenerCiudades()`

8. **premiumService.js**
   - Gestión de membresías premium
   - Funciones: `activarPremium()`, `verificarPremium()`

---

### 📁 src/styles/
Estilos globales y temas.

**Archivos:**

1. **theme.css**
   - Variables CSS para tema claro/oscuro
   - Colores, tipografía, espaciado
   
2. **animations.css**
   - Animaciones CSS reutilizables
   - Fade in, slide in, bounce, etc.

---

### 📁 src/utils/
Funciones utilitarias.

**Utilidades:**

1. **premiumCheck.js**
   ```javascript
   export const esPremium = async (uid) => { ... }
   export const puedeCrearMas = async (uid, tipo) => { ... }
   ```

2. **validators.js**
   ```javascript
   export const validarEmail = (email) => { ... }
   export const validarPassword = (password) => { ... }
   export const validarUrl = (url) => { ... }
   export const sanitizarTexto = (texto) => { ... }
   ```

---

### 📁 cypress/
Tests end-to-end con Cypress.

**Estructura:**
- `e2e/`: Tests E2E
- `fixtures/`: Datos de prueba
- `support/`: Comandos personalizados

---

### 📁 documentacion-tecnica/
Documentación técnica completa del proyecto.

**Archivos:**
1. `README.md`: Índice y resumen ejecutivo
2. `MANUAL_INSTALACION.md`: Guía de instalación
3. `ARQUITECTURA_PROYECTO.md`: Arquitectura del sistema
4. `COMPONENTES_DETALLADOS.md`: Documentación de componentes
5. `SERVICIOS_Y_UTILIDADES.md`: Documentación de servicios
6. `ESTRUCTURA_ARCHIVOS.md`: Este archivo

---

## Archivos de Configuración

### package.json
Define dependencias y scripts del proyecto.

**Scripts principales:**
```json
{
  "dev": "vite",                    // Servidor de desarrollo
  "build": "vite build",            // Build de producción
  "preview": "vite preview",        // Preview de build
  "test": "vitest",                 // Tests unitarios
  "test:e2e": "cypress open",       // Tests E2E
  "lint": "eslint src"              // Linter
}
```

---

### vite.config.js
Configuración de Vite (build tool).

**Configuración clave:**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
});
```

---

### firestore.rules
Reglas de seguridad de Firestore.

**Reglas principales:**
- Usuarios autenticados pueden leer/escribir sus datos
- Validación de datos en escritura
- Administradores tienen acceso completo

---

### firestore.indexes.json
Índices compuestos de Firestore para queries optimizadas.

**Índices principales:**
- Publicaciones por usuario y fecha
- Eventos por fecha y ubicación
- Productos por categoría y precio

---

## Archivos CSS por Página

Cada página tiene su archivo CSS correspondiente:

```
src/pages/
├── AcercaDe.css
├── AdminDashboard.css
├── Ayuda.css
├── Buscar.css
├── Chat.css
├── Contacto.css
├── Eventos.css
├── Followers.css
├── Home.css
├── Login.css
├── Membership.css
├── MisGrupos.css
├── MisPublicaciones.css
├── Musicmarket.css
├── Notifications.css
├── Profile.css
├── ProfileViewNew.css
├── Publicaciones.css
└── Register.css
```

---

## Archivos CSS de Componentes

```
src/components/
├── ChatDock.css
├── ChatWindow.css
├── ComentariosPublicacion.css
├── EstadisticasAvanzadas.css
├── Footer.css
├── Navbar.css
├── NotificationCenter.css
├── ProfileCard.css
├── ProfileForm.css
└── PublicacionForm.css
```

---

## Variables de Entorno (.env)

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_API_KEY=
VITE_CLOUDINARY_API_SECRET=
VITE_CLOUDINARY_UPLOAD_PRESET=

# EmailJS
VITE_EMAILJS_PUBLIC_KEY=
VITE_EMAILJS_SERVICE_ID=
VITE_EMAILJS_TEMPLATE_CONTACTO=
VITE_EMAILJS_TEMPLATE_BIENVENIDA=

# Admin
VITE_ADMIN_UIDS=
```

---

## Tamaño de Archivos (Aproximado)

| Categoría | Archivos | Tamaño Total |
|-----------|----------|--------------|
| Componentes JSX | 40+ | ~800 KB |
| Páginas JSX | 25+ | ~1.2 MB |
| Servicios JS | 9 | ~150 KB |
| CSS | 30+ | ~400 KB |
| Documentación | 6 | ~500 KB |
| Tests | 5+ | ~100 KB |
| Configuración | 10+ | ~50 KB |
| **TOTAL** | **120+** | **~3.2 MB** |

*Nota: No incluye node_modules (~500 MB)*

---

## Flujo de Importación

### Ejemplo de flujo típico:

```
App.jsx
  ↓
  imports Navbar.jsx
    ↓
    imports NotificationCenter.jsx
      ↓
      imports useNotifications.js (hook)
        ↓
        imports notificationService.js
          ↓
          imports firebase.js
```

---

## Convenciones de Nombres

### Archivos
- **Componentes:** PascalCase (`ProfileCard.jsx`)
- **Servicios:** camelCase (`emailService.js`)
- **Hooks:** camelCase con prefijo `use` (`useEstadisticas.js`)
- **Utilidades:** camelCase (`validators.js`)
- **CSS:** kebab-case o PascalCase (`Profile.css`)

### Código
- **Componentes:** PascalCase
- **Funciones:** camelCase
- **Constantes:** UPPER_SNAKE_CASE
- **Variables:** camelCase

---

## Archivos Ignorados (.gitignore)

```
# Dependencias
node_modules/

# Build
dist/
build/

# Entorno
.env
.env.local

# IDE
.vscode/
.idea/

# Logs
*.log

# OS
.DS_Store
Thumbs.db

# Tests
coverage/
```

---

## Puntos de Entrada

### Desarrollo
```
index.html → src/main.jsx → src/App.jsx
```

### Producción
```
dist/index.html → dist/assets/index-[hash].js
```

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026  
**Total de archivos documentados:** 120+
