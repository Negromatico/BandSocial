# 🎯 Crear Unidades de Anuncios en Google AdSense

## ✅ Tu Client ID ya está configurado:
```
ca-pub-7674381219911928
```

---

## 📋 Paso 1: Acceder a AdSense

1. Ve a: **https://adsense.google.com**
2. Inicia sesión con tu cuenta de Google
3. En el menú lateral, click en **"Anuncios"**
4. Luego click en **"Por unidad de anuncio"**

---

## 📋 Paso 2: Crear 3 Unidades de Anuncios

### **Unidad 1: Banner para Feed** 🎯

1. Click en **"Crear nueva unidad de anuncio"**
2. Selecciona **"Anuncio gráfico"**
3. Configura:
   - **Nombre:** `BandSocial Feed Banner`
   - **Tipo de anuncio:** Anuncio gráfico
   - **Tamaño:** Adaptable (recomendado) o 728x90
   - **Estilo:** Automático
4. Click en **"Crear"**
5. **COPIA EL SLOT ID** (ej: `1234567890`)
6. Guárdalo para el siguiente paso

---

### **Unidad 2: Rectangle para Sidebar** 📱

1. Click en **"Crear nueva unidad de anuncio"**
2. Selecciona **"Anuncio gráfico"**
3. Configura:
   - **Nombre:** `BandSocial Sidebar Rectangle`
   - **Tipo de anuncio:** Anuncio gráfico
   - **Tamaño:** Rectángulo mediano (300x250) o Adaptable
   - **Estilo:** Automático
4. Click en **"Crear"**
5. **COPIA EL SLOT ID** (ej: `0987654321`)
6. Guárdalo para el siguiente paso

---

### **Unidad 3: Native para Eventos/Market** 🎨

1. Click en **"Crear nueva unidad de anuncio"**
2. Selecciona **"Anuncio nativo"** o **"In-feed"**
3. Configura:
   - **Nombre:** `BandSocial Native`
   - **Tipo de anuncio:** Anuncio nativo
   - **Tamaño:** Adaptable
   - **Estilo:** Personalizado (opcional)
4. Click en **"Crear"**
5. **COPIA EL SLOT ID** (ej: `1122334455`)
6. Guárdalo para el siguiente paso

---

## 📋 Paso 3: Actualizar el archivo .env

Una vez que tengas los 3 Slot IDs, abre tu archivo `.env` y actualiza:

```env
# Google AdSense Configuration
VITE_ADSENSE_CLIENT_ID=ca-pub-7674381219911928
VITE_ADSENSE_BANNER_SLOT=TU_SLOT_ID_BANNER_AQUI
VITE_ADSENSE_RECTANGLE_SLOT=TU_SLOT_ID_RECTANGLE_AQUI
VITE_ADSENSE_NATIVE_SLOT=TU_SLOT_ID_NATIVE_AQUI
```

**Ejemplo:**
```env
VITE_ADSENSE_CLIENT_ID=ca-pub-7674381219911928
VITE_ADSENSE_BANNER_SLOT=1234567890
VITE_ADSENSE_RECTANGLE_SLOT=9876543210
VITE_ADSENSE_NATIVE_SLOT=5555555555
```

---

## 📋 Paso 4: Reiniciar el Servidor

```bash
# Detén el servidor (Ctrl+C)
# Reinicia:
npm run dev
```

---

## 📋 Paso 5: Verificar en Desarrollo

1. Abre: http://localhost:5176/publicaciones
2. Deberías ver placeholders de anuncios:
   - **En el feed:** Cada 3 publicaciones
   - **En el sidebar:** Anuncio sticky

**Nota:** En desarrollo verás placeholders morados. En producción verán los anuncios reales de Google.

---

## 📋 Paso 6: Desplegar a Producción

```bash
npm run build
netlify deploy --prod
```

---

## 📋 Paso 7: Esperar Aprobación de Google

- **Tiempo:** 1-7 días
- **Requisitos:**
  - ✅ Código de AdSense en el sitio
  - ✅ Contenido original y de calidad
  - ✅ Tráfico real (no bots)
  - ✅ Cumplir políticas de AdSense

**Google revisará tu sitio y te enviará un email cuando esté aprobado.**

---

## 🎯 Ubicaciones de los Anuncios:

### **Feed de Publicaciones:**
```
Publicación 1
Publicación 2
Publicación 3
📢 ANUNCIO BANNER ← Cada 3 posts
Publicación 4
Publicación 5
Publicación 6
📢 ANUNCIO BANNER ← Cada 3 posts
```

### **Sidebar Derecho:**
```
┌─────────────────┐
│ 📢 ANUNCIO      │ ← Sticky (siempre visible)
│   RECTANGLE     │
├─────────────────┤
│ Chats Activos   │
├─────────────────┤
│ Sugerencias     │
└─────────────────┘
```

---

## 💡 Consejos:

1. **Nombres descriptivos:** Usa nombres claros para identificar cada unidad
2. **Tamaños adaptables:** Mejor para responsive
3. **Monitorea el rendimiento:** Revisa qué unidades generan más ingresos
4. **Experimenta:** Prueba diferentes posiciones y tamaños

---

## ⚠️ Importante:

- **NO hagas clic en tus propios anuncios** (puede suspender tu cuenta)
- **NO pidas a otros que hagan clic** (viola las políticas)
- **Espera pacientemente** la aprobación de Google
- **Mantén contenido de calidad** en tu sitio

---

## 📊 Después de la Aprobación:

### Monitorea tu Dashboard de AdSense:
- **Impresiones:** Cuántas veces se muestran los anuncios
- **Clics:** Cuántos clics reciben
- **CTR:** Porcentaje de clics (Click-Through Rate)
- **CPM:** Costo por mil impresiones
- **Ingresos:** Ganancias diarias/mensuales

### Optimiza:
- Ajusta posiciones según rendimiento
- Prueba diferentes tamaños
- Analiza qué páginas generan más ingresos

---

## 🎉 ¡Listo!

Una vez que completes estos pasos, tu sitio estará completamente configurado con Google AdSense.

**Próximo paso:** Crear las 3 unidades de anuncios y copiar los Slot IDs al archivo `.env`

¿Necesitas ayuda con algún paso? 💰✨
