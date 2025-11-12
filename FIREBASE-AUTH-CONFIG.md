# 🔐 Configuración de Firebase Authentication

## Problema: Recuperación de Contraseña No Funciona

Si el correo de recuperación de contraseña no se envía, sigue estos pasos:

---

## ✅ PASO 1: Verificar Configuración de Email en Firebase

### 1. Ve a Firebase Console
```
https://console.firebase.google.com/project/bandas-f9c77/authentication/emails
```

### 2. Configura la Plantilla de Email
- Click en **"Templates"** o **"Plantillas"**
- Busca **"Password reset"** o **"Restablecer contraseña"**
- Verifica que esté habilitada
- Personaliza el mensaje si lo deseas

---

## ✅ PASO 2: Autorizar Dominios

### 1. Ve a Dominios Autorizados
```
https://console.firebase.google.com/project/bandas-f9c77/authentication/settings
```

### 2. Agrega estos dominios:
- `localhost` ✅ (ya debería estar)
- `127.0.0.1` ✅
- Tu dominio de producción cuando lo tengas

### 3. Click en **"Add domain"** si falta alguno

---

## ✅ PASO 3: Verificar Método de Autenticación

### 1. Ve a Sign-in Methods
```
https://console.firebase.google.com/project/bandas-f9c77/authentication/providers
```

### 2. Verifica que **Email/Password** esté habilitado
- Debe tener un check verde ✅
- Si no está habilitado, haz click y actívalo

---

## ✅ PASO 4: Configurar Remitente de Email

### 1. Ve a Settings → Project Settings
```
https://console.firebase.google.com/project/bandas-f9c77/settings/general
```

### 2. Scroll hasta **"Public-facing name"**
- Nombre: `BandSocial`
- Email de soporte: Tu email

### 3. Esto aparecerá en los correos enviados

---

## 🧪 CÓMO PROBAR

### 1. En la aplicación:
```
1. Ve a http://localhost:5173/login
2. Click en "¿Olvidaste tu contraseña?"
3. Ingresa un correo REGISTRADO
4. Click en "Enviar correo de recuperación"
```

### 2. Verifica en la consola del navegador:
```
F12 → Console
Busca: "Correo de recuperación enviado exitosamente"
```

### 3. Revisa tu email:
- Bandeja de entrada
- **Carpeta de SPAM** ⚠️ (muy importante)
- Carpeta de Promociones (Gmail)

---

## 🔍 MENSAJES DE ERROR MEJORADOS

La aplicación ahora muestra errores específicos:

### ❌ `auth/user-not-found`
**Mensaje**: "Este correo no está registrado."
**Solución**: Verifica que el correo esté registrado en Firebase

### ❌ `auth/invalid-email`
**Mensaje**: "El formato del correo es inválido."
**Solución**: Verifica que el correo tenga formato válido (ejemplo@dominio.com)

### ❌ `auth/too-many-requests`
**Mensaje**: "Demasiados intentos. Intenta más tarde."
**Solución**: Espera 15-30 minutos antes de intentar de nuevo

### ❌ `auth/network-request-failed`
**Mensaje**: "Error de conexión. Verifica tu internet."
**Solución**: Verifica tu conexión a internet

---

## 📧 CONFIGURACIÓN AVANZADA (Opcional)

### Personalizar Email Template

1. Ve a Firebase Console → Authentication → Templates
2. Click en el ícono de lápiz en "Password reset"
3. Personaliza:
   - **Subject**: "Recupera tu contraseña de BandSocial"
   - **Body**: Personaliza el mensaje
   - **From name**: "BandSocial"

### Ejemplo de mensaje personalizado:
```
Hola,

Recibimos una solicitud para restablecer tu contraseña de BandSocial.

Haz clic en el siguiente enlace para crear una nueva contraseña:
%LINK%

Si no solicitaste este cambio, puedes ignorar este correo.

¡Nos vemos en el escenario!
El equipo de BandSocial
```

---

## 🚨 PROBLEMAS COMUNES

### 1. "El correo no llega"
✅ **Soluciones**:
- Revisa SPAM/Correo no deseado
- Verifica que el correo esté registrado
- Espera 5-10 minutos (puede tardar)
- Verifica dominios autorizados en Firebase

### 2. "Error: auth/unauthorized-domain"
✅ **Solución**:
- Agrega `localhost` y `127.0.0.1` a dominios autorizados
- Firebase Console → Authentication → Settings → Authorized domains

### 3. "El enlace del correo no funciona"
✅ **Solución**:
- Verifica que la URL de redirección esté correcta
- Debe ser: `http://localhost:5173/login` o tu dominio

### 4. "Error: auth/missing-continue-uri"
✅ **Solución**:
- Ya está configurado en el código con `url: window.location.origin + '/login'`

---

## 📝 CÓDIGO ACTUALIZADO

El código ahora incluye:

```javascript
await sendPasswordResetEmail(auth, resetEmail, {
  url: window.location.origin + '/login',
  handleCodeInApp: false
});
```

**Mejoras**:
- ✅ Validación de email antes de enviar
- ✅ Mensajes de error específicos
- ✅ URL de redirección configurada
- ✅ Logs en consola para debugging
- ✅ Manejo de todos los códigos de error

---

## 🎯 CHECKLIST FINAL

Antes de reportar que no funciona, verifica:

- [ ] Email/Password está habilitado en Firebase
- [ ] Dominios autorizados incluyen localhost
- [ ] El correo está REGISTRADO en Firebase
- [ ] Revisaste carpeta de SPAM
- [ ] Esperaste al menos 5 minutos
- [ ] No hay errores en la consola del navegador
- [ ] La conexión a internet funciona

---

## 📞 SOPORTE

Si después de seguir todos estos pasos aún no funciona:

1. Abre la consola del navegador (F12)
2. Reproduce el error
3. Copia el mensaje de error completo
4. Verifica en Firebase Console → Authentication → Users si el usuario existe

---

**Última actualización**: Noviembre 11, 2025
**Proyecto**: BandSocial
**Firebase Project**: bandas-f9c77
