# 🔥 Configurar Emails de Firebase Auth

Firebase Auth envía automáticamente emails para recuperación de contraseña, pero puedes personalizar el template.

---

## 🎯 Problema Actual

Cuando usas `sendPasswordResetEmail()`, Firebase envía un email automáticamente, pero:
- ❌ El email tiene el diseño genérico de Firebase
- ❌ No tiene el branding de BandSocial
- ✅ El enlace de reset SÍ funciona correctamente

---

## ✅ Solución: Personalizar Template de Firebase

### **Paso 1: Ir a Firebase Console**

1. Ve a: https://console.firebase.google.com/
2. Selecciona tu proyecto: **bandas-f9c77**
3. Ve a **Authentication** (Autenticación)
4. Click en la pestaña **Templates** (Plantillas)

### **Paso 2: Seleccionar "Password reset"**

1. En la lista de templates, busca **"Password reset"** (Restablecimiento de contraseña)
2. Click en el ícono de **lápiz** (editar)

### **Paso 3: Personalizar el Email**

#### **Configuración Básica:**

**Nombre del remitente:**
```
BandSocial
```

**Dirección del remitente (opcional):**
```
noreply@bandsociall.netlify.app
```

#### **Asunto del Email:**
```
Recupera tu contraseña de BandSocial 🔐
```

#### **Cuerpo del Email (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: white;
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 40px 30px;
      text-align: center;
    }
    .logo {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    .content {
      padding: 40px 30px;
    }
    .button {
      display: inline-block;
      background: #667eea;
      color: white !important;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background: #f9f9f9;
      padding: 30px;
      text-align: center;
      color: #666;
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎸 BANDSOCIAL</div>
      <h2>Recuperación de Contraseña</h2>
    </div>
    
    <div class="content">
      <p>Hola,</p>
      
      <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta de BandSocial.</p>
      
      <p style="text-align: center;">
        <a href="%LINK%" class="button">🔐 Restablecer Contraseña</a>
      </p>
      
      <p style="background: #fff3cd; padding: 15px; border-radius: 5px; border-left: 4px solid #ffc107;">
        <strong>⚠️ ¿No solicitaste este cambio?</strong><br>
        Si no solicitaste restablecer tu contraseña, ignora este correo. Tu cuenta permanecerá segura.
      </p>
      
      <p style="color: #888; font-size: 13px;">
        <strong>¿El botón no funciona?</strong><br>
        Copia y pega este enlace en tu navegador:<br>
        <span style="word-break: break-all; color: #667eea;">%LINK%</span>
      </p>
    </div>
    
    <div class="footer">
      <p><strong>BandSocial</strong> - Red Social Musical de Colombia 🎸</p>
      <p>© 2025 BandSocial. Todos los derechos reservados.</p>
    </div>
  </div>
</body>
</html>
```

**IMPORTANTE:** Firebase reemplaza automáticamente `%LINK%` con el enlace real de recuperación.

### **Paso 4: Guardar**

1. Click en **"Save"** (Guardar)
2. Firebase aplicará el nuevo template inmediatamente

---

## 🧪 Probar el Email

### **1. En tu aplicación:**
```javascript
// En Login.jsx
await sendPasswordResetEmail(auth, 'tu@email.com');
```

### **2. Revisa tu email:**
- Deberías recibir el email con el diseño de BandSocial
- El enlace debe funcionar correctamente
- Click en "Restablecer Contraseña"

### **3. Verifica en Firebase Console:**
- Ve a **Authentication** → **Users**
- Busca el usuario
- Verifica que el email se haya enviado

---

## 📧 Variables Disponibles en Firebase

Firebase proporciona estas variables que puedes usar en el template:

| Variable | Descripción |
|----------|-------------|
| `%LINK%` | Enlace de recuperación (REQUERIDO) |
| `%EMAIL%` | Email del usuario |
| `%APP_NAME%` | Nombre de la app (BandSocial) |

---

## 🎨 Template Simplificado (Sin HTML)

Si prefieres algo más simple, usa este:

```
Hola,

Recibimos una solicitud para restablecer tu contraseña de BandSocial.

Haz click aquí para crear una nueva contraseña:
%LINK%

Este enlace expirará en 1 hora.

¿No solicitaste este cambio? Ignora este correo.

---
BandSocial - Red Social Musical de Colombia 🎸
© 2025 BandSocial
```

---

## ⚙️ Configuración Avanzada

### **Personalizar Dominio del Email**

Para enviar desde `@bandsocial.com` en lugar de `@firebase.com`:

1. Ve a **Authentication** → **Settings** → **Authorized domains**
2. Agrega tu dominio personalizado
3. Configura registros DNS (SPF, DKIM)
4. Verifica el dominio

### **Idioma del Email**

Firebase detecta automáticamente el idioma del navegador del usuario, pero puedes forzar español:

```javascript
await sendPasswordResetEmail(auth, email, {
  url: 'https://bandsociall.netlify.app',
  handleCodeInApp: false,
});
```

---

## 🔍 Solución de Problemas

### **No llega el email**

1. **Revisa spam/correo no deseado**
2. **Verifica en Firebase Console:**
   - Authentication → Users
   - Busca el usuario
   - Verifica que el email sea correcto
3. **Revisa la consola del navegador:**
   ```javascript
   ✅ Correo de recuperación enviado exitosamente a: usuario@email.com
   ```

### **Error: "auth/user-not-found"**

- El email no está registrado en Firebase Auth
- Verifica que el usuario se haya registrado correctamente

### **Error: "auth/too-many-requests"**

- Demasiados intentos de reset
- Espera 15-30 minutos antes de intentar nuevamente

### **El enlace no funciona**

- El enlace expira después de 1 hora
- Solicita un nuevo enlace de recuperación

---

## 📊 Comparación: Firebase vs EmailJS

| Característica | Firebase Auth | EmailJS |
|----------------|---------------|---------|
| **Configuración** | Fácil | Media |
| **Enlace funcional** | ✅ Sí | ❌ No (requiere implementación) |
| **Personalización** | Media | Alta |
| **Costo** | Gratis | Gratis (200/mes) |
| **Mantenimiento** | Bajo | Medio |
| **Recomendado para** | Recuperación de contraseña | Confirmaciones, notificaciones |

---

## ✅ Recomendación Final

**Para recuperación de contraseña:**
- ✅ Usa Firebase Auth (más simple y confiable)
- ✅ Personaliza el template en Firebase Console
- ✅ El enlace funciona automáticamente

**Para otros emails:**
- ✅ Usa EmailJS (confirmación de pago, bienvenida, etc.)
- ✅ Mayor control sobre el diseño
- ✅ No requiere enlace de Firebase

---

## 🚀 Siguiente Paso

1. Ve a Firebase Console
2. Personaliza el template de "Password reset"
3. Prueba enviando un email de recuperación
4. Verifica que llegue con el diseño de BandSocial

¡Listo! 🎸✨
