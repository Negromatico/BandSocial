# Documentación de Diagramas UML - BandSocial

Esta documentación proporciona información detallada para crear todos los diagramas UML del proyecto BandSocial.

---

## 1. DIAGRAMA DE CASOS DE USO

### Descripción
Muestra las interacciones entre los actores (usuarios) y el sistema BandSocial.

### Actores
1. **Usuario Invitado** (sin registro)
2. **Usuario Registrado** (Músico/Banda/Productor)
3. **Usuario Premium**
4. **Administrador del Sistema**

### Casos de Uso Principales

#### Usuario Invitado
- Ver publicaciones públicas
- Buscar músicos/bandas
- Ver eventos públicos
- Ver productos en MusicMarket
- Registrarse en la plataforma
- Iniciar sesión

#### Usuario Registrado
- **Gestión de Perfil**
  - Crear perfil
  - Editar perfil (foto, biografía, ciudad, géneros, instrumentos)
  - Ver perfil propio
  - Ver perfiles de otros usuarios
  - Eliminar cuenta

- **Publicaciones**
  - Crear publicación (texto, foto, video)
  - Editar publicación
  - Eliminar publicación
  - Reaccionar a publicaciones (me gusta)
  - Comentar publicaciones
  - Compartir publicaciones

- **Red Social**
  - Seguir a otros usuarios
  - Dejar de seguir
  - Ver seguidores
  - Ver usuarios que sigue
  - Enviar mensajes directos
  - Recibir mensajes
  - Buscar músicos/bandas

- **Eventos**
  - Crear evento
  - Editar evento
  - Cancelar evento
  - Marcar asistencia a evento
  - Ver eventos
  - Buscar eventos por ciudad/fecha

- **MusicMarket**
  - Publicar producto (instrumento/equipo)
  - Editar producto
  - Eliminar producto
  - Buscar productos
  - Contactar vendedor
  - Ver productos propios

- **Notificaciones**
  - Recibir notificaciones (nuevos seguidores, comentarios, mensajes)
  - Ver notificaciones
  - Marcar como leídas

- **Grupos**
  - Crear grupo musical
  - Unirse a grupo
  - Salir de grupo
  - Gestionar miembros del grupo

#### Usuario Premium (hereda de Usuario Registrado)
- Obtener insignia PRO
- Publicaciones destacadas
- Mayor visibilidad en búsquedas
- Estadísticas avanzadas de perfil
- Acceso prioritario a eventos
- Gestionar suscripción

#### Administrador
- Moderar contenido
- Eliminar publicaciones inapropiadas
- Suspender/eliminar usuarios
- Ver reportes de usuarios
- Gestionar eventos reportados
- Ver estadísticas de la plataforma

### Relaciones
- **Include**: Autenticación (incluida en casi todos los casos de uso de usuario registrado)
- **Extend**: Notificaciones (extienden acciones como comentar, seguir, etc.)
- **Generalización**: Usuario Premium hereda de Usuario Registrado

---

## 2. DIAGRAMA DE CLASES

### Clases Principales

#### Usuario
```
Usuario
-----------------
- uid: String
- email: String
- password: String (encriptada)
- nombre: String
- fotoPerfil: String (URL)
- type: String (músico, banda, productor, etc.)
- ciudad: String
- biografia: String
- generosMusicales: Array<String>
- instrumentos: Array<String>
- experiencia: String
- seguidores: Array<String>
- siguiendo: Array<String>
- fechaRegistro: Date
- planActual: String (free, premium)
- membershipPlan: String
-----------------
+ registrarse()
+ iniciarSesion()
+ cerrarSesion()
+ editarPerfil()
+ seguirUsuario(uid: String)
+ dejarDeSeguir(uid: String)
+ eliminarCuenta()
```

#### Publicacion
```
Publicacion
-----------------
- id: String
- autorUid: String
- autorNombre: String
- autorFoto: String
- descripcion: String
- imagenesUrl: Array<String>
- videosUrl: Array<String>
- tipo: String
- ciudad: String
- reacciones: Array<String> (uids de usuarios)
- comentarios: Array<Comentario>
- createdAt: Timestamp
-----------------
+ crear()
+ editar()
+ eliminar()
+ agregarReaccion(uid: String)
+ quitarReaccion(uid: String)
+ agregarComentario(comentario: Comentario)
```

#### Comentario
```
Comentario
-----------------
- id: String
- autorUid: String
- autorNombre: String
- autorFoto: String
- texto: String
- timestamp: Timestamp
-----------------
+ crear()
+ eliminar()
```

#### Evento
```
Evento
-----------------
- id: String
- organizadorUid: String
- titulo: String
- descripcion: String
- fecha: Date
- hora: String
- ubicacion: String
- ciudad: String
- imagenUrl: String
- precio: Number
- asistentes: Array<String>
- interesados: Array<String>
- createdAt: Timestamp
-----------------
+ crear()
+ editar()
+ cancelar()
+ marcarAsistencia(uid: String)
+ marcarInteres(uid: String)
```

#### Producto (MusicMarket)
```
Producto
-----------------
- id: String
- vendedorUid: String
- vendedorNombre: String
- titulo: String
- descripcion: String
- precio: Number
- categoria: String (guitarra, bajo, batería, etc.)
- condicion: String (nuevo, usado)
- imagenesUrl: Array<String>
- ciudad: String
- estado: String (disponible, vendido)
- createdAt: Timestamp
-----------------
+ publicar()
+ editar()
+ eliminar()
+ marcarComoVendido()
+ contactarVendedor()
```

#### Mensaje
```
Mensaje
-----------------
- id: String
- chatId: String
- fromUid: String
- toUid: String
- texto: String
- timestamp: Timestamp
- leido: Boolean
-----------------
+ enviar()
+ marcarComoLeido()
```

#### Chat
```
Chat
-----------------
- chatId: String
- participantes: Array<String>
- lastMsg: String
- lastAt: Timestamp
- lastFrom: String
- lastRead: Boolean
-----------------
+ iniciarChat()
+ obtenerMensajes()
```

#### Notificacion
```
Notificacion
-----------------
- id: String
- paraUid: String
- deUid: String
- tipo: String (seguidor, comentario, reaccion, mensaje)
- mensaje: String
- leida: Boolean
- timestamp: Timestamp
- link: String
-----------------
+ crear()
+ marcarComoLeida()
+ eliminar()
```

#### Grupo
```
Grupo
-----------------
- id: String
- nombre: String
- descripcion: String
- creadorUid: String
- miembros: Array<String>
- generoMusical: String
- ciudad: String
- imagenUrl: String
- createdAt: Timestamp
-----------------
+ crear()
+ agregarMiembro(uid: String)
+ eliminarMiembro(uid: String)
+ editar()
+ eliminar()
```

#### Membresia
```
Membresia
-----------------
- uid: String
- plan: String (premium)
- fechaInicio: Date
- fechaFin: Date
- activa: Boolean
- metodoPago: String
-----------------
+ suscribirse()
+ cancelar()
+ renovar()
+ verificarEstado()
```

### Relaciones entre Clases

1. **Usuario - Publicacion**: 1 a muchos (un usuario puede tener muchas publicaciones)
2. **Publicacion - Comentario**: 1 a muchos (una publicación puede tener muchos comentarios)
3. **Usuario - Evento**: 1 a muchos (un usuario puede crear muchos eventos)
4. **Usuario - Producto**: 1 a muchos (un usuario puede vender muchos productos)
5. **Usuario - Mensaje**: 1 a muchos (un usuario puede enviar muchos mensajes)
6. **Usuario - Notificacion**: 1 a muchos (un usuario puede recibir muchas notificaciones)
7. **Usuario - Grupo**: muchos a muchos (un usuario puede estar en varios grupos)
8. **Usuario - Membresia**: 1 a 1 (un usuario tiene una membresía)
9. **Usuario - Usuario**: muchos a muchos (seguidores/siguiendo)

---

## 3. DIAGRAMA DE SECUENCIA

### Secuencia 1: Registro de Usuario

**Actores**: Usuario Invitado, Sistema, Firebase Auth, Firestore

**Flujo**:
1. Usuario ingresa a página de registro
2. Usuario completa formulario (email, contraseña, nombre, tipo)
3. Usuario hace clic en "Registrarse"
4. Sistema valida datos del formulario
5. Sistema envía solicitud a Firebase Auth
6. Firebase Auth crea cuenta de usuario
7. Firebase Auth retorna UID
8. Sistema crea documento en Firestore (colección 'perfiles')
9. Sistema guarda información del perfil
10. Sistema redirige a página de inicio
11. Sistema muestra mensaje de bienvenida

### Secuencia 2: Crear Publicación

**Actores**: Usuario Registrado, Sistema, Firestore, Storage

**Flujo**:
1. Usuario hace clic en "Crear Publicación"
2. Sistema muestra modal de creación
3. Usuario escribe texto
4. Usuario selecciona imagen/video (opcional)
5. Usuario hace clic en "Publicar"
6. Sistema valida contenido
7. SI hay imagen/video:
   - Sistema sube archivo a Firebase Storage
   - Storage retorna URL
8. Sistema crea documento en Firestore (colección 'publicaciones')
9. Sistema guarda publicación con datos
10. Firestore confirma creación
11. Sistema actualiza feed
12. Sistema cierra modal
13. Sistema muestra publicación en el feed

### Secuencia 3: Enviar Mensaje Directo

**Actores**: Usuario A, Usuario B, Sistema, Firestore

**Flujo**:
1. Usuario A abre perfil de Usuario B
2. Usuario A hace clic en "Enviar Mensaje"
3. Sistema verifica si existe chat entre A y B
4. SI NO existe chat:
   - Sistema crea chatId único
   - Sistema crea documentos en userChats para A y B
5. Sistema abre ventana de chat
6. Usuario A escribe mensaje
7. Usuario A envía mensaje
8. Sistema guarda mensaje en Firestore (colección 'messages')
9. Sistema actualiza lastMsg en userChats de A y B
10. Sistema envía notificación a Usuario B
11. Usuario B recibe notificación en tiempo real

### Secuencia 4: Comprar Membresía Premium

**Actores**: Usuario, Sistema, Pasarela de Pago, Firestore

**Flujo**:
1. Usuario navega a página de Membresía
2. Sistema muestra planes disponibles
3. Usuario selecciona plan Premium
4. Usuario hace clic en "Suscribirse"
5. Sistema redirige a página de pago
6. Usuario ingresa datos de pago
7. Usuario confirma pago
8. Sistema procesa pago con pasarela
9. Pasarela confirma pago exitoso
10. Sistema actualiza perfil en Firestore
11. Sistema establece planActual = "premium"
12. Sistema crea registro de membresía
13. Sistema redirige a perfil
14. Sistema muestra insignia PRO

### Secuencia 5: Crear y Asistir a Evento

**Actores**: Organizador, Asistente, Sistema, Firestore

**Flujo Creación**:
1. Organizador navega a sección Eventos
2. Organizador hace clic en "Crear Evento"
3. Sistema muestra formulario
4. Organizador completa información (título, fecha, ubicación, etc.)
5. Organizador sube imagen del evento
6. Sistema sube imagen a Storage
7. Organizador hace clic en "Publicar Evento"
8. Sistema crea documento en Firestore (colección 'eventos')
9. Sistema confirma creación
10. Sistema muestra evento en lista

**Flujo Asistencia**:
1. Asistente busca eventos
2. Sistema muestra lista de eventos
3. Asistente selecciona evento
4. Sistema muestra detalles del evento
5. Asistente hace clic en "Asistiré"
6. Sistema agrega UID a array de asistentes
7. Sistema actualiza contador de asistentes
8. Sistema envía notificación al organizador
9. Sistema confirma asistencia al usuario

---

## 4. DIAGRAMA DE ACTIVIDADES

### Actividad 1: Proceso de Publicación de Contenido

**Inicio**: Usuario autenticado en feed

1. Usuario hace clic en "Crear Publicación"
2. ¿Qué tipo de contenido?
   - **Texto**: Escribir texto → Continuar
   - **Imagen**: Escribir texto → Seleccionar imagen → Continuar
   - **Video**: Escribir texto → Seleccionar video → Continuar
3. ¿Contenido válido?
   - **NO**: Mostrar error → Volver a paso 2
   - **SÍ**: Continuar
4. ¿Hay archivo multimedia?
   - **SÍ**: Subir a Storage → Obtener URL
   - **NO**: Continuar
5. Crear documento en Firestore
6. ¿Creación exitosa?
   - **NO**: Mostrar error → Fin
   - **SÍ**: Actualizar feed
7. Mostrar publicación
8. Notificar a seguidores

**Fin**: Publicación visible en feed

### Actividad 2: Proceso de Búsqueda de Músicos

**Inicio**: Usuario en página de búsqueda

1. Usuario ingresa criterios de búsqueda:
   - Nombre
   - Ciudad
   - Género musical
   - Instrumento
   - Tipo de perfil
2. Usuario hace clic en "Buscar"
3. Sistema consulta Firestore con filtros
4. ¿Hay resultados?
   - **NO**: Mostrar "No se encontraron resultados" → Fin
   - **SÍ**: Continuar
5. Sistema ordena resultados (Premium primero)
6. Sistema muestra lista de perfiles
7. Usuario selecciona perfil
8. Sistema muestra perfil completo
9. ¿Usuario quiere conectar?
   - **Seguir**: Agregar a siguiendo → Notificar
   - **Mensaje**: Abrir chat
   - **Volver**: Regresar a resultados

**Fin**: Acción completada

### Actividad 3: Proceso de Venta en MusicMarket

**Inicio**: Usuario vendedor

1. Usuario navega a MusicMarket
2. Usuario hace clic en "Vender Producto"
3. Usuario completa formulario:
   - Título
   - Descripción
   - Precio
   - Categoría
   - Condición
   - Ciudad
4. Usuario sube fotos del producto
5. ¿Fotos válidas?
   - **NO**: Mostrar error → Volver a paso 4
   - **SÍ**: Subir a Storage
6. Usuario hace clic en "Publicar"
7. ¿Datos completos?
   - **NO**: Mostrar campos faltantes → Volver a paso 3
   - **SÍ**: Continuar
8. Sistema crea documento en Firestore
9. Sistema publica producto
10. **Proceso de Venta**:
    - Comprador ve producto
    - Comprador contacta vendedor
    - Negociación por mensajes
    - Acuerdo de venta
11. Vendedor marca como "Vendido"
12. Sistema actualiza estado del producto

**Fin**: Producto vendido

---

## 5. DIAGRAMA DE ESTADOS

### Estados del Usuario

```
[No Registrado] 
    → (Registro exitoso) → [Registrado - Perfil Incompleto]
    → (Completar perfil) → [Registrado - Activo]
    → (Suscripción Premium) → [Premium - Activo]
    → (Cancelar Premium) → [Registrado - Activo]
    → (Inactividad 6 meses) → [Inactivo]
    → (Iniciar sesión) → [Registrado - Activo]
    → (Eliminar cuenta) → [Eliminado]
```

### Estados de una Publicación

```
[Borrador]
    → (Publicar) → [Publicada]
    → (Editar) → [Publicada - Editada]
    → (Reportar) → [En Revisión]
    → (Aprobar) → [Publicada]
    → (Rechazar) → [Eliminada]
    → (Usuario elimina) → [Eliminada]
```

### Estados de un Evento

```
[Borrador]
    → (Publicar) → [Programado]
    → (Editar) → [Programado - Modificado]
    → (Fecha llega) → [En Curso]
    → (Finaliza) → [Finalizado]
    → (Cancelar) → [Cancelado]
```

### Estados de un Producto (MusicMarket)

```
[Borrador]
    → (Publicar) → [Disponible]
    → (Editar) → [Disponible - Actualizado]
    → (Marcar vendido) → [Vendido]
    → (Eliminar) → [Eliminado]
    → (Reportar) → [En Revisión]
    → (Aprobar) → [Disponible]
    → (Rechazar) → [Eliminado]
```

### Estados de un Mensaje

```
[Enviando]
    → (Enviado exitoso) → [Enviado]
    → (Receptor abre chat) → [Entregado]
    → (Receptor lee) → [Leído]
    → (Error de envío) → [Fallido]
```

### Estados de Membresía Premium

```
[Sin Membresía]
    → (Suscribirse) → [Premium - Activa]
    → (Renovación automática) → [Premium - Activa]
    → (Cancelar) → [Premium - Cancelada]
    → (Vencimiento) → [Sin Membresía]
    → (Pago fallido) → [Premium - Suspendida]
    → (Pagar) → [Premium - Activa]
```

---

## 6. DIAGRAMA DE COMPONENTES

### Arquitectura de Componentes

#### Frontend (React)
```
App
├── Contexts
│   ├── ThemeContext
│   ├── ChatDockContext
│   └── GuestContext
├── Pages
│   ├── Auth
│   │   ├── Login
│   │   ├── Register
│   │   └── ResetPassword
│   ├── Social
│   │   ├── PublicacionesNuevo
│   │   ├── Profile
│   │   ├── ProfileView
│   │   └── Buscar
│   ├── Events
│   │   └── EventosNuevo
│   ├── Market
│   │   └── MusicmarketNuevo
│   ├── Info
│   │   ├── AcercaDe
│   │   ├── TerminosCondiciones
│   │   ├── PoliticaPrivacidad
│   │   ├── Contacto
│   │   └── Ayuda
│   ├── Premium
│   │   ├── Membership
│   │   └── Payment
│   └── Other
│       ├── Notifications
│       ├── Followers
│       ├── MisGrupos
│       └── GamePage
├── Components
│   ├── Navbar
│   ├── Footer
│   ├── PublicacionForm
│   ├── ComentariosPublicacion
│   ├── ReaccionesPublicacion
│   ├── ContadorComentarios
│   ├── AuthPromptModal
│   ├── ScrollToTop
│   └── ErrorBoundary
└── Services
    ├── firebase
    ├── notificationService
    └── authService
```

#### Backend (Firebase)
```
Firebase
├── Authentication
│   └── Gestión de usuarios
├── Firestore Database
│   ├── Colecciones
│   │   ├── perfiles
│   │   ├── publicaciones
│   │   ├── eventos
│   │   ├── productos
│   │   ├── messages
│   │   ├── userChats
│   │   ├── notificaciones
│   │   └── grupos
│   └── Reglas de seguridad
├── Storage
│   ├── Imágenes de perfil
│   ├── Imágenes de publicaciones
│   ├── Imágenes de eventos
│   └── Imágenes de productos
└── Hosting
    └── Aplicación web
```

#### Servicios Externos
```
Servicios Externos
├── EmailJS (Envío de emails)
├── Procesador de Pagos
└── CDN (Bootstrap, React Icons)
```

---

## 7. DIAGRAMA DE DESPLIEGUE

### Arquitectura de Despliegue

```
[Navegador del Usuario]
    ↓ HTTPS
[Firebase Hosting]
    ↓
[Aplicación React (SPA)]
    ↓
[Firebase SDK]
    ↓
┌─────────────────────────────┐
│   Firebase Services         │
├─────────────────────────────┤
│ - Authentication            │
│ - Firestore Database        │
│ - Cloud Storage             │
│ - Cloud Functions (futuro)  │
└─────────────────────────────┘
    ↓
[Servicios Externos]
    - EmailJS
    - Pasarela de Pago
```

### Nodos de Despliegue

1. **Cliente (Navegador)**
   - Componente: Aplicación React
   - Protocolo: HTTPS
   - Puerto: 443

2. **Servidor Firebase Hosting**
   - Componente: Archivos estáticos (HTML, CSS, JS)
   - CDN global
   - SSL/TLS automático

3. **Firebase Authentication**
   - Gestión de sesiones
   - Tokens JWT
   - Autenticación de terceros (Google, Facebook)

4. **Firestore Database**
   - Base de datos NoSQL
   - Sincronización en tiempo real
   - Reglas de seguridad

5. **Cloud Storage**
   - Almacenamiento de archivos
   - URLs públicas
   - Reglas de acceso

6. **Servicios Externos**
   - EmailJS: Envío de correos
   - Procesador de pagos: Transacciones premium

---

## 8. DIAGRAMA DE PAQUETES

### Estructura de Paquetes

```
bandsocial/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar
│   │   │   ├── Footer
│   │   │   └── ErrorBoundary
│   │   ├── social/
│   │   │   ├── PublicacionForm
│   │   │   ├── ComentariosPublicacion
│   │   │   ├── ReaccionesPublicacion
│   │   │   └── ContadorComentarios
│   │   └── auth/
│   │       └── AuthPromptModal
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login
│   │   │   ├── Register
│   │   │   └── ResetPassword
│   │   ├── social/
│   │   │   ├── PublicacionesNuevo
│   │   │   ├── Profile
│   │   │   ├── ProfileView
│   │   │   └── Buscar
│   │   ├── events/
│   │   │   └── EventosNuevo
│   │   ├── market/
│   │   │   └── MusicmarketNuevo
│   │   ├── info/
│   │   │   ├── AcercaDe
│   │   │   ├── TerminosCondiciones
│   │   │   ├── PoliticaPrivacidad
│   │   │   ├── Contacto
│   │   │   └── Ayuda
│   │   └── premium/
│   │       ├── Membership
│   │       └── Payment
│   ├── contexts/
│   │   ├── ThemeContext
│   │   ├── ChatDockContext
│   │   └── GuestContext
│   ├── services/
│   │   ├── firebase
│   │   ├── notificationService
│   │   └── authService
│   ├── styles/
│   │   ├── global.css
│   │   ├── theme.css
│   │   └── InfoPages.css
│   └── utils/
│       └── helpers
└── public/
    └── assets/
```

### Dependencias entre Paquetes

- **pages** → **components**: Las páginas usan componentes
- **pages** → **services**: Las páginas usan servicios
- **pages** → **contexts**: Las páginas consumen contextos
- **components** → **services**: Algunos componentes usan servicios
- **components** → **contexts**: Componentes consumen contextos
- **services** → **firebase**: Servicios dependen de Firebase
- **contexts** → **services**: Contextos pueden usar servicios

---

## HERRAMIENTAS RECOMENDADAS PARA CREAR LOS DIAGRAMAS

1. **Draw.io (diagrams.net)** - Gratis, online
   - Ideal para: Todos los diagramas UML
   - URL: https://app.diagrams.net/

2. **Lucidchart** - Freemium
   - Ideal para: Diagramas profesionales
   - URL: https://www.lucidchart.com/

3. **PlantUML** - Gratis, basado en texto
   - Ideal para: Diagramas de clases y secuencia
   - URL: https://plantuml.com/

4. **StarUML** - Freemium
   - Ideal para: Diagramas UML completos
   - URL: https://staruml.io/

5. **Visual Paradigm** - Freemium
   - Ideal para: Proyectos profesionales completos
   - URL: https://www.visual-paradigm.com/

---

## NOTAS IMPORTANTES

1. **Colores Sugeridos**:
   - Usuario: Azul (#667eea)
   - Sistema: Gris (#6b7280)
   - Firebase: Naranja (#FFA500)
   - Acciones exitosas: Verde (#10b981)
   - Errores: Rojo (#ef4444)

2. **Convenciones**:
   - Usar nombres en español para actores y casos de uso
   - Usar camelCase para atributos y métodos en diagramas de clases
   - Incluir multiplicidad en relaciones
   - Documentar restricciones importantes

3. **Prioridad de Diagramas**:
   1. Diagrama de Casos de Uso (visión general)
   2. Diagrama de Clases (estructura de datos)
   3. Diagrama de Secuencia (flujos principales)
   4. Diagrama de Actividades (procesos complejos)
   5. Diagrama de Estados (ciclos de vida)
   6. Diagrama de Componentes (arquitectura)
   7. Diagrama de Despliegue (infraestructura)
   8. Diagrama de Paquetes (organización del código)

---

**Fecha de creación**: Febrero 2026
**Proyecto**: BandSocial - Red Social Musical
**Versión**: 1.0
