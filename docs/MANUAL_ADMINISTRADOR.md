# MANUAL DE ADMINISTRADOR - BANDSOCIAL

## 📋 INFORMACIÓN GENERAL

**Aplicación:** BandSocial  
**Versión:** 1.0  
**URL:** https://bandsociall.netlify.app  
**Cuenta Admin:** estebanber24@gmail.com

---

## 🔐 ACCESO AL PANEL DE ADMINISTRADOR

### Iniciar Sesión como Administrador

1. Ir a https://bandsociall.netlify.app
2. Hacer clic en "Iniciar Sesión"
3. Ingresar credenciales de administrador
4. Una vez autenticado, hacer clic en el avatar de usuario
5. Seleccionar **"Panel de Administrador"** (botón rojo)
6. Serás redirigido a `/admin`

---

## 📊 DASHBOARD PRINCIPAL

### Estructura del Panel

El dashboard de administrador contiene 4 secciones principales:

1. **Usuarios** - Gestión de cuentas
2. **Publicaciones** - Moderación de contenido
3. **Eventos** - Administración de eventos
4. **Productos** - Gestión del marketplace
5. **Analítica** - Estadísticas y métricas

---

## 👥 GESTIÓN DE USUARIOS

### Ver Lista de Usuarios

- Acceder a la pestaña "Usuarios"
- Ver tabla con todos los usuarios registrados
- Información mostrada:
  - Nombre completo
  - Email
  - Tipo de perfil
  - Plan (Estándar/Premium)
  - Estado (Activo/Baneado/Desactivado)
  - Fecha de registro

### Buscar Usuarios

- Usar la barra de búsqueda
- Filtrar por nombre, email o tipo

### Banear/Desbanear Usuario

**Banear:**
1. Encontrar usuario en la lista
2. Hacer clic en botón "Banear"
3. Confirmar acción
4. El usuario no podrá iniciar sesión

**Desbanear:**
1. Encontrar usuario baneado
2. Hacer clic en "Desbanear"
3. El usuario recupera acceso

### Ver Detalles de Usuario

1. Hacer clic en el nombre del usuario
2. Ver perfil completo con:
   - Información personal
   - Publicaciones
   - Productos
   - Eventos creados
   - Estadísticas

---

## 📝 MODERACIÓN DE PUBLICACIONES

### Ver Todas las Publicaciones

- Acceder a pestaña "Publicaciones"
- Ver lista completa de posts
- Información mostrada:
  - Autor
  - Contenido
  - Fecha
  - Reacciones
  - Comentarios

### Eliminar Publicación

1. Encontrar publicación inapropiada
2. Hacer clic en "Eliminar"
3. Confirmar eliminación
4. La publicación se borra permanentemente

### Filtrar Publicaciones

- Por fecha
- Por autor
- Por cantidad de reportes

---

## 🎤 ADMINISTRACIÓN DE EVENTOS

### Ver Todos los Eventos

- Acceder a pestaña "Eventos"
- Ver lista de eventos creados
- Información:
  - Título
  - Creador
  - Fecha y hora
  - Ubicación
  - Asistentes confirmados

### Eliminar Evento

1. Seleccionar evento
2. Hacer clic en "Eliminar"
3. Confirmar acción

### Editar Evento

1. Hacer clic en evento
2. Modificar información necesaria
3. Guardar cambios

---

## 🎸 GESTIÓN DE PRODUCTOS (MUSICMARKET)

### Ver Productos

- Acceder a pestaña "Productos"
- Ver lista completa del marketplace
- Información:
  - Nombre
  - Vendedor
  - Precio
  - Estado
  - Calificación

### Eliminar Producto

1. Encontrar producto
2. Hacer clic en "Eliminar"
3. Confirmar eliminación

### Moderar Productos

- Revisar productos reportados
- Verificar precios sospechosos
- Validar descripciones

---

## 📊 ANALÍTICA Y ESTADÍSTICAS

### Dashboard General

Métricas principales:
- Total de usuarios
- Usuarios activos
- Publicaciones totales
- Eventos creados
- Productos en venta
- Tasa de conversión Premium

### Analítica de Usuarios

**KPIs:**
- Total de usuarios
- Usuarios Premium vs Estándar
- Nuevos registros (últimos 30 días)
- Tasa de conversión a Premium

**Gráficos:**
- Distribución por tipo de perfil
- Distribución por ciudad
- Distribución por género musical
- Crecimiento de usuarios

### Analítica de Publicaciones

**KPIs:**
- Total de publicaciones
- Promedio de reacciones
- Tasa de engagement
- Publicaciones por usuario

**Gráficos:**
- Publicaciones por tipo
- Engagement por tipo de perfil
- Actividad por ciudad

### Analítica de Eventos

**KPIs:**
- Total de eventos
- Promedio de asistentes
- Eventos próximos
- Tasa de confirmación

**Gráficos:**
- Eventos por tipo
- Eventos por ciudad
- Eventos por género musical
- Distribución de precios

### Analítica de Productos

**KPIs:**
- Total de productos
- Precio promedio
- Calificación promedio
- Tasa de productos usados

**Gráficos:**
- Productos por categoría
- Productos por ubicación
- Distribución de precios
- Calificaciones

### Analítica de Eliminación de Cuentas

**KPIs:**
- Total de encuestas
- Cuentas eliminadas
- Cuentas desactivadas

**Gráficos:**
- Razones de eliminación
- Eliminación vs Desactivación
- Por tipo de perfil
- Por plan de membresía

**Tabla de Razones:**
- Razón más común
- Cantidad
- Porcentaje
- Acción común (Eliminar/Desactivar)

---

## 🔧 CONFIGURACIÓN DEL SISTEMA

### Reglas de Firebase

**Firestore Rules:**
- Ubicación: `firestore.rules`
- Aplicar cambios en Firebase Console
- Protección de colecciones
- Validación de datos

**Storage Rules:**
- Ubicación: `storage.rules`
- Límites de tamaño por colección
- Tipos de archivo permitidos

### Colecciones de Firestore

1. **perfiles** - Información de usuarios
2. **publicaciones** - Posts del feed
3. **eventos** - Eventos musicales
4. **productos** - Marketplace
5. **conversaciones** - Chats
6. **notificaciones** - Sistema de notificaciones
7. **encuestasEliminacion** - Analítica de eliminación
8. **grupos** - Grupos musicales
9. **pagos** - Transacciones Premium

---

## 🚨 MODERACIÓN Y REPORTES

### Revisar Reportes

1. Acceder a sección "Reportes"
2. Ver lista de contenido reportado
3. Revisar cada caso
4. Tomar acción:
   - Eliminar contenido
   - Advertir usuario
   - Banear usuario
   - Descartar reporte

### Tipos de Reportes

- Contenido inapropiado
- Spam
- Acoso
- Información falsa
- Violación de derechos de autor

---

## 📈 GESTIÓN DE PLANES PREMIUM

### Ver Suscripciones

- Lista de usuarios Premium
- Fecha de inicio
- Estado de pago
- Próxima renovación

### Gestionar Pagos

- Verificar transacciones
- Resolver problemas de pago
- Cancelar suscripciones
- Reembolsos

---

## 🔔 NOTIFICACIONES MASIVAS

### Enviar Notificación Global

1. Ir a "Notificaciones"
2. Hacer clic en "Enviar Notificación Masiva"
3. Escribir mensaje
4. Seleccionar destinatarios:
   - Todos los usuarios
   - Solo Premium
   - Solo Estándar
   - Por ciudad
5. Enviar

---

## 📊 EXPORTAR DATOS

### Exportar Reportes

- Usuarios: CSV, Excel
- Publicaciones: CSV
- Eventos: CSV
- Productos: CSV
- Analíticas: PDF

---

## 🛡️ SEGURIDAD

### Mejores Prácticas

1. Cambiar contraseña regularmente
2. No compartir credenciales
3. Revisar logs de actividad
4. Monitorear actividad sospechosa
5. Mantener reglas de Firebase actualizadas

### Logs de Actividad

- Ver acciones de administrador
- Fecha y hora
- Tipo de acción
- Usuario afectado

---

## 🆘 SOPORTE TÉCNICO

### Contacto Técnico

**Desarrollador:** Equipo BandSocial  
**Email:** dev@bandsocial.com  
**GitHub:** https://github.com/Negromatico/BandSocial

### Problemas Comunes

**Error de autenticación:**
- Verificar credenciales
- Limpiar caché
- Verificar reglas de Firebase

**Datos no se cargan:**
- Verificar conexión a Firebase
- Revisar índices de Firestore
- Verificar reglas de seguridad

---

## 📝 NOTAS IMPORTANTES

1. Solo la cuenta `estebanber24@gmail.com` tiene acceso de administrador
2. Todas las acciones de moderación son irreversibles
3. Respetar la privacidad de los usuarios
4. Documentar decisiones importantes
5. Revisar analíticas semanalmente

---

**Última actualización:** Febrero 2026  
**Versión:** 1.0
