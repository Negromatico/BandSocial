# 📊 Cómo Funcionan las Estadísticas en BandSocial

## ✅ Estado Actual

Las estadísticas **YA ESTÁN CONFIGURADAS** para tomar datos reales de Firestore. No muestran datos estáticos.

## 🔄 Flujo de Datos

### 1. **Componente EstadisticasAvanzadas.jsx**
```javascript
// Se ejecuta automáticamente al cargar el componente
useEffect(() => {
  cargarEstadisticas();
}, [periodo]);

// Carga datos reales de Firestore
const cargarEstadisticas = async () => {
  const [usuarios, publicaciones, eventos, productos, sesiones] = await Promise.all([
    estadisticasAvanzadas.getEstadisticasUsuarios(periodo),
    estadisticasAvanzadas.getEstadisticasPublicaciones(periodo),
    estadisticasAvanzadas.getEstadisticasEventos(periodo),
    estadisticasAvanzadas.getEstadisticasProductos(periodo),
    estadisticasAvanzadas.getEstadisticasSesiones(periodo)
  ]);
  
  // Guarda los datos reales en el estado
  setStatsUsuarios(usuarios);
  setStatsPublicaciones(publicaciones);
  // ...
};
```

### 2. **Servicio estadisticasAvanzadas.js**
Este servicio consulta directamente a Firestore:

```javascript
// Ejemplo: Estadísticas de usuarios
async getEstadisticasUsuarios(periodo = 'todo') {
  const { inicio, fin } = this.getRangoFechas(periodo);
  
  // Consulta REAL a Firestore
  const perfilesRef = collection(db, 'perfiles');
  let q = query(perfilesRef);
  
  if (periodo !== 'todo') {
    q = query(perfilesRef, 
      where('createdAt', '>=', inicio), 
      where('createdAt', '<=', fin)
    );
  }
  
  const snapshot = await getDocs(q);
  
  // Procesa los datos REALES
  snapshot.forEach(doc => {
    const data = doc.data();
    // Cuenta usuarios por tipo, departamento, etc.
  });
  
  return stats; // Retorna datos REALES
}
```

## 📊 Colecciones de Firestore Consultadas

### **Usuarios**
- **Colección:** `perfiles`
- **Datos:** Total, por tipo, por departamento, por género musical, por instrumento, por plan (free/premium), activos/inactivos

### **Publicaciones**
- **Colección:** `publicaciones`
- **Datos:** Total, por tipo, por ciudad, con/sin imágenes, reacciones, comentarios, engagement

### **Eventos**
- **Colección:** `eventos`
- **Datos:** Total, por tipo, por ciudad, por género, gratuitos/pagos, pasados/próximos, asistentes

### **Productos**
- **Colección:** `productos`
- **Datos:** Total, por categoría, por estado, por ciudad, precios (promedio, min, max), valor inventario

### **Sesiones**
- **Colección:** `sesiones` (NUEVA)
- **Datos:** Nuevos registros, inicios de sesión, tiempo de conexión, usuarios activos

## 🔍 Por Qué Pueden Aparecer Ceros

Si ves **0** en las estadísticas, es porque:

### 1. **No hay datos en Firestore**
- La colección está vacía
- No hay documentos que cumplan con el filtro de período

### 2. **Filtro de período muy restrictivo**
- Si seleccionas "Últimas 24 horas" y no hay datos de hoy, mostrará 0
- Cambia a "Todo el tiempo" para ver todos los datos

### 3. **Campo `createdAt` faltante**
- Los documentos antiguos pueden no tener el campo `createdAt`
- Solo se contarán documentos con este campo cuando uses filtros temporales

### 4. **Colección `sesiones` no existe aún**
- Esta es una colección nueva para tracking
- Necesita implementarse el tracking de sesiones en la app

## ✅ Cómo Verificar que Funciona

### **Paso 1: Abrir el Panel de Admin**
```
http://localhost:5173/admin
```

### **Paso 2: Ir a la pestaña "Estadísticas"**

### **Paso 3: Abrir la consola del navegador (F12)**
Busca mensajes como:
```javascript
// Si hay errores de permisos:
"Error al obtener estadísticas: Missing or insufficient permissions"

// Si funciona correctamente:
// No debería haber errores, solo los datos cargados
```

### **Paso 4: Cambiar el período**
- Selecciona "Todo el tiempo" para ver todos los datos
- Si aún ves 0, es porque no hay datos en Firestore

## 🔧 Solución de Problemas

### **Problema: "Missing or insufficient permissions"**
**Solución:** Desplegar las reglas de Firestore

```bash
# Opción 1: Firebase Console
https://console.firebase.google.com/
→ Firestore Database → Reglas
→ Copiar contenido de firestore.rules
→ Publicar

# Opción 2: Firebase CLI
firebase deploy --only firestore:rules
```

### **Problema: Todos los valores son 0**
**Solución:** Verificar que hay datos en Firestore

1. Ve a Firebase Console
2. Firestore Database
3. Verifica que existen las colecciones:
   - `perfiles` (usuarios)
   - `publicaciones`
   - `eventos`
   - `productos`

### **Problema: Solo algunas estadísticas muestran 0**
**Solución:** Esa colección específica está vacía o no tiene el campo `createdAt`

## 📝 Campos Requeridos en Firestore

Para que las estadísticas funcionen correctamente, los documentos deben tener:

### **Perfiles (Usuarios)**
```javascript
{
  createdAt: Timestamp,
  type: string,              // 'musico', 'banda', etc.
  departamento: string,
  ciudad: string,
  generosMusicales: array,
  instrumentos: array,
  planActual: string,        // 'free' o 'premium'
  ultimaActividad: Timestamp
}
```

### **Publicaciones**
```javascript
{
  createdAt: Timestamp,
  tipo: string,
  ciudad: string,
  imagenesUrl: array
  // reacciones y comentarios son subcolecciones
}
```

### **Eventos**
```javascript
{
  createdAt: Timestamp,
  tipo: string,
  ciudad: string,
  generos: array,
  precio: number,
  fecha: Timestamp,
  asistentes: array
}
```

### **Productos**
```javascript
{
  createdAt: Timestamp,
  categoria: string,
  estado: string,
  ubicacion: string,
  precio: number,
  imagenes: array
}
```

## 🎯 Resumen

- ✅ **Las estadísticas YA cargan datos reales de Firestore**
- ✅ **No son datos estáticos ni de prueba**
- ✅ **Se actualizan automáticamente al cambiar el período**
- ⚠️ **Si ves 0, es porque no hay datos en Firestore para ese período**
- ⚠️ **Necesitas desplegar las reglas de Firestore para que funcione**

## 🚀 Próximos Pasos (Opcional)

Si quieres tracking de sesiones:

1. Implementar `registrarInicioSesion()` en el login
2. Implementar `registrarCierreSesion()` en el logout
3. Las estadísticas de sesiones empezarán a mostrar datos reales

---

**Última actualización:** 13 de febrero de 2026
