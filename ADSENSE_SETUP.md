# 🚀 Guía Rápida: Configurar Google AdSense en BandSocial

## ✅ Lo que ya está hecho:

1. ✅ Componente `AdBanner.jsx` creado
2. ✅ Estilos `AdBanner.css` creados
3. ✅ Variables de entorno configuradas en `.env.example`
4. ✅ Anuncios implementados en `PublicacionesNuevo.jsx`:
   - Cada 3 publicaciones en el feed
   - Sidebar derecho (sticky)

---

## 📋 Paso 1: Registrarse en Google AdSense

### 1.1 Crear Cuenta

1. Ve a: **https://www.google.com/adsense**
2. Click en **"Comenzar"**
3. Inicia sesión con tu cuenta de Google
4. Completa el formulario:
   - **URL del sitio:** `https://bandsociall.netlify.app`
   - **País:** Colombia
   - **Acepta términos y condiciones**

### 1.2 Agregar tu Sitio

1. En el dashboard, ve a **"Sitios"**
2. Click en **"Agregar sitio"**
3. Ingresa: `bandsociall.netlify.app`
4. Copia el código de verificación que te dan

### 1.3 Verificar tu Sitio

Google te dará un código como este:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
     crossorigin="anonymous"></script>
```

**Agrégalo a `index.html`:**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <link rel="icon" type="image/svg+xml" href="/vite.svg" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>BandSocial - Red Social Musical</title>
  
  <!-- Google AdSense -->
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
       crossorigin="anonymous"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>
```

---

## 📋 Paso 2: Configurar Variables de Entorno

### 2.1 Obtener tu Client ID

Tu Client ID es el número que aparece después de `ca-pub-` en el código de AdSense.

Ejemplo: Si tu código es `ca-pub-1234567890123456`, tu Client ID es `ca-pub-1234567890123456`

### 2.2 Crear Unidades de Anuncios

1. En AdSense, ve a **"Anuncios" → "Por unidad de anuncio"**
2. Click en **"Crear nueva unidad de anuncio"**

**Crea 3 unidades:**

#### **Unidad 1: Banner (Feed)**
- **Nombre:** BandSocial Feed Banner
- **Tipo:** Anuncio gráfico
- **Tamaño:** Adaptable (728x90)
- Copia el **Slot ID** (ej: `1234567890`)

#### **Unidad 2: Rectangle (Sidebar)**
- **Nombre:** BandSocial Sidebar Rectangle
- **Tipo:** Anuncio gráfico
- **Tamaño:** Rectángulo mediano (300x250)
- Copia el **Slot ID** (ej: `0987654321`)

#### **Unidad 3: Native (Eventos/Market)**
- **Nombre:** BandSocial Native
- **Tipo:** Anuncio nativo
- **Tamaño:** Adaptable
- Copia el **Slot ID** (ej: `1122334455`)

### 2.3 Actualizar `.env`

Abre tu archivo `.env` y agrega:

```env
# Google AdSense Configuration
VITE_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
VITE_ADSENSE_BANNER_SLOT=1234567890
VITE_ADSENSE_RECTANGLE_SLOT=0987654321
VITE_ADSENSE_NATIVE_SLOT=1122334455
```

**Reemplaza:**
- `XXXXXXXXXXXXXXXX` con tu Client ID real
- `1234567890` con tu Slot ID de Banner
- `0987654321` con tu Slot ID de Rectangle
- `1122334455` con tu Slot ID de Native

---

## 📋 Paso 3: Implementar en Más Páginas

### 3.1 EventosNuevo.jsx

Agrega al inicio del archivo:

```jsx
import AdBanner from '../components/AdBanner';
```

Busca donde se mapean los eventos (línea ~256) y modifica:

```jsx
<div className="eventos-grid">
  {eventosOrdenados.map((ev, index) => {
    const { dia, mes } = formatFecha(ev.fecha);
    const numAsistentes = ev.asistentes?.length || 0;
    
    return (
      <React.Fragment key={ev.id}>
        <div className="evento-card">
          {/* ... contenido del evento ... */}
        </div>

        {/* Anuncio cada 4 eventos */}
        {(index + 1) % 4 === 0 && (
          <AdBanner 
            format="banner" 
            position="events"
            isPremium={false} // Cambiar según el plan del usuario
          />
        )}
      </React.Fragment>
    );
  })}
</div>
```

### 3.2 MusicmarketNuevo.jsx

Similar a EventosNuevo:

```jsx
import AdBanner from '../components/AdBanner';

// En el mapeo de productos:
{productosFiltrados.map((producto, index) => (
  <React.Fragment key={producto.id}>
    <div className="producto-card">
      {/* ... contenido del producto ... */}
    </div>

    {/* Anuncio cada 5 productos */}
    {(index + 1) % 5 === 0 && (
      <AdBanner 
        format="native" 
        position="market"
        isPremium={false}
      />
    )}
  </React.Fragment>
))}
```

---

## 📋 Paso 4: Desplegar y Esperar Aprobación

### 4.1 Build y Deploy

```bash
npm run build
netlify deploy --prod
```

### 4.2 Esperar Aprobación de Google

- **Tiempo:** 1-7 días
- **Requisitos:**
  - Contenido original y de calidad ✅
  - Tráfico real (no bots)
  - Cumplir políticas de AdSense
  - Sitio accesible públicamente ✅

### 4.3 Verificar en AdSense

1. Ve al dashboard de AdSense
2. Verifica el estado de tu sitio
3. Espera el email de aprobación

---

## 📊 Paso 5: Monitorear Rendimiento

### 5.1 Dashboard de AdSense

Revisa diariamente:
- **Impresiones:** Número de veces que se muestran los anuncios
- **Clics:** Número de clics en los anuncios
- **CTR:** Click-Through Rate (% de clics)
- **CPM:** Costo por Mil impresiones
- **Ingresos:** Ganancias del día

### 5.2 Google Analytics

Conecta AdSense con Analytics para ver:
- Páginas con mejor rendimiento
- Ubicaciones de anuncios más efectivas
- Comportamiento de usuarios

---

## 🎯 Optimización de Anuncios

### Mejores Prácticas:

1. **Ubicación:**
   - ✅ Feed: Cada 3-5 publicaciones
   - ✅ Sidebar: Sticky (siempre visible)
   - ✅ Eventos: Cada 4 eventos
   - ✅ Market: Cada 5 productos

2. **Tamaños:**
   - Banner: 728x90 (desktop), adaptable (móvil)
   - Rectangle: 300x250 (sidebar)
   - Native: Adaptable (se integra con el diseño)

3. **Experiencia de Usuario:**
   - No saturar con anuncios
   - Mantener diseño limpio
   - Ofrecer opción Premium sin anuncios

4. **A/B Testing:**
   - Probar diferentes posiciones
   - Medir CTR de cada ubicación
   - Ajustar frecuencia según feedback

---

## 💰 Proyección de Ingresos

### Escenario Conservador (1,000 visitas/día):

| Métrica | Valor |
|---------|-------|
| Impresiones/día | 18,000 |
| CPM promedio | $3 USD |
| Ingresos/día | $54 USD |
| Ingresos/mes | **$1,620 USD** |

### Escenario Optimista (10,000 visitas/día):

| Métrica | Valor |
|---------|-------|
| Impresiones/día | 180,000 |
| CPM promedio | $4 USD |
| Ingresos/día | $720 USD |
| Ingresos/mes | **$21,600 USD** |

---

## ⚠️ Políticas de AdSense (Importante)

### ❌ NO Hacer:

- Hacer clic en tus propios anuncios
- Pedir a otros que hagan clic
- Colocar anuncios en contenido prohibido
- Modificar el código de los anuncios
- Ocultar anuncios o hacerlos confusos

### ✅ SÍ Hacer:

- Crear contenido original y de calidad
- Respetar la experiencia del usuario
- Seguir las políticas de AdSense
- Monitorear el rendimiento
- Responder a notificaciones de Google

---

## 🔧 Troubleshooting

### Problema: Los anuncios no aparecen

**Soluciones:**
1. Verifica que el sitio esté aprobado
2. Revisa las variables de entorno
3. Asegúrate de estar en producción (no desarrollo)
4. Espera 24-48h después de la aprobación

### Problema: Ingresos muy bajos

**Soluciones:**
1. Aumenta el tráfico del sitio
2. Optimiza la ubicación de los anuncios
3. Mejora el CTR con mejor posicionamiento
4. Crea contenido más relevante

### Problema: Cuenta suspendida

**Soluciones:**
1. Lee el email de Google cuidadosamente
2. Corrige las violaciones de políticas
3. Apela la decisión si fue un error
4. Contacta al soporte de AdSense

---

## 📞 Soporte

### Google AdSense:
- **Centro de ayuda:** https://support.google.com/adsense
- **Foro de la comunidad:** https://support.google.com/adsense/community
- **Email:** Disponible en el dashboard

### BandSocial:
- **Documentación:** Ver `ADVERTISING_GUIDE.md`
- **Componente:** `src/components/AdBanner.jsx`

---

## ✅ Checklist Final

Antes de lanzar los anuncios:

- [ ] Cuenta de AdSense creada y aprobada
- [ ] Código de verificación agregado a `index.html`
- [ ] Variables de entorno configuradas en `.env`
- [ ] Unidades de anuncios creadas (Banner, Rectangle, Native)
- [ ] Componente `AdBanner` implementado en PublicacionesNuevo
- [ ] Anuncios implementados en EventosNuevo (opcional)
- [ ] Anuncios implementados en MusicmarketNuevo (opcional)
- [ ] Build y deploy a Netlify
- [ ] Verificar que los anuncios aparecen en producción
- [ ] Monitorear dashboard de AdSense

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, tu sitio estará monetizado con Google AdSense.

**Próximos pasos:**
1. Aumentar tráfico con SEO y marketing
2. Optimizar ubicaciones según rendimiento
3. Ofrecer plan Premium sin anuncios
4. Diversificar ingresos con otras fuentes

**Ingresos potenciales:** $1,000-20,000 USD/mes según tráfico

¡Éxito con la monetización! 💰🎸✨
