# 🔍 Verificar Por Qué No Cargan las Estadísticas

## Paso 1: Abrir la Consola del Navegador

1. Ve a: `http://localhost:5173/admin`
2. Presiona **F12** para abrir DevTools
3. Ve a la pestaña **Console**
4. Haz clic en la pestaña "Estadísticas" en el panel de admin

## Paso 2: Buscar Errores

### ❌ Error de Permisos
Si ves algo como:
```
FirebaseError: Missing or insufficient permissions
```

**Solución:** Necesitas desplegar las reglas de Firestore

```bash
# Opción 1: Firebase Console
1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Firestore Database → Reglas
4. Copia el contenido de firestore.rules
5. Haz clic en "Publicar"

# Opción 2: Firebase CLI
firebase deploy --only firestore:rules
```

### ⚠️ No Hay Errores Pero Todo Muestra 0

**Causa:** No hay datos en Firestore para ese período

**Solución:** 
1. En el selector de período, elige **"Todo el tiempo"**
2. Si aún muestra 0, es porque las colecciones están vacías

## Paso 3: Verificar Datos en Firestore

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto
3. Firestore Database
4. Verifica que existen estas colecciones con documentos:
   - ✅ `perfiles` (usuarios)
   - ✅ `publicaciones`
   - ✅ `eventos`
   - ✅ `productos`

## Paso 4: Verificar Campos Requeridos

Para que las estadísticas funcionen, los documentos deben tener el campo `createdAt`:

### Ejemplo de Perfil
```javascript
{
  uid: "abc123",
  nombre: "Juan Pérez",
  email: "juan@example.com",
  type: "musico",
  createdAt: Timestamp(2026, 1, 15), // ← IMPORTANTE
  departamento: "Antioquia",
  municipio: "Medellín"
}
```

### Ejemplo de Publicación
```javascript
{
  autorUid: "abc123",
  contenido: "Mi primera publicación",
  tipo: "texto",
  createdAt: Timestamp(2026, 2, 1), // ← IMPORTANTE
  ciudad: "Medellín"
}
```

## Paso 5: Probar con Datos de Prueba

Si no tienes datos, puedes crear algunos de prueba:

1. Ve al panel de admin
2. Crea algunos usuarios de prueba
3. Crea publicaciones, eventos o productos
4. Vuelve a las estadísticas

## 🔧 Comandos Útiles en la Consola del Navegador

Pega esto en la consola para ver qué está pasando:

```javascript
// Ver si hay errores de conexión
console.log('Firebase conectado:', window.firebase !== undefined);

// Ver cuántos documentos hay en cada colección
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Contar perfiles
getDocs(collection(db, 'perfiles')).then(snap => {
  console.log('Total perfiles:', snap.size);
});

// Contar publicaciones
getDocs(collection(db, 'publicaciones')).then(snap => {
  console.log('Total publicaciones:', snap.size);
});

// Contar eventos
getDocs(collection(db, 'eventos')).then(snap => {
  console.log('Total eventos:', snap.size);
});

// Contar productos
getDocs(collection(db, 'productos')).then(snap => {
  console.log('Total productos:', snap.size);
});
```

## ✅ Checklist de Verificación

- [ ] Las reglas de Firestore están desplegadas
- [ ] No hay errores en la consola del navegador
- [ ] Las colecciones tienen documentos en Firestore
- [ ] Los documentos tienen el campo `createdAt`
- [ ] El selector de período está en "Todo el tiempo"
- [ ] Eres administrador (email: estebanber24@gmail.com)

## 🎯 Solución Rápida

Si todo lo anterior está bien pero aún no carga:

1. **Refresca la página** (F5)
2. **Limpia la caché** (Ctrl + Shift + R)
3. **Cierra sesión y vuelve a iniciar**
4. **Verifica que estás logueado como admin**

---

**Nota:** Las estadísticas YA están configuradas para cargar datos reales. Si ves 0, es porque realmente no hay datos en Firestore para ese período o las reglas no están desplegadas.
