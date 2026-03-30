import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Tabs, Tab, Spinner, Alert } from 'react-bootstrap';
import { FaUsers, FaFileAlt, FaCalendar, FaShoppingBag, FaTrash, FaBan, FaCheck, FaChartLine, FaKey, FaQrcode, FaDownload, FaShareAlt } from 'react-icons/fa';
import { QRCodeCanvas } from 'qrcode.react';
import { db, auth } from '../services/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, limit, getDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import colombiaAPI from '../services/colombiaAPI';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import './AdminDashboard.css';

// ─── Componente QR Code Section ───────────────────────────────────────────────
const SITE_URL = 'https://bandsociall.netlify.app';

const QRCodeSection = () => {
  const qrRef = useRef(null);
  const [qrSize, setQrSize] = useState(220);
  const [copied, setCopied] = useState(false);

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;

    // Crear canvas compuesto con el diseño de la tarjeta
    const compositeCanvas = document.createElement('canvas');
    const padding = 40;
    const labelHeight = 70;
    const cardW = qrSize + padding * 2;
    const cardH = qrSize + padding * 2 + labelHeight;
    compositeCanvas.width = cardW;
    compositeCanvas.height = cardH;

    const ctx = compositeCanvas.getContext('2d');

    // Fondo gradiente azul-negro
    const grad = ctx.createLinearGradient(0, 0, cardW, cardH);
    grad.addColorStop(0, '#0a0a1a');
    grad.addColorStop(0.5, '#1a1aff');
    grad.addColorStop(1, '#0033ff');
    ctx.fillStyle = grad;

    // Bordes redondeados
    const r = 20;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(cardW - r, 0);
    ctx.quadraticCurveTo(cardW, 0, cardW, r);
    ctx.lineTo(cardW, cardH - r);
    ctx.quadraticCurveTo(cardW, cardH, cardW - r, cardH);
    ctx.lineTo(r, cardH);
    ctx.quadraticCurveTo(0, cardH, 0, cardH - r);
    ctx.lineTo(0, r);
    ctx.quadraticCurveTo(0, 0, r, 0);
    ctx.closePath();
    ctx.fill();

    // QR blanco sobre fondo
    ctx.fillStyle = 'white';
    ctx.fillRect(padding - 8, padding - 8, qrSize + 16, qrSize + 16);
    ctx.drawImage(canvas, padding, padding, qrSize, qrSize);

    // Texto BandSocial centrado abajo
    ctx.fillStyle = 'white';
    ctx.font = 'bold 22px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BandSocial', cardW / 2, cardH - 22);

    const link = document.createElement('a');
    link.download = 'BandSocial-QR.png';
    link.href = compositeCanvas.toDataURL('image/png');
    link.click();
  };

  const copyLink = () => {
    navigator.clipboard.writeText(SITE_URL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="qr-section-wrapper">
      <div className="qr-intro" style={{textAlign: 'center'}}>
        <h4 className="qr-intro-title" style={{justifyContent: 'center'}}><FaQrcode className="me-2" />Código QR de BandSocial</h4>
        <p className="qr-intro-desc">
          Comparte la plataforma escaneando este código QR. Enlace directo a{' '}
          <a href={SITE_URL} target="_blank" rel="noreferrer" className="qr-link">{SITE_URL}</a>
        </p>
      </div>

      <div className="qr-content-center">
        {/* Tarjeta QR principal */}
        <div className="qr-card-outer" ref={qrRef}>
          <div className="qr-card-inner">
            <div className="qr-white-bg">
              <QRCodeCanvas
                value={SITE_URL}
                size={qrSize}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </div>
            <p className="qr-brand-label">BandSocial</p>
          </div>
        </div>

        {/* Panel de opciones */}
        <div className="qr-options-panel">
          <div className="qr-option-card">
            <h5 className="qr-option-title">Tamaño del QR</h5>
            <div className="qr-size-buttons">
              {[180, 220, 280].map(s => (
                <button
                  key={s}
                  className={`qr-size-btn ${qrSize === s ? 'active' : ''}`}
                  onClick={() => setQrSize(s)}
                >
                  {s === 180 ? 'S' : s === 220 ? 'M' : 'L'}
                  <span>{s}px</span>
                </button>
              ))}
            </div>
          </div>

          <div className="qr-option-card">
            <h5 className="qr-option-title">URL del sitio</h5>
            <div className="qr-url-display">
              <span className="qr-url-text">{SITE_URL}</span>
              <button className="qr-copy-btn" onClick={copyLink}>
                {copied ? '✓ Copiado' : 'Copiar'}
              </button>
            </div>
          </div>

          <div className="qr-action-buttons">
            <button className="qr-download-btn" onClick={downloadQR}>
              <FaDownload className="me-2" />
              Descargar PNG
            </button>
            <a
              href={SITE_URL}
              target="_blank"
              rel="noreferrer"
              className="qr-visit-btn"
            >
              <FaShareAlt className="me-2" />
              Visitar sitio
            </a>
          </div>

          <div className="qr-info-box">
            <p>💡 El código QR lleva directamente a la plataforma BandSocial. Ideal para imprimir en flyers, tarjetas o eventos.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
// ──────────────────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalEvents: 0,
    totalProducts: 0,
    premiumUsers: 0
  });
  
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);
  const [departamentosMap, setDepartamentosMap] = useState({});
  const [ciudadesMap, setCiudadesMap] = useState({});
  const [departamentosList, setDepartamentosList] = useState([]);
  const [ciudadesList, setCiudadesList] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editUserData, setEditUserData] = useState({
    departamento: '',
    ciudad: ''
  });
  
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const currentUser = auth.currentUser;

  useEffect(() => {
    checkAdminAccess();
    cargarDepartamentosYCiudades();
  }, []);

  useEffect(() => {
    if (!loadingLocations && Object.keys(departamentosMap).length > 0) {
      fetchAllData();
    }
  }, [loadingLocations, departamentosMap]);

  const cargarDepartamentosYCiudades = async () => {
    try {
      console.log('Cargando departamentos y ciudades desde API de Colombia...');
      
      const [departamentos, ciudades] = await Promise.all([
        colombiaAPI.getDepartamentos(),
        colombiaAPI.getAllCiudades()
      ]);

      console.log('API respondio:', departamentos?.length, 'departamentos,', ciudades?.length, 'ciudades');
      
      // Guardar listas completas para los selectores
      setDepartamentosList(departamentos);
      setCiudadesList(ciudades);
      
      // Crear mapas para conversión de IDs a nombres
      const deptMap = {};
      departamentos.forEach(dept => {
        deptMap[dept.id] = dept.name;
      });
      setDepartamentosMap(deptMap);

      const cityMap = {};
      ciudades.forEach(city => {
        cityMap[city.id] = city.name;
      });
      setCiudadesMap(cityMap);
      
      setLoadingLocations(false);
      console.log('Ubicaciones cargadas exitosamente desde API de Colombia');
    } catch (error) {
      console.error('Error al cargar desde API de Colombia:', error);
      setLoadingLocations(false);
      showToast('Error al cargar ubicaciones desde API de Colombia', 'error');
    }
  };

  const checkAdminAccess = () => {
    if (!currentUser || currentUser.email !== 'estebanber24@gmail.com') {
      showToast('Acceso denegado. Solo administradores pueden acceder.', 'error');
      navigate('/');
    }
  };

  const obtenerNombreDepartamento = (departamento) => {
    if (!departamento) return 'N/A';
    
    // Si es un objeto con label o value
    if (typeof departamento === 'object') {
      return departamento?.label || departamento?.value || 'N/A';
    }
    
    // Si es un número
    if (typeof departamento === 'number') {
      return departamentosMap[departamento] || 'N/A';
    }
    
    // Si es un string numérico
    if (typeof departamento === 'string' && !isNaN(departamento)) {
      const deptId = parseInt(departamento);
      return departamentosMap[deptId] || 'N/A';
    }
    
    // Si es un string no numérico, asumimos que ya es el nombre
    return departamento;
  };

  const obtenerNombreMunicipio = (municipio, ciudad) => {
    const valor = municipio || ciudad;
    if (!valor) return 'N/A';
    
    // Si es un objeto con label o value
    if (typeof valor === 'object') {
      return valor?.label || valor?.value || 'N/A';
    }
    
    // Si es un número
    if (typeof valor === 'number') {
      const nombre = ciudadesMap[valor];
      if (nombre) return nombre;
      console.warn(`Ciudad ID ${valor} no encontrada en mapa`);
      return 'N/A';
    }
    
    // Si es un string numérico
    if (typeof valor === 'string' && !isNaN(valor)) {
      const cityId = parseInt(valor);
      const nombre = ciudadesMap[cityId];
      if (nombre) return nombre;
      console.warn(`Ciudad ID ${cityId} no encontrada en mapa`);
      return 'N/A';
    }
    
    // Si es un string no numérico, asumimos que ya es el nombre
    return valor;
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      console.log('Iniciando carga de datos del panel de administrador...');
      
      // Obtener usuarios
      const usersSnap = await getDocs(collection(db, 'perfiles'));
      const usersData = usersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      console.log('Usuarios cargados:', usersData.length);
      
      const premiumCount = usersData.filter(u => u.planActual === 'premium').length;

      // Obtener publicaciones (sin ordenar si no tienen createdAt)
      let postsData = [];
      try {
        const postsSnap = await getDocs(collection(db, 'publicaciones'));
        postsData = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Publicaciones cargadas:', postsData.length);
      } catch (error) {
        console.error('Error cargando publicaciones:', error);
      }
      setPosts(postsData);

      // Obtener eventos
      let eventsData = [];
      try {
        const eventsSnap = await getDocs(collection(db, 'eventos'));
        eventsData = eventsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Eventos cargados:', eventsData.length);
      } catch (error) {
        console.error('Error cargando eventos:', error);
      }
      setEvents(eventsData);

      // Obtener productos
      let productsData = [];
      try {
        const productsSnap = await getDocs(collection(db, 'productos'));
        productsData = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log('Productos cargados:', productsData.length);
      } catch (error) {
        console.error('Error cargando productos:', error);
      }
      setProducts(productsData);

      setStats({
        totalUsers: usersData.length,
        totalPosts: postsData.length,
        totalEvents: eventsData.length,
        totalProducts: productsData.length,
        premiumUsers: premiumCount
      });
      
      console.log('Datos cargados exitosamente');
    } catch (error) {
      console.error('Error general al cargar datos:', error);
      showToast(`Error al cargar los datos: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('¿Estás seguro de eliminar esta publicación?')) {
      try {
        await deleteDoc(doc(db, 'publicaciones', postId));
        setPosts(posts.filter(p => p.id !== postId));
        setStats(prev => ({ ...prev, totalPosts: prev.totalPosts - 1 }));
        showToast('Publicación eliminada exitosamente', 'success');
      } catch (error) {
        console.error('Error deleting post:', error);
        showToast('Error al eliminar la publicación', 'error');
      }
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('¿Estás seguro de eliminar este evento?')) {
      try {
        await deleteDoc(doc(db, 'eventos', eventId));
        setEvents(events.filter(e => e.id !== eventId));
        setStats(prev => ({ ...prev, totalEvents: prev.totalEvents - 1 }));
        showToast('Evento eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error deleting event:', error);
        showToast('Error al eliminar el evento', 'error');
      }
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`¿Estás seguro de eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`)) {
      try {
        await deleteDoc(doc(db, 'perfiles', userId));
        setUsers(users.filter(u => u.id !== userId));
        setStats(prev => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
        showToast('Usuario eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error deleting user:', error);
        showToast('Error al eliminar el usuario', 'error');
      }
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await deleteDoc(doc(db, 'productos', productId));
        setProducts(products.filter(p => p.id !== productId));
        setStats(prev => ({ ...prev, totalProducts: prev.totalProducts - 1 }));
        showToast('Producto eliminado exitosamente', 'success');
      } catch (error) {
        console.error('Error deleting product:', error);
        showToast('Error al eliminar el producto', 'error');
      }
    }
  };

  const handleBanUser = async (userId, userName, isBanned) => {
    const action = isBanned ? 'desbanear' : 'banear';
    if (window.confirm(`¿Estás seguro de ${action} a "${userName}"?`)) {
      try {
        await updateDoc(doc(db, 'perfiles', userId), {
          banned: !isBanned
        });
        setUsers(users.map(u => u.id === userId ? { ...u, banned: !isBanned } : u));
        showToast(`Usuario ${action}do exitosamente`, 'success');
      } catch (error) {
        console.error(`Error al ${action} usuario:`, error);
        showToast(`Error al ${action} usuario`, 'error');
      }
    }
  };

  const handleOpenEditUser = (user) => {
    setEditingUser(user);
    setEditUserData({
      departamento: user.departamento || '',
      ciudad: user.ciudad || user.municipio || ''
    });
    setShowEditUserModal(true);
  };

  const handleUpdateUserLocation = async () => {
    if (!editingUser) return;

    try {
      await updateDoc(doc(db, 'perfiles', editingUser.id), {
        departamento: editUserData.departamento,
        ciudad: editUserData.ciudad,
        municipio: editUserData.ciudad,
        updatedAt: new Date()
      });

      setUsers(users.map(u => 
        u.id === editingUser.id 
          ? { ...u, departamento: editUserData.departamento, ciudad: editUserData.ciudad, municipio: editUserData.ciudad }
          : u
      ));

      showToast('Ubicación actualizada exitosamente', 'success');
      setShowEditUserModal(false);
      setEditingUser(null);
    } catch (error) {
      console.error('Error al actualizar ubicación:', error);
      showToast('Error al actualizar ubicación', 'error');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToast('Las contraseñas no coinciden', 'warning');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'warning');
      return;
    }

    setChangingPassword(true);
    try {
      // Reautenticar usuario
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        passwordData.currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Cambiar contraseña
      await updatePassword(currentUser, passwordData.newPassword);
      
      showToast('Contraseña actualizada exitosamente', 'success');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        showToast('Contraseña actual incorrecta', 'error');
      } else {
        showToast('Error al cambiar la contraseña', 'error');
      }
    } finally {
      setChangingPassword(false);
    }
  };


  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const calcularTiempoEnPlataforma = (tiempoUsoTotal) => {
    if (!tiempoUsoTotal || tiempoUsoTotal === 0) return '0m';
    
    // tiempoUsoTotal está en minutos
    const totalMinutos = tiempoUsoTotal;
    
    const dias = Math.floor(totalMinutos / (60 * 24));
    const horas = Math.floor((totalMinutos % (60 * 24)) / 60);
    const minutos = Math.floor(totalMinutos % 60);
    
    if (dias > 0) {
      return `${dias}d ${horas}h`;
    } else if (horas > 0) {
      return `${horas}h ${minutos}m`;
    } else {
      return `${minutos}m`;
    }
  };

  if (loading || loadingLocations) {
    return (
      <Container className="admin-dashboard mt-5">
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <h3 className="mt-3">
            {loadingLocations ? 'Cargando ubicaciones desde API de Colombia...' : 'Cargando datos del panel...'}
          </h3>
          {loadingLocations && (
            <p className="text-muted">
              Obteniendo nombres de departamentos y ciudades...
            </p>
          )}
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="admin-dashboard">
      <ToastContainer />
      
      <div className="admin-header">
        <h1 className="admin-title">
          <FaChartLine className="me-2" />
          Panel de Administrador
        </h1>
        <div className="admin-actions">
          <Button 
            variant="outline-primary" 
            onClick={() => setShowPasswordModal(true)}
            className="me-2"
          >
            <FaKey className="me-1" />
            Cambiar Contraseña
          </Button>
          <Button variant="outline-danger" onClick={() => navigate('/')}>
            Volver al Inicio
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card stat-users">
            <Card.Body>
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-info">
                <h3>{stats.totalUsers}</h3>
                <p>Usuarios Totales</p>
                <small className="text-muted">{stats.premiumUsers} Premium</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-posts">
            <Card.Body>
              <div className="stat-icon">
                <FaFileAlt />
              </div>
              <div className="stat-info">
                <h3>{stats.totalPosts}</h3>
                <p>Publicaciones</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-events">
            <Card.Body>
              <div className="stat-icon">
                <FaCalendar />
              </div>
              <div className="stat-info">
                <h3>{stats.totalEvents}</h3>
                <p>Eventos</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-products">
            <Card.Body>
              <div className="stat-icon">
                <FaShoppingBag />
              </div>
              <div className="stat-info">
                <h3>{stats.totalProducts}</h3>
                <p>Productos</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabs de gestión */}
      <Card className="admin-content-card">
        <Card.Body>
          <Tabs defaultActiveKey="users" className="mb-3">
            {/* Tab Usuarios */}
            <Tab eventKey="users" title={`Usuarios (${users.length})`}>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Email</th>
                      <th>Tipo</th>
                      <th>Plan</th>
                      <th>Tiempo en la Página</th>
                      <th>Fecha Registro</th>
                      <th>Departamento</th>
                      <th>Municipio</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} style={{ backgroundColor: user.banned ? '#ffe6e6' : 'transparent' }}>
                        <td>{user.nombre || user.nombreCompleto || user.displayName || <span style={{color:'#9ca3af',fontStyle:'italic'}}>Sin nombre</span>}</td>
                        <td>{user.email}</td>
                        <td>
                          <Badge bg="info">
                            {typeof user.type === 'object' ? user.type?.label || user.type?.value || 'N/A' : user.type || 'N/A'}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg={user.planActual === 'premium' ? 'warning' : 'secondary'}>
                            {user.planActual || 'free'}
                          </Badge>
                        </td>
                        <td>
                          <Badge bg="info">
                            {calcularTiempoEnPlataforma(user.tiempoUsoTotal || 0)}
                          </Badge>
                        </td>
                        <td>{formatDate(user.fechaRegistro || user.createdAt)}</td>
                        <td>{obtenerNombreDepartamento(user.departamento)}</td>
                        <td>{obtenerNombreMunicipio(user.municipio, user.ciudad)}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenEditUser(user)}
                              title="Editar ubicación"
                            >
                              <FaCheck />
                            </Button>
                            <Button 
                              variant={user.banned ? 'success' : 'warning'}
                              size="sm"
                              onClick={() => handleBanUser(user.id, user.nombre || user.email, user.banned)}
                              title={user.banned ? 'Desbanear usuario' : 'Banear usuario'}
                            >
                              <FaBan />
                            </Button>
                            <Button 
                              variant="danger" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id, user.nombre || user.email)}
                              title="Eliminar usuario"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>

            {/* Tab Publicaciones */}
            <Tab eventKey="posts" title={`Publicaciones (${posts.length})`}>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Autor</th>
                      <th>Tipo</th>
                      <th>Fecha</th>
                      <th>Reacciones</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {posts.map(post => (
                      <tr key={post.id}>
                        <td>{post.titulo || post.descripcion?.substring(0, 50) || 'Sin título'}</td>
                        <td>{post.autorNombre || 'N/A'}</td>
                        <td><Badge bg="primary">{post.tipo || 'general'}</Badge></td>
                        <td>{formatDate(post.createdAt)}</td>
                        <td>{post.reacciones ? Object.values(post.reacciones).reduce((acc, arr) => acc + (Array.isArray(arr) ? arr.length : 0), 0) : 0}</td>
                        <td>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>

            {/* Tab Eventos */}
            <Tab eventKey="events" title={`Eventos (${events.length})`}>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Organizador</th>
                      <th>Fecha Evento</th>
                      <th>Departamento</th>
                      <th>Ciudad</th>
                      <th>Asistentes</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map(event => (
                      <tr key={event.id}>
                        <td>{event.titulo}</td>
                        <td>{event.creadorNombre || 'N/A'}</td>
                        <td>{event.fecha}</td>
                        <td>{obtenerNombreDepartamento(event.departamento)}</td>
                        <td>{event.ciudad || 'N/A'}</td>
                        <td>{event.asistentes?.length || 0}</td>
                        <td>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteEvent(event.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>

            {/* Tab Productos */}
            <Tab eventKey="products" title={`Productos (${products.length})`}>
              <div className="table-responsive">
                <Table striped hover>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      <th>Vendedor</th>
                      <th>Precio</th>
                      <th>Estado</th>
                      <th>Ubicación</th>
                      <th>Valoración</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>{product.nombre}</td>
                        <td>
                          <Badge bg="info">
                            {product.categoria || product.tipo || 'N/A'}
                          </Badge>
                        </td>
                        <td>{product.vendedorNombre || 'N/A'}</td>
                        <td>${product.precio?.toLocaleString()}</td>
                        <td><Badge bg="success">{product.estado}</Badge></td>
                        <td>{product.ubicacion}</td>
                        <td>{product.rating || 0}/5 ({product.resenas || 0} reseñas)</td>
                        <td>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <FaTrash />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Tab>

            {/* Tab Analítica */}
            <Tab eventKey="analytics" title="Analítica">
              <AnalyticsDashboard 
                users={users}
                publications={posts}
                events={events}
                products={products}
              />
            </Tab>

            {/* Tab QR Code */}
            <Tab eventKey="qrcode" title={<span><FaQrcode className="me-1" />Código QR</span>}>
              <QRCodeSection />
            </Tab>

          </Tabs>
        </Card.Body>
      </Card>

      {/* Modal Cambiar Contraseña */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Contraseña de Administrador</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleChangePassword}>
            <Form.Group className="mb-3">
              <Form.Label>Contraseña Actual</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                required
                placeholder="Ingresa tu contraseña actual"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Confirmar Nueva Contraseña</Form.Label>
              <Form.Control
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                required
                placeholder="Confirma la nueva contraseña"
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit" disabled={changingPassword}>
                {changingPassword ? 'Cambiando...' : 'Cambiar Contraseña'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal de Edición de Ubicación */}
      <Modal show={showEditUserModal} onHide={() => setShowEditUserModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Editar Ubicación de Usuario</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingUser && (
            <>
              <p><strong>Usuario:</strong> {editingUser.nombre || editingUser.email}</p>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Departamento</Form.Label>
                  <Form.Select
                    value={editUserData.departamento}
                    onChange={(e) => setEditUserData({ ...editUserData, departamento: e.target.value })}
                  >
                    <option value="">Seleccionar departamento...</option>
                    {departamentosList.map(dept => (
                      <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Ciudad</Form.Label>
                  <Form.Select
                    value={editUserData.ciudad}
                    onChange={(e) => setEditUserData({ ...editUserData, ciudad: e.target.value })}
                  >
                    <option value="">Seleccionar ciudad...</option>
                    {ciudadesList
                      .filter(city => !editUserData.departamento || city.departmentId === parseInt(editUserData.departamento))
                      .map(city => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                  </Form.Select>
                  {editUserData.departamento && (
                    <Form.Text className="text-muted">
                      Mostrando ciudades del departamento seleccionado
                    </Form.Text>
                  )}
                </Form.Group>
              </Form>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditUserModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleUpdateUserLocation}>
            Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminDashboard;
