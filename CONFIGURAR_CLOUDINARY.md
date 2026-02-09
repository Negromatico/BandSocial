# Configuración de Cloudinary para BandSocial

## Problema Actual
Error: "Upload preset not found" al subir imágenes de eventos.

## Solución: Crear Upload Preset en Cloudinary

### Paso 1: Acceder a Cloudinary
1. Ve a https://cloudinary.com/
2. Inicia sesión con tu cuenta
3. Tu Cloud Name es: `ddijtaal1`

### Paso 2: Crear Upload Preset
1. En el dashboard, ve a **Settings** (⚙️ en la esquina superior derecha)
2. Selecciona la pestaña **Upload**
3. Scroll hacia abajo hasta **Upload presets**
4. Haz clic en **Add upload preset**

### Paso 3: Configurar el Preset "Bandas"
Configura el preset con estos valores:

**Información Básica:**
- **Preset name:** `Bandas`
- **Signing Mode:** `Unsigned` ⚠️ MUY IMPORTANTE
- **Folder:** Dejar vacío (se especifica en el código)

**Configuración Recomendada:**
- **Use filename:** Yes
- **Unique filename:** Yes
- **Overwrite:** No
- **Auto tagging:** 0.6 (opcional)

**Transformaciones (opcional pero recomendado):**
- **Width:** 1920
- **Height:** 1080
- **Crop mode:** limit
- **Quality:** auto:good
- **Format:** auto

### Paso 4: Guardar
1. Haz clic en **Save** al final de la página
2. Verifica que el preset "Bandas" aparezca en la lista

## Presets Necesarios para BandSocial

El proyecto usa los siguientes presets:

### 1. Preset "Bandas" (Principal)
- **Uso:** Eventos, productos, publicaciones
- **Carpetas:** 
  - `eventos/` - Imágenes de eventos
  - `productos/` - Imágenes de productos
  - `publicaciones/` - Imágenes de posts
  - `perfiles/` - Fotos de perfil
  - `portadas/` - Banners de perfil

### 2. Configuración Actual en el Código

```javascript
// src/services/cloudinary.js
export async function uploadToCloudinary(file, preset = 'Bandas', folder = 'bandas') {
  const url = `https://api.cloudinary.com/v1_1/ddijtaal1/image/upload`;
  // ...
}
```

**Usos en el proyecto:**
```javascript
// Eventos
uploadToCloudinary(imagenFile, 'Bandas', 'eventos')

// Productos
uploadToCloudinary(file, 'Bandas', 'productos')

// Perfil
uploadToCloudinary(file, 'Bandas', 'perfiles')

// Banner
uploadToCloudinary(file, 'Bandas', 'portadas')
```

## Verificar que Funciona

### Prueba 1: Crear un Evento
1. Ve a la página de Eventos
2. Haz clic en "Crear Evento"
3. Llena el formulario
4. Sube una imagen
5. Haz clic en "Crear Evento"
6. ✅ Debería funcionar sin errores

### Prueba 2: Verificar en Cloudinary
1. Ve a **Media Library** en Cloudinary
2. Deberías ver la carpeta `eventos/`
3. Dentro debería estar la imagen que subiste

## Solución Alternativa (Si no puedes crear el preset)

Si no tienes acceso para crear presets, puedes usar el preset por defecto de Cloudinary:

### Opción A: Usar preset por defecto
Edita `src/services/cloudinary.js`:

```javascript
export async function uploadToCloudinary(file, preset = 'ml_default', folder = 'bandas') {
  // ...
}
```

### Opción B: Usar signed uploads (requiere backend)
Esto requiere un servidor backend para firmar las solicitudes. No recomendado para este proyecto.

## Estructura de Carpetas en Cloudinary

```
ddijtaal1/
├── eventos/
│   ├── evento1.jpg
│   ├── evento2.jpg
│   └── ...
├── productos/
│   ├── guitarra1.jpg
│   ├── bajo1.jpg
│   └── ...
├── perfiles/
│   ├── user1.jpg
│   ├── user2.jpg
│   └── ...
├── portadas/
│   ├── banner1.jpg
│   ├── banner2.jpg
│   └── ...
└── publicaciones/
    ├── post1.jpg
    ├── post2.jpg
    └── ...
```

## Límites de Cloudinary (Plan Gratuito)

- **Almacenamiento:** 25 GB
- **Ancho de banda:** 25 GB/mes
- **Transformaciones:** 25,000/mes
- **Imágenes:** Ilimitadas

## Troubleshooting

### Error: "Upload preset not found"
✅ **Solución:** Crear el preset "Bandas" como unsigned

### Error: "Invalid signature"
❌ **Causa:** El preset está configurado como "signed"
✅ **Solución:** Cambiar a "unsigned"

### Error: "Unauthorized"
❌ **Causa:** Cloud name incorrecto
✅ **Solución:** Verificar que sea `ddijtaal1`

### Error: "File too large"
❌ **Causa:** Imagen muy pesada
✅ **Solución:** Comprimir la imagen antes de subir

## Mejoras Futuras

1. **Optimización automática:**
   - Configurar transformaciones en el preset
   - Reducir tamaño automáticamente
   - Convertir a WebP para mejor rendimiento

2. **Múltiples presets:**
   - `Bandas_Eventos` - Optimizado para eventos
   - `Bandas_Productos` - Optimizado para productos
   - `Bandas_Perfiles` - Optimizado para avatares

3. **Backup:**
   - Configurar backup automático
   - Exportar imágenes periódicamente

## Recursos

- **Dashboard:** https://cloudinary.com/console
- **Documentación:** https://cloudinary.com/documentation
- **Upload Presets:** https://cloudinary.com/documentation/upload_presets

---

**Última actualización:** Diciembre 2025  
**Cloud Name:** ddijtaal1  
**Preset Principal:** Bandas (unsigned)
