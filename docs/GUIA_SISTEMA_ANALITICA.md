# 📊 Guía Completa del Sistema de Analítica - BandSocial

## 🎯 Descripción General

Sistema completo de analítica y métricas para red social de músicos, implementado con Firebase (Firestore + Cloud Functions) que permite visualizar estadísticas jerárquicas por ubicación geográfica en tiempo real.

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  EstadisticasGeograficasAvanzadas.jsx                │   │
│  │  - Vista Departamentos                                │   │
│  │  - Vista Ciudades (Drill-down)                        │   │
│  │  - Vista Detalle Ciudad                               │   │
│  │  - Gráficos (Chart.js)                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                           ↓                                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  analyticsService.js                                  │   │
│  │  - Consultas optimizadas                              │   │
│  │  - Cálculos de métricas                               │   │
│  │  - Cache de datos                                     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  FIREBASE FIRESTORE                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Colecciones Base │  │ Colecciones      │                │
│  │ - perfiles       │  │ Analytics        │                │
│  │ - eventos        │  │ - analytics_     │                │
│  │ - publicaciones  │  │   departamentos  │                │
│  │ - productos      │  │ - analytics_     │                │
│  │                  │  │   ciudades       │                │
│  └──────────────────┘  └──────────────────┘                │
└─────────────────────────────────────────────────────────────┘
                           ↑
┌─────────────────────────────────────────────────────────────┐
│              CLOUD FUNCTIONS (Node.js)                       │
│  - onUserCreated                                             │
│  - onEventoCreated                                           │
│  - onPublicacionCreated                                      │
│  - onPublicacionLiked                                        │
│  - onProductoCreated                                         │
│  - actualizarEstadisticasMensuales (Scheduled)              │
│  - calcularEngagement (Callable)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Estructura de Datos

### Colección: `analytics_departamentos`

```javascript
{
  departamento: "Antioquia",
  totalUsuarios: 1250,
  usuariosPremium: 85,
  totalEventos: 340,
  totalAsistentes: 4500,
  totalPublicaciones: 2800,
  totalReacciones: 15600,
  totalProductos: 450,
  sumaPrecios: 12500000,
  publicacionesPorTipo: {
    texto: 1200,
    imagen: 1400,
    video: 200
  },
  productosPorCategoria: {
    instrumentos: 200,
    equipos: 150,
    servicios: 100
  },
  ultimaActualizacion: Timestamp
}
```

### Colección: `analytics_ciudades`

```javascript
{
  departamento: "Antioquia",
  ciudad: "Medellín",
  totalUsuarios: 850,
  usuariosPremium: 60,
  totalEventos: 220,
  totalAsistentes: 3200,
  totalPublicaciones: 1900,
  totalReacciones: 10500,
  totalProductos: 300,
  sumaPrecios: 8500000,
  publicacionesPorTipo: {
    texto: 800,
    imagen: 950,
    video: 150
  },
  productosPorCategoria: {
    instrumentos: 140,
    equipos: 100,
    servicios: 60
  },
  ultimaActualizacion: Timestamp
}
```

### Subcolección: `analytics_departamentos/{dept}/historial`

```javascript
{
  mes: "2026-01-01T00:00:00.000Z",
  totalUsuarios: 1200,
  totalEventos: 320,
  totalPublicaciones: 2600,
  // ... todas las métricas del mes
  timestamp: Timestamp
}
```

---

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias de Cloud Functions

```bash
cd functions
npm install
```

### 2. Configurar Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

### 3. Desplegar Cloud Functions

```bash
firebase deploy --only functions
```

### 4. Crear Índices en Firestore

```bash
firebase deploy --only firestore:indexes
```

### 5. Integrar en AdminDashboard

```javascript
// AdminDashboard.jsx
import EstadisticasGeograficasAvanzadas from '../components/EstadisticasGeograficasAvanzadas';

// Agregar nueva pestaña
<Tab eventKey="analytics" title="Analítica Geográfica">
  <EstadisticasGeograficasAvanzadas />
</Tab>
```

---

## 📊 Métricas Disponibles

### Métricas Principales
- **Total Usuarios**: Usuarios registrados por ubicación
- **Usuarios Premium**: Usuarios con plan premium
- **Total Eventos**: Eventos creados
- **Total Asistentes**: Suma de asistentes a eventos
- **Total Publicaciones**: Publicaciones creadas
- **Total Reacciones**: Likes en publicaciones
- **Total Productos**: Productos en marketplace
- **Suma Precios**: Valor total de productos

### Métricas Calculadas
- **Engagement**: `(reacciones + publicaciones) / usuarios`
- **Promedio Precio**: `sumaPrecios / totalProductos`
- **Tasa Conversión Premium**: `(usuariosPremium / totalUsuarios) * 100`
- **Promedio Reacciones/Usuario**: `totalReacciones / totalUsuarios`
- **Promedio Asistentes/Evento**: `totalAsistentes / totalEventos`

### Métricas de Crecimiento
- Comparación mes actual vs mes anterior
- Porcentaje de crecimiento por métrica
- Tendencias mensuales

---

## 🔄 Flujo de Actualización Automática

### Cuando se crea un usuario:
```
1. Trigger: onCreate en colección 'perfiles'
2. Cloud Function: onUserCreated
3. Actualiza: analytics_departamentos
4. Actualiza: analytics_ciudades
5. Incrementa: totalUsuarios, usuariosPremium (si aplica)
```

### Cuando se crea un evento:
```
1. Trigger: onCreate en colección 'eventos'
2. Cloud Function: onEventoCreated
3. Lee: departamento y ciudad del evento
4. Actualiza: analytics_departamentos
5. Actualiza: analytics_ciudades
6. Incrementa: totalEventos, totalAsistentes
```

### Cuando se crea una publicación:
```
1. Trigger: onCreate en colección 'publicaciones'
2. Cloud Function: onPublicacionCreated
3. Lee: ubicación del autor desde 'perfiles'
4. Actualiza: analytics_departamentos
5. Actualiza: analytics_ciudades
6. Incrementa: totalPublicaciones, publicacionesPorTipo
```

### Cuando se da like:
```
1. Trigger: onUpdate en colección 'publicaciones'
2. Cloud Function: onPublicacionLiked
3. Calcula: diferencia de likes
4. Actualiza: analytics_departamentos
5. Actualiza: analytics_ciudades
6. Incrementa: totalReacciones
```

---

## 📈 Visualizaciones Disponibles

### Vista Departamentos
- **Tarjetas por departamento** con métricas principales
- **Resumen general** de toda la plataforma
- **Top 10 ciudades** con más usuarios
- **Barra de engagement** por departamento
- **Badges** de usuarios premium

### Vista Ciudades (Drill-down)
- **Gráfico de líneas**: Evolución mensual (usuarios, eventos, publicaciones)
- **Gráfico de barras**: Top 10 ciudades por usuarios
- **Gráfico de dona**: Géneros musicales populares
- **Gráfico de barras horizontales**: Instrumentos más tocados
- **Tarjetas de ciudades** con métricas y engagement

### Vista Detalle Ciudad
- **4 tarjetas principales**: Usuarios, Eventos, Publicaciones, Productos
- **Métricas de engagement**: Score y tasa de conversión
- **Tabla de actividad**: Promedios por usuario/evento
- **Gráfico de pastel**: Distribución de géneros
- **Gráfico de barras**: Distribución de instrumentos

---

## ⚡ Optimización y Rendimiento

### Estrategias Implementadas

1. **Datos Agregados**
   - No se consultan colecciones completas
   - Se usan documentos pre-calculados
   - Actualizaciones incrementales con `FieldValue.increment()`

2. **Índices Compuestos**
   - Consultas optimizadas por ubicación
   - Ordenamiento eficiente
   - Ver `FIRESTORE_INDICES.md`

3. **Batch Operations**
   - Actualización simultánea de departamento y ciudad
   - Reducción de llamadas a Firestore

4. **Caché en Frontend**
   - Estado local de React
   - Evita consultas repetidas
   - Actualización bajo demanda

5. **Consultas Limitadas**
   - Top 10 ciudades
   - Últimos 6 meses de historial
   - Máximo 10 géneros/instrumentos

---

## 💰 Estimación de Costos

### Lecturas de Firestore

**Sin sistema de analytics (consultas directas):**
```
- Cargar departamentos: 1000+ lecturas (todos los perfiles)
- Cargar ciudades: 500+ lecturas por departamento
- Total por carga: ~1500 lecturas
- Costo: $0.36 por millón de lecturas
```

**Con sistema de analytics (datos agregados):**
```
- Cargar departamentos: 32 lecturas (32 departamentos)
- Cargar ciudades: 50 lecturas (ciudades de un dept)
- Total por carga: ~82 lecturas
- Ahorro: 95% de lecturas
```

### Escrituras de Cloud Functions

```
- Por usuario nuevo: 2 escrituras (dept + ciudad)
- Por evento nuevo: 2 escrituras
- Por publicación: 2 escrituras
- Por like: 2 escrituras
- Costo: $1.08 por millón de escrituras
```

### Estimación Mensual (10,000 usuarios activos)

```
Lecturas:
- 1000 cargas de dashboard/mes × 82 lecturas = 82,000 lecturas
- Costo: $0.03/mes

Escrituras:
- 500 usuarios nuevos × 2 = 1,000
- 2000 eventos × 2 = 4,000
- 10,000 publicaciones × 2 = 20,000
- 50,000 likes × 2 = 100,000
- Total: 125,000 escrituras
- Costo: $0.14/mes

Total mensual: ~$0.17/mes
```

---

## 🔧 Mantenimiento

### Tareas Automáticas

1. **Historial Mensual** (Día 1 de cada mes)
   - Cloud Function programada
   - Guarda snapshot de estadísticas
   - Permite análisis de tendencias

2. **Limpieza de Datos** (Opcional)
   - Eliminar historial mayor a 24 meses
   - Archivar datos antiguos

### Tareas Manuales

1. **Monitoreo de Índices**
   - Verificar índices activos en Firebase Console
   - Revisar consultas lentas

2. **Revisión de Métricas**
   - Validar precisión de datos
   - Comparar con datos reales

3. **Optimización**
   - Ajustar límites de consultas
   - Agregar nuevas métricas según necesidad

---

## 🐛 Solución de Problemas

### Problema: Estadísticas no se actualizan

**Causas posibles:**
- Cloud Functions no desplegadas
- Permisos insuficientes
- Campos faltantes en documentos

**Solución:**
```bash
# Verificar logs de Cloud Functions
firebase functions:log

# Re-desplegar functions
firebase deploy --only functions

# Verificar permisos en Firestore Rules
```

### Problema: Consultas lentas

**Causas posibles:**
- Índices faltantes
- Consultas sin optimizar

**Solución:**
```bash
# Desplegar índices
firebase deploy --only firestore:indexes

# Verificar en Firebase Console → Firestore → Indexes
```

### Problema: Datos inconsistentes

**Causas posibles:**
- Documentos sin ubicación
- Actualizaciones fallidas

**Solución:**
```javascript
// Script de migración para agregar ubicación faltante
const batch = db.batch();
const perfiles = await getDocs(collection(db, 'perfiles'));

perfiles.forEach(doc => {
  if (!doc.data().departamento) {
    batch.update(doc.ref, {
      departamento: 'Sin especificar',
      ciudad: 'Sin especificar'
    });
  }
});

await batch.commit();
```

---

## 📚 API del Servicio de Analytics

### Funciones Principales

```javascript
// Obtener estadísticas de departamentos
const departamentos = await analyticsService.obtenerEstadisticasDepartamentos();

// Obtener ciudades de un departamento
const ciudades = await analyticsService.obtenerEstadisticasCiudades('Antioquia');

// Obtener detalle de una ciudad
const detalle = await analyticsService.obtenerEstadisticasCiudadDetallada('Antioquia', 'Medellín');

// Obtener historial mensual
const historial = await analyticsService.obtenerHistorialMensual('Antioquia', 12);

// Obtener top ciudades
const top = await analyticsService.obtenerTopCiudades('totalUsuarios', 10);

// Obtener distribución de géneros
const generos = await analyticsService.obtenerDistribucionGeneros('Antioquia', 'Medellín');

// Obtener distribución de instrumentos
const instrumentos = await analyticsService.obtenerDistribucionInstrumentos('Antioquia');

// Obtener resumen general
const resumen = await analyticsService.obtenerResumenGeneral();
```

---

## 🎨 Personalización

### Agregar Nueva Métrica

1. **Actualizar Cloud Function:**
```javascript
exports.onNuevaAccion = functions.firestore
  .document('coleccion/{docId}')
  .onCreate(async (snap, context) => {
    const data = snap.data();
    
    // Actualizar analytics
    const deptRef = db.collection('analytics_departamentos').doc(data.departamento);
    await deptRef.set({
      nuevaMetrica: admin.firestore.FieldValue.increment(1)
    }, { merge: true });
  });
```

2. **Actualizar Servicio:**
```javascript
// analyticsService.js
export const obtenerNuevaMetrica = async (departamento) => {
  const doc = await getDoc(db, 'analytics_departamentos', departamento);
  return doc.data().nuevaMetrica || 0;
};
```

3. **Actualizar UI:**
```javascript
// EstadisticasGeograficasAvanzadas.jsx
<Card>
  <Card.Body>
    <h3>{stats.nuevaMetrica}</h3>
    <p>Nueva Métrica</p>
  </Card.Body>
</Card>
```

### Agregar Nuevo Gráfico

```javascript
const prepararDatosNuevoGrafico = () => {
  return {
    labels: datos.map(d => d.label),
    datasets: [{
      label: 'Mi Nueva Métrica',
      data: datos.map(d => d.value),
      backgroundColor: 'rgba(75, 192, 192, 0.6)'
    }]
  };
};

// En el JSX
<Bar data={prepararDatosNuevoGrafico()} />
```

---

## 📖 Referencias

- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [React Bootstrap Documentation](https://react-bootstrap.github.io/)

---

## ✅ Checklist de Implementación

- [ ] Instalar dependencias de Cloud Functions
- [ ] Configurar Firebase CLI
- [ ] Desplegar Cloud Functions
- [ ] Crear índices en Firestore
- [ ] Integrar componente en AdminDashboard
- [ ] Probar flujo completo de actualización
- [ ] Verificar visualizaciones
- [ ] Monitorear costos
- [ ] Documentar cambios personalizados
- [ ] Capacitar al equipo

---

**Versión:** 1.0  
**Fecha:** Febrero 2026  
**Autor:** Sistema de Analítica BandSocial
