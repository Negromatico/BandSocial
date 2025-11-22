# 🔧 Solución: Error 422 - The recipients address is empty

## ❌ Error Actual:

```
POST https://api.emailjs.com/api/v1.0/email/send 422 (Unprocessable Content)
EmailJSResponseStatus: The recipients address is empty
```

**Causa:** El template en EmailJS no tiene configurado el campo "To Email" correctamente.

---

## ✅ Solución: Configurar "To Email" en EmailJS

### **Paso 1: Ir al Template**

1. Ve a: https://dashboard.emailjs.com/admin/templates
2. Busca el template: **template_n53bkjh**
3. Click en **"Edit"** (ícono de lápiz)

### **Paso 2: Configurar "To Email"**

En la configuración del template, busca el campo **"To Email"** y asegúrate de que tenga:

```
{{to_email}}
```

**IMPORTANTE:** Debe ser exactamente `{{to_email}}` (con dobles llaves).

### **Paso 3: Verificar Configuración Completa**

Tu template debe tener esta configuración:

```
Template Settings:
├─ Template Name: Subscription Confirmation
├─ From Name: BandSocial
├─ From Email: (tu email verificado)
├─ To Email: {{to_email}}  ← IMPORTANTE
├─ Subject: ¡Bienvenido a BandSocial Premium! 👑
└─ Content: (tu HTML)
```

### **Paso 4: Guardar**

1. Click en **"Save"**
2. Espera la confirmación

---

## 📋 Variables que Debes Configurar:

En el template de EmailJS, asegúrate de tener estas variables:

| Campo | Valor | Descripción |
|-------|-------|-------------|
| **To Email** | `{{to_email}}` | Email del destinatario (REQUERIDO) |
| **To Name** | `{{to_name}}` | Nombre del usuario (opcional) |
| **Subject** | `¡Bienvenido a BandSocial Premium! 👑` | Asunto del email |

---

## 🎨 Configuración Completa del Template:

### **Settings (Configuración):**

```
Template Name: Subscription Confirmation
From Name: BandSocial
From Email: noreply@bandsociall.netlify.app
Reply To: (vacío o tu email de soporte)
To Email: {{to_email}}
BCC: (vacío)
```

### **Subject (Asunto):**

```
¡Bienvenido a BandSocial Premium! 👑
```

### **Content (Contenido HTML):**

Usa el HTML del archivo `EMAILJS_SETUP.md` o este simplificado:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: white; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px; text-align: center; }
    .content { padding: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎸 BANDSOCIAL</h1>
      <h2>¡Bienvenido a Premium! 👑</h2>
    </div>
    <div class="content">
      <h3>Hola {{to_name}},</h3>
      <p>¡Gracias por unirte a BandSocial Premium!</p>
      
      <h4>📋 Detalles</h4>
      <p><strong>Plan:</strong> {{plan_name}}</p>
      <p><strong>Monto:</strong> {{amount}}</p>
      <p><strong>Inicio:</strong> {{start_date}}</p>
      <p><strong>Renovación:</strong> {{end_date}}</p>
      <p><strong>ID:</strong> {{transaction_id}}</p>
      
      <p>© 2025 BandSocial 🎸</p>
    </div>
  </div>
</body>
</html>
```

---

## 🧪 Probar el Template:

### **Opción 1: Test en EmailJS Dashboard**

1. En el editor del template, busca **"Test it"**
2. Ingresa valores de prueba:
   ```json
   {
     "to_email": "tu@email.com",
     "to_name": "Tu Nombre",
     "plan_name": "Premium",
     "amount": "$29.990 COP",
     "start_date": "22 de noviembre de 2025",
     "end_date": "22 de diciembre de 2025",
     "transaction_id": "BS-1234567890"
   }
   ```
3. Click en **"Send Test"**
4. Verifica que llegue el email

### **Opción 2: Test desde tu App**

1. Recarga la aplicación
2. Simula un pago
3. Verifica en consola:
   ```
   📧 Enviando correo de confirmación a: tu@email.com
   🔍 Template Params: { to_email: "tu@email.com", ... }
   ✅ Correo enviado exitosamente
   ```

---

## 🔍 Diagnóstico en Consola:

Después de actualizar el template, verifica estos logs:

```javascript
// ✅ Correcto:
📧 Enviando correo de confirmación a: estebanber25@gmail.com
🔍 Template Params: { to_email: "estebanber25@gmail.com", to_name: "Esteban", ... }
🔍 Service ID: BandSocial
🔍 Template ID: template_n53bkjh
✅ Correo enviado exitosamente

// ❌ Error:
❌ Error enviando correo: The recipients address is empty
```

---

## 📸 Captura de Pantalla de Referencia:

Tu configuración en EmailJS debe verse así:

```
┌─────────────────────────────────────────┐
│ Template Settings                       │
├─────────────────────────────────────────┤
│ Template Name: Subscription Confirmation│
│ From Name: BandSocial                   │
│ From Email: noreply@...                 │
│ To Email: {{to_email}}  ← AQUÍ          │
│ Subject: ¡Bienvenido a...               │
└─────────────────────────────────────────┘
```

---

## ⚠️ Errores Comunes:

| Error | Causa | Solución |
|-------|-------|----------|
| `recipients address is empty` | Falta `{{to_email}}` | Agregar en "To Email" |
| `{to_email}` (una llave) | Sintaxis incorrecta | Usar `{{to_email}}` (doble llave) |
| `to_email` (sin llaves) | No es variable | Usar `{{to_email}}` |
| Campo vacío | No configurado | Escribir `{{to_email}}` |

---

## ✅ Checklist Final:

- [ ] Ir a EmailJS Dashboard
- [ ] Editar template `template_n53bkjh`
- [ ] Configurar "To Email" como `{{to_email}}`
- [ ] Guardar cambios
- [ ] Probar con "Send Test"
- [ ] Verificar que llegue el email
- [ ] Probar desde la app

---

**Una vez configurado el "To Email" en EmailJS, el error desaparecerá.** 📧✨
