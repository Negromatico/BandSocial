# 📊 Sistema de Estadísticas Avanzadas - BandSocial

## 🎯 Descripción General

Sistema completo de estadísticas con gráficos circulares (Pie/Doughnut), filtros temporales y métricas avanzadas de sesión y actividad de usuarios.

## ✨ Características Principales

### 1. **Gráficos Circulares**
- ✅ Pie Charts (gráficos de pastel)
- ✅ Doughnut Charts (gráficos de dona)
- ✅ Colores personalizados y atractivos
- ✅ Tooltips con porcentajes
- ✅ Leyendas interactivas

### 2. **Filtros Temporales**
- ✅ **Día:** Últimas 24 horas
- ✅ **Semana:** Últimos 7 días
- ✅ **Mes:** Últimos 30 días
- ✅ **Año:** Últimos 365 días
- ✅ **Todo:** Desde el inicio

### 3. **Categorías de Estadísticas**

#### 📊 **Resumen General**
- Vista rápida de todas las categorías
- 4 gráficos circulares principales
- Tarjetas de resumen con iconos

#### 👥 **Usuarios**
- Total de usuarios
- Por tipo (Músico, Banda, Productor, etc.)
- Por plan (Free vs Premium)
- Por actividad (Activos vs Inactivos)
- Por departamento (Top 10)
- Por género musical (Top 10)
- Por instrumento (Top 10)
- Nuevos registros en el período

#### 📝 **Publicaciones**
- Total de publicaciones
- Por tipo (Busco Músico, Busco Banda, Evento, Otro)
- Por ciudad (Top 10)
- Con/Sin imágenes
- Total de reacciones
- Total de comentarios
- Promedio de reacciones por publicación
- Promedio de comentarios por publicación
- Top 5 publicaciones más populares

#### 🎉 **Eventos**
- Total de eventos
- Por tipo
- Por ciudad (Top 10)
- Por género musical (Top 10)
- Gratuitos vs Pagos
- Pasados vs Próximos
- Total de asistentes
- Promedio de asistentes por evento
- Top 5 eventos más populares

#### 🛒 **Productos**
- Total de productos
- Por categoría
- Por estado (Nuevo, Usado, etc.)
- Por ciudad (Top 10)
- Con/Sin imágenes
- Precio promedio
- Precio mínimo y máximo
- Valor total del inventario
- Top 5 productos más caros
- Top 5 productos más baratos

#### 🔐 **Sesiones y Registros**
- Nuevos registros por tipo
- Total de inicios de sesión
- Usuarios activos únicos
- Tiempo promedio de conexión
- Tiempo total de conexión
- Registros por día
- Inicios de sesión por día

## 🏗️ Arquitectura

### Archivos Principales

```
src/
├── services/
│   └── estadisticasAvanzadas.js    # Servicio principal de estadísticas
├── components/
│   ├── EstadisticasAvanzadas.jsx   # Componente de visualización
│   └── EstadisticasAvanzadas.css   # Estilos personalizados
└── pages/
    └── AdminDashboard.jsx          # Integración en panel admin
```

### Colecciones de Firestore

```
firestore/
├── perfiles/              # Usuarios principales
├── publicaciones/         # Publicaciones
├── eventos/               # Eventos
├── productos/             # Productos del marketplace
└── sesiones/              # Tracking de sesiones (NUEVO)
    ├── userId             # ID del usuario
    ├── tipo               # 'login' o 'logout'
    ├── timestamp          # Fecha y hora
    ├── duracion           # Duración en minutos (solo logout)
    └── fecha              # Fecha en formato YYYY-MM-DD
```

## 📦 Dependencias

```json
{
  "react-chartjs-2": "^5.x",
  "chart.js": "^4.x"
}
```

### Instalación

```bash
npm install react-chartjs-2 chart.js --legacy-peer-deps
```

## 🚀 Uso

### 1. En el Panel de Administrador

```javascript
import EstadisticasAvanzadas from '../components/EstadisticasAvanzadas';

<Tab eventKey="estadisticas" title="📊 Estadísticas Avanzadas">
  <EstadisticasAvanzadas />
</Tab>
```

### 2. Tracking de Sesiones

#### Registrar Inicio de Sesión

```javascript
import estadisticasAvanzadas from '../services/estadisticasAvanzadas';

// Al iniciar sesión
await estadisticasAvanzadas.registrarInicioSesion(user.uid);
```

#### Registrar Cierre de Sesión

```javascript
// Al cerrar sesión
const duracionMinutos = calcularDuracionSesion(); // Tu lógica
await estadisticasAvanzadas.registrarCierreSesion(user.uid, duracionMinutos);
```

### 3. Obtener Estadísticas Programáticamente

```javascript
import estadisticasAvanzadas from '../services/estadisticasAvanzadas';

// Estadísticas de usuarios del último mes
const statsUsuarios = await estadisticasAvanzadas.getEstadisticasUsuarios('mes');

// Estadísticas de publicaciones de la última semana
const statsPubs = await estadisticasAvanzadas.getEstadisticasPublicaciones('semana');

// Resumen general de todo
const resumen = await estadisticasAvanzadas.getResumenGeneral('todo');
```

## 🎨 Personalización

### Colores de Gráficos

Los colores se generan automáticamente con una paleta predefinida:

```javascript
const colors = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
  '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'
];
```

### Estilos de Tarjetas

```css
.stat-card-users {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card-posts {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card-events {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card-products {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}
```

## 🔒 Seguridad (Firestore Rules)

```javascript
// Solo administradores pueden leer sesiones
match /sesiones/{sessionId} {
  allow read: if isAdmin();
  allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
  allow update: if false;
  allow delete: if isAdmin();
}
```

## 📊 Métricas Disponibles

### Usuarios
- Total, Activos, Inactivos, Premium, Free
- Distribución por tipo, departamento, género, instrumento
- Nuevos registros por período

### Publicaciones
- Total, con/sin imágenes
- Distribución por tipo y ciudad
- Engagement (reacciones, comentarios)
- Publicaciones más populares

### Eventos
- Total, gratuitos, pagos, pasados, próximos
- Distribución por tipo, ciudad, género
- Asistencia total y promedio
- Eventos más populares

### Productos
- Total, con/sin imágenes
- Distribución por categoría, estado, ciudad
- Análisis de precios (promedio, min, max)
- Valor total del inventario

### Sesiones
- Nuevos registros
- Inicios de sesión
- Usuarios activos únicos
- Tiempo de conexión (promedio y total)

## 🐛 Solución de Problemas

### Error: "Missing or insufficient permissions"

**Solución:** Asegúrate de que las reglas de Firestore estén desplegadas correctamente.

```bash
firebase deploy --only firestore:rules
```

### Gráficos no se muestran

**Solución:** Verifica que Chart.js esté instalado correctamente.

```bash
npm install react-chartjs-2 chart.js --legacy-peer-deps
```

### Datos no cargan

**Solución:** 
1. Verifica que el usuario sea administrador
2. Revisa la consola del navegador para errores
3. Confirma que las colecciones existen en Firestore

## 📈 Rendimiento

- **Carga inicial:** ~2-3 segundos (depende de la cantidad de datos)
- **Cambio de período:** ~1-2 segundos
- **Cambio de pestaña:** Instantáneo (datos ya cargados)

### Optimizaciones

- Carga paralela de todas las estadísticas
- Caché de datos en memoria
- Lazy loading de gráficos
- Paginación en tablas (si aplica)

## 🔄 Actualizaciones Futuras

- [ ] Exportar estadísticas a PDF
- [ ] Exportar estadísticas a Excel
- [ ] Comparación entre períodos
- [ ] Gráficos de línea para tendencias
- [ ] Filtros adicionales (por ciudad, tipo, etc.)
- [ ] Estadísticas en tiempo real
- [ ] Notificaciones de métricas importantes

## 📞 Soporte

Para problemas o sugerencias:
1. Revisa la documentación completa
2. Verifica los logs de la consola
3. Confirma que las reglas de Firestore estén actualizadas
4. Verifica que el usuario tenga permisos de administrador

---

**Última actualización:** 13 de febrero de 2026
**Versión:** 2.0
**Autor:** Sistema BandSocial
