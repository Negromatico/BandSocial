# 📧 Templates de Email para BandSocial

Colección de templates HTML para EmailJS

---

## 🔐 Template 1: Recuperación de Contraseña

### **Configuración en EmailJS:**

**Template Name:** `password_reset`

**Subject (Asunto):**
```
Recupera tu contraseña de BandSocial 🔐
```

**To Email:**
```
{{to_email}}
```

**Content (HTML):**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
    .header h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 18px;
      color: #333;
      margin-bottom: 20px;
    }
    .message {
      color: #666;
      font-size: 15px;
      line-height: 1.8;
      margin-bottom: 30px;
    }
    .button-container {
      text-align: center;
      margin: 40px 0;
    }
    .reset-button {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 16px 40px;
      text-decoration: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
    }
    .reset-button:hover {
      background: #5568d3;
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
    }
    .info-box {
      background: #f0f4ff;
      border-left: 4px solid #667eea;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .info-box p {
      margin: 0;
      color: #555;
      font-size: 14px;
    }
    .warning-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 20px;
      margin: 30px 0;
      border-radius: 4px;
    }
    .warning-box p {
      margin: 0;
      color: #856404;
      font-size: 14px;
    }
    .divider {
      height: 1px;
      background: #e0e0e0;
      margin: 30px 0;
    }
    .footer {
      background: #f9f9f9;
      padding: 30px;
      text-align: center;
      color: #666;
      font-size: 13px;
      border-top: 1px solid #e0e0e0;
    }
    .footer p {
      margin: 8px 0;
    }
    .footer a {
      color: #667eea;
      text-decoration: none;
    }
    .social-links {
      margin-top: 20px;
    }
    .social-links a {
      display: inline-block;
      margin: 0 10px;
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🎸 BANDSOCIAL</div>
      <h2>Recuperación de Contraseña</h2>
    </div>
    
    <!-- Content -->
    <div class="content">
      <div class="greeting">
        Hola {{user_name}},
      </div>
      
      <div class="message">
        Recibimos una solicitud para restablecer la contraseña de tu cuenta de BandSocial.
        Si fuiste tú quien lo solicitó, haz clic en el botón de abajo para crear una nueva contraseña.
      </div>
      
      <!-- Reset Button -->
      <div class="button-container">
        <a href="{{reset_link}}" class="reset-button">
          🔐 Restablecer Contraseña
        </a>
      </div>
      
      <!-- Info Box -->
      <div class="info-box">
        <p><strong>⏰ Este enlace expirará en 1 hora</strong></p>
        <p style="margin-top: 10px;">
          Por seguridad, este enlace solo puede usarse una vez y expirará después de 60 minutos.
        </p>
      </div>
      
      <!-- Warning Box -->
      <div class="warning-box">
        <p><strong>⚠️ ¿No solicitaste este cambio?</strong></p>
        <p style="margin-top: 10px;">
          Si no solicitaste restablecer tu contraseña, ignora este correo. 
          Tu cuenta permanecerá segura y no se realizarán cambios.
        </p>
      </div>
      
      <div class="divider"></div>
      
      <!-- Alternative Link -->
      <div class="message" style="font-size: 13px; color: #888;">
        <p><strong>¿El botón no funciona?</strong></p>
        <p>Copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #667eea; margin-top: 10px;">
          {{reset_link}}
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>BandSocial</strong> - Red Social Musical de Colombia 🎸</p>
      <p>Conectando músicos, bandas y amantes de la música</p>
      
      <div class="divider" style="margin: 20px 0;"></div>
      
      <p>¿Necesitas ayuda? Contáctanos en <a href="mailto:soporte@bandsocial.com">soporte@bandsocial.com</a></p>
      
      <div class="social-links">
        <a href="https://bandsociall.netlify.app">🌐 Sitio Web</a>
        <a href="#">📱 Instagram</a>
        <a href="#">🎵 Facebook</a>
      </div>
      
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Este es un correo automático, por favor no responder.<br>
        © 2025 BandSocial. Todos los derechos reservados.
      </p>
    </div>
  </div>
</body>
</html>
```

---

## 📋 Variables del Template:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `{{to_email}}` | Email del destinatario | `usuario@email.com` |
| `{{user_name}}` | Nombre del usuario | `Juan Pérez` |
| `{{reset_link}}` | Enlace de recuperación | `https://bandsociall.netlify.app/reset?token=abc123` |

---

## 🔧 Cómo Crear el Template en EmailJS:

### **Paso 1: Ir a Email Templates**
1. Ve a https://dashboard.emailjs.com/
2. Click en **"Email Templates"**
3. Click en **"Create New Template"**

### **Paso 2: Configurar el Template**

**Template Name:**
```
password_reset
```

**Subject:**
```
Recupera tu contraseña de BandSocial 🔐
```

**To Email:**
```
{{to_email}}
```

**Content:**
- Copia y pega el HTML completo de arriba

### **Paso 3: Guardar**
1. Click en **"Save"**
2. Copia el **Template ID** (ejemplo: `template_abc123`)

---

## 💻 Código para Enviar el Email:

### **Crear archivo:** `src/services/passwordResetService.js`

```javascript
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_PASSWORD_RESET = import.meta.env.VITE_EMAILJS_TEMPLATE_PASSWORD_RESET;

/**
 * Envía email de recuperación de contraseña
 * @param {Object} data - Datos del usuario
 * @param {string} data.userEmail - Email del usuario
 * @param {string} data.userName - Nombre del usuario
 * @param {string} data.resetLink - Enlace de recuperación
 */
export const sendPasswordResetEmail = async (data) => {
  try {
    const templateParams = {
      to_email: data.userEmail,
      user_name: data.userName,
      reset_link: data.resetLink,
    };

    console.log('📧 Enviando email de recuperación a:', data.userEmail);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_PASSWORD_RESET,
      templateParams
    );

    console.log('✅ Email de recuperación enviado:', response);

    return {
      success: true,
      message: 'Email de recuperación enviado exitosamente'
    };
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    return {
      success: false,
      message: 'No se pudo enviar el email de recuperación',
      error: error.message
    };
  }
};
```

---

## 🔐 Integración con Firebase Auth:

### **Actualizar:** `src/pages/Login.jsx`

```javascript
import { sendPasswordResetEmail } from 'firebase/auth';
import { sendPasswordResetEmail as sendResetEmailNotification } from '../services/passwordResetService';
import { auth } from '../services/firebase';

const handlePasswordReset = async (email) => {
  try {
    // 1. Enviar email de Firebase (con enlace de reset)
    await sendPasswordResetEmail(auth, email);
    
    // 2. Obtener datos del usuario
    const userDoc = await getDoc(doc(db, 'perfiles', email));
    const userName = userDoc.exists() ? userDoc.data().nombre : 'Usuario';
    
    // 3. Enviar email personalizado con EmailJS (opcional)
    // Nota: Firebase ya envía su propio email, esto es adicional
    await sendResetEmailNotification({
      userEmail: email,
      userName: userName,
      resetLink: `https://bandsociall.netlify.app/reset` // Firebase maneja el token
    });
    
    showToast('Email de recuperación enviado. Revisa tu bandeja de entrada.', 'success');
  } catch (error) {
    console.error('Error:', error);
    showToast('Error al enviar email de recuperación', 'error');
  }
};
```

---

## 🎨 Vista Previa del Email:

```
┌────────────────────────────────────┐
│  🎸 BANDSOCIAL                     │
│  Recuperación de Contraseña        │
├────────────────────────────────────┤
│                                    │
│  Hola Juan Pérez,                  │
│                                    │
│  Recibimos una solicitud para      │
│  restablecer la contraseña de tu   │
│  cuenta de BandSocial.             │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  🔐 Restablecer Contraseña   │ │
│  └──────────────────────────────┘ │
│                                    │
│  ⏰ Este enlace expirará en 1 hora │
│                                    │
│  ⚠️ ¿No solicitaste este cambio?   │
│  Ignora este correo.               │
│                                    │
└────────────────────────────────────┘
```

---

## ⚙️ Configurar Variables de Entorno:

### **Actualizar:** `.env`

```env
# EmailJS Templates
VITE_EMAILJS_SERVICE_ID=BandSocial
VITE_EMAILJS_TEMPLATE_ID=template_qz7su7q
VITE_EMAILJS_TEMPLATE_PASSWORD_RESET=template_nuevo_id
VITE_EMAILJS_PUBLIC_KEY=rLWXOVXb-xCBR1cJZ
```

---

## ✅ Checklist de Implementación:

- [ ] Crear template en EmailJS
- [ ] Copiar Template ID
- [ ] Agregar Template ID al `.env`
- [ ] Crear `passwordResetService.js`
- [ ] Actualizar `Login.jsx` con función de reset
- [ ] Probar envío de email
- [ ] Verificar que el enlace funcione
- [ ] Revisar diseño en móvil

---

## 🎯 Características del Template:

✅ **Diseño Responsive** - Se ve bien en móvil y desktop  
✅ **Botón CTA Grande** - Fácil de hacer click  
✅ **Enlace Alternativo** - Por si el botón no funciona  
✅ **Advertencia de Seguridad** - Informa sobre solicitudes no autorizadas  
✅ **Expiración Clara** - Indica que expira en 1 hora  
✅ **Branding Consistente** - Colores y estilo de BandSocial  
✅ **Footer Completo** - Con información de contacto  

---

¿Necesitas más templates? Puedo crear:
- ✉️ Bienvenida de nuevo usuario
- 🎉 Confirmación de registro
- 📧 Verificación de email
- 🔔 Notificación de actividad
- 💳 Confirmación de pago (ya creado)
