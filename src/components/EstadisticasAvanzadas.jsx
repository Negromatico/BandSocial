import React, { useState, useEffect } from 'react';
import { Tabs, Tab, Form, Card, Row, Col, Spinner, Badge } from 'react-bootstrap';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Doughnut, Bar } from 'react-chartjs-2';
import estadisticasAvanzadas from '../services/estadisticasAvanzadas';
import { FaUsers, FaFileAlt, FaCalendarAlt, FaShoppingBag, FaClock, FaUserPlus, FaSignInAlt } from 'react-icons/fa';
import './EstadisticasAvanzadas.css';

// Registrar componentes de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const EstadisticasAvanzadas = () => {
  const [periodo, setPeriodo] = useState('mes');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');
  
  // Estados para cada categoría
  const [statsUsuarios, setStatsUsuarios] = useState(null);
  const [statsPublicaciones, setStatsPublicaciones] = useState(null);
  const [statsEventos, setStatsEventos] = useState(null);
  const [statsProductos, setStatsProductos] = useState(null);
  const [statsSesiones, setStatsSesiones] = useState(null);

  useEffect(() => {
    cargarEstadisticas();
  }, [periodo]);

  const cargarEstadisticas = async () => {
    setLoading(true);
    try {
      const [usuarios, publicaciones, eventos, productos, sesiones] = await Promise.all([
        estadisticasAvanzadas.getEstadisticasUsuarios(periodo),
        estadisticasAvanzadas.getEstadisticasPublicaciones(periodo),
        estadisticasAvanzadas.getEstadisticasEventos(periodo),
        estadisticasAvanzadas.getEstadisticasProductos(periodo),
        estadisticasAvanzadas.getEstadisticasSesiones(periodo)
      ]);
      
      setStatsUsuarios(usuarios);
      setStatsPublicaciones(publicaciones);
      setStatsEventos(eventos);
      setStatsProductos(productos);
      setStatsSesiones(sesiones);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChartColors = (count) => {
    const colors = [
      '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316',
      '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4',
      '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'
    ];
    return colors.slice(0, count);
  };

  const crearDatasetPie = (datos, label) => {
    const labels = Object.keys(datos);
    const values = Object.values(datos);
    
    return {
      labels,
      datasets: [{
        label,
        data: values,
        backgroundColor: getChartColors(labels.length),
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Cargando estadísticas avanzadas...</p>
      </div>
    );
  }

  return (
    <div className="estadisticas-avanzadas">
      {/* Filtro de Período */}
      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6}>
              <h4 className="mb-0">Estadísticas Avanzadas</h4>
              <small className="text-muted">Análisis detallado con gráficos circulares</small>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-0">
                <Form.Label className="fw-bold">Período de análisis:</Form.Label>
                <Form.Select 
                  value={periodo} 
                  onChange={(e) => setPeriodo(e.target.value)}
                  className="form-select-lg"
                >
                  <option value="dia">Últimas 24 horas</option>
                  <option value="semana">Última semana</option>
                  <option value="mes">Último mes</option>
                  <option value="año">Último año</option>
                  <option value="todo">Todo el tiempo</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tarjetas de Resumen Rápido */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card stat-card-users">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Usuarios</h6>
                  <h2 className="mb-0">{statsUsuarios?.total || 0}</h2>
                  <small style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    <FaUserPlus /> {statsSesiones?.nuevosRegistros || 0} nuevos
                  </small>
                </div>
                <FaUsers size={40} className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-card-posts">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Publicaciones</h6>
                  <h2 className="mb-0">{statsPublicaciones?.total || 0}</h2>
                  <small style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {statsPublicaciones?.totalReacciones || 0} reacciones
                  </small>
                </div>
                <FaFileAlt size={40} className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-card-events">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Eventos</h6>
                  <h2 className="mb-0">{statsEventos?.total || 0}</h2>
                  <small style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    {statsEventos?.totalAsistentes || 0} asistentes
                  </small>
                </div>
                <FaCalendarAlt size={40} className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card stat-card-products">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted mb-1">Productos</h6>
                  <h2 className="mb-0">{statsProductos?.total || 0}</h2>
                  <small style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    ${statsProductos?.precioPromedio || 0} promedio
                  </small>
                </div>
                <FaShoppingBag size={40} className="stat-icon" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Pestañas de Estadísticas Detalladas */}
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        
        {/* PESTAÑA: RESUMEN */}
        <Tab eventKey="resumen" title="Resumen">
          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Usuarios por Tipo</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsUsuarios && Object.keys(statsUsuarios.porTipo).length > 0 ? (
                    <Pie data={crearDatasetPie(statsUsuarios.porTipo, 'Usuarios')} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No hay datos disponibles</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">Publicaciones por Tipo</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsPublicaciones && Object.keys(statsPublicaciones.porTipo).length > 0 ? (
                    <Doughnut data={crearDatasetPie(statsPublicaciones.porTipo, 'Publicaciones')} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No hay datos disponibles</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-warning text-white">
                  <h5 className="mb-0">Eventos por Tipo</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsEventos && Object.keys(statsEventos.porTipo).length > 0 ? (
                    <Pie data={crearDatasetPie(statsEventos.porTipo, 'Eventos')} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No hay datos disponibles</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-danger text-white">
                  <h5 className="mb-0">Productos por Categoría</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsProductos && Object.keys(statsProductos.porCategoria).length > 0 ? (
                    <Doughnut data={crearDatasetPie(statsProductos.porCategoria, 'Productos')} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No hay datos disponibles</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* PESTAÑA: USUARIOS */}
        <Tab eventKey="usuarios" title="Usuarios">
          <Row>
            <Col md={4} className="mb-4">
              <Card>
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Por Tipo</h5>
                </Card.Header>
                <Card.Body style={{ height: '300px' }}>
                  {statsUsuarios && Object.keys(statsUsuarios.porTipo).length > 0 ? (
                    <Pie data={crearDatasetPie(statsUsuarios.porTipo, 'Usuarios')} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card>
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">Por Plan</h5>
                </Card.Header>
                <Card.Body style={{ height: '300px' }}>
                  {statsUsuarios && (
                    <Doughnut 
                      data={crearDatasetPie(statsUsuarios.porPlan, 'Usuarios')} 
                      options={chartOptions} 
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card>
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">Actividad</h5>
                </Card.Header>
                <Card.Body style={{ height: '300px' }}>
                  {statsUsuarios && (
                    <Pie 
                      data={crearDatasetPie({
                        'Activos': statsUsuarios.activos,
                        'Inactivos': statsUsuarios.inactivos
                      }, 'Usuarios')} 
                      options={chartOptions} 
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-purple text-white">
                  <h5 className="mb-0">Por Departamento (Top 10)</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsUsuarios && Object.keys(statsUsuarios.porDepartamento).length > 0 ? (
                    <Doughnut 
                      data={crearDatasetPie(
                        Object.fromEntries(
                          Object.entries(statsUsuarios.porDepartamento)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 10)
                        ), 
                        'Usuarios'
                      )} 
                      options={chartOptions} 
                    />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-secondary text-white">
                  <h5 className="mb-0">Por Género Musical (Top 10)</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsUsuarios && Object.keys(statsUsuarios.porGeneroMusical).length > 0 ? (
                    <Pie 
                      data={crearDatasetPie(
                        Object.fromEntries(
                          Object.entries(statsUsuarios.porGeneroMusical)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 10)
                        ), 
                        'Usuarios'
                      )} 
                      options={chartOptions} 
                    />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Métricas adicionales */}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header className="bg-dark text-white">
                  <h5 className="mb-0">Métricas Clave</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3} className="text-center">
                      <h3 className="text-primary">{statsUsuarios?.total || 0}</h3>
                      <p className="text-muted">Total Usuarios</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-success">{statsUsuarios?.activos || 0}</h3>
                      <p className="text-muted">Usuarios Activos</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-warning">{statsUsuarios?.porPlan?.premium || 0}</h3>
                      <p className="text-muted">Usuarios Premium</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-info">{statsSesiones?.nuevosRegistros || 0}</h3>
                      <p className="text-muted">Nuevos Registros</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* PESTAÑA: PUBLICACIONES */}
        <Tab eventKey="publicaciones" title="Publicaciones">
          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">Por Tipo</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsPublicaciones && Object.keys(statsPublicaciones.porTipo).length > 0 ? (
                    <Doughnut data={crearDatasetPie(statsPublicaciones.porTipo, 'Publicaciones')} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">Con/Sin Imágenes</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsPublicaciones && (
                    <Pie 
                      data={crearDatasetPie({
                        'Con Imágenes': statsPublicaciones.conImagenes,
                        'Sin Imágenes': statsPublicaciones.sinImagenes
                      }, 'Publicaciones')} 
                      options={chartOptions} 
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={12} className="mb-4">
              <Card>
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Por Ciudad (Top 10)</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsPublicaciones && Object.keys(statsPublicaciones.porCiudad).length > 0 ? (
                    <Doughnut 
                      data={crearDatasetPie(
                        Object.fromEntries(
                          Object.entries(statsPublicaciones.porCiudad)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 10)
                        ), 
                        'Publicaciones'
                      )} 
                      options={chartOptions} 
                    />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Métricas */}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header className="bg-dark text-white">
                  <h5 className="mb-0">Métricas de Engagement</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3} className="text-center">
                      <h3 className="text-primary">{statsPublicaciones?.total || 0}</h3>
                      <p className="text-muted">Total Publicaciones</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-success">{statsPublicaciones?.totalReacciones || 0}</h3>
                      <p className="text-muted">Total Reacciones</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-warning">{statsPublicaciones?.totalComentarios || 0}</h3>
                      <p className="text-muted">Total Comentarios</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-info">{statsPublicaciones?.promedioReaccionesPorPublicacion || 0}</h3>
                      <p className="text-muted">Promedio Reacciones</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* PESTAÑA: EVENTOS */}
        <Tab eventKey="eventos" title="Eventos">
          <Row>
            <Col md={4} className="mb-4">
              <Card>
                <Card.Header className="bg-warning text-white">
                  <h5 className="mb-0">Por Tipo</h5>
                </Card.Header>
                <Card.Body style={{ height: '300px' }}>
                  {statsEventos && Object.keys(statsEventos.porTipo).length > 0 ? (
                    <Pie data={crearDatasetPie(statsEventos.porTipo, 'Eventos')} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card>
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">Gratuitos vs Pagos</h5>
                </Card.Header>
                <Card.Body style={{ height: '300px' }}>
                  {statsEventos && (
                    <Doughnut 
                      data={crearDatasetPie({
                        'Gratuitos': statsEventos.gratuitos,
                        'Pagos': statsEventos.pagos
                      }, 'Eventos')} 
                      options={chartOptions} 
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Por Ciudad (Top 10)</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsEventos && Object.keys(statsEventos.porCiudad).length > 0 ? (
                    <Doughnut 
                      data={crearDatasetPie(
                        Object.fromEntries(
                          Object.entries(statsEventos.porCiudad)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 10)
                        ), 
                        'Eventos'
                      )} 
                      options={chartOptions} 
                    />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-secondary text-white">
                  <h5 className="mb-0">Por Género Musical (Top 10)</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsEventos && Object.keys(statsEventos.porGenero).length > 0 ? (
                    <Pie 
                      data={crearDatasetPie(
                        Object.fromEntries(
                          Object.entries(statsEventos.porGenero)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 10)
                        ), 
                        'Eventos'
                      )} 
                      options={chartOptions} 
                    />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Métricas */}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header className="bg-dark text-white">
                  <h5 className="mb-0">Métricas de Eventos</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3} className="text-center">
                      <h3 className="text-primary">{statsEventos?.total || 0}</h3>
                      <p className="text-muted">Total Eventos</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-success">{statsEventos?.totalAsistentes || 0}</h3>
                      <p className="text-muted">Total Asistentes</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-warning">{statsEventos?.promedioAsistentesPorEvento || 0}</h3>
                      <p className="text-muted">Promedio Asistentes</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-info">{statsEventos?.eventosProximos || 0}</h3>
                      <p className="text-muted">Eventos Próximos</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* PESTAÑA: PRODUCTOS */}
        <Tab eventKey="productos" title="Productos">
          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-danger text-white">
                  <h5 className="mb-0">Por Categoría</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsProductos && Object.keys(statsProductos.porCategoria).length > 0 ? (
                    <Doughnut data={crearDatasetPie(statsProductos.porCategoria, 'Productos')} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-warning text-white">
                  <h5 className="mb-0">Por Estado</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsProductos && Object.keys(statsProductos.porEstado).length > 0 ? (
                    <Pie data={crearDatasetPie(statsProductos.porEstado, 'Productos')} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">Con/Sin Imágenes</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsProductos && (
                    <Doughnut 
                      data={crearDatasetPie({
                        'Con Imágenes': statsProductos.conImagenes,
                        'Sin Imágenes': statsProductos.sinImagenes
                      }, 'Productos')} 
                      options={chartOptions} 
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-primary text-white">
                  <h5 className="mb-0">Por Ciudad (Top 10)</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsProductos && Object.keys(statsProductos.porCiudad).length > 0 ? (
                    <Pie 
                      data={crearDatasetPie(
                        Object.fromEntries(
                          Object.entries(statsProductos.porCiudad)
                            .sort(([,a], [,b]) => b - a)
                            .slice(0, 10)
                        ), 
                        'Productos'
                      )} 
                      options={chartOptions} 
                    />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Métricas */}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header className="bg-dark text-white">
                  <h5 className="mb-0">Métricas de Productos</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3} className="text-center">
                      <h3 className="text-primary">{statsProductos?.total || 0}</h3>
                      <p className="text-muted">Total Productos</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-success">${statsProductos?.precioPromedio || 0}</h3>
                      <p className="text-muted">Precio Promedio</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-warning">${statsProductos?.precioMaximo || 0}</h3>
                      <p className="text-muted">Precio Máximo</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <h3 className="text-info">${statsProductos?.totalValorInventario || 0}</h3>
                      <p className="text-muted">Valor Total Inventario</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* PESTAÑA: SESIONES Y REGISTROS */}
        <Tab eventKey="sesiones" title="Sesiones">
          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-success text-white">
                  <h5 className="mb-0">Nuevos Registros por Tipo</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsSesiones && Object.keys(statsSesiones.registrosPorTipo).length > 0 ? (
                    <Pie data={crearDatasetPie(statsSesiones.registrosPorTipo, 'Registros')} options={chartOptions} />
                  ) : (
                    <p className="text-center text-muted">No hay datos</p>
                  )}
                </Card.Body>
              </Card>
            </Col>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header className="bg-info text-white">
                  <h5 className="mb-0">Actividad de Usuarios</h5>
                </Card.Header>
                <Card.Body style={{ height: '350px' }}>
                  {statsSesiones && (
                    <Doughnut 
                      data={crearDatasetPie({
                        'Usuarios Activos': statsSesiones.usuariosActivosUnicos,
                        'Total Usuarios': statsUsuarios?.total - statsSesiones.usuariosActivosUnicos
                      }, 'Usuarios')} 
                      options={chartOptions} 
                    />
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Métricas de Sesión */}
          <Row>
            <Col md={12}>
              <Card>
                <Card.Header className="bg-dark text-white">
                  <h5 className="mb-0">Métricas de Sesión y Actividad</h5>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={3} className="text-center">
                      <FaUserPlus size={40} className="text-success mb-2" />
                      <h3 className="text-success">{statsSesiones?.nuevosRegistros || 0}</h3>
                      <p className="text-muted">Nuevos Registros</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <FaSignInAlt size={40} className="text-primary mb-2" />
                      <h3 className="text-primary">{statsSesiones?.totalIniciosSesion || 0}</h3>
                      <p className="text-muted">Inicios de Sesión</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <FaClock size={40} className="text-warning mb-2" />
                      <h3 className="text-warning">{statsSesiones?.tiempoPromedioConexion || 0} min</h3>
                      <p className="text-muted">Tiempo Promedio</p>
                    </Col>
                    <Col md={3} className="text-center">
                      <FaUsers size={40} className="text-info mb-2" />
                      <h3 className="text-info">{statsSesiones?.usuariosActivosUnicos || 0}</h3>
                      <p className="text-muted">Usuarios Activos</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>
    </div>
  );
};

export default EstadisticasAvanzadas;
