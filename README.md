# 🎸 BandSocial - Red Social Musical

<div align="center">

![BandSocial Logo](https://img.shields.io/badge/BandSocial-Conectando%20Talento%20Musical-8B5CF6?style=for-the-badge&logo=music&logoColor=white)

[![Netlify Status](https://api.netlify.com/api/v1/badges/your-badge-id/deploy-status)](https://bandsociall.netlify.app)
[![React](https://img.shields.io/badge/React-19.1.0-61DAFB?logo=react)](https://reactjs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-11.9.1-FFCA28?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**[Ver Demo](https://bandsociall.netlify.app)** | **[Documentación](./docs)** | **[Reportar Bug](https://github.com/tu-usuario/bandsocial/issues)**

</div>

---

## 📋 Tabla de Contenidos

- [Sobre el Proyecto](#-sobre-el-proyecto)
- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Scripts Disponibles](#-scripts-disponibles)
- [Deploy](#-deploy)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## 🎯 Sobre el Proyecto

**BandSocial** es una plataforma integral para músicos y bandas en Colombia que facilita:

- 🤝 **Networking Musical**: Conecta con músicos y bandas afines
- 🎸 **Marketplace**: Compra y vende instrumentos musicales
- 🎤 **Eventos**: Organiza y asiste a eventos musicales
- 💬 **Mensajería**: Comunicación en tiempo real
- 📱 **Feed Social**: Comparte tu música y proyectos

### ¿Por qué BandSocial?

- ✅ Centraliza todas las necesidades de la comunidad musical
- ✅ Interfaz intuitiva y moderna
- ✅ Real-time con Firebase
- ✅ PWA instalable en móviles
- ✅ Optimizado para rendimiento

---

## ✨ Características

### 🎵 Funcionalidades Principales

- **Perfiles Personalizados**
  - Músicos individuales y bandas
  - Galería de fotos y videos
  - Instrumentos y géneros musicales
  - Disponibilidad y ubicación

- **Feed Social**
  - Publicaciones con imágenes
  - Reacciones y comentarios
  - Filtros por tipo y ciudad
  - Sugerencias de músicos

- **Eventos Musicales**
  - Crear y gestionar eventos
  - Asistir a eventos
  - Filtros por ciudad, género y tipo
  - Calendario integrado

- **Marketplace**
  - Publicar instrumentos y equipos
  - Filtros avanzados
  - Contacto directo con vendedores
  - Precios en COP

- **Chat en Tiempo Real**
  - Mensajería instantánea
  - Notificaciones de mensajes nuevos
  - Historial de conversaciones

- **Membresía Premium**
  - Plan gratuito y premium
  - Pasarela de pagos
  - Beneficios exclusivos

### 🚀 Características Técnicas

- ⚡ **Lazy Loading** - Carga optimizada de componentes
- 🎨 **Animaciones Suaves** - Transiciones y efectos visuales
- 📱 **PWA** - Instalable como app móvil
- 🔒 **Seguridad** - Reglas de Firestore estrictas
- 🌐 **SEO Optimizado** - Meta tags y structured data
- 🎯 **Error Boundary** - Manejo robusto de errores
- 📊 **Analytics Ready** - Preparado para Google Analytics

---

## 🛠 Tecnologías

### Frontend
- **React 19.1.0** - Librería de UI
- **Vite 7.0.0** - Build tool ultra-rápido
- **React Router DOM 7.6.3** - Navegación SPA
- **React Bootstrap 2.10.10** - Componentes UI
- **React Icons 5.5.0** - Iconos

### Backend & Servicios
- **Firebase 11.9.1**
  - Authentication
  - Firestore Database
  - Storage
- **Cloudinary** - CDN para imágenes

### Herramientas de Desarrollo
- **ESLint** - Linting
- **Vitest** - Testing unitario
- **Cypress** - Testing E2E

---

## 📦 Instalación

### Prerrequisitos

```bash
node >= 18.0.0
npm >= 9.0.0
```

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/bandsocial.git
cd bandsocial/BANDSOCIALCENTER
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env` en la raíz:

```env
VITE_FIREBASE_API_KEY=tu_api_key
VITE_FIREBASE_AUTH_DOMAIN=tu_auth_domain
VITE_FIREBASE_PROJECT_ID=tu_project_id
VITE_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

4. **Iniciar servidor de desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 🎮 Uso

### Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
npm run lint:fix

# Tests
npm run test
npm run test:coverage
npm run test:e2e
```

### Configuración de Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Authentication (Email/Password)
3. Crea una base de datos Firestore
4. Configura Storage
5. Copia las credenciales a `.env`

### Desplegar Reglas de Seguridad

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Desplegar reglas
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## 📁 Estructura del Proyecto

```
BANDSOCIALCENTER/
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # Service Worker
│   └── _redirects             # Netlify redirects
├── src/
│   ├── components/            # Componentes reutilizables
│   │   ├── Navbar.jsx
│   │   ├── Toast.jsx
│   │   └── ErrorBoundary.jsx
│   ├── pages/                 # Páginas/Rutas
│   │   ├── Login.jsx
│   │   ├── Profile.jsx
│   │   ├── PublicacionesNuevo.jsx
│   │   ├── EventosNuevo.jsx
│   │   └── MusicmarketNuevo.jsx
│   ├── services/              # Servicios externos
│   │   ├── firebase.js
│   │   └── cloudinary.js
│   ├── hooks/                 # Custom hooks
│   ├── data/                  # Datos estáticos
│   ├── animations.css         # Animaciones globales
│   ├── global.css             # Estilos globales
│   ├── App.jsx                # Componente principal
│   └── main.jsx               # Punto de entrada
├── firestore.rules            # Reglas de seguridad
├── firestore.indexes.json     # Índices de Firestore
├── netlify.toml               # Configuración de Netlify
├── vite.config.js             # Configuración de Vite
└── package.json               # Dependencias
```

---

## 📜 Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Crea build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Ejecuta ESLint |
| `npm run lint:fix` | Corrige errores de ESLint |
| `npm run test` | Ejecuta tests unitarios |
| `npm run test:ui` | Tests con interfaz visual |
| `npm run test:coverage` | Genera reporte de cobertura |
| `npm run test:e2e` | Tests end-to-end con Cypress |

---

## 🚀 Deploy

### Netlify (Recomendado)

1. **Conectar con Git**
```bash
git remote add origin https://github.com/tu-usuario/bandsocial.git
git push -u origin main
```

2. **Deploy en Netlify**
- Ve a [netlify.com](https://netlify.com)
- Conecta tu repositorio
- Build command: `npm run build`
- Publish directory: `dist`

3. **Configurar variables de entorno**
- Site settings → Environment variables
- Agrega todas las variables `VITE_*`

### Netlify CLI

```bash
# Instalar CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Firebase Hosting

```bash
# Instalar CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar
firebase init hosting

# Deploy
npm run build
firebase deploy
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Guías de Estilo

- Usa ESLint para mantener el código consistente
- Escribe tests para nuevas funcionalidades
- Documenta funciones complejas
- Usa commits semánticos

---

## 📝 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

## 👥 Equipo

- **Desarrollador Principal** - [Tu Nombre](https://github.com/tu-usuario)

---

## 📞 Contacto

- **Email**: soporte@bandsocial.com
- **Website**: [bandsociall.netlify.app](https://bandsociall.netlify.app)
- **GitHub**: [github.com/tu-usuario/bandsocial](https://github.com/tu-usuario/bandsocial)

---

## 🙏 Agradecimientos

- [React](https://reactjs.org/)
- [Firebase](https://firebase.google.com/)
- [Netlify](https://netlify.com/)
- [React Bootstrap](https://react-bootstrap.github.io/)
- [React Icons](https://react-icons.github.io/react-icons/)

---

<div align="center">

**Hecho con ❤️ y 🎸 en Colombia**

[⬆ Volver arriba](#-bandsocial---red-social-musical)

</div>
