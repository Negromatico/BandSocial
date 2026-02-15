# MANUAL DE INSTALACIÓN - BANDSOCIAL
## Guía Completa de Configuración y Despliegue

---

## 📋 INFORMACIÓN DEL DOCUMENTO

**Proyecto:** BandSocial  
**Versión:** 1.0  
**Fecha:** Febrero 2026  
**Audiencia:** Desarrolladores y Administradores de Sistemas

---

## 📑 TABLA DE CONTENIDOS

1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Instalación Local](#instalación-local)
3. [Configuración de Firebase](#configuración-de-firebase)
4. [Configuración de Cloudinary](#configuración-de-cloudinary)
5. [Variables de Entorno](#variables-de-entorno)
6. [Ejecución en Desarrollo](#ejecución-en-desarrollo)
7. [Compilación para Producción](#compilación-para-producción)
8. [Despliegue en Netlify](#despliegue-en-netlify)
9. [Verificación de la Instalación](#verificación-de-la-instalación)
10. [Solución de Problemas](#solución-de-problemas)

---

## 💻 REQUISITOS DEL SISTEMA

### **Hardware Mínimo**

| Componente | Requisito Mínimo | Recomendado |
|------------|------------------|-------------|
| Procesador | Intel Core i3 / AMD Ryzen 3 | Intel Core i5 / AMD Ryzen 5 |
| RAM | 4 GB | 8 GB o más |
| Almacenamiento | 2 GB libres | 5 GB libres |
| Conexión | Internet estable | Banda ancha |

### **Software Requerido**

#### **1. Node.js**
- **Versión:** 18.x o superior
- **Descarga:** https://nodejs.org

**Verificar instalación:**
```bash
node --version
# Debe mostrar: v18.x.x o superior

npm --version
# Debe mostrar: 9.x.x o superior
```

#### **2. Git**
- **Versión:** 2.x o superior
- **Descarga:** https://git-scm.com

**Verificar instalación:**
```bash
git --version
# Debe mostrar: git version 2.x.x
```

#### **3. Editor de Código (Opcional)**
- Visual Studio Code (Recomendado)
- Sublime Text
- WebStorm
- Atom

#### **4. Navegador Web Moderno**
- Google Chrome (Recomendado)
- Mozilla Firefox
- Microsoft Edge
- Safari

---

## 🔧 INSTALACIÓN LOCAL

### **Paso 1: Clonar el Repositorio**

**Opción A: Usando HTTPS**
```bash
git clone https://github.com/Negromatico/BandSocial.git
```

**Opción B: Usando SSH**
```bash
git clone git@github.com:Negromatico/BandSocial.git
```

**Resultado esperado:**
```
Cloning into 'BandSocial'...
remote: Enumerating objects: 1234, done.
remote: Counting objects: 100% (1234/1234), done.
remote: Compressing objects: 100% (567/567), done.
remote: Total 1234 (delta 890), reused 1234 (delta 890)
Receiving objects: 100% (1234/1234), 15.23 MiB | 5.12 MiB/s, done.
Resolving deltas: 100% (890/890), done.
```

---

### **Paso 2: Navegar al Directorio del Proyecto**

```bash
cd BandSocial/BANDSOCIALCENTER
```

**Verificar estructura:**
```bash
ls -la
# o en Windows:
dir
```

**Deberías ver:**
```
.
├── node_modules/
├── public/
├── src/
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
└── README.md
```

---

### **Paso 3: Instalar Dependencias**

```bash
npm install
```

**Proceso de instalación:**
```
npm WARN deprecated package@version: ...
added 533 packages, and audited 534 packages in 45s

128 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**Tiempo estimado:** 2-5 minutos (dependiendo de la conexión)

**Nota:** Si encuentras errores, intenta:
```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🔥 CONFIGURACIÓN DE FIREBASE

### **Paso 1: Crear Proyecto en Firebase**

1. Ve a https://console.firebase.google.com
2. Haz clic en **"Agregar proyecto"**
3. Ingresa el nombre: **"BandSocial"**
4. (Opcional) Habilita Google Analytics
5. Haz clic en **"Crear proyecto"**

**Tiempo de creación:** 30-60 segundos

---

### **Paso 2: Registrar Aplicación Web**

1. En el panel de Firebase, haz clic en el ícono **Web** (`</>`)
2. Ingresa el nombre de la app: **"BandSocial Web"**
3. (Opcional) Marca "También configurar Firebase Hosting"
4. Haz clic en **"Registrar app"**

---

### **Paso 3: Obtener Credenciales**

Copia la configuración que aparece:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bandsocial-xxxxx.firebaseapp.com",
  projectId: "bandsocial-xxxxx",
  storageBucket: "bandsocial-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

**⚠️ IMPORTANTE:** Guarda estas credenciales de forma segura.

---

### **Paso 4: Habilitar Autenticación**

1. En el menú lateral, ve a **"Authentication"**
2. Haz clic en **"Comenzar"**
3. Selecciona **"Correo electrónico/contraseña"**
4. Habilita el método
5. Haz clic en **"Guardar"**

---

### **Paso 5: Crear Base de Datos Firestore**

1. En el menú lateral, ve a **"Firestore Database"**
2. Haz clic en **"Crear base de datos"**
3. Selecciona **"Iniciar en modo de prueba"** (temporalmente)
4. Elige la ubicación: **"us-central"** o la más cercana
5. Haz clic en **"Habilitar"**

---

### **Paso 6: Configurar Reglas de Seguridad**

En la pestaña **"Reglas"** de Firestore, reemplaza con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper para verificar autenticación
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Función helper para verificar propietario
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    
    // Perfiles
    match /perfiles/{userId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update: if isOwner(userId);
      allow delete: if isOwner(userId);
    }
    
    // Publicaciones
    match /publicaciones/{postId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isOwner(resource.data.usuarioId);
      
      // Comentarios (subcolección)
      match /comentarios/{commentId} {
        allow read: if isSignedIn();
        allow create: if isSignedIn();
        allow update, delete: if isOwner(resource.data.usuarioId);
      }
    }
    
    // Eventos
    match /eventos/{eventId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isOwner(resource.data.creadorUid);
    }
    
    // Productos
    match /productos/{productId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isOwner(resource.data.vendedorUid);
    }
    
    // Conversaciones
    match /conversaciones/{chatId} {
      allow read, write: if isSignedIn() && 
        request.auth.uid in resource.data.participantes;
      
      // Mensajes (subcolección)
      match /mensajes/{messageId} {
        allow read, write: if isSignedIn() && 
          request.auth.uid in get(/databases/$(database)/documents/conversaciones/$(chatId)).data.participantes;
      }
    }
    
    // Notificaciones
    match /notificaciones/{notifId} {
      allow read, write: if isSignedIn() && 
        isOwner(resource.data.usuarioId);
    }
    
    // Grupos
    match /grupos/{groupId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isOwner(resource.data.creadorUid);
    }
  }
}
```

Haz clic en **"Publicar"**

---

### **Paso 7: Habilitar Storage**

1. En el menú lateral, ve a **"Storage"**
2. Haz clic en **"Comenzar"**
3. Acepta las reglas predeterminadas
4. Elige la ubicación (misma que Firestore)
5. Haz clic en **"Listo"**

**Configurar reglas de Storage:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null 
        && request.resource.size < 5 * 1024 * 1024 // 5MB
        && request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

### **Paso 8: Crear Índices de Firestore**

Ve a **"Firestore Database"** > **"Índices"** y crea los siguientes índices compuestos:

**Índice 1: Publicaciones por usuario y fecha**
```
Colección: publicaciones
Campos:
  - usuarioId (Ascendente)
  - createdAt (Descendente)
```

**Índice 2: Eventos por ciudad y fecha**
```
Colección: eventos
Campos:
  - ciudad (Ascendente)
  - fecha (Ascendente)
```

**Índice 3: Productos por categoría y precio**
```
Colección: productos
Campos:
  - categoria (Ascendente)
  - precio (Ascendente)
```

**Índice 4: Notificaciones por usuario y fecha**
```
Colección: notificaciones
Campos:
  - usuarioId (Ascendente)
  - createdAt (Descendente)
```

---

## ☁️ CONFIGURACIÓN DE CLOUDINARY

### **Paso 1: Crear Cuenta en Cloudinary**

1. Ve a https://cloudinary.com
2. Haz clic en **"Sign Up Free"**
3. Completa el formulario de registro
4. Verifica tu email

---

### **Paso 2: Obtener Credenciales**

1. Inicia sesión en Cloudinary
2. Ve al **Dashboard**
3. Encontrarás tus credenciales:

```
Cloud Name: dxxxxxxxx
API Key: 123456789012345
API Secret: xxxxxxxxxxxxxxxxxxxxxxxx
```

---

### **Paso 3: Configurar Upload Presets**

1. Ve a **Settings** > **Upload**
2. Scroll hasta **Upload presets**
3. Haz clic en **"Add upload preset"**

**Preset 1: Perfiles**
```
Preset name: bandsocial_perfiles
Signing Mode: Unsigned
Folder: perfiles
Transformation:
  - Width: 500
  - Height: 500
  - Crop: fill
  - Quality: auto
  - Format: auto
```

**Preset 2: Publicaciones**
```
Preset name: bandsocial_publicaciones
Signing Mode: Unsigned
Folder: publicaciones
Transformation:
  - Width: 1200
  - Height: 1200
  - Crop: limit
  - Quality: auto
  - Format: auto
```

**Preset 3: Eventos**
```
Preset name: bandsocial_eventos
Signing Mode: Unsigned
Folder: eventos
Transformation:
  - Width: 1920
  - Height: 1080
  - Crop: fill
  - Quality: auto
  - Format: auto
```

**Preset 4: Productos**
```
Preset name: bandsocial_productos
Signing Mode: Unsigned
Folder: productos
Transformation:
  - Width: 800
  - Height: 800
  - Crop: fill
  - Quality: auto
  - Format: auto
```

---

## 🔐 VARIABLES DE ENTORNO

### **Paso 1: Crear Archivo .env**

En la raíz del proyecto (`BANDSOCIALCENTER/`), crea un archivo `.env`:

```bash
# En Linux/Mac
touch .env

# En Windows
type nul > .env
```

---

### **Paso 2: Configurar Variables**

Abre el archivo `.env` y agrega:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=bandsocial-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=bandsocial-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=bandsocial-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:xxxxxxxxxxxxx

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dxxxxxxxx
VITE_CLOUDINARY_UPLOAD_PRESET_PERFILES=bandsocial_perfiles
VITE_CLOUDINARY_UPLOAD_PRESET_PUBLICACIONES=bandsocial_publicaciones
VITE_CLOUDINARY_UPLOAD_PRESET_EVENTOS=bandsocial_eventos
VITE_CLOUDINARY_UPLOAD_PRESET_PRODUCTOS=bandsocial_productos

# Application Configuration
VITE_APP_NAME=BandSocial
VITE_APP_URL=http://localhost:5173
VITE_APP_ENV=development
```

**⚠️ IMPORTANTE:** 
- Reemplaza los valores `XXXXX` con tus credenciales reales
- NO compartas este archivo en repositorios públicos
- El archivo `.env` ya está en `.gitignore`

---

### **Paso 3: Verificar Configuración**

Crea un archivo `.env.example` (sin credenciales reales):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_APP_ID=your_app_id_here

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET_PERFILES=your_preset_here
VITE_CLOUDINARY_UPLOAD_PRESET_PUBLICACIONES=your_preset_here
VITE_CLOUDINARY_UPLOAD_PRESET_EVENTOS=your_preset_here
VITE_CLOUDINARY_UPLOAD_PRESET_PRODUCTOS=your_preset_here

# Application Configuration
VITE_APP_NAME=BandSocial
VITE_APP_URL=http://localhost:5173
VITE_APP_ENV=development
```

Este archivo SÍ se puede compartir en el repositorio.

---

## 🚀 EJECUCIÓN EN DESARROLLO

### **Paso 1: Iniciar Servidor de Desarrollo**

```bash
npm run dev
```

**Salida esperada:**
```
  VITE v7.1.7  ready in 1234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h + enter to show help
```

---

### **Paso 2: Abrir en el Navegador**

1. Abre tu navegador
2. Ve a: http://localhost:5173
3. Deberías ver la página de inicio de BandSocial

---

### **Paso 3: Verificar Funcionamiento**

**Pruebas básicas:**

1. ✅ La página carga sin errores
2. ✅ Puedes ver el formulario de login/registro
3. ✅ Los estilos se aplican correctamente
4. ✅ No hay errores en la consola del navegador

**Abrir consola del navegador:**
- Chrome/Edge: `F12` o `Ctrl+Shift+I`
- Firefox: `F12` o `Ctrl+Shift+K`
- Safari: `Cmd+Option+I`

---

### **Comandos Útiles de Desarrollo**

```bash
# Iniciar servidor de desarrollo
npm run dev

# Iniciar con puerto específico
npm run dev -- --port 3000

# Iniciar y abrir navegador automáticamente
npm run dev -- --open

# Ver información de red
npm run dev -- --host

# Limpiar caché y reiniciar
rm -rf node_modules/.vite
npm run dev
```

---

## 📦 COMPILACIÓN PARA PRODUCCIÓN

### **Paso 1: Compilar el Proyecto**

```bash
npm run build
```

**Proceso de compilación:**
```
vite v7.1.7 building for production...
transforming (533 modules)...
✓ 533 modules transformed.
dist/index.html                    4.98 kB │ gzip: 1.58 kB
dist/assets/css/index.css        320.29 kB │ gzip: 47.29 kB
dist/assets/js/index.js          488.14 kB │ gzip: 113.73 kB
✓ built in 16.29s
```

**Tiempo estimado:** 15-30 segundos

---

### **Paso 2: Verificar Carpeta dist/**

```bash
ls -la dist/
```

**Contenido esperado:**
```
dist/
├── index.html
├── assets/
│   ├── css/
│   │   └── index-xxxxx.css
│   ├── js/
│   │   └── index-xxxxx.js
│   ├── images/
│   └── fonts/
└── ...
```

---

### **Paso 3: Previsualizar Build Local**

```bash
npm run preview
```

**Salida:**
```
  ➜  Local:   http://localhost:4173/
  ➜  Network: http://192.168.1.100:4173/
```

Abre http://localhost:4173 para verificar la versión de producción localmente.

---

## 🌐 DESPLIEGUE EN NETLIFY

### **Método 1: Despliegue Manual (Drag & Drop)**

#### **Paso 1: Crear Cuenta en Netlify**

1. Ve a https://www.netlify.com
2. Haz clic en **"Sign up"**
3. Regístrate con GitHub, GitLab o email

---

#### **Paso 2: Compilar el Proyecto**

```bash
npm run build
```

---

#### **Paso 3: Desplegar**

1. En Netlify, haz clic en **"Add new site"** > **"Deploy manually"**
2. Arrastra la carpeta `dist/` al área de despliegue
3. Espera a que termine la subida (1-2 minutos)
4. Netlify te dará una URL: `https://random-name-xxxxx.netlify.app`

---

### **Método 2: Despliegue con CLI (Recomendado)**

#### **Paso 1: Instalar Netlify CLI**

```bash
npm install -g netlify-cli
```

**Verificar instalación:**
```bash
netlify --version
# Debe mostrar: netlify-cli/x.x.x
```

---

#### **Paso 2: Autenticarse**

```bash
netlify login
```

Se abrirá tu navegador para autorizar la CLI.

---

#### **Paso 3: Inicializar Sitio**

```bash
netlify init
```

**Responde las preguntas:**
```
? What would you like to do? 
  ❯ Create & configure a new site

? Team: 
  ❯ Your Team Name

? Site name (optional): 
  ❯ bandsociall

? Your build command: 
  ❯ npm run build

? Directory to deploy: 
  ❯ dist

? Netlify functions folder: 
  ❯ (leave empty)
```

---

#### **Paso 4: Desplegar**

**Despliegue de prueba:**
```bash
netlify deploy
```

**Despliegue a producción:**
```bash
netlify deploy --prod
```

**Salida esperada:**
```
Deploy path:        /path/to/BandSocial/BANDSOCIALCENTER/dist
Configuration path: /path/to/BandSocial/BANDSOCIALCENTER/netlify.toml

✔ Finished uploading 27 assets
✔ Deploy is live!

Deployed to production URL: https://bandsociall.netlify.app
Unique deploy URL: https://xxxxx--bandsociall.netlify.app
```

---

### **Método 3: Despliegue Continuo con GitHub**

#### **Paso 1: Conectar Repositorio**

1. En Netlify, haz clic en **"Add new site"** > **"Import an existing project"**
2. Selecciona **"GitHub"**
3. Autoriza a Netlify
4. Selecciona el repositorio **"BandSocial"**

---

#### **Paso 2: Configurar Build**

```
Base directory: BANDSOCIALCENTER
Build command: npm run build
Publish directory: BANDSOCIALCENTER/dist
```

---

#### **Paso 3: Agregar Variables de Entorno**

En Netlify:
1. Ve a **"Site settings"** > **"Environment variables"**
2. Agrega todas las variables del archivo `.env`:

```
VITE_FIREBASE_API_KEY = AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN = bandsocial-...
VITE_FIREBASE_PROJECT_ID = bandsocial-...
...
```

---

#### **Paso 4: Desplegar**

1. Haz clic en **"Deploy site"**
2. Netlify compilará y desplegará automáticamente
3. Cada push a `main` desplegará automáticamente

---

### **Configuración Adicional de Netlify**

#### **Archivo netlify.toml**

Crea `netlify.toml` en la raíz del proyecto:

```toml
[build]
  base = "BANDSOCIALCENTER"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

#### **Configurar Dominio Personalizado**

1. En Netlify, ve a **"Domain settings"**
2. Haz clic en **"Add custom domain"**
3. Ingresa tu dominio: `www.bandsocial.com`
4. Sigue las instrucciones para configurar DNS
5. Netlify configurará SSL automáticamente

---

## ✅ VERIFICACIÓN DE LA INSTALACIÓN

### **Checklist de Verificación**

#### **1. Dependencias**
```bash
npm list --depth=0
```
✅ Todas las dependencias instaladas sin errores

---

#### **2. Variables de Entorno**
```bash
cat .env
```
✅ Todas las variables configuradas correctamente

---

#### **3. Firebase**
- ✅ Proyecto creado
- ✅ Authentication habilitado
- ✅ Firestore configurado
- ✅ Storage habilitado
- ✅ Reglas de seguridad aplicadas

---

#### **4. Cloudinary**
- ✅ Cuenta creada
- ✅ Upload presets configurados
- ✅ Credenciales en `.env`

---

#### **5. Servidor de Desarrollo**
```bash
npm run dev
```
✅ Servidor inicia sin errores
✅ Aplicación carga en http://localhost:5173

---

#### **6. Compilación**
```bash
npm run build
```
✅ Build completa sin errores
✅ Carpeta `dist/` generada

---

#### **7. Funcionalidades**
- ✅ Registro de usuario funciona
- ✅ Login funciona
- ✅ Subida de imágenes funciona
- ✅ Crear publicación funciona
- ✅ Chat funciona
- ✅ Notificaciones funcionan

---

### **Pruebas de Funcionalidad**

#### **Test 1: Registro**
1. Abre la aplicación
2. Haz clic en "Registrarse"
3. Completa el formulario
4. Verifica que se cree el usuario en Firebase Authentication

---

#### **Test 2: Login**
1. Ingresa email y contraseña
2. Haz clic en "Iniciar Sesión"
3. Verifica que redirija al feed

---

#### **Test 3: Crear Publicación**
1. En el feed, escribe una publicación
2. Sube una imagen
3. Haz clic en "Publicar"
4. Verifica que aparezca en Firestore

---

#### **Test 4: Chat**
1. Ve al perfil de otro usuario
2. Haz clic en "Mensaje"
3. Envía un mensaje
4. Verifica que aparezca en tiempo real

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Problema 1: npm install falla**

**Error:**
```
npm ERR! code EACCES
npm ERR! syscall access
```

**Solución:**
```bash
# Limpiar caché
npm cache clean --force

# Reinstalar con permisos
sudo npm install
# o en Windows (como Administrador):
npm install
```

---

### **Problema 2: Vite no inicia**

**Error:**
```
Error: Cannot find module 'vite'
```

**Solución:**
```bash
# Reinstalar Vite
npm install vite --save-dev

# O reinstalar todas las dependencias
rm -rf node_modules package-lock.json
npm install
```

---

### **Problema 3: Variables de entorno no se cargan**

**Error:**
```
Firebase: Error (auth/invalid-api-key)
```

**Solución:**
1. Verifica que el archivo `.env` esté en la raíz correcta
2. Verifica que las variables empiecen con `VITE_`
3. Reinicia el servidor de desarrollo
```bash
# Detener servidor (Ctrl+C)
npm run dev
```

---

### **Problema 4: Error de CORS en Firebase**

**Error:**
```
Access to fetch at 'https://firestore.googleapis.com' has been blocked by CORS policy
```

**Solución:**
1. Verifica que el dominio esté autorizado en Firebase Console
2. Ve a Authentication > Settings > Authorized domains
3. Agrega tu dominio de Netlify

---

### **Problema 5: Imágenes no se suben a Cloudinary**

**Error:**
```
Upload failed: Unsigned upload preset not found
```

**Solución:**
1. Verifica que los upload presets existan en Cloudinary
2. Verifica que sean "Unsigned"
3. Verifica que los nombres coincidan con `.env`

---

### **Problema 6: Build falla en Netlify**

**Error:**
```
Build failed: Command failed with exit code 1
```

**Solución:**
1. Verifica que las variables de entorno estén en Netlify
2. Verifica que `netlify.toml` esté configurado correctamente
3. Revisa los logs de build en Netlify

---

### **Problema 7: Aplicación no carga después del deploy**

**Síntoma:** Página en blanco o error 404

**Solución:**
1. Verifica que `netlify.toml` tenga la redirección SPA:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
2. Redeploy el sitio

---

### **Problema 8: Firestore Permission Denied**

**Error:**
```
FirebaseError: Missing or insufficient permissions
```

**Solución:**
1. Verifica las reglas de seguridad en Firestore
2. Verifica que el usuario esté autenticado
3. Verifica que el usuario tenga permisos para la operación

---

## 📊 MONITOREO Y LOGS

### **Logs de Desarrollo**

```bash
# Ver logs en tiempo real
npm run dev

# Ver logs detallados
npm run dev -- --debug
```

---

### **Logs de Firebase**

1. Ve a Firebase Console
2. Selecciona tu proyecto
3. Ve a **"Firestore"** > **"Usage"**
4. Revisa operaciones de lectura/escritura

---

### **Logs de Netlify**

1. Ve a tu sitio en Netlify
2. Haz clic en **"Deploys"**
3. Selecciona un deploy
4. Haz clic en **"Deploy log"**

---

## 🔄 ACTUALIZACIÓN DEL PROYECTO

### **Actualizar Dependencias**

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas las dependencias
npm update

# Actualizar una dependencia específica
npm install <package>@latest

# Actualizar dependencias mayores (con precaución)
npm install <package>@latest
```

---

### **Actualizar desde Git**

```bash
# Obtener últimos cambios
git pull origin main

# Reinstalar dependencias si es necesario
npm install

# Reiniciar servidor
npm run dev
```

---

## 📚 RECURSOS ADICIONALES

### **Documentación Oficial**

- **Vite:** https://vitejs.dev/guide/
- **React:** https://react.dev/learn
- **Firebase:** https://firebase.google.com/docs
- **Cloudinary:** https://cloudinary.com/documentation
- **Netlify:** https://docs.netlify.com

---

### **Comandos de Referencia Rápida**

```bash
# Desarrollo
npm run dev              # Iniciar servidor de desarrollo
npm run build            # Compilar para producción
npm run preview          # Previsualizar build

# Git
git status               # Ver estado
git add .                # Agregar cambios
git commit -m "mensaje"  # Commit
git push                 # Subir cambios

# Netlify
netlify login            # Autenticarse
netlify init             # Inicializar sitio
netlify deploy           # Deploy de prueba
netlify deploy --prod    # Deploy a producción

# Utilidades
npm install              # Instalar dependencias
npm cache clean --force  # Limpiar caché
npm outdated             # Ver actualizaciones
```

---

## 📞 SOPORTE

**Problemas de Instalación:**
- Email: soporte@bandsocial.com
- GitHub Issues: https://github.com/Negromatico/BandSocial/issues

**Documentación:**
- Manual Técnico: `/docs/MANUAL_TECNICO.md`
- Manual de Usuario: `/docs/MANUAL_USUARIO.md`

---

## ✅ CHECKLIST FINAL

Antes de considerar la instalación completa, verifica:

- [ ] Node.js 18+ instalado
- [ ] Git instalado
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Proyecto Firebase creado y configurado
- [ ] Cuenta Cloudinary creada y configurada
- [ ] Archivo `.env` creado con todas las variables
- [ ] Servidor de desarrollo funciona (`npm run dev`)
- [ ] Build de producción funciona (`npm run build`)
- [ ] Aplicación desplegada en Netlify
- [ ] Registro de usuario funciona
- [ ] Login funciona
- [ ] Subida de imágenes funciona
- [ ] Todas las funcionalidades principales probadas

---

**¡Felicitaciones! Has completado la instalación de BandSocial.**

---

**Última actualización:** Febrero 2026  
**Versión del Manual:** 1.0
