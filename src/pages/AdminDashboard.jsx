import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Badge, Tabs, Tab } from 'react-bootstrap';
import { FaUsers, FaFileAlt, FaCalendar, FaShoppingBag, FaTrash, FaBan, FaCheck, FaChartLine, FaKey } from 'react-icons/fa';
import { db, auth } from '../services/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy, limit, getDoc } from 'firebase/firestore';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import './AdminDashboard.css';

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
  
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const currentUser = auth.currentUser;

  useEffect(() => {
    checkAdminAccess();
    fetchAllData();
  }, []);

  const checkAdminAccess = () => {
    if (!currentUser || currentUser.email !== 'estebanber24@gmail.com') {
      showToast('Acceso denegado. Solo administradores pueden acceder.', 'error');
      navigate('/');
    }
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

  const handleBanUser = async (userId, userName, currentBanStatus) => {
    const action = currentBanStatus ? 'desbanear' : 'banear';
    if (window.confirm(`¿Estás seguro de ${action} al usuario "${userName}"?`)) {
      try {
        await updateDoc(doc(db, 'perfiles', userId), {
          banned: !currentBanStatus,
          bannedAt: !currentBanStatus ? new Date().toISOString() : null
        });
        setUsers(users.map(u => 
          u.id === userId 
            ? { ...u, banned: !currentBanStatus, bannedAt: !currentBanStatus ? new Date().toISOString() : null }
            : u
        ));
        showToast(`Usuario ${action}do exitosamente`, 'success');
      } catch (error) {
        console.error('Error banning/unbanning user:', error);
        showToast(`Error al ${action} el usuario`, 'error');
      }
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

  if (loading) {
    return (
      <Container className="admin-dashboard mt-5">
        <div className="text-center">
          <h3>Cargando panel de administrador...</h3>
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
                      <th>Estado</th>
                      <th>Fecha Registro</th>
                      <th>Ciudad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id} style={{ backgroundColor: user.banned ? '#ffe6e6' : 'transparent' }}>
                        <td>{user.nombre || 'N/A'}</td>
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
                          {user.banned ? (
                            <Badge bg="danger">Baneado</Badge>
                          ) : (
                            <Badge bg="success">Activo</Badge>
                          )}
                        </td>
                        <td>{formatDate(user.fechaRegistro)}</td>
                        <td>
                          {typeof user.ciudad === 'object' ? user.ciudad?.label || user.ciudad?.value || 'N/A' : user.ciudad || 'N/A'}
                        </td>
                        <td>
                          <div className="d-flex gap-2">
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
                        <td>{post.reacciones?.length || 0}</td>
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
                        <td>{product.vendedorNombre || 'N/A'}</td>
                        <td>${product.precio?.toLocaleString()}</td>
                        <td><Badge bg="success">{product.estado}</Badge></td>
                        <td>{product.ubicacion}</td>
                        <td>⭐ {product.rating || 0} ({product.resenas || 0})</td>
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
    </Container>
  );
};

export default AdminDashboard;
