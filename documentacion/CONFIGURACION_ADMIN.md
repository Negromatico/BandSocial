# Configuración del Panel de Administrador - BandSocial

## Credenciales de Administrador

**Email:** estebanber24@gmail.com  
**Contraseña inicial:** admin123

## Pasos para Configurar el Administrador

### 1. Crear la cuenta de administrador en Firebase

Tienes dos opciones para crear la cuenta de administrador:

#### Opción A: Desde Firebase Console (Recomendado)

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto BandSocial
3. Ve a **Authentication** → **Users**
4. Haz clic en **Add user**
5. Ingresa:
   - Email: `estebanber24@gmail.com`
   - Password: `admin123`
6. Haz clic en **Add user**

#### Opción B: Desde la aplicación (Registro normal)

1. Ve a la página de registro de BandSocial
2. Regístrate con:
   - Email: `estebanber24@gmail.com`
   - Contraseña: `admin123`
   - Completa los demás campos requeridos

### 2. Crear el perfil del administrador en Firestore

Después de crear la cuenta en Authentication, necesitas crear el documento del perfil:

1. Ve a **Firestore Database** en Firebase Console
2. Navega a la colección `perfiles`
3. Busca el documento con el UID del usuario `estebanber24@gmail.com`
4. Si no existe, créalo con la siguiente estructura:

```json
{
  "uid": "[UID del usuario]",
  "email": "estebanber24@gmail.com",
  "nombre": "Administrador",
  "type": "administrador",
  "planActual": "premium",
  "fechaRegistro": "[Timestamp actual]",
  "ciudad": "Medellín",
  "biografia": "Administrador del sistema BandSocial"
}
```

### 3. Desplegar las reglas de Firestore actualizadas

Las reglas de Firestore ya están configuradas en el archivo `firestore.rules`. Necesitas desplegarlas:

**Opción 1 - Firebase Console:**
1. Ve a Firestore Database → Reglas
2. Copia el contenido de `firestore.rules`
3. Pégalo en el editor
4. Haz clic en **Publicar**

**Opción 2 - Firebase CLI:**
```bash
firebase deploy --only firestore:rules
```

## Acceso al Panel de Administrador

Una vez configurado, puedes acceder al panel de administrador de dos formas:

### URL Directa
```
http://localhost:5173/admin
```
o en producción:
```
https://tu-dominio.com/admin
```

### Características del Panel

El panel de administrador incluye:

✅ **Estadísticas en tiempo real:**
- Total de usuarios
- Usuarios premium
- Total de publicaciones
- Total de eventos
- Total de productos en MusicMarket

✅ **Gestión de contenido:**
- **Usuarios:** Ver lista completa de usuarios con sus datos
- **Publicaciones:** Ver y eliminar publicaciones
- **Eventos:** Ver y eliminar eventos
- **Productos:** Ver y eliminar productos del MusicMarket

✅ **Seguridad:**
- Solo accesible con el email `estebanber24@gmail.com`
- Cambio de contraseña desde el panel
- Redirección automática si no es administrador

## Cambiar la Contraseña de Administrador

1. Inicia sesión con las credenciales de administrador
2. Ve al panel de administrador (`/admin`)
3. Haz clic en el botón **"Cambiar Contraseña"**
4. Ingresa:
   - Contraseña actual: `admin123`
   - Nueva contraseña: [tu nueva contraseña]
   - Confirmar nueva contraseña
5. Haz clic en **"Cambiar Contraseña"**

## Seguridad

⚠️ **IMPORTANTE:**
- Cambia la contraseña `admin123` inmediatamente después del primer acceso
- No compartas las credenciales de administrador
- El acceso está restringido solo al email `estebanber24@gmail.com`
- Si necesitas agregar más administradores, modifica el código en `AdminDashboard.jsx` línea 43

## Solución de Problemas

### No puedo acceder al panel
- Verifica que estés usando el email exacto: `estebanber24@gmail.com`
- Asegúrate de haber creado la cuenta en Firebase Authentication
- Verifica que hayas iniciado sesión correctamente

### Error de permisos en Firestore
- Asegúrate de haber desplegado las reglas de Firestore actualizadas
- Verifica que las reglas permitan lectura y escritura para el administrador

### No veo datos en el panel
- Verifica que existan datos en Firestore (usuarios, publicaciones, etc.)
- Revisa la consola del navegador para ver errores
- Asegúrate de que las colecciones existan en Firestore

## Estructura de Archivos

```
src/
├── pages/
│   ├── AdminDashboard.jsx    # Componente principal del panel
│   └── AdminDashboard.css     # Estilos del panel
└── App.jsx                     # Ruta /admin configurada
```

## Notas Adicionales

- El panel es completamente responsive y funciona en dispositivos móviles
- Las estadísticas se actualizan cada vez que se carga el panel
- Las acciones de eliminación requieren confirmación
- Todos los cambios se reflejan inmediatamente en la aplicación

---

**Fecha de creación:** Febrero 2026  
**Versión:** 1.0  
**Proyecto:** BandSocial - Panel de Administrador
