# 📧 Configuración de EmailJS (GRATIS)

EmailJS permite enviar hasta **200 emails gratis al mes** sin necesidad de backend.

## 🚀 Pasos para Configurar

### 1. Crear Cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Click en **"Sign Up"** (Registrarse)
3. Usa tu email de Gmail, Outlook o cualquier otro
4. Confirma tu email

### 2. Agregar Servicio de Email

1. En el dashboard, ve a **"Email Services"**
2. Click en **"Add New Service"**
3. Selecciona tu proveedor:
   - **Gmail** (recomendado)
   - Outlook
   - Yahoo
   - Otro
4. Conecta tu cuenta de email
5. Copia el **Service ID** (ejemplo: `service_abc1234`)

### 3. Crear Template de Email

1. Ve a **"Email Templates"**
2. Click en **"Create New Template"**
3. Usa este template:

#### **Nombre del Template:** `subscription_confirmation`

#### **Subject (Asunto):**
```
¡Bienvenido a BandSocial Premium! 🎸👑
```

#### **Content (Contenido):**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
    .total { background: #667eea; color: white; padding: 15px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
    .benefits { background: #f0f4ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .benefit-item { padding: 8px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🎸 BANDSOCIAL</div>
      <h2>¡Bienvenido a Premium! 👑</h2>
    </div>
    
    <div class="content">
      <h3>Hola {{to_name}},</h3>
      <p>¡Gracias por unirte a BandSocial Premium! Tu suscripción ha sido activada exitosamente.</p>
      
      <div class="card">
        <h4 style="margin-top: 0; color: #667eea;">📋 Detalles de tu Suscripción</h4>
        <div class="detail-row">
          <span><strong>Plan:</strong></span>
          <span>{{plan_name}}</span>
        </div>
        <div class="detail-row">
          <span><strong>Fecha de Inicio:</strong></span>
          <span>{{start_date}}</span>
        </div>
        <div class="detail-row">
          <span><strong>Fecha de Renovación:</strong></span>
          <span>{{end_date}}</span>
        </div>
        <div class="detail-row">
          <span><strong>ID de Transacción:</strong></span>
          <span>{{transaction_id}}</span>
        </div>
        <div class="detail-row" style="border-bottom: none;">
          <span><strong>Método de Pago:</strong></span>
          <span>{{payment_method}}</span>
        </div>
      </div>
      
      <div class="total">
        Total Pagado: {{amount}}
      </div>
      
      <div class="benefits">
        <h4 style="margin-top: 0; color: #667eea;">✨ Beneficios de tu Plan Premium</h4>
        <div class="benefit-item">✓ Publicaciones ilimitadas</div>
        <div class="benefit-item">✓ Productos ilimitados en MusicMarket</div>
        <div class="benefit-item">✓ Eventos ilimitados</div>
        <div class="benefit-item">✓ Insignia Premium en tu perfil</div>
        <div class="benefit-item">✓ Soporte prioritario</div>
        <div class="benefit-item">✓ Acceso a funciones exclusivas</div>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://bandsociall.netlify.app/profile" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;">
          Ver Mi Perfil Premium
        </a>
      </div>
      
      <p style="margin-top: 30px; color: #666; font-size: 14px;">
        <strong>Nota:</strong> Tu suscripción se renovará automáticamente el {{end_date}}. 
        Puedes cancelar en cualquier momento desde tu perfil.
      </p>
    </div>
    
    <div class="footer">
      <p>Este es un correo automático, por favor no responder.</p>
      <p>© 2025 BandSocial - Red Social Musical de Colombia</p>
      <p>¿Necesitas ayuda? Contáctanos en soporte@bandsocial.com</p>
    </div>
  </div>
</body>
</html>
```

4. En **"To email"** pon: `{{to_email}}`
5. Guarda el template
6. Copia el **Template ID** (ejemplo: `template_xyz5678`)

### 4. Obtener Public Key

1. Ve a **"Account"** → **"General"**
2. Busca **"Public Key"**
3. Copia la clave (ejemplo: `abc123XYZ456`)

### 5. Configurar en el Proyecto

Abre el archivo `src/services/emailService.js` y reemplaza:

```javascript
const EMAILJS_SERVICE_ID = 'service_abc1234'; // Tu Service ID
const EMAILJS_TEMPLATE_ID = 'template_xyz5678'; // Tu Template ID
const EMAILJS_PUBLIC_KEY = 'abc123XYZ456'; // Tu Public Key
```

## ✅ Probar el Envío

1. Inicia la aplicación: `npm run dev`
2. Ve a `/payment`
3. Completa el formulario de pago
4. Click en "Confirmar Pago"
5. Revisa tu email (puede tardar 1-2 minutos)

## 📊 Plan Gratuito de EmailJS

- ✅ **200 emails/mes** gratis
- ✅ Sin tarjeta de crédito
- ✅ Soporte básico
- ✅ Templates ilimitados
- ✅ Servicios ilimitados

## 🔧 Solución de Problemas

### Error: "Service ID not found"
- Verifica que copiaste correctamente el Service ID
- Asegúrate de que el servicio esté activo

### Error: "Template ID not found"
- Verifica el Template ID
- Asegúrate de que el template esté guardado

### No llega el correo
- Revisa la carpeta de spam
- Verifica que el email en `to_email` sea correcto
- Revisa los logs de EmailJS en el dashboard

### Error: "Public Key invalid"
- Copia nuevamente la Public Key
- Asegúrate de no tener espacios extras

## 🎯 Variables del Template

Estas son las variables que puedes usar en tu template:

- `{{to_email}}` - Email del destinatario
- `{{to_name}}` - Nombre del usuario
- `{{plan_name}}` - Nombre del plan (Premium)
- `{{amount}}` - Monto pagado ($29,990 COP)
- `{{start_date}}` - Fecha de inicio
- `{{end_date}}` - Fecha de renovación
- `{{transaction_id}}` - ID de transacción
- `{{payment_method}}` - Método de pago

## 📱 Alternativas Gratuitas

Si necesitas más de 200 emails/mes:

1. **SendGrid** - 100 emails/día gratis
2. **Mailgun** - 5,000 emails/mes gratis (primeros 3 meses)
3. **AWS SES** - 62,000 emails/mes gratis (primer año)

## 🚀 Siguiente Nivel

Para producción, considera:
- Usar un dominio personalizado
- Configurar DKIM/SPF
- Monitorear tasas de entrega
- Implementar retry logic
- Agregar analytics de emails

---

**¿Necesitas ayuda?** Revisa la [documentación oficial de EmailJS](https://www.emailjs.com/docs/)
