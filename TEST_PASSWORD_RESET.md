# 🔍 Diagnóstico: Email de Recuperación No Llega

## ✅ Checklist de Diagnóstico

### **1. Verificar en la Consola del Navegador**

Abre las DevTools (F12) y busca:

```javascript
// ✅ Mensaje exitoso:
✅ Correo de recuperación enviado exitosamente a: tu@email.com

// ❌ Errores comunes:
❌ Error: auth/user-not-found
❌ Error: auth/invalid-email
❌ Error: auth/network-request-failed
```

### **2. Verificar en Firebase Console**

1. Ve a: https://console.firebase.google.com/
2. Proyecto: **bandas-f9c77**
3. **Authentication** → **Users**
4. Busca tu email
5. ¿Aparece el usuario? ✅ / ❌

### **3. Verificar Configuración de Firebase**

#### **A. Email/Password habilitado:**
1. Firebase Console → **Authentication** → **Sign-in method**
2. ¿"Email/Password" está habilitado? ✅ / ❌

#### **B. Dominio autorizado:**
1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. ¿Está `localhost` en la lista? ✅ / ❌
3. ¿Está `bandsociall.netlify.app` en la lista? ✅ / ❌

### **4. Verificar Email del Usuario**

¿El email está registrado en Firebase Auth?

```bash
# Opción 1: Buscar en Firebase Console
Authentication → Users → Buscar por email

# Opción 2: Intentar login
Si puedes hacer login con ese email, entonces SÍ está registrado
```

### **5. Revisar Carpetas de Email**

- [ ] Bandeja de entrada
- [ ] Spam / Correo no deseado
- [ ] Promociones
- [ ] Actualizaciones
- [ ] Social

### **6. Probar con Otro Email**

Intenta con un email diferente:
- Gmail
- Outlook
- Yahoo

---

## 🔧 Soluciones Según el Error

### **Error: "auth/user-not-found"**

**Problema:** El email no está registrado en Firebase Auth

**Solución:**
1. Registra el usuario primero
2. Ve a `/register`
3. Crea una cuenta con ese email
4. Luego intenta recuperar contraseña

### **Error: "auth/invalid-email"**

**Problema:** Formato de email inválido

**Solución:**
- Verifica que el email tenga formato correcto: `usuario@dominio.com`
- No debe tener espacios
- Debe tener @ y dominio

### **Error: "auth/too-many-requests"**

**Problema:** Demasiados intentos

**Solución:**
- Espera 15-30 minutos
- O usa otro email para probar

### **No hay error pero no llega el email**

**Posibles causas:**

#### **1. Firebase no está enviando emails**

**Verificar:**
```javascript
// En Login.jsx, agrega más logs:
console.log('🔍 Intentando enviar email a:', resetEmail);
await sendPasswordResetEmail(auth, resetEmail);
console.log('✅ Firebase dice que envió el email');
```

#### **2. Email bloqueado por el proveedor**

**Solución:**
- Revisa spam
- Agrega `noreply@bandsociall.netlify.app` a contactos
- Intenta con otro proveedor de email

#### **3. Configuración de Firebase incorrecta**

**Verificar en Firebase Console:**
1. **Authentication** → **Settings** → **SMTP settings**
2. ¿Hay configuración personalizada? 
   - Si SÍ: Verifica que sea correcta
   - Si NO: Firebase usa su servidor por defecto (debería funcionar)

---

## 🧪 Prueba Manual en Firebase Console

### **Método 1: Enviar desde Firebase Console**

1. Ve a Firebase Console
2. **Authentication** → **Users**
3. Busca tu usuario
4. Click en los 3 puntos (⋮)
5. Click en **"Send password reset email"**
6. ¿Llega el email? ✅ / ❌

Si NO llega desde Firebase Console, el problema es de Firebase, no de tu código.

### **Método 2: Crear usuario de prueba**

1. Firebase Console → **Authentication** → **Users**
2. Click en **"Add user"**
3. Email: `test@test.com`
4. Password: `test123456`
5. Intenta recuperar contraseña de este usuario
6. ¿Llega el email? ✅ / ❌

---

## 💻 Código de Prueba Mejorado

Actualiza `Login.jsx` con más logs:

```javascript
const handleResetPassword = async (e) => {
  e.preventDefault();
  setResetError('');
  setResetSent(false);
  
  console.log('🔍 INICIO: Proceso de recuperación de contraseña');
  console.log('📧 Email ingresado:', resetEmail);
  
  if (!resetEmail || !resetEmail.includes('@')) {
    console.log('❌ Email inválido');
    setResetError('Por favor ingresa un correo electrónico válido');
    return;
  }
  
  try {
    console.log('🔄 Llamando a Firebase sendPasswordResetEmail...');
    
    await sendPasswordResetEmail(auth, resetEmail);
    
    console.log('✅ Firebase respondió exitosamente');
    console.log('📬 Email debería llegar a:', resetEmail);
    
    setResetSent(true);
    
  } catch (err) {
    console.error('❌ ERROR COMPLETO:', err);
    console.error('❌ Código de error:', err.code);
    console.error('❌ Mensaje:', err.message);
    
    let errorMessage = 'No se pudo enviar el correo. ';
    
    switch (err.code) {
      case 'auth/user-not-found':
        errorMessage += 'Este correo no está registrado.';
        console.log('💡 SOLUCIÓN: Registra este email primero en /register');
        break;
      case 'auth/invalid-email':
        errorMessage += 'El formato del correo es inválido.';
        break;
      case 'auth/too-many-requests':
        errorMessage += 'Demasiados intentos. Intenta más tarde.';
        break;
      default:
        errorMessage += err.message;
    }
    
    setResetError(errorMessage);
  }
};
```

---

## 📊 Tabla de Diagnóstico

| Síntoma | Causa Probable | Solución |
|---------|----------------|----------|
| Error en consola | Ver mensaje específico | Seguir solución del error |
| Sin error, no llega | Usuario no existe | Registrar usuario primero |
| Sin error, no llega | Email en spam | Revisar spam |
| Sin error, no llega | Firebase mal configurado | Verificar en Console |
| Llega desde Console, no desde app | Problema en código | Revisar implementación |

---

## 🎯 Acción Inmediata

**Haz esto AHORA:**

1. **Abre la consola del navegador (F12)**
2. **Ve a la pestaña "Console"**
3. **Intenta recuperar contraseña**
4. **Copia TODOS los mensajes que aparezcan**
5. **Pégalos aquí para que pueda ayudarte mejor**

---

## 🔑 Credenciales de Prueba

Si quieres probar rápido, usa estas credenciales:

```javascript
// Usuario de prueba
Email: test@bandsocial.com
Password: Test123456!

// Pasos:
1. Registra este usuario en /register
2. Intenta recuperar contraseña
3. Revisa el email test@bandsocial.com
```

---

## 📞 Información Necesaria para Ayudarte

Para diagnosticar mejor, necesito saber:

1. **¿Qué aparece en la consola del navegador?**
   - Copia todos los mensajes

2. **¿El usuario existe en Firebase Auth?**
   - Ve a Firebase Console → Authentication → Users
   - ¿Aparece tu email?

3. **¿Qué proveedor de email usas?**
   - Gmail / Outlook / Yahoo / Otro

4. **¿Revisaste spam?**
   - Sí / No

5. **¿Probaste desde Firebase Console?**
   - Sí / No
   - ¿Llegó? Sí / No

---

**Responde estas preguntas y podré ayudarte mejor.** 🔍
