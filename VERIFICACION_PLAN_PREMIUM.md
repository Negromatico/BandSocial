# Verificación de Plan Premium al Iniciar Sesión

## Problema Resuelto
El sistema ahora identifica correctamente si una cuenta es Premium o no, y redirige al usuario apropiadamente al iniciar sesión.

## Cambios Implementados

### 1. **Login.jsx** - Verificación de Plan al Iniciar Sesión
**Ubicación:** `src/pages/Login.jsx`

**Cambios:**
- ✅ Agregado `getDoc` y `doc` de Firestore para obtener el perfil del usuario
- ✅ Modificada función `onSubmit` para verificar el plan del usuario después de autenticarse
- ✅ Lógica de redirección:
  - **Usuario Premium** → Redirige a `/publicaciones` (feed principal)
  - **Usuario Free** → Redirige a `/membership` (página de planes)
  - **Sin perfil** → Redirige a `/membership` (configuración inicial)

**Código implementado:**
```javascript
const onSubmit = async (data) => {
  setError('');
  try {
    const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
    const user = userCredential.user;
    
    // Obtener el perfil del usuario para verificar su plan
    const perfilRef = doc(db, 'perfiles', user.uid);
    const perfilSnap = await getDoc(perfilRef);
    
    if (perfilSnap.exists()) {
      const perfil = perfilSnap.data();
      
      // Verificar si el usuario ya tiene plan premium
      const esPremium = perfil.planActual === 'premium' || perfil.membershipPlan === 'premium';
      
      if (esPremium) {
        // Si ya es premium, ir directo a publicaciones
        navigate('/publicaciones');
      } else {
        // Si no es premium, mostrar página de membership
        navigate('/membership');
      }
    } else {
      // Si no existe el perfil, ir a membership para configurarlo
      navigate('/membership');
    }
  } catch (err) {
    setError('Correo o contraseña incorrectos');
  }
};
```

### 2. **Register.jsx** - Plan Inicial para Nuevos Usuarios
**Ubicación:** `src/pages/Register.jsx`

**Cambios:**
- ✅ Agregados campos `planActual` y `membershipPlan` con valor inicial `'free'`
- ✅ Todos los nuevos usuarios comienzan con plan gratuito por defecto

**Código implementado:**
```javascript
await setDoc(doc(db, 'perfiles', user.uid), {
  // ... otros campos ...
  planActual: 'free',
  membershipPlan: 'free',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
```

### 3. **Membership.jsx** - Indicador de Plan Actual
**Ubicación:** `src/pages/Membership.jsx`

**Cambios:**
- ✅ Agregado `useEffect` para cargar el plan actual del usuario
- ✅ Estado `currentPlan` para almacenar el plan del usuario
- ✅ Indicador visual "Tu Plan Actual" en la tarjeta correspondiente
- ✅ Botón deshabilitado con texto "Plan Actual" para el plan activo
- ✅ Clase CSS `current-plan` para resaltar visualmente

**Código implementado:**
```javascript
// Cargar el plan actual del usuario
useEffect(() => {
  const loadCurrentPlan = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const perfilRef = doc(db, 'perfiles', user.uid);
        const perfilSnap = await getDoc(perfilRef);
        if (perfilSnap.exists()) {
          const perfil = perfilSnap.data();
          const plan = perfil.planActual || perfil.membershipPlan || null;
          setCurrentPlan(plan);
        }
      } catch (error) {
        console.error('Error al cargar plan actual:', error);
      }
    }
  };
  
  loadCurrentPlan();
}, []);
```

## Flujo de Usuario

### Nuevo Usuario (Registro)
1. Usuario se registra en `/register`
2. Se crea perfil con `planActual: 'free'` y `membershipPlan: 'free'`
3. Redirige a `/membership` para elegir plan
4. Usuario puede:
   - Continuar con plan Free → Va a `/profile`
   - Obtener Premium → Va a `/payment`

### Usuario Existente (Login)
1. Usuario inicia sesión en `/login`
2. Sistema verifica el plan en Firestore
3. **Si es Premium:**
   - Redirige directamente a `/publicaciones`
   - NO muestra página de membership
4. **Si es Free:**
   - Redirige a `/membership`
   - Muestra "Tu Plan Actual" en tarjeta Free
   - Puede actualizar a Premium

## Campos de Firestore

### Colección: `perfiles`
```javascript
{
  planActual: 'free' | 'premium',      // Plan actual del usuario
  membershipPlan: 'free' | 'premium',  // Campo alternativo (compatibilidad)
  membershipStartDate: string,         // Fecha de inicio del plan
  membershipEndDate: string,           // Fecha de fin (solo Premium)
  // ... otros campos
}
```

## Beneficios

✅ **Mejor UX:** Usuarios Premium no ven anuncios innecesarios
✅ **Conversión:** Usuarios Free ven la oferta Premium al iniciar sesión
✅ **Claridad:** Indicador visual del plan actual en Membership
✅ **Consistencia:** Verificación en ambos campos (`planActual` y `membershipPlan`)
✅ **Seguridad:** Validación en el backend (Firestore)

## Archivos Modificados

1. `src/pages/Login.jsx`
2. `src/pages/Register.jsx`
3. `src/pages/Membership.jsx`

## Pruebas Recomendadas

- [ ] Registrar nuevo usuario → Debe tener plan 'free'
- [ ] Login con usuario Free → Debe ir a `/membership`
- [ ] Login con usuario Premium → Debe ir a `/publicaciones`
- [ ] Verificar indicador "Tu Plan Actual" en Membership
- [ ] Actualizar de Free a Premium → Verificar redirección correcta
- [ ] Verificar que botón "Plan Actual" esté deshabilitado

## Notas Adicionales

- La verificación usa ambos campos (`planActual` y `membershipPlan`) para compatibilidad
- Los usuarios existentes sin estos campos serán tratados como Free
- El sistema es retrocompatible con perfiles antiguos
