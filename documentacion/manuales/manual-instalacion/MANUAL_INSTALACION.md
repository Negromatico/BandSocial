# 📘 Manual de Instalación - BandSocial

## Tabla de Contenidos
1. [Requisitos Previos](#requisitos-previos)
2. [Instalación del Proyecto](#instalación-del-proyecto)
3. [Configuración de Firebase](#configuración-de-firebase)
4. [Configuración de Cloudinary](#configuración-de-cloudinary)
5. [Configuración de EmailJS](#configuración-de-emailjs)
6. [Variables de Entorno](#variables-de-entorno)
7. [Ejecución del Proyecto](#ejecución-del-proyecto)
8. [Despliegue](#despliegue)
9. [Solución de Problemas](#solución-de-problemas)

---

## 1. Requisitos Previos

### Software Necesario

#### Node.js y npm
- **Versión requerida:** Node.js 18.x o superior
- **Verificar instalación:**
  ```bash
  node --version
  npm --version
  ```
- **Descargar:** https://nodejs.org/

#### Git
- **Verificar instalación:**
  ```bash
  git --version
  ```
- **Descargar:** https://git-scm.com/

#### Editor de Código (Recomendado)
- Visual Studio Code: https://code.visualstudio.com/
- WebStorm
- Sublime Text

### Cuentas de Servicios Externos

1. **Firebase** (Obligatorio)
   - Cuenta de Google
   - Proyecto de Firebase creado
   - https://console.firebase.google.com/

2. **Cloudinary** (Obligatorio)
   - Cuenta gratuita o de pago
   - https://cloudinary.com/

3. **EmailJS** (Obligatorio)
   - Cuenta para envío de emails
   - https://www.emailjs.com/

---

## 2. Instalación del Proyecto

### Paso 1: Clonar el Repositorio

```bash
# Clonar desde GitHub
git clone https://github.com/Negromatico/BandSocial.git

# Navegar al directorio del proyecto
cd BandSocial
```

### Paso 2: Instalar Dependencias

```bash
# Instalar todas las dependencias del proyecto
npm install
```

**Dependencias principales que se instalarán:**
- React 19.1.0
- React Router DOM 7.6.3
- Firebase 11.9.1
- Bootstrap 5.3.7
- React Bootstrap 2.10.10
- Vite 7.0.0
- Chart.js 4.5.1
- Axios 1.10.0
- EmailJS Browser 4.4.1

**Tiempo estimado:** 2-5 minutos dependiendo de la conexión a internet.

### Paso 3: Verificar Instalación

```bash
# Verificar que node_modules se creó correctamente
ls node_modules

# Verificar package-lock.json
ls package-lock.json
```

---

## 3. Configuración de Firebase

### Paso 1: Crear Proyecto en Firebase

1. Ir a https://console.firebase.google.com/
2. Clic en "Agregar proyecto"
3. Nombre del proyecto: `BandSocial` (o el nombre que prefieras)
4. Habilitar Google Analytics (opcional)
5. Crear proyecto

### Paso 2: Configurar Authentication

1. En el menú lateral, ir a **Authentication**
2. Clic en "Comenzar"
3. Habilitar los siguientes métodos de inicio de sesión:
   - ✅ **Correo electrónico/contraseña**
   - ✅ **Google** (opcional pero recomendado)

#### Configurar Email Verification
1. En Authentication > Templates
2. Configurar plantilla de verificación de email
3. Personalizar el mensaje si es necesario

### Paso 3: Configurar Firestore Database

1. En el menú lateral, ir a **Firestore Database**
2. Clic en "Crear base de datos"
3. Seleccionar modo: **Producción** (recomendado) o **Prueba**
4. Elegir ubicación: `us-central` o la más cercana a tu región

#### Crear Índices Compuestos

Copiar el contenido de `firestore.indexes.json` y aplicarlo:

```bash
# Instalar Firebase CLI si no está instalado
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Desplegar índices
firebase deploy --only firestore:indexes
```

#### Configurar Reglas de Seguridad

1. En Firestore Database > Reglas
2. Copiar el contenido de `firestore.rules`
3. Publicar las reglas

**Reglas principales:**
- Usuarios autenticados pueden leer/escribir sus propios datos
- Administradores tienen acceso completo
- Validación de datos en escritura
- Protección contra spam y abuso

### Paso 4: Configurar Storage

1. En el menú lateral, ir a **Storage**
2. Clic en "Comenzar"
3. Configurar reglas de seguridad:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

### Paso 5: Obtener Credenciales

1. En Configuración del proyecto (⚙️)
2. Ir a "Tus aplicaciones"
3. Clic en el ícono web `</>`
4. Registrar la app: `BandSocial Web`
5. Copiar la configuración de Firebase:

```javascript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "TU_PROJECT_ID.firebaseapp.com",
  projectId: "TU_PROJECT_ID",
  storageBucket: "TU_PROJECT_ID.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID",
  measurementId: "TU_MEASUREMENT_ID"
};
```

---

## 4. Configuración de Cloudinary

### Paso 1: Crear Cuenta

1. Ir a https://cloudinary.com/
2. Registrarse (cuenta gratuita disponible)
3. Verificar email

### Paso 2: Obtener Credenciales

1. En el Dashboard de Cloudinary
2. Copiar las siguientes credenciales:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Paso 3: Configurar Upload Preset

1. Ir a Settings > Upload
2. Scroll hasta "Upload presets"
3. Clic en "Add upload preset"
4. Configuración recomendada:
   - **Preset name:** `bandsocial_preset`
   - **Signing Mode:** `Unsigned`
   - **Folder:** `bandsocial`
   - **Allowed formats:** `jpg, png, gif, webp`
   - **Max file size:** `10 MB`
   - **Transformation:**
     - Width: 1200
     - Height: 1200
     - Crop: limit
     - Quality: auto
     - Format: auto

---

## 5. Configuración de EmailJS

### Paso 1: Crear Cuenta

1. Ir a https://www.emailjs.com/
2. Registrarse (cuenta gratuita: 200 emails/mes)
3. Verificar email

### Paso 2: Configurar Servicio de Email

1. En el Dashboard, ir a **Email Services**
2. Clic en "Add New Service"
3. Seleccionar proveedor (Gmail recomendado)
4. Configurar:
   - **Service ID:** Copiar para usar después
   - **Service Name:** `BandSocial Gmail`
   - Conectar cuenta de Gmail
   - Autorizar acceso

### Paso 3: Crear Plantillas de Email

#### Plantilla 1: Contacto
1. Ir a **Email Templates**
2. Clic en "Create New Template"
3. **Template ID:** `template_contacto`
4. **Template Name:** `Contacto BandSocial`
5. **Content:**

```html
Asunto: Nuevo mensaje de contacto - BandSocial

Hola,

Has recibido un nuevo mensaje de contacto:

Nombre: {{from_name}}
Email: {{from_email}}
Asunto: {{subject}}

Mensaje:
{{message}}

---
Este mensaje fue enviado desde BandSocial
```

#### Plantilla 2: Bienvenida
1. Crear nueva plantilla
2. **Template ID:** `template_bienvenida`
3. **Content:**

```html
Asunto: ¡Bienvenido a BandSocial! 🎵

Hola {{user_name}},

¡Bienvenido a BandSocial, la red social para músicos!

Tu cuenta ha sido creada exitosamente. Ahora puedes:
- Crear tu perfil de músico o banda
- Publicar contenido musical
- Conectar con otros músicos
- Participar en eventos
- Comprar/vender instrumentos

¡Empieza a explorar!

Saludos,
El equipo de BandSocial
```

### Paso 4: Obtener Credenciales

1. En Account > API Keys
2. Copiar:
   - **Public Key**
   - **Service ID** (del servicio creado)
   - **Template IDs** (de las plantillas creadas)

---

## 6. Variables de Entorno

### Paso 1: Crear Archivo .env

En la raíz del proyecto, crear archivo `.env`:

```bash
# En Windows
copy .env.example .env

# En Mac/Linux
cp .env.example .env
```

### Paso 2: Configurar Variables

Editar `.env` con tus credenciales:

```env
# ============================================
# FIREBASE CONFIGURATION
# ============================================
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ============================================
# CLOUDINARY CONFIGURATION
# ============================================
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
VITE_CLOUDINARY_API_KEY=123456789012345
VITE_CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
VITE_CLOUDINARY_UPLOAD_PRESET=bandsocial_preset

# ============================================
# EMAILJS CONFIGURATION
# ============================================
VITE_EMAILJS_PUBLIC_KEY=tu-public-key-emailjs
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_CONTACTO=template_contacto
VITE_EMAILJS_TEMPLATE_BIENVENIDA=template_bienvenida

# ============================================
# APPLICATION CONFIGURATION
# ============================================
VITE_APP_NAME=BandSocial
VITE_APP_URL=http://localhost:5173
VITE_APP_ENV=development

# ============================================
# ADMIN CONFIGURATION
# ============================================
# Lista de UIDs de administradores separados por comas
VITE_ADMIN_UIDS=uid1,uid2,uid3
```

### Paso 3: Verificar Variables

Crear archivo de prueba `test-env.js`:

```javascript
console.log('Firebase API Key:', import.meta.env.VITE_FIREBASE_API_KEY);
console.log('Cloudinary Cloud Name:', import.meta.env.VITE_CLOUDINARY_CLOUD_NAME);
console.log('EmailJS Public Key:', import.meta.env.VITE_EMAILJS_PUBLIC_KEY);
```

**⚠️ IMPORTANTE:**
- Nunca subir `.env` a Git
- `.env` ya está en `.gitignore`
- Usar `.env.example` como plantilla
- Mantener credenciales seguras

---

## 7. Ejecución del Proyecto

### Modo Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev
```

**Salida esperada:**
```
VITE v7.0.0  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h + enter to show help
```

**Acceder a la aplicación:**
- Abrir navegador en `http://localhost:5173`
- La aplicación se recarga automáticamente al hacer cambios

### Modo Producción (Local)

```bash
# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

### Ejecutar Tests

```bash
# Tests unitarios
npm run test

# Tests con UI
npm run test:ui

# Tests con cobertura
npm run test:coverage

# Tests E2E
npm run test:e2e

# Tests E2E sin interfaz
npm run test:e2e:headless
```

### Linter

```bash
# Verificar código
npm run lint

# Corregir automáticamente
npm run lint:fix
```

---

## 8. Despliegue

### Opción 1: Netlify (Recomendado)

#### Desde la Interfaz Web

1. Ir a https://www.netlify.com/
2. Clic en "Add new site" > "Import an existing project"
3. Conectar con GitHub
4. Seleccionar repositorio `BandSocial`
5. Configurar build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
6. Agregar variables de entorno (todas las de `.env`)
7. Clic en "Deploy site"

#### Desde CLI

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Inicializar
netlify init

# Desplegar
netlify deploy --prod
```

### Opción 2: Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Desplegar
vercel --prod
```

### Opción 3: Firebase Hosting

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicializar hosting
firebase init hosting

# Configurar:
# - Public directory: dist
# - Single-page app: Yes
# - Automatic builds: No

# Build
npm run build

# Desplegar
firebase deploy --only hosting
```

### Post-Despliegue

1. **Actualizar Firebase Auth:**
   - Agregar dominio autorizado en Firebase Console
   - Authentication > Settings > Authorized domains

2. **Actualizar CORS en Cloudinary:**
   - Settings > Security > Allowed fetch domains
   - Agregar tu dominio de producción

3. **Verificar EmailJS:**
   - Verificar que el dominio está autorizado
   - Account > Security

---

## 9. Solución de Problemas

### Problema: npm install falla

**Síntomas:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solución:**
```bash
# Limpiar caché
npm cache clean --force

# Eliminar node_modules y package-lock.json
rm -rf node_modules package-lock.json

# Reinstalar
npm install --legacy-peer-deps
```

### Problema: Vite no inicia

**Síntomas:**
```
Error: Cannot find module 'vite'
```

**Solución:**
```bash
# Reinstalar Vite
npm install vite@latest --save-dev

# Verificar vite.config.js existe
ls vite.config.js
```

### Problema: Firebase no conecta

**Síntomas:**
- Error: "Firebase: Error (auth/invalid-api-key)"
- No se puede autenticar

**Solución:**
1. Verificar variables de entorno en `.env`
2. Verificar que las credenciales son correctas
3. Verificar que el dominio está autorizado en Firebase Console
4. Reiniciar servidor de desarrollo

```bash
# Detener servidor (Ctrl+C)
# Reiniciar
npm run dev
```

### Problema: Cloudinary no sube imágenes

**Síntomas:**
- Error 401 Unauthorized
- Imágenes no se cargan

**Solución:**
1. Verificar `VITE_CLOUDINARY_UPLOAD_PRESET` en `.env`
2. Verificar que el preset es "Unsigned" en Cloudinary
3. Verificar CORS en Cloudinary Settings

### Problema: EmailJS no envía emails

**Síntomas:**
- Error 403 Forbidden
- Emails no llegan

**Solución:**
1. Verificar límite de emails (200/mes en plan gratuito)
2. Verificar Service ID y Template IDs
3. Verificar que el servicio de email está activo
4. Revisar spam/correo no deseado

### Problema: Build falla en producción

**Síntomas:**
```
Error: Build failed with X errors
```

**Solución:**
```bash
# Verificar errores de linter
npm run lint

# Corregir errores
npm run lint:fix

# Limpiar y rebuild
rm -rf dist
npm run build
```

### Problema: Variables de entorno no funcionan en producción

**Síntomas:**
- `undefined` en variables de entorno
- Funcionalidades no trabajan en producción

**Solución:**
1. Verificar que las variables empiezan con `VITE_`
2. En Netlify/Vercel, agregar variables en el panel de configuración
3. Redesplegar después de agregar variables

### Logs y Debugging

```bash
# Ver logs de Vite
npm run dev -- --debug

# Ver logs de build
npm run build -- --debug

# Ver logs de Firebase
firebase debug

# Ver logs de Netlify
netlify logs
```

---

## Contacto y Soporte

- **GitHub Issues:** https://github.com/Negromatico/BandSocial/issues
- **Documentación adicional:** Ver carpeta `/documentacion`
- **Email:** [Tu email de soporte]

---

## Checklist de Instalación

- [ ] Node.js 18+ instalado
- [ ] Git instalado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Proyecto Firebase creado
- [ ] Authentication configurado
- [ ] Firestore Database creado
- [ ] Índices de Firestore desplegados
- [ ] Reglas de Firestore configuradas
- [ ] Storage configurado
- [ ] Cuenta Cloudinary creada
- [ ] Upload preset configurado
- [ ] Cuenta EmailJS creada
- [ ] Servicio de email configurado
- [ ] Plantillas de email creadas
- [ ] Archivo `.env` creado
- [ ] Variables de entorno configuradas
- [ ] Servidor de desarrollo funcionando
- [ ] Tests pasando
- [ ] Build de producción exitoso

---

**Versión del Manual:** 1.0.0  
**Última actualización:** Febrero 2026  
**Autor:** Equipo BandSocial
