# ⚠️ URGENTE: Desplegar Reglas de Firestore

## 🚨 Problema Actual

**Las publicaciones y eventos NO aparecen porque las reglas actualizadas NO están desplegadas en Firebase.**

Las reglas están correctas en tu archivo local `firestore.rules`, pero Firebase sigue usando las reglas antiguas.

## ✅ Solución Inmediata (2 minutos)

### Paso 1: Abrir Firebase Console
```
https://console.firebase.google.com/
```

### Paso 2: Seleccionar Proyecto
- Busca y selecciona: **bandas-f9c77**

### Paso 3: Ir a Reglas de Firestore
1. Menú lateral izquierdo → **Firestore Database**
2. Arriba, haz clic en la pestaña **Reglas**

### Paso 4: Copiar las Reglas Actualizadas
1. En VS Code, abre el archivo: `firestore.rules`
2. Selecciona TODO el contenido (Ctrl+A)
3. Copia (Ctrl+C)

### Paso 5: Pegar en Firebase Console
1. En Firebase Console, **BORRA** todo el contenido actual
2. Pega las nuevas reglas (Ctrl+V)

### Paso 6: Publicar
1. Haz clic en el botón **Publicar** (arriba a la derecha, color azul)
2. Confirma la publicación

### Paso 7: Verificar
1. Espera 10-30 segundos
2. Vuelve a tu aplicación: http://localhost:5173
3. Recarga la página (F5 o Ctrl+R)
4. Las publicaciones y eventos deberían aparecer ahora

## 🎯 Qué Hacen las Nuevas Reglas

```javascript
// Publicaciones - Lectura pública
match /publicaciones/{postId} {
  allow read: if true;  // ✅ Cualquiera puede leer
  // ...
}

// Eventos - Lectura pública
match /eventos/{eventId} {
  allow read: if true;  // ✅ Cualquiera puede leer
  // ...
}
```

## ⏱️ Tiempo Total: 2-3 minutos

## 🐛 Si Después de Desplegar Sigue Sin Funcionar

1. **Limpia la caché del navegador:**
   - Ctrl+Shift+Delete
   - Selecciona "Caché" y "Cookies"
   - Haz clic en "Borrar datos"

2. **Cierra y abre el navegador completamente**

3. **Verifica en la consola del navegador (F12):**
   - Busca errores de permisos
   - Debería decir algo como: "Publicaciones cargadas: X"

## ✅ Confirmación de Éxito

Sabrás que funcionó cuando:
- ✅ Ves las publicaciones en la página principal
- ✅ Ves los eventos en /eventos
- ✅ No hay errores de "permission denied" en consola
- ✅ Las estadísticas cargan en /admin

## 📞 Importante

**NO puedes desplegar las reglas desde VS Code directamente.**
**DEBES usar Firebase Console para copiar y pegar las reglas.**

---

**Última actualización:** 13 de febrero de 2026, 2:03 PM
