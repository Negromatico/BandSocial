# 🔥 Crear Índice en Firestore

## ❌ Error Actual:

```
FirebaseError: The query requires an index.
```

## ✅ Solución:

### **Opción 1: Crear Índice Automáticamente (RECOMENDADO)**

1. **Haz click en este enlace** que aparece en el error:
   ```
   https://console.firebase.google.com/v1/r/project/bandas-f9c77/firestore/indexes?create_composite=...
   ```

2. Firebase te llevará directamente a crear el índice
3. Click en **"Crear índice"**
4. Espera 2-5 minutos mientras se construye
5. ¡Listo! El error desaparecerá

---

### **Opción 2: Crear Índice Manualmente**

1. Ve a **Firebase Console**
2. Selecciona tu proyecto: `bandas-f9c77`
3. Ve a **Firestore Database**
4. Click en la pestaña **"Índices"** (Indexes)
5. Click en **"Crear índice"**
6. Configura:
   - **Colección:** `publicaciones`
   - **Campos a indexar:**
     - Campo: `autorUid` → Orden: Ascendente
     - Campo: `createdAt` → Orden: Descendente
   - **Ámbito de la consulta:** Colección
7. Click en **"Crear"**
8. Espera a que se construya (2-5 minutos)

---

## 📋 Índices Necesarios para BandSocial:

### **1. Publicaciones por Autor (REQUERIDO)**
```
Colección: publicaciones
Campos:
  - autorUid (Ascendente)
  - createdAt (Descendente)
```

### **2. Eventos por Creador**
```
Colección: eventos
Campos:
  - creadorUid (Ascendente)
  - fecha (Descendente)
```

### **3. Productos por Vendedor**
```
Colección: productos
Campos:
  - vendedorUid (Ascendente)
  - createdAt (Descendente)
```

---

## ⏱️ Tiempo de Construcción:

- **Colecciones pequeñas (<100 docs):** 1-2 minutos
- **Colecciones medianas (100-1000 docs):** 2-5 minutos
- **Colecciones grandes (>1000 docs):** 5-15 minutos

---

## 🔍 Verificar Estado del Índice:

1. Ve a **Firestore → Índices**
2. Busca el índice de `publicaciones`
3. Estado:
   - 🟢 **Habilitado:** Listo para usar
   - 🟡 **Construyendo:** Espera unos minutos
   - 🔴 **Error:** Revisa la configuración

---

## 💡 Prevenir Futuros Errores:

Cuando agregues nuevas consultas con `orderBy` + `where`, Firebase te pedirá crear índices automáticamente. Siempre:

1. Click en el enlace del error
2. Crea el índice
3. Espera a que se construya
4. Recarga la página

---

## ✅ Después de Crear el Índice:

1. Espera 2-5 minutos
2. Recarga tu aplicación
3. El error desaparecerá
4. Las publicaciones se cargarán correctamente

---

**Nota:** Este es un proceso normal en Firestore. Los índices mejoran el rendimiento de las consultas complejas.
