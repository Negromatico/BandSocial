# 🧩 Documentación Detallada de Componentes - BandSocial

## Tabla de Contenidos
1. [Componentes de Layout](#componentes-de-layout)
2. [Componentes de Autenticación](#componentes-de-autenticación)
3. [Componentes de Perfil](#componentes-de-perfil)
4. [Componentes de Publicaciones](#componentes-de-publicaciones)
5. [Componentes de Chat](#componentes-de-chat)
6. [Componentes de Notificaciones](#componentes-de-notificaciones)
7. [Componentes de Estadísticas](#componentes-de-estadísticas)
8. [Componentes de Formularios](#componentes-de-formularios)
9. [Componentes de UI](#componentes-de-ui)

---

## 1. Componentes de Layout

### Navbar.jsx

**Ubicación:** `src/components/Navbar.jsx`

**Propósito:** Barra de navegación principal de la aplicación.

**Props:** Ninguna

**Estado:**
```javascript
- searchQuery: string          // Término de búsqueda
- showSearch: boolean          // Mostrar barra de búsqueda
- currentUser: User | null     // Usuario autenticado
```

**Funcionalidades:**
- Navegación entre páginas principales
- Búsqueda de usuarios
- Toggle de tema (claro/oscuro)
- Centro de notificaciones
- Menú de usuario
- Responsive (hamburger menu en móvil)

**Estructura:**
```jsx
<nav className="navbar">
  <div className="navbar-brand">
    <Logo />
  </div>
  
  <div className="navbar-menu">
    <NavLink to="/publicaciones">Publicaciones</NavLink>
    <NavLink to="/eventos">Eventos</NavLink>
    <NavLink to="/musicmarket">MusicMarket</NavLink>
  </div>
  
  <div className="navbar-actions">
    <SearchBar />
    <ThemeToggle />
    <NotificationCenter />
    <UserMenu />
  </div>
</nav>
```

**Dependencias:**
- `react-router-dom`: Navegación
- `react-icons`: Iconos
- `NotificationCenter`: Componente de notificaciones
- `ThemeContext`: Contexto de tema

---

### Footer.jsx

**Ubicación:** `src/components/Footer.jsx`

**Propósito:** Pie de página con enlaces y información.

**Props:** Ninguna

**Estructura:**
```jsx
<footer className="footer">
  <div className="footer-content">
    <div className="footer-section">
      <h4>BandSocial</h4>
      <p>Red social para músicos</p>
    </div>
    
    <div className="footer-section">
      <h4>Enlaces</h4>
      <Link to="/acerca-de">Acerca de</Link>
      <Link to="/ayuda">Ayuda</Link>
      <Link to="/contacto">Contacto</Link>
    </div>
    
    <div className="footer-section">
      <h4>Legal</h4>
      <Link to="/terminos">Términos</Link>
      <Link to="/privacidad">Privacidad</Link>
    </div>
  </div>
  
  <div className="footer-bottom">
    <p>&copy; 2026 BandSocial. Todos los derechos reservados.</p>
  </div>
</footer>
```

---

### ScrollToTop.jsx

**Ubicación:** `src/components/ScrollToTop.jsx`

**Propósito:** Scroll automático al top al cambiar de ruta.

**Props:** Ninguna

**Implementación:**
```javascript
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
```

**Uso:**
```jsx
<BrowserRouter>
  <ScrollToTop />
  <Routes>
    {/* rutas */}
  </Routes>
</BrowserRouter>
```

---

## 2. Componentes de Autenticación

### Login.jsx

**Ubicación:** `src/pages/Login.jsx`

**Propósito:** Página de inicio de sesión.

**Estado:**
```javascript
- email: string                // Email del usuario
- password: string             // Contraseña
- loading: boolean             // Estado de carga
- error: string | null         // Mensaje de error
- showPassword: boolean        // Mostrar/ocultar contraseña
```

**Funcionalidades:**
- Login con email/password
- Login con Google (opcional)
- Validación de formulario
- Manejo de errores
- Redirección después de login
- Link a recuperación de contraseña
- Link a registro

**Flujo:**
```
1. Usuario ingresa email y password
2. Validación de campos
3. signInWithEmailAndPassword(email, password)
4. Si éxito: redirigir a /publicaciones
5. Si error: mostrar mensaje
```

**Código clave:**
```javascript
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError(null);
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    navigate('/publicaciones');
  } catch (error) {
    setError(getErrorMessage(error.code));
  } finally {
    setLoading(false);
  }
};
```

---

### Register.jsx

**Ubicación:** `src/pages/Register.jsx`

**Propósito:** Página de registro de nuevos usuarios.

**Estado:**
```javascript
- formData: {
    nombre: string,
    email: string,
    password: string,
    confirmPassword: string,
    type: 'musico' | 'banda'
  }
- loading: boolean
- error: string | null
```

**Funcionalidades:**
- Registro con email/password
- Validación de contraseña (mínimo 6 caracteres)
- Confirmación de contraseña
- Creación automática de perfil en Firestore
- Envío de email de verificación
- Redirección después de registro

**Flujo:**
```
1. Usuario completa formulario
2. Validación de campos
3. createUserWithEmailAndPassword()
4. Crear documento en collection('perfiles')
5. sendEmailVerification()
6. Redirigir a /profile (completar perfil)
```

**Código clave:**
```javascript
const handleRegister = async (e) => {
  e.preventDefault();
  
  if (password !== confirmPassword) {
    setError('Las contraseñas no coinciden');
    return;
  }
  
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, email, password
    );
    
    // Crear perfil
    await setDoc(doc(db, 'perfiles', userCredential.user.uid), {
      nombre,
      email,
      type,
      createdAt: serverTimestamp(),
      premium: false
    });
    
    // Enviar verificación
    await sendEmailVerification(userCredential.user);
    
    navigate('/profile');
  } catch (error) {
    setError(getErrorMessage(error.code));
  }
};
```

---

### EmailVerificationPrompt.jsx

**Ubicación:** `src/components/EmailVerificationPrompt.jsx`

**Propósito:** Prompt para verificar email.

**Props:**
```typescript
{
  user: User                   // Usuario de Firebase
  onClose: () => void          // Callback al cerrar
}
```

**Funcionalidades:**
- Mostrar estado de verificación
- Reenviar email de verificación
- Actualizar estado al verificar

**Estructura:**
```jsx
<Modal show={!user.emailVerified}>
  <Modal.Header>
    <h3>Verifica tu email</h3>
  </Modal.Header>
  
  <Modal.Body>
    <p>Hemos enviado un email a {user.email}</p>
    <p>Por favor verifica tu email para continuar</p>
    
    <Button onClick={handleResendEmail}>
      Reenviar email
    </Button>
  </Modal.Body>
</Modal>
```

---

## 3. Componentes de Perfil

### Profile.jsx

**Ubicación:** `src/pages/Profile.jsx`

**Propósito:** Página de perfil del usuario autenticado.

**Estado:**
```javascript
- perfil: {
    nombre: string,
    email: string,
    fotoPerfil: string,
    fotoPortada: string,
    bio: string,
    instrumentos: string[],
    generos: string[],
    ciudad: string,
    redesSociales: {
      spotify: string,
      youtube: string,
      instagram: string
    }
  }
- publicaciones: Publicacion[]
- eventos: Evento[]
- activeTab: 'publicaciones' | 'eventos' | 'acerca'
- showEditModal: boolean
- loading: boolean
```

**Funcionalidades:**
- Mostrar información del perfil
- Editar perfil (modal)
- Subir foto de perfil
- Subir foto de portada
- Ver publicaciones propias
- Ver eventos creados
- Tabs de navegación
- Crear nueva publicación

**Estructura:**
```jsx
<div className="profile-container">
  {/* Portada */}
  <div className="profile-cover">
    <img src={perfil.fotoPortada} />
    <Button onClick={handleUploadCover}>
      Cambiar portada
    </Button>
  </div>
  
  {/* Info principal */}
  <div className="profile-header">
    <img src={perfil.fotoPerfil} className="profile-avatar" />
    <div className="profile-info">
      <h1>{perfil.nombre}</h1>
      <p>{perfil.bio}</p>
      <Button onClick={() => setShowEditModal(true)}>
        Editar perfil
      </Button>
    </div>
  </div>
  
  {/* Tabs */}
  <Tabs activeKey={activeTab} onSelect={setActiveTab}>
    <Tab eventKey="publicaciones" title="Publicaciones">
      {publicaciones.map(pub => <PublicacionCard {...pub} />)}
    </Tab>
    
    <Tab eventKey="eventos" title="Eventos">
      {eventos.map(evt => <EventoCard {...evt} />)}
    </Tab>
    
    <Tab eventKey="acerca" title="Acerca de">
      <AcercaDeSection perfil={perfil} />
    </Tab>
  </Tabs>
  
  {/* Modal de edición */}
  <EditProfileModal
    show={showEditModal}
    onHide={() => setShowEditModal(false)}
    perfil={perfil}
    onSave={handleSaveProfile}
  />
</div>
```

---

### ProfileViewNew.jsx

**Ubicación:** `src/pages/ProfileViewNew.jsx`

**Propósito:** Ver perfil de otros usuarios.

**Props:** Ninguna (usa `useParams` para obtener UID)

**Estado:**
```javascript
- perfil: Perfil | null
- publicaciones: Publicacion[]
- eventos: Evento[]
- siguiendo: boolean           // Si el usuario actual sigue a este perfil
- loadingFollow: boolean
- currentUser: User | null
- activeTab: string
```

**Funcionalidades:**
- Ver perfil de otro usuario
- Seguir/dejar de seguir
- Ver publicaciones del usuario
- Ver eventos del usuario
- Dar like a publicaciones
- Comentar publicaciones
- Abrir chat con el usuario

**Código clave:**
```javascript
// Seguir usuario
const handleFollow = async () => {
  setLoadingFollow(true);
  
  try {
    if (siguiendo) {
      // Dejar de seguir
      await updateDoc(doc(db, 'perfiles', currentUser.uid), {
        siguiendo: arrayRemove(uid)
      });
      await updateDoc(doc(db, 'perfiles', uid), {
        seguidores: arrayRemove(currentUser.uid)
      });
    } else {
      // Seguir
      await updateDoc(doc(db, 'perfiles', currentUser.uid), {
        siguiendo: arrayUnion(uid)
      });
      await updateDoc(doc(db, 'perfiles', uid), {
        seguidores: arrayUnion(currentUser.uid)
      });
      
      // Notificar
      await notificarNuevoSeguidor(currentUser.uid, uid);
    }
    
    setSiguiendo(!siguiendo);
  } catch (error) {
    console.error('Error al seguir:', error);
  } finally {
    setLoadingFollow(false);
  }
};

// Dar like
const handleLike = async (postId) => {
  if (!currentUser) return;
  
  const postRef = doc(db, 'publicaciones', postId);
  const postSnap = await getDoc(postRef);
  
  if (postSnap.exists()) {
    const likes = postSnap.data().likes || [];
    const hasLiked = likes.includes(currentUser.uid);
    
    if (hasLiked) {
      await updateDoc(postRef, {
        likes: arrayRemove(currentUser.uid)
      });
    } else {
      await updateDoc(postRef, {
        likes: arrayUnion(currentUser.uid)
      });
    }
    
    // Actualizar estado local
    setPublicaciones(prev => prev.map(pub => {
      if (pub.id === postId) {
        const newLikes = hasLiked 
          ? likes.filter(id => id !== currentUser.uid)
          : [...likes, currentUser.uid];
        return { ...pub, likes: newLikes };
      }
      return pub;
    }));
  }
};
```

---

### ProfileForm.jsx

**Ubicación:** `src/components/ProfileForm.jsx`

**Propósito:** Formulario de edición de perfil.

**Props:**
```typescript
{
  initialValues: Perfil        // Valores iniciales del perfil
  onSubmit: (data) => void     // Callback al guardar
  onCancel: () => void         // Callback al cancelar
}
```

**Estado:**
```javascript
- formData: Perfil
- errors: Record<string, string>
- loading: boolean
```

**Validaciones:**
- Nombre: requerido, mínimo 3 caracteres
- Bio: máximo 500 caracteres
- URLs de redes sociales: formato válido
- Instrumentos: al menos 1 seleccionado
- Géneros: al menos 1 seleccionado

**Estructura:**
```jsx
<Form onSubmit={handleSubmit}>
  <Form.Group>
    <Form.Label>Nombre *</Form.Label>
    <Form.Control
      type="text"
      value={formData.nombre}
      onChange={handleChange('nombre')}
      isInvalid={!!errors.nombre}
    />
    <Form.Control.Feedback type="invalid">
      {errors.nombre}
    </Form.Control.Feedback>
  </Form.Group>
  
  <Form.Group>
    <Form.Label>Biografía</Form.Label>
    <Form.Control
      as="textarea"
      rows={4}
      value={formData.bio}
      onChange={handleChange('bio')}
      maxLength={500}
    />
    <Form.Text>
      {formData.bio.length}/500 caracteres
    </Form.Text>
  </Form.Group>
  
  <Form.Group>
    <Form.Label>Instrumentos</Form.Label>
    <Select
      isMulti
      options={instrumentosOptions}
      value={formData.instrumentos}
      onChange={handleInstrumentosChange}
    />
  </Form.Group>
  
  {/* Más campos... */}
  
  <div className="form-actions">
    <Button variant="secondary" onClick={onCancel}>
      Cancelar
    </Button>
    <Button variant="primary" type="submit" disabled={loading}>
      {loading ? 'Guardando...' : 'Guardar'}
    </Button>
  </div>
</Form>
```

---

## 4. Componentes de Publicaciones

### PublicacionForm.jsx

**Ubicación:** `src/components/PublicacionForm.jsx`

**Propósito:** Formulario para crear publicaciones.

**Props:**
```typescript
{
  onSubmit: (data) => void
  onCancel: () => void
}
```

**Estado:**
```javascript
- contenido: string            // Texto de la publicación
- imagenes: File[]             // Imágenes seleccionadas
- imagenesPreviews: string[]   // URLs de preview
- uploading: boolean           // Subiendo imágenes
- status: 'publico' | 'privado' | 'amigos'
```

**Funcionalidades:**
- Editor de texto
- Subir múltiples imágenes (máx 4)
- Preview de imágenes
- Eliminar imágenes
- Selector de privacidad
- Validación de contenido

**Código clave:**
```javascript
const handleImageChange = (e) => {
  const files = Array.from(e.target.files);
  
  if (files.length + imagenes.length > 4) {
    alert('Máximo 4 imágenes');
    return;
  }
  
  // Generar previews
  const previews = files.map(file => URL.createObjectURL(file));
  
  setImagenes([...imagenes, ...files]);
  setImagenesPreviews([...imagenesPreviews, ...previews]);
};

const handleSubmit = async (e) => {
  e.preventDefault();
  setUploading(true);
  
  try {
    // Subir imágenes a Cloudinary
    const imageUrls = await Promise.all(
      imagenes.map(img => uploadToCloudinary(img))
    );
    
    // Crear publicación
    await addDoc(collection(db, 'publicaciones'), {
      usuarioId: currentUser.uid,
      contenido,
      imagenesUrl: imageUrls,
      status,
      likes: [],
      comentarios: 0,
      createdAt: serverTimestamp()
    });
    
    onSubmit();
  } catch (error) {
    console.error('Error al crear publicación:', error);
  } finally {
    setUploading(false);
  }
};
```

---

### ComentariosPublicacion.jsx

**Ubicación:** `src/components/ComentariosPublicacion.jsx`

**Propósito:** Sistema de comentarios para publicaciones.

**Props:**
```typescript
{
  publicacionId: string
  usuarioId: string            // Dueño de la publicación
}
```

**Estado:**
```javascript
- comentarios: Comentario[]
- nuevoComentario: string
- loading: boolean
- submitting: boolean
```

**Funcionalidades:**
- Listar comentarios
- Agregar comentario
- Eliminar comentario (solo propios)
- Tiempo relativo (hace 2 horas)
- Scroll automático a nuevos comentarios

**Estructura:**
```jsx
<div className="comentarios-container">
  <div className="comentarios-list">
    {comentarios.map(comentario => (
      <div key={comentario.id} className="comentario">
        <img src={comentario.autorFoto} className="comentario-avatar" />
        <div className="comentario-content">
          <div className="comentario-header">
            <span className="comentario-autor">{comentario.autorNombre}</span>
            <span className="comentario-tiempo">{getTimeAgo(comentario.createdAt)}</span>
          </div>
          <p className="comentario-texto">{comentario.texto}</p>
        </div>
        {comentario.autorId === currentUser.uid && (
          <Button
            variant="link"
            size="sm"
            onClick={() => handleDelete(comentario.id)}
          >
            Eliminar
          </Button>
        )}
      </div>
    ))}
  </div>
  
  <Form onSubmit={handleSubmit} className="comentario-form">
    <Form.Control
      type="text"
      placeholder="Escribe un comentario..."
      value={nuevoComentario}
      onChange={(e) => setNuevoComentario(e.target.value)}
    />
    <Button type="submit" disabled={!nuevoComentario.trim() || submitting}>
      {submitting ? 'Enviando...' : 'Comentar'}
    </Button>
  </Form>
</div>
```

---

### ReaccionesPublicacion.jsx

**Ubicación:** `src/components/ReaccionesPublicacion.jsx`

**Propósito:** Sistema de reacciones (likes) para publicaciones.

**Props:**
```typescript
{
  publicacionId: string
  likes: string[]              // Array de UIDs que dieron like
  onLike: () => void
}
```

**Funcionalidades:**
- Mostrar contador de likes
- Toggle de like/unlike
- Animación al dar like
- Mostrar usuarios que dieron like (tooltip)

**Código:**
```javascript
const ReaccionesPublicacion = ({ publicacionId, likes, onLike }) => {
  const currentUser = auth.currentUser;
  const hasLiked = likes.includes(currentUser?.uid);
  
  return (
    <div className="reacciones">
      <Button
        variant="link"
        className={`like-button ${hasLiked ? 'liked' : ''}`}
        onClick={onLike}
      >
        {hasLiked ? '❤️' : '🤍'} Me gusta
      </Button>
      
      <span className="likes-count">
        {likes.length} {likes.length === 1 ? 'persona' : 'personas'}
      </span>
    </div>
  );
};
```

---

## 5. Componentes de Chat

### ChatDock.jsx

**Ubicación:** `src/components/ChatDock.jsx`

**Propósito:** Panel flotante de chats activos.

**Estado:**
```javascript
- chats: Chat[]                // Lista de chats
- minimized: boolean           // Panel minimizado
- loading: boolean
```

**Funcionalidades:**
- Listar chats recientes
- Abrir ventana de chat
- Minimizar/maximizar panel
- Indicador de mensajes no leídos
- Scroll de chats

**Estructura:**
```jsx
<div className="chat-dock">
  <div className="chat-dock-header" onClick={toggleMinimized}>
    <h4>Mensajes</h4>
    <span className="unread-count">{unreadCount}</span>
  </div>
  
  {!minimized && (
    <div className="chat-dock-body">
      {chats.map(chat => (
        <div
          key={chat.chatId}
          className="chat-item"
          onClick={() => handleOpenChat(chat)}
        >
          <img src={chat.withFoto} className="chat-avatar" />
          <div className="chat-info">
            <div className="chat-name">{chat.withNombre}</div>
            <div className="chat-last-msg">{chat.lastMsg}</div>
          </div>
          {chat.unread > 0 && (
            <span className="chat-unread">{chat.unread}</span>
          )}
        </div>
      ))}
    </div>
  )}
</div>
```

---

### ChatWindow.jsx

**Ubicación:** `src/components/ChatWindow.jsx`

**Propósito:** Ventana de chat individual.

**Props:**
```typescript
{
  user: {
    uid: string,
    nombre: string,
    email: string,
    avatar?: string
  }
  onClose: () => void
  onMinimize: () => void
  minimized: boolean
}
```

**Estado:**
```javascript
- messages: Message[]
- input: string
- loading: boolean
- isRead: boolean              // Si el destinatario leyó el mensaje
```

**Funcionalidades:**
- Listar mensajes en tiempo real
- Enviar mensajes
- Indicador de "visto"
- Scroll automático a último mensaje
- Minimizar ventana
- Cerrar ventana
- Link a perfil del usuario

**Código clave:**
```javascript
// Listener de mensajes en tiempo real
useEffect(() => {
  if (!chatId) return;
  
  const q = query(
    collection(db, 'chats', chatId, 'messages'),
    orderBy('createdAt')
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    setMessages(snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })));
  });
  
  return unsubscribe;
}, [chatId]);

// Enviar mensaje
const handleSend = async (e) => {
  e.preventDefault();
  if (!input.trim()) return;
  
  const msgText = input;
  setInput('');
  
  // Agregar mensaje
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    text: msgText,
    from: currentUser.uid,
    to: user.uid,
    createdAt: serverTimestamp()
  });
  
  // Actualizar metadata
  await Promise.all([
    setDoc(doc(db, 'userChats', currentUser.uid, 'chats', chatId), {
      lastMsg: msgText,
      lastAt: new Date().toISOString(),
      lastFrom: currentUser.uid,
      lastRead: true
    }, { merge: true }),
    
    setDoc(doc(db, 'userChats', user.uid, 'chats', chatId), {
      lastMsg: msgText,
      lastAt: new Date().toISOString(),
      lastFrom: currentUser.uid,
      lastRead: false
    }, { merge: true })
  ]);
  
  // Notificar
  await notificarNuevoMensaje(currentUser.uid, user.uid, msgText);
};
```

---

## 6. Componentes de Notificaciones

### NotificationCenter.jsx

**Ubicación:** `src/components/NotificationCenter.jsx`

**Propósito:** Centro de notificaciones dropdown.

**Estado:**
```javascript
- notificaciones: Notificacion[]
- show: boolean                // Dropdown abierto/cerrado
- unreadCount: number
- loading: boolean
```

**Tipos de notificaciones:**
- `like`: Alguien dio like a tu publicación
- `comentario`: Alguien comentó tu publicación
- `seguidor`: Alguien te siguió
- `mensaje`: Nuevo mensaje
- `evento`: Invitación a evento

**Funcionalidades:**
- Listar notificaciones
- Marcar como leída
- Marcar todas como leídas
- Eliminar notificación
- Navegación al hacer click
- Actualización en tiempo real

**Estructura:**
```jsx
<Dropdown show={show} onToggle={setShow}>
  <Dropdown.Toggle variant="link">
    <FaBell />
    {unreadCount > 0 && (
      <span className="notification-badge">{unreadCount}</span>
    )}
  </Dropdown.Toggle>
  
  <Dropdown.Menu className="notification-menu">
    <div className="notification-header">
      <h5>Notificaciones</h5>
      <Button variant="link" onClick={handleMarkAllRead}>
        Marcar todas como leídas
      </Button>
    </div>
    
    <div className="notification-list">
      {notificaciones.map(notif => (
        <div
          key={notif.id}
          className={`notification-item ${!notif.leida ? 'unread' : ''}`}
          onClick={() => handleNotificationClick(notif)}
        >
          <img src={notif.origenFoto} className="notification-avatar" />
          <div className="notification-content">
            <p>{notif.mensaje}</p>
            <span className="notification-time">
              {getTimeAgo(notif.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
    
    <div className="notification-footer">
      <Link to="/notifications">Ver todas</Link>
    </div>
  </Dropdown.Menu>
</Dropdown>
```

**Código de navegación:**
```javascript
const handleNotificationClick = async (notif) => {
  // Marcar como leída
  await updateDoc(doc(db, 'notificaciones', notif.id), {
    leida: true
  });
  
  // Navegar según tipo
  switch (notif.tipo) {
    case 'like':
    case 'comentario':
      navigate(`/publicaciones/${notif.publicacionId}`);
      break;
    case 'seguidor':
      navigate(`/profile/${notif.origenUid}`);
      break;
    case 'mensaje':
      openChat(notif.origenUid);
      break;
    case 'evento':
      navigate(`/eventos/${notif.eventoId}`);
      break;
  }
  
  setShow(false);
};
```

---

## 7. Componentes de Estadísticas

### EstadisticasAvanzadas.jsx

**Ubicación:** `src/components/EstadisticasAvanzadas.jsx`

**Propósito:** Dashboard completo de estadísticas.

**Props:**
```typescript
{
  userId?: string              // Si no se pasa, usa currentUser
}
```

**Estado:**
```javascript
- stats: {
    publicaciones: number,
    eventos: number,
    seguidores: number,
    siguiendo: number,
    likes: number,
    comentarios: number
  }
- chartData: ChartData
- loading: boolean
- periodo: '7d' | '30d' | '90d' | 'all'
```

**Funcionalidades:**
- Métricas generales
- Gráficos de actividad
- Tabla de publicaciones más populares
- Filtro por período
- Exportar datos (CSV)

**Estructura:**
```jsx
<div className="estadisticas-container">
  <div className="estadisticas-header">
    <h2>Estadísticas</h2>
    <Select
      value={periodo}
      onChange={setPeriodo}
      options={[
        { value: '7d', label: 'Últimos 7 días' },
        { value: '30d', label: 'Últimos 30 días' },
        { value: '90d', label: 'Últimos 90 días' },
        { value: 'all', label: 'Todo el tiempo' }
      ]}
    />
  </div>
  
  <div className="estadisticas-cards">
    <EstadisticasCard
      title="Publicaciones"
      value={stats.publicaciones}
      icon={<FaFileAlt />}
    />
    <EstadisticasCard
      title="Seguidores"
      value={stats.seguidores}
      icon={<FaUsers />}
    />
    <EstadisticasCard
      title="Likes"
      value={stats.likes}
      icon={<FaHeart />}
    />
    <EstadisticasCard
      title="Comentarios"
      value={stats.comentarios}
      icon={<FaComment />}
    />
  </div>
  
  <div className="estadisticas-charts">
    <GraficoBarras
      data={chartData}
      title="Actividad por día"
    />
  </div>
  
  <div className="estadisticas-table">
    <TablaEstadisticas
      data={topPublicaciones}
      title="Publicaciones más populares"
    />
  </div>
</div>
```

---

### EstadisticasCard.jsx

**Ubicación:** `src/components/Estadisticas/EstadisticasCard.jsx`

**Props:**
```typescript
{
  title: string
  value: number
  icon: ReactNode
  trend?: {
    value: number,
    direction: 'up' | 'down'
  }
}
```

**Estructura:**
```jsx
<div className="estadistica-card">
  <div className="card-icon">{icon}</div>
  <div className="card-content">
    <h3>{title}</h3>
    <div className="card-value">{value}</div>
    {trend && (
      <div className={`card-trend ${trend.direction}`}>
        {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
      </div>
    )}
  </div>
</div>
```

---

### GraficoBarras.jsx

**Ubicación:** `src/components/Estadisticas/GraficoBarras.jsx`

**Props:**
```typescript
{
  data: {
    labels: string[],
    datasets: {
      label: string,
      data: number[],
      backgroundColor: string
    }[]
  }
  title: string
}
```

**Implementación:**
```javascript
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GraficoBarras = ({ data, title }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: title
      }
    }
  };
  
  return <Bar options={options} data={data} />;
};
```

---

## 8. Componentes de Formularios

### HorariosField.jsx

**Ubicación:** `src/components/HorariosField.jsx`

**Propósito:** Campo de formulario para seleccionar horarios.

**Props:**
```typescript
{
  value: {
    dia: string,
    horaInicio: string,
    horaFin: string
  }[]
  onChange: (horarios) => void
}
```

**Funcionalidades:**
- Agregar múltiples horarios
- Eliminar horario
- Validación de rangos

**Estructura:**
```jsx
<div className="horarios-field">
  {value.map((horario, index) => (
    <div key={index} className="horario-item">
      <Form.Select
        value={horario.dia}
        onChange={(e) => handleChange(index, 'dia', e.target.value)}
      >
        <option value="lunes">Lunes</option>
        <option value="martes">Martes</option>
        {/* ... */}
      </Form.Select>
      
      <Form.Control
        type="time"
        value={horario.horaInicio}
        onChange={(e) => handleChange(index, 'horaInicio', e.target.value)}
      />
      
      <Form.Control
        type="time"
        value={horario.horaFin}
        onChange={(e) => handleChange(index, 'horaFin', e.target.value)}
      />
      
      <Button
        variant="danger"
        size="sm"
        onClick={() => handleRemove(index)}
      >
        Eliminar
      </Button>
    </div>
  ))}
  
  <Button variant="outline-primary" onClick={handleAdd}>
    + Agregar horario
  </Button>
</div>
```

---

### DateRangePicker.jsx

**Ubicación:** `src/components/DateRangePicker.jsx`

**Propósito:** Selector de rango de fechas.

**Props:**
```typescript
{
  startDate: Date
  endDate: Date
  onChange: (start: Date, end: Date) => void
  minDate?: Date
  maxDate?: Date
}
```

**Implementación:**
```javascript
import Calendar from 'react-calendar';

const DateRangePicker = ({ startDate, endDate, onChange, minDate, maxDate }) => {
  const handleChange = (value) => {
    if (Array.isArray(value)) {
      onChange(value[0], value[1]);
    }
  };
  
  return (
    <Calendar
      selectRange
      value={[startDate, endDate]}
      onChange={handleChange}
      minDate={minDate}
      maxDate={maxDate}
      locale="es-ES"
    />
  );
};
```

---

### ImageCropModal.jsx

**Ubicación:** `src/components/ImageCropModal.jsx`

**Propósito:** Modal para recortar imágenes.

**Props:**
```typescript
{
  show: boolean
  onHide: () => void
  image: string                // URL de la imagen
  onCrop: (croppedImage: Blob) => void
  aspect?: number              // Ratio de aspecto (ej: 1 para cuadrado)
}
```

**Funcionalidades:**
- Recortar imagen
- Zoom
- Rotar
- Preview en tiempo real

**Implementación:**
```javascript
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const ImageCropModal = ({ show, onHide, image, onCrop, aspect = 1 }) => {
  const [crop, setCrop] = useState({
    unit: '%',
    width: 90,
    aspect
  });
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  
  const handleCropComplete = async () => {
    if (!completedCrop || !imgRef.current) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
    const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      imgRef.current,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    
    canvas.toBlob((blob) => {
      onCrop(blob);
      onHide();
    }, 'image/jpeg', 0.95);
  };
  
  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Recortar imagen</Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
        <ReactCrop
          crop={crop}
          onChange={setCrop}
          onComplete={setCompletedCrop}
          aspect={aspect}
        >
          <img ref={imgRef} src={image} alt="Crop" />
        </ReactCrop>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancelar
        </Button>
        <Button variant="primary" onClick={handleCropComplete}>
          Recortar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
```

---

## 9. Componentes de UI

### Toast.jsx

**Ubicación:** `src/components/Toast.jsx`

**Propósito:** Notificaciones temporales tipo toast.

**Hook personalizado:**
```javascript
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };
  
  const ToastContainer = () => (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
  
  return { showToast, ToastContainer };
};
```

**Uso:**
```javascript
const { showToast, ToastContainer } = useToast();

// Mostrar toast
showToast('Perfil actualizado correctamente', 'success');
showToast('Error al guardar', 'error');

// Renderizar
return (
  <>
    <ToastContainer />
    {/* resto del componente */}
  </>
);
```

---

### ErrorBoundary.jsx

**Ubicación:** `src/components/ErrorBoundary.jsx`

**Propósito:** Capturar errores de React y mostrar UI de fallback.

**Implementación:**
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error capturado:', error, errorInfo);
    // Enviar a servicio de logging
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Algo salió mal</h1>
          <p>Lo sentimos, ha ocurrido un error inesperado.</p>
          <Button onClick={() => window.location.reload()}>
            Recargar página
          </Button>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

**Uso:**
```jsx
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

### UpgradePremiumModal.jsx

**Ubicación:** `src/components/UpgradePremiumModal.jsx`

**Propósito:** Modal para upgrade a premium.

**Props:**
```typescript
{
  show: boolean
  onHide: () => void
  feature?: string             // Funcionalidad que requiere premium
}
```

**Estructura:**
```jsx
<Modal show={show} onHide={onHide} centered>
  <Modal.Header closeButton>
    <Modal.Title>Actualiza a Premium</Modal.Title>
  </Modal.Header>
  
  <Modal.Body>
    <div className="premium-features">
      <h4>Funcionalidades Premium:</h4>
      <ul>
        <li>✓ Publicaciones ilimitadas</li>
        <li>✓ Eventos ilimitados</li>
        <li>✓ Productos ilimitados en MusicMarket</li>
        <li>✓ Estadísticas avanzadas</li>
        <li>✓ Sin anuncios</li>
        <li>✓ Badge de verificado</li>
      </ul>
    </div>
    
    <div className="premium-pricing">
      <h3>$9.99/mes</h3>
      <p>Cancela cuando quieras</p>
    </div>
  </Modal.Body>
  
  <Modal.Footer>
    <Button variant="secondary" onClick={onHide}>
      Ahora no
    </Button>
    <Button variant="primary" onClick={handleUpgrade}>
      Actualizar a Premium
    </Button>
  </Modal.Footer>
</Modal>
```

---

**Versión:** 1.0.0  
**Última actualización:** Febrero 2026
