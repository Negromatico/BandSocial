# Índices Compuestos Necesarios en Firestore

Este documento describe todos los índices compuestos que deben crearse en Firestore para optimizar el rendimiento del sistema de analítica.

## 📋 Índices para Colección `perfiles`

### 1. Índice: Departamento + Ciudad
```
Colección: perfiles
Campos:
  - departamento (Ascendente)
  - ciudad (Ascendente)
```
**Uso:** Consultas de usuarios por ubicación específica

### 2. Índice: Departamento + PlanActual
```
Colección: perfiles
Campos:
  - departamento (Ascendente)
  - planActual (Ascendente)
```
**Uso:** Filtrar usuarios premium por departamento

### 3. Índice: Ciudad + CreatedAt
```
Colección: perfiles
Campos:
  - ciudad (Ascendente)
  - createdAt (Descendente)
```
**Uso:** Usuarios más recientes por ciudad

---

## 📋 Índices para Colección `eventos`

### 1. Índice: Departamento + Fecha
```
Colección: eventos
Campos:
  - departamento (Ascendente)
  - fecha (Descendente)
```
**Uso:** Eventos próximos por departamento

### 2. Índice: Ciudad + Estado
```
Colección: eventos
Campos:
  - ciudad (Ascendente)
  - estado (Ascendente)
```
**Uso:** Filtrar eventos activos por ciudad

### 3. Índice: Departamento + Ciudad + Fecha
```
Colección: eventos
Campos:
  - departamento (Ascendente)
  - ciudad (Ascendente)
  - fecha (Descendente)
```
**Uso:** Eventos específicos por ubicación y fecha

---

## 📋 Índices para Colección `publicaciones`

### 1. Índice: AutorUid + CreatedAt
```
Colección: publicaciones
Campos:
  - autorUid (Ascendente)
  - createdAt (Descendente)
```
**Uso:** Publicaciones de un usuario ordenadas por fecha

### 2. Índice: Tipo + CreatedAt
```
Colección: publicaciones
Campos:
  - tipo (Ascendente)
  - createdAt (Descendente)
```
**Uso:** Filtrar publicaciones por tipo (texto, imagen, video)

---

## 📋 Índices para Colección `productos`

### 1. Índice: VendedorUid + Estado
```
Colección: productos
Campos:
  - vendedorUid (Ascendente)
  - estado (Ascendente)
```
**Uso:** Productos activos de un vendedor

### 2. Índice: Categoria + Precio
```
Colección: productos
Campos:
  - categoria (Ascendente)
  - precio (Ascendente)
```
**Uso:** Productos ordenados por precio en una categoría

---

## 📋 Índices para Colección `analytics_ciudades`

### 1. Índice: Departamento + TotalUsuarios
```
Colección: analytics_ciudades
Campos:
  - departamento (Ascendente)
  - totalUsuarios (Descendente)
```
**Uso:** Top ciudades por usuarios en un departamento

### 2. Índice: Departamento + Engagement
```
Colección: analytics_ciudades
Campos:
  - departamento (Ascendente)
  - engagement (Descendente)
```
**Uso:** Ciudades con mayor engagement por departamento

---

## 🔧 Cómo Crear los Índices

### Opción 1: Firebase Console (Manual)
1. Ve a Firebase Console → Firestore Database
2. Haz clic en la pestaña "Indexes"
3. Haz clic en "Create Index"
4. Selecciona la colección y agrega los campos según se especifica arriba
5. Guarda el índice

### Opción 2: Firebase CLI (Automático)
Crea un archivo `firestore.indexes.json` en la raíz del proyecto:

```json
{
  "indexes": [
    {
      "collectionGroup": "perfiles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "departamento", "order": "ASCENDING" },
        { "fieldPath": "ciudad", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "perfiles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "departamento", "order": "ASCENDING" },
        { "fieldPath": "planActual", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "perfiles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ciudad", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "eventos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "departamento", "order": "ASCENDING" },
        { "fieldPath": "fecha", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "eventos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "ciudad", "order": "ASCENDING" },
        { "fieldPath": "estado", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "eventos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "departamento", "order": "ASCENDING" },
        { "fieldPath": "ciudad", "order": "ASCENDING" },
        { "fieldPath": "fecha", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "publicaciones",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "autorUid", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "publicaciones",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "tipo", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "productos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "vendedorUid", "order": "ASCENDING" },
        { "fieldPath": "estado", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "productos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "categoria", "order": "ASCENDING" },
        { "fieldPath": "precio", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "analytics_ciudades",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "departamento", "order": "ASCENDING" },
        { "fieldPath": "totalUsuarios", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Luego ejecuta:
```bash
firebase deploy --only firestore:indexes
```

---

## ⚡ Consideraciones de Rendimiento

### Índices Automáticos
Firestore crea automáticamente índices de campo único para cada campo. No necesitas crear índices para:
- Consultas simples con un solo campo
- Consultas de igualdad simple

### Cuándo Crear Índices Compuestos
Crea índices compuestos cuando:
- Usas múltiples campos en `where()`
- Combinas `where()` con `orderBy()`
- Usas `orderBy()` en múltiples campos

### Límites de Firestore
- Máximo 200 índices compuestos por proyecto
- Máximo 200 campos por índice
- Los índices se construyen de forma asíncrona (pueden tardar varios minutos)

---

## 🔍 Monitoreo de Índices

### Ver Índices Faltantes
Firebase Console te mostrará automáticamente un error cuando una consulta requiera un índice que no existe. El error incluirá un enlace directo para crear el índice.

### Verificar Uso de Índices
Usa Firebase Console → Firestore → Usage para ver:
- Lecturas de documentos
- Uso de índices
- Consultas lentas

---

## 📊 Impacto en Costos

### Lecturas de Documentos
- Sin índice: Escaneo completo de colección (costoso)
- Con índice: Solo documentos que coinciden (eficiente)

### Ejemplo:
```javascript
// ❌ SIN ÍNDICE: Lee TODOS los perfiles (1000+ lecturas)
const q = query(
  collection(db, 'perfiles'),
  where('departamento', '==', 'Antioquia'),
  where('ciudad', '==', 'Medellín')
);

// ✅ CON ÍNDICE: Lee solo los que coinciden (50 lecturas)
// Mismo código, pero con índice creado
```

---

## 🚀 Mejores Prácticas

1. **Crear índices antes de lanzar a producción**
2. **Monitorear consultas lentas regularmente**
3. **Eliminar índices no utilizados**
4. **Usar colecciones de analytics agregadas para reducir consultas**
5. **Implementar caché en el frontend cuando sea posible**

---

## 📝 Checklist de Implementación

- [ ] Crear archivo `firestore.indexes.json`
- [ ] Desplegar índices con Firebase CLI
- [ ] Verificar que todos los índices estén construidos
- [ ] Probar consultas en producción
- [ ] Monitorear uso y rendimiento
- [ ] Optimizar consultas basándose en métricas

---

## 🆘 Solución de Problemas

### Error: "The query requires an index"
**Solución:** Haz clic en el enlace del error o crea el índice manualmente

### Índice en estado "Building"
**Solución:** Espera. Los índices grandes pueden tardar horas en construirse

### Consulta lenta a pesar del índice
**Solución:** 
- Verifica que el índice esté activo
- Revisa el orden de los campos en el índice
- Considera usar datos agregados en lugar de consultas complejas

---

**Última actualización:** Febrero 2026
**Versión:** 1.0
