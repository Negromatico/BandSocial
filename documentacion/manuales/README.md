# 📚 Documentación Técnica Completa - BandSocial

## Resumen Ejecutivo

BandSocial es una **plataforma social especializada para músicos y bandas** construida con tecnologías modernas de desarrollo web. Este proyecto implementa una arquitectura escalable basada en React para el frontend y Firebase como Backend as a Service (BaaS).

### Características Principales

- 🎵 **Red Social Musical**: Sistema completo de publicaciones, comentarios, likes y seguimiento de usuarios
- 🎸 **Marketplace**: Compra/venta de instrumentos y equipos musicales
- 🎤 **Eventos**: Creación, gestión y participación en eventos musicales
- 💬 **Chat en Tiempo Real**: Mensajería instantánea entre usuarios
- 👥 **Perfiles Personalizables**: Para músicos individuales y bandas
- 📊 **Dashboard Administrativo**: Estadísticas avanzadas y gestión de usuarios
- 🌙 **Tema Dual**: Modo claro/oscuro con persistencia
- 📱 **Responsive**: Diseño adaptable a todos los dispositivos

### Stack Tecnológico

**Frontend:**
- React 19.1.0
- Vite 7.0.0
- React Router DOM 7.6.3
- Bootstrap 5.3.7 + React Bootstrap 2.10.10
- Material-UI 7.1.2

**Backend y Servicios:**
- Firebase 11.9.1 (Authentication, Firestore, Storage)
- Cloudinary (Gestión de imágenes)
- EmailJS 4.4.1 (Envío de emails)

**Testing:**
- Vitest 4.0.18
- Testing Library 14.1.2
- Cypress 13.6.2

---

## 📖 Índice de Documentación

### 1. Manual de Instalación
**Archivo:** `MANUAL_INSTALACION.md`

Guía completa paso a paso para instalar y configurar el proyecto desde cero.

**Contenido:**
- ✅ Requisitos previos (Node.js, Git, cuentas de servicios)
- ✅ Instalación del proyecto
- ✅ Configuración de Firebase (Authentication, Firestore, Storage)
- ✅ Configuración de Cloudinary
- ✅ Configuración de EmailJS
- ✅ Variables de entorno
- ✅ Ejecución del proyecto (desarrollo y producción)
- ✅ Despliegue (Netlify, Vercel, Firebase Hosting)
- ✅ Solución de problemas comunes

**Tiempo estimado de instalación:** 30-45 minutos

---

### 2. Arquitectura del Proyecto
**Archivo:** `ARQUITECTURA_PROYECTO.md`

Análisis profundo de la arquitectura y estructura del proyecto.

**Contenido:**
- 🏗️ Visión general de la arquitectura
- 📦 Stack tecnológico detallado
- 🧩 Arquitectura de componentes
- 📁 Estructura de directorios completa
- 🔄 Flujo de datos (autenticación, publicaciones, chat)
- 🎨 Patrones de diseño implementados
- 📊 Gestión de estado (local, global, servidor)
- 🛣️ Routing y navegación
- 🔐 Autenticación y autorización
- 💾 Estructura de base de datos Firestore

**Diagramas incluidos:**
- Arquitectura general del sistema
- Jerarquía de componentes
- Flujo de datos
- Estructura de Firestore

---

### 3. Componentes Detallados
**Archivo:** `COMPONENTES_DETALLADOS.md`

Documentación exhaustiva de todos los componentes React del proyecto.

**Contenido:**

#### Componentes de Layout
- `Navbar.jsx`: Barra de navegación principal
- `Footer.jsx`: Pie de página
- `ScrollToTop.jsx`: Scroll automático

#### Componentes de Autenticación
- `Login.jsx`: Inicio de sesión
- `Register.jsx`: Registro de usuarios
- `EmailVerificationPrompt.jsx`: Verificación de email

#### Componentes de Perfil
- `Profile.jsx`: Perfil del usuario autenticado
- `ProfileViewNew.jsx`: Ver perfil de otros usuarios
- `ProfileForm.jsx`: Formulario de edición de perfil

#### Componentes de Publicaciones
- `PublicacionForm.jsx`: Crear publicaciones
- `ComentariosPublicacion.jsx`: Sistema de comentarios
- `ReaccionesPublicacion.jsx`: Sistema de likes

#### Componentes de Chat
- `ChatDock.jsx`: Panel flotante de chats
- `ChatWindow.jsx`: Ventana de chat individual

#### Componentes de Notificaciones
- `NotificationCenter.jsx`: Centro de notificaciones

#### Componentes de Estadísticas
- `EstadisticasAvanzadas.jsx`: Dashboard de estadísticas
- `EstadisticasCard.jsx`: Tarjeta de estadística
- `GraficoBarras.jsx`: Gráficos con Chart.js

#### Componentes de Formularios
- `HorariosField.jsx`: Selector de horarios
- `DateRangePicker.jsx`: Selector de rango de fechas
- `ImageCropModal.jsx`: Recorte de imágenes

#### Componentes de UI
- `Toast.jsx`: Notificaciones temporales
- `ErrorBoundary.jsx`: Manejo de errores
- `UpgradePremiumModal.jsx`: Modal de upgrade

**Para cada componente se documenta:**
- Ubicación del archivo
- Propósito y funcionalidad
- Props y tipos
- Estado interno
- Estructura JSX
- Código clave con ejemplos
- Uso y ejemplos prácticos

---

### 4. Servicios y Utilidades
**Archivo:** `SERVICIOS_Y_UTILIDADES.md`

Documentación de todos los servicios, APIs y utilidades del proyecto.

**Contenido:**

#### Servicios de Firebase
- `firebase.js`: Configuración e inicialización

#### Servicio de Cloudinary
- `cloudinary.js`: Subida y gestión de imágenes
- Funciones: `uploadToCloudinary`, `uploadMultipleToCloudinary`, `deleteFromCloudinary`, `getTransformedUrl`

#### Servicio de Email
- `emailService.js`: Envío de emails con EmailJS
- Funciones: `enviarEmailContacto`, `enviarEmailBienvenida`, `enviarEmailRecuperacion`

#### Servicio de Notificaciones
- `notificationService.js`: Gestión de notificaciones
- Funciones: `notificarLike`, `notificarComentario`, `notificarNuevoSeguidor`, `notificarNuevoMensaje`, `notificarInvitacionEvento`

#### Servicio de Estadísticas
- `estadisticasService.js`: Estadísticas de usuarios
- `estadisticasAvanzadas.js`: Estadísticas globales
- Funciones: `obtenerEstadisticasUsuario`, `obtenerPublicacionesPopulares`, `obtenerActividadPorPeriodo`, `obtenerEstadisticasGlobales`

#### API de Colombia
- `colombiaAPI.js`: Datos de departamentos y ciudades
- Funciones: `obtenerDepartamentos`, `obtenerCiudades`, `obtenerCiudadesPorDepartamento`, `buscarCiudades`

#### Custom Hooks
- `useColombia.js`: Hook para datos de Colombia
- `useEstadisticas.js`: Hook para estadísticas
- `useImageUpload.js`: Hook para subir imágenes
- `useNotifications.js`: Hook para notificaciones en tiempo real

#### Utilidades
- `premiumCheck.js`: Verificación de usuarios premium
- `validators.js`: Funciones de validación

**Para cada servicio se documenta:**
- Ubicación del archivo
- Propósito
- Configuración
- Funciones disponibles
- Parámetros y retornos
- Ejemplos de uso

---

## 🚀 Inicio Rápido

### Instalación en 5 pasos

```bash
# 1. Clonar repositorio
git clone https://github.com/Negromatico/BandSocial.git
cd BandSocial

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Iniciar servidor de desarrollo
npm run dev

# 5. Abrir en navegador
# http://localhost:5173
```

### Estructura de Archivos Principal

```
BandSocial/
├── src/
│   ├── components/          # Componentes reutilizables
│   ├── contexts/            # Contextos de React
│   ├── hooks/               # Custom Hooks
│   ├── pages/               # Páginas/Vistas
│   ├── services/            # Servicios y APIs
│   ├── styles/              # Estilos globales
│   ├── utils/               # Utilidades
│   ├── App.jsx              # Componente raíz
│   └── main.jsx             # Punto de entrada
├── documentacion-tecnica/   # Esta documentación
├── public/                  # Archivos estáticos
├── .env.example             # Ejemplo de variables de entorno
├── package.json             # Dependencias
└── vite.config.js           # Configuración de Vite
```

---

## 📊 Estadísticas del Proyecto

### Líneas de Código (Aproximado)

| Categoría | Archivos | Líneas |
|-----------|----------|--------|
| Componentes | 40+ | ~15,000 |
| Páginas | 25+ | ~12,000 |
| Servicios | 9 | ~2,500 |
| Hooks | 4 | ~800 |
| Utilidades | 2 | ~500 |
| Tests | 2+ | ~1,000 |
| **TOTAL** | **80+** | **~31,800** |

### Dependencias

- **Producción:** 24 paquetes
- **Desarrollo:** 9 paquetes
- **Total:** 33 paquetes

### Colecciones de Firestore

- `perfiles`: Perfiles de usuarios
- `publicaciones`: Publicaciones
- `eventos`: Eventos
- `productos`: Productos del marketplace
- `chats`: Chats y mensajes
- `notificaciones`: Notificaciones
- `userChats`: Metadata de chats

---

## 🔑 Conceptos Clave

### Autenticación
- Firebase Authentication con email/password
- Verificación de email obligatoria
- Listeners en tiempo real (`onAuthStateChanged`)
- Protección de rutas

### Base de Datos
- Firestore NoSQL
- Listeners en tiempo real (`onSnapshot`)
- Índices compuestos para queries optimizadas
- Reglas de seguridad estrictas

### Gestión de Estado
- **Local:** `useState` para estado de componente
- **Global:** Context API (`ThemeContext`, `ChatDockContext`)
- **Servidor:** Firestore con listeners en tiempo real

### Subida de Archivos
- Cloudinary para imágenes
- Transformaciones automáticas (resize, crop, quality)
- URLs optimizadas con CDN

### Notificaciones
- Sistema de notificaciones en tiempo real
- Tipos: like, comentario, seguidor, mensaje, evento
- Centro de notificaciones con contador

### Chat
- Mensajería en tiempo real con Firestore
- Panel flotante de chats (`ChatDock`)
- Ventanas de chat individuales (`ChatWindow`)
- Indicadores de mensajes no leídos

---

## 🎯 Flujos Principales

### Flujo de Registro
```
1. Usuario completa formulario de registro
2. Firebase crea cuenta (createUserWithEmailAndPassword)
3. Se crea documento en collection('perfiles')
4. Se envía email de verificación
5. Redirección a página de perfil
6. Usuario completa información adicional
```

### Flujo de Publicación
```
1. Usuario crea publicación con texto e imágenes
2. Imágenes se suben a Cloudinary
3. Se obtienen URLs de Cloudinary
4. Se crea documento en collection('publicaciones')
5. Se notifica a seguidores
6. Publicación aparece en feed en tiempo real
```

### Flujo de Chat
```
1. Usuario A abre chat con Usuario B
2. Se crea/obtiene chatId único
3. Usuario A envía mensaje
4. Mensaje se guarda en collection('chats/{chatId}/messages')
5. Listener de Usuario B detecta nuevo mensaje
6. UI de Usuario B se actualiza automáticamente
7. Se envía notificación a Usuario B
```

---

## 🛡️ Seguridad

### Reglas de Firestore
- Usuarios solo pueden leer/escribir sus propios datos
- Validación de datos en escritura
- Protección contra spam
- Administradores tienen acceso completo

### Validación
- Validación de formularios con Yup
- Sanitización de texto para prevenir XSS
- Validación de URLs
- Validación de emails y contraseñas

### Variables de Entorno
- Todas las credenciales en `.env`
- `.env` en `.gitignore`
- Uso de `import.meta.env.VITE_*`

---

## 🧪 Testing

### Tests Unitarios (Vitest)
```bash
npm run test           # Ejecutar tests
npm run test:ui        # UI de tests
npm run test:coverage  # Cobertura
```

### Tests E2E (Cypress)
```bash
npm run test:e2e              # Modo interactivo
npm run test:e2e:headless     # Modo headless
```

### Linting
```bash
npm run lint           # Verificar código
npm run lint:fix       # Corregir automáticamente
```

---

## 📈 Roadmap y Mejoras Futuras

### Funcionalidades Planeadas
- [ ] Videollamadas integradas
- [ ] Streaming de audio en vivo
- [ ] Sistema de reputación
- [ ] Marketplace con pagos integrados
- [ ] App móvil (React Native)
- [ ] PWA (Progressive Web App)
- [ ] Integración con Spotify API
- [ ] Sistema de badges y logros

### Mejoras Técnicas
- [ ] Migración a TypeScript
- [ ] Server-Side Rendering (SSR)
- [ ] Optimización de bundle size
- [ ] Lazy loading de componentes
- [ ] Service Workers para offline
- [ ] Internacionalización (i18n)

---

## 🤝 Contribución

### Guía de Contribución
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Estándares de Código
- ESLint para linting
- Prettier para formateo
- Commits semánticos
- Tests para nuevas funcionalidades

---

## 📞 Soporte y Contacto

### Recursos
- **Repositorio:** https://github.com/Negromatico/BandSocial
- **Issues:** https://github.com/Negromatico/BandSocial/issues
- **Documentación:** `/documentacion-tecnica/`

### Comunidad
- Discord: [Próximamente]
- Twitter: [Próximamente]
- Email: contacto@bandsocial.com

---

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver archivo `LICENSE` para más detalles.

---

## 🙏 Agradecimientos

- **Firebase** por el excelente BaaS
- **Cloudinary** por la gestión de imágenes
- **EmailJS** por el servicio de emails
- **React** y su increíble ecosistema
- **Vite** por el rápido desarrollo
- Todos los contribuidores del proyecto

---

## 📝 Notas de Versión

### Versión 1.0.0 (Febrero 2026)
- ✅ Sistema completo de autenticación
- ✅ Perfiles de usuario personalizables
- ✅ Publicaciones con imágenes
- ✅ Sistema de likes y comentarios
- ✅ Chat en tiempo real
- ✅ Eventos musicales
- ✅ Marketplace de instrumentos
- ✅ Notificaciones en tiempo real
- ✅ Dashboard administrativo
- ✅ Modo oscuro
- ✅ Responsive design
- ✅ Tests unitarios y E2E

---

**Documentación generada:** Febrero 2026  
**Versión del proyecto:** 1.0.0  
**Última actualización:** Febrero 2026

---

## 🎓 Apéndices

### A. Glosario de Términos
- **BaaS:** Backend as a Service
- **SPA:** Single Page Application
- **CDN:** Content Delivery Network
- **NoSQL:** Not Only SQL
- **JWT:** JSON Web Token
- **PWA:** Progressive Web App
- **SSR:** Server-Side Rendering

### B. Referencias Externas
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [Bootstrap Documentation](https://getbootstrap.com/)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

### C. Comandos Útiles

```bash
# Desarrollo
npm run dev                    # Iniciar servidor de desarrollo
npm run build                  # Build de producción
npm run preview                # Preview de build

# Testing
npm run test                   # Tests unitarios
npm run test:ui                # UI de tests
npm run test:coverage          # Cobertura de tests
npm run test:e2e               # Tests E2E

# Linting
npm run lint                   # Verificar código
npm run lint:fix               # Corregir automáticamente

# Firebase
firebase login                 # Login en Firebase
firebase deploy                # Desplegar a Firebase Hosting
firebase deploy --only firestore:rules    # Desplegar solo reglas
firebase deploy --only firestore:indexes  # Desplegar solo índices

# Git
git status                     # Ver estado
git add .                      # Agregar todos los cambios
git commit -m "mensaje"        # Commit
git push                       # Push a remoto
git pull                       # Pull de remoto
```

---

**¡Gracias por usar BandSocial!** 🎵🎸🎤
