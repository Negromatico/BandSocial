# MANUAL DE DESPLIEGUE Y MANTENIMIENTO - BANDSOCIAL

## 📋 INFORMACIÓN GENERAL

**Aplicación:** BandSocial  
**Plataforma de Despliegue:** Netlify  
**URL Producción:** https://bandsociall.netlify.app  
**Repositorio:** https://github.com/Negromatico/BandSocial

---

## 🚀 DESPLIEGUE A PRODUCCIÓN

### Requisitos Previos

- Node.js 18+ instalado
- npm 9+ instalado
- Git configurado
- Cuenta de Netlify
- Cuenta de Firebase
- Cuenta de Cloudinary

---

## 📦 PREPARACIÓN DEL PROYECTO

### 1. Clonar Repositorio

```bash
git clone https://github.com/Negromatico/BandSocial.git
cd BandSocial/BANDSOCIALCENTER
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
VITE_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
VITE_FIREBASE_APP_ID=tu-app-id
VITE_CLOUDINARY_CLOUD_NAME=tu-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=tu-preset
```

### 4. Compilar Proyecto

```bash
npm run build
```

Esto generará la carpeta `dist/` con los archivos optimizados.

---

## 🌐 DESPLIEGUE EN NETLIFY

### Opción 1: Despliegue Manual (CLI)

**Instalar Netlify CLI:**

```bash
npm install -g netlify-cli
```

**Login en Netlify:**

```bash
netlify login
```

**Desplegar a Producción:**

```bash
# Desde la raíz del proyecto BandSocial-main
netlify deploy --prod --dir=BANDSOCIALCENTER/dist
```

### Opción 2: Despliegue Automático (GitHub)

1. Ir a Netlify Dashboard
2. Hacer clic en "New site from Git"
3. Conectar con GitHub
4. Seleccionar repositorio `BandSocial`
5. Configurar:
   - **Base directory:** `BANDSOCIALCENTER`
   - **Build command:** `npm run build`
   - **Publish directory:** `BANDSOCIALCENTER/dist`
6. Agregar variables de entorno en Netlify
7. Hacer clic en "Deploy site"

### Configuración de Variables de Entorno en Netlify

1. Site settings > Environment variables
2. Agregar cada variable:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`

---

## 🔄 FLUJO DE TRABAJO DE DESARROLLO

### 1. Desarrollo Local

```bash
# Crear rama de feature
git checkout -b feature/nueva-funcionalidad

# Desarrollar y probar
npm run dev

# Hacer commits
git add .
git commit -m "feat: descripción del cambio"
```

### 2. Pruebas

```bash
# Ejecutar tests
npm run test

# Build de prueba
npm run build
```

### 3. Push a GitHub

```bash
# Push a rama
git push origin feature/nueva-funcionalidad

# Crear Pull Request en GitHub
# Revisar cambios
# Merge a main
```

### 4. Despliegue Automático

Una vez que se hace merge a `main`, Netlify desplegará automáticamente.

### 5. Verificación

1. Esperar a que termine el build en Netlify
2. Verificar URL de producción
3. Probar funcionalidades críticas
4. Revisar logs de errores

---

## 🔧 COMANDOS ÚTILES

### Desarrollo

```bash
# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint

# Tests
npm run test
```

### Git

```bash
# Ver estado
git status

# Ver cambios
git diff

# Ver historial
git log --oneline

# Deshacer cambios
git checkout -- archivo.js

# Revertir commit
git revert HEAD
```

### Netlify

```bash
# Ver sitios
netlify sites:list

# Ver estado del deploy
netlify status

# Ver logs
netlify logs

# Abrir dashboard
netlify open
```

---

## 📊 MONITOREO Y LOGS

### Netlify Logs

1. Ir a Netlify Dashboard
2. Seleccionar sitio
3. Deploys > Ver deploy específico
4. Ver logs de build

### Firebase Logs

1. Firebase Console
2. Firestore > Usage
3. Authentication > Usage
4. Storage > Usage

### Errores en Producción

**Ver errores en navegador:**
1. Abrir DevTools (F12)
2. Console tab
3. Buscar errores en rojo

**Sentry/Error Tracking (Opcional):**
- Configurar Sentry para tracking de errores
- Ver stack traces completos
- Recibir alertas de errores

---

## 🔐 SEGURIDAD EN PRODUCCIÓN

### Checklist Pre-Despliegue

- ✅ Variables de entorno configuradas
- ✅ API Keys no expuestas en código
- ✅ Reglas de Firebase actualizadas
- ✅ HTTPS habilitado
- ✅ Dominios autorizados configurados
- ✅ Rate limiting implementado
- ✅ Validación de inputs
- ✅ Sanitización de datos

### Dominios Autorizados en Firebase

1. Firebase Console > Authentication
2. Sign-in method > Authorized domains
3. Agregar:
   - `bandsociall.netlify.app`
   - `localhost` (para desarrollo)

---

## 🔄 ACTUALIZACIONES Y MANTENIMIENTO

### Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
npm outdated

# Actualizar todas
npm update

# Actualizar específica
npm install react@latest

# Verificar vulnerabilidades
npm audit

# Corregir vulnerabilidades
npm audit fix
```

### Actualizar Firebase

```bash
npm install firebase@latest
```

### Actualizar React

```bash
npm install react@latest react-dom@latest
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Build Falla en Netlify

**Error: "Module not found"**

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Error: "Out of memory"**

Aumentar memoria en `package.json`:

```json
{
  "scripts": {
    "build": "NODE_OPTIONS=--max-old-space-size=4096 vite build"
  }
}
```

### Errores de Firebase

**Error: "Permission denied"**

- Verificar reglas de Firestore
- Verificar autenticación del usuario
- Revisar índices compuestos

**Error: "Quota exceeded"**

- Revisar uso en Firebase Console
- Optimizar queries
- Considerar upgrade de plan

### Imágenes No Cargan

**Cloudinary:**
- Verificar API key
- Verificar upload preset
- Verificar límites de cuenta

**Firebase Storage:**
- Verificar reglas de Storage
- Verificar tamaño de archivos
- Verificar cuota

---

## 📈 OPTIMIZACIÓN DE RENDIMIENTO

### Code Splitting

Ya implementado con React.lazy:

```javascript
const Profile = lazy(() => import('./pages/Profile'));
const Events = lazy(() => import('./pages/EventosNuevo'));
```

### Optimización de Imágenes

- Usar formatos modernos (WebP)
- Comprimir antes de subir
- Lazy loading de imágenes
- Usar CDN (Cloudinary)

### Caché

Configurar headers en `netlify.toml`:

```toml
[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

---

## 🔄 ROLLBACK

### Revertir a Versión Anterior

**En Netlify:**

1. Ir a Deploys
2. Encontrar deploy anterior funcional
3. Hacer clic en "Publish deploy"

**En Git:**

```bash
# Ver commits
git log --oneline

# Revertir a commit específico
git revert <commit-hash>

# Push
git push origin main
```

---

## 📋 CHECKLIST DE DESPLIEGUE

### Pre-Despliegue

- [ ] Código revisado y testeado
- [ ] Build local exitoso
- [ ] Variables de entorno configuradas
- [ ] Reglas de Firebase actualizadas
- [ ] Índices de Firestore creados
- [ ] Dependencias actualizadas
- [ ] Tests pasando
- [ ] Sin errores de linter

### Post-Despliegue

- [ ] Build en Netlify exitoso
- [ ] URL de producción accesible
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Publicaciones se cargan
- [ ] Eventos se muestran
- [ ] MusicMarket funciona
- [ ] Chat funciona
- [ ] Notificaciones funcionan
- [ ] Imágenes cargan correctamente
- [ ] Sin errores en consola
- [ ] Performance aceptable

---

## 📞 SOPORTE

### Contactos

**Desarrollador Principal:**
- Email: dev@bandsocial.com
- GitHub: @Negromatico

**Netlify Support:**
- https://answers.netlify.com/

**Firebase Support:**
- https://firebase.google.com/support

---

## 📝 NOTAS IMPORTANTES

1. **Siempre hacer backup** antes de cambios mayores
2. **Probar en local** antes de desplegar
3. **Usar ramas** para features nuevas
4. **Documentar cambios** en commits
5. **Monitorear errores** después de deploy
6. **Mantener dependencias actualizadas**
7. **Revisar logs regularmente**

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0
