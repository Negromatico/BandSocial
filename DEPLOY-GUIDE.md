# 🚀 GUÍA DE DEPLOY A NETLIFY - BANDSOCIAL

## MÉTODO 3: NETLIFY CLI

### REQUISITOS PREVIOS
- Node.js instalado
- npm instalado
- Cuenta en Netlify (gratis en netlify.com)

---

## PASO 1: INSTALAR NETLIFY CLI

Abre PowerShell o CMD y ejecuta:

```bash
npm install -g netlify-cli
```

Verifica la instalación:
```bash
netlify --version
```

---

## PASO 2: LOGIN EN NETLIFY

```bash
netlify login
```

Esto abrirá tu navegador para autorizar la CLI. Haz clic en "Authorize".

---

## PASO 3: PREPARAR EL PROYECTO

Navega a la carpeta del proyecto:
```bash
cd d:\BandSocial-main\BANDSOCIALCENTER
```

Instala las dependencias (si no están instaladas):
```bash
npm install
```

---

## PASO 4: BUILD DEL PROYECTO

Crea el build de producción:
```bash
npm run build
```

Esto generará la carpeta `dist` con los archivos optimizados.

---

## PASO 5: DEPLOY A NETLIFY

### Opción A: Deploy de Prueba (Draft)

```bash
netlify deploy
```

Cuando te pregunte:
- **"What would you like to do?"** → Selecciona `+ Create & configure a new site`
- **"Team:"** → Selecciona tu equipo (o personal)
- **"Site name:"** → Escribe `bandsocial` (o el nombre que prefieras)
- **"Publish directory:"** → Escribe `dist`

Netlify te dará una URL de preview como:
```
https://deploy-preview-xxx--bandsocial.netlify.app
```

Revisa que todo funcione correctamente.

### Opción B: Deploy Directo a Producción

Si ya probaste y todo funciona:

```bash
netlify deploy --prod
```

O en un solo comando:
```bash
netlify deploy --prod --dir=dist
```

---

## PASO 6: CONFIGURAR VARIABLES DE ENTORNO

### Opción 1: Desde la CLI

```bash
netlify env:set VITE_FIREBASE_API_KEY "AIzaSyAS9p4Ifg_gxA6EfTj5pWoQ9vK-KKOfzw0"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "bandas-f9c77.firebaseapp.com"
netlify env:set VITE_FIREBASE_PROJECT_ID "bandas-f9c77"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "bandas-f9c77.appspot.com"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "1040136309254"
netlify env:set VITE_FIREBASE_APP_ID "1:1040136309254:web:3454ff467b23236e1fd187"
```

### Opción 2: Desde el Dashboard

1. Ve a tu sitio en netlify.com
2. Site settings → Environment variables
3. Agrega cada variable manualmente

**IMPORTANTE:** Después de agregar variables, haz un nuevo deploy:
```bash
netlify deploy --prod
```

---

## PASO 7: VERIFICAR EL SITIO

Tu sitio estará disponible en:
```
https://bandsocial.netlify.app
```

O el nombre que hayas elegido.

---

## COMANDOS ÚTILES

### Ver información del sitio
```bash
netlify status
```

### Abrir el sitio en el navegador
```bash
netlify open:site
```

### Abrir el dashboard de Netlify
```bash
netlify open:admin
```

### Ver logs
```bash
netlify logs
```

### Listar sitios
```bash
netlify sites:list
```

### Vincular a un sitio existente
```bash
netlify link
```

---

## SCRIPT AUTOMÁTICO

Hemos creado un script PowerShell para automatizar el proceso:

```bash
.\deploy.ps1
```

Este script:
1. ✅ Verifica el directorio
2. ✅ Instala dependencias
3. ✅ Crea el build
4. ✅ Verifica que todo esté correcto

Después solo necesitas ejecutar:
```bash
netlify login
netlify deploy --prod
```

---

## DEPLOY CONTINUO (OPCIONAL)

Para deploys automáticos cada vez que hagas push a Git:

1. Sube tu proyecto a GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/TU_USUARIO/bandsocial.git
git push -u origin main
```

2. En Netlify CLI:
```bash
netlify init
```

3. Selecciona "Create & configure a new site"
4. Conecta tu repositorio de GitHub
5. Netlify hará deploy automático en cada push

---

## SOLUCIÓN DE PROBLEMAS

### Error: "netlify: command not found"
```bash
# Reinstala Netlify CLI
npm uninstall -g netlify-cli
npm install -g netlify-cli
```

### Error: "Build failed"
```bash
# Verifica que el build funcione localmente
npm run build

# Si hay errores, revisa:
npm run lint
```

### Error: "Page not found" en rutas
✅ Ya está solucionado con `netlify.toml` y `_redirects`

### Error: Variables de entorno no funcionan
```bash
# Verifica que estén configuradas
netlify env:list

# Agrega las que falten
netlify env:set NOMBRE_VARIABLE "valor"

# Haz un nuevo deploy
netlify deploy --prod
```

---

## ACTUALIZAR EL SITIO

Cada vez que hagas cambios:

```bash
# 1. Build
npm run build

# 2. Deploy
netlify deploy --prod
```

O usa el script:
```bash
.\deploy.ps1
netlify deploy --prod
```

---

## DOMINIO PERSONALIZADO

Para usar tu propio dominio (bandsocial.com.co):

```bash
netlify domains:add bandsocial.com.co
```

Luego configura los DNS según las instrucciones de Netlify.

---

## COSTOS

**Plan Gratuito:**
- ✅ 100 GB bandwidth/mes
- ✅ 300 build minutes/mes
- ✅ SSL gratis
- ✅ Suficiente para empezar

---

## SOPORTE

- Documentación: https://docs.netlify.com
- CLI Docs: https://cli.netlify.com
- Community: https://answers.netlify.com

---

¡Listo! Tu proyecto BandSocial estará en línea en minutos. 🎉
