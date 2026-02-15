import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Tabs, Tab, Spinner, Badge, Table } from 'react-bootstrap';
import { FaUsers, FaFileAlt, FaCalendar, FaShoppingBag, FaChartLine, FaTrophy, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { Bar, Pie, Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement } from 'chart.js';
import analyticsService from '../services/analyticsService';
import './AnalyticsDashboard.css';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title, LineElement, PointElement);

const AnalyticsDashboard = ({ users, publications, events, products }) => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    if (users && publications && events && products) {
      processAnalytics();
    }
  }, [users, publications, events, products]);

  const processAnalytics = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.generateConsolidatedDashboard(
        users,
        publications,
        events,
        products
      );
      setAnalytics(data);
    } catch (error) {
      console.error('Error procesando analíticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Procesando datos estadísticos...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-5">
        <p>No hay datos disponibles para analizar</p>
      </div>
    );
  }

  // Colores para gráficos - Paleta consistente
  const chartColors = {
    primary: ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140', '#30cfd0'],
    purple: '#667eea',
    blue: '#4facfe',
    teal: '#38f9d7',
    pink: '#fa709a',
    gradient1: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    gradient2: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    gradient3: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    gradient4: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
  };

  return (
    <Container fluid className="analytics-dashboard">
      <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
        
        {/* ============================================ */}
        {/* TAB: DASHBOARD GENERAL */}
        {/* ============================================ */}
        <Tab eventKey="general" title="Dashboard General">
          <Row className="mb-4">
            <Col md={3}>
              <Card className="stat-card bg-primary text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6>Total Usuarios</h6>
                      <h2>{analytics.summary.totalUsers}</h2>
                      <small>{analytics.summary.premiumRate}% Premium</small>
                    </div>
                    <FaUsers size={40} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card bg-success text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6>Publicaciones</h6>
                      <h2>{analytics.summary.totalPublications}</h2>
                      <small>Engagement: {analytics.summary.engagementRate}</small>
                    </div>
                    <FaFileAlt size={40} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card bg-warning text-dark">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6>Eventos</h6>
                      <h2>{analytics.summary.totalEvents}</h2>
                      <small>Promedio: {analytics.summary.avgEventAttendees} asistentes</small>
                    </div>
                    <FaCalendar size={40} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="stat-card bg-info text-white">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6>Productos</h6>
                      <h2>{analytics.summary.totalProducts}</h2>
                      <small>Precio promedio: ${analytics.summary.avgProductPrice.toLocaleString()}</small>
                    </div>
                    <FaShoppingBag size={40} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <FaChartLine className="me-2" />
                  Distribución de Usuarios por Plan
                </Card.Header>
                <Card.Body>
                  <Pie
                    data={{
                      labels: Object.keys(analytics.users.byPlan),
                      datasets: [{
                        data: Object.values(analytics.users.byPlan),
                        backgroundColor: chartColors.primary
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <FaChartLine className="me-2" />
                  Crecimiento de Usuarios por Mes
                </Card.Header>
                <Card.Body>
                  <Line
                    data={{
                      labels: Object.keys(analytics.users.growthByMonth).sort(),
                      datasets: [{
                        label: 'Nuevos Usuarios',
                        data: Object.keys(analytics.users.growthByMonth).sort().map(k => analytics.users.growthByMonth[k]),
                        borderColor: chartColors.info,
                        backgroundColor: chartColors.info + '33',
                        tension: 0.4
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* ============================================ */}
        {/* TAB: USUARIOS */}
        {/* ============================================ */}
        <Tab eventKey="users" title="Usuarios">
          <Row className="mb-4">
            <Col md={12}>
              <h4>KPIs de Usuarios</h4>
            </Col>
            <Col md={4}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Tasa Premium</h6>
                  <h2>{analytics.users.kpis.premiumRate}%</h2>
                  <Badge bg="success">Objetivo: 20%</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Tiempo Promedio</h6>
                  <h2>{analytics.users.kpis.avgTimeHours}h</h2>
                  <Badge bg="info">Por usuario</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Usuarios Activos</h6>
                  <h2>{analytics.users.kpis.totalActive}</h2>
                  <Badge bg="primary">Total</Badge>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <FaUsers className="me-2" />
                  Distribución por Tipo de Usuario
                </Card.Header>
                <Card.Body>
                  <Bar
                    data={{
                      labels: Object.keys(analytics.users.byType),
                      datasets: [{
                        label: 'Cantidad',
                        data: Object.values(analytics.users.byType),
                        backgroundColor: chartColors.primary
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <FaMapMarkerAlt className="me-2" />
                  Top 10 Departamentos
                </Card.Header>
                <Card.Body>
                  <Bar
                    data={{
                      labels: Object.keys(analytics.users.byDepartamento).slice(0, 10),
                      datasets: [{
                        label: 'Usuarios',
                        data: Object.values(analytics.users.byDepartamento).slice(0, 10),
                        backgroundColor: chartColors.success
                      }]
                    }}
                    options={{
                      indexAxis: 'y',
                      responsive: true,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>
                  <FaClock className="me-2" />
                  Estadísticas Descriptivas - Tiempo en Plataforma
                </Card.Header>
                <Card.Body>
                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th>Métrica</th>
                        <th>Valor (minutos)</th>
                        <th>Valor (horas)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Media</strong></td>
                        <td>{analytics.users.timeStats.mean}</td>
                        <td>{(analytics.users.timeStats.mean / 60).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Mediana</strong></td>
                        <td>{analytics.users.timeStats.median}</td>
                        <td>{(analytics.users.timeStats.median / 60).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Moda</strong></td>
                        <td>{analytics.users.timeStats.mode}</td>
                        <td>{(analytics.users.timeStats.mode / 60).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Desviación Estándar</strong></td>
                        <td>{analytics.users.timeStats.stdDev}</td>
                        <td>{(analytics.users.timeStats.stdDev / 60).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Mínimo</strong></td>
                        <td>{analytics.users.timeStats.min}</td>
                        <td>{(analytics.users.timeStats.min / 60).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>Máximo</strong></td>
                        <td>{analytics.users.timeStats.max}</td>
                        <td>{(analytics.users.timeStats.max / 60).toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* ============================================ */}
        {/* TAB: PUBLICACIONES */}
        {/* ============================================ */}
        <Tab eventKey="publications" title="Publicaciones">
          <Row className="mb-4">
            <Col md={12}>
              <h4>KPIs de Publicaciones</h4>
            </Col>
            <Col md={4}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Engagement Rate</h6>
                  <h2>{analytics.publications.kpis.engagementRate}</h2>
                  <Badge bg="success">Reacciones/Publicación</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Promedio Reacciones</h6>
                  <h2>{analytics.publications.kpis.avgReactions}</h2>
                  <Badge bg="info">Por publicación</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Total Publicaciones</h6>
                  <h2>{analytics.publications.kpis.totalPublications}</h2>
                  <Badge bg="primary">Activas</Badge>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <FaFileAlt className="me-2" />
                  Publicaciones por Tipo
                </Card.Header>
                <Card.Body>
                  <Doughnut
                    data={{
                      labels: Object.keys(analytics.publications.byType),
                      datasets: [{
                        data: Object.values(analytics.publications.byType),
                        backgroundColor: chartColors.primary
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'right' }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <FaTrophy className="me-2" />
                  Promedio de Reacciones por Tipo
                </Card.Header>
                <Card.Body>
                  <Bar
                    data={{
                      labels: Object.keys(analytics.publications.avgReactionsByType),
                      datasets: [{
                        label: 'Reacciones Promedio',
                        data: Object.values(analytics.publications.avgReactionsByType),
                        backgroundColor: chartColors.warning
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>
                  <FaChartLine className="me-2" />
                  Estadísticas Descriptivas - Reacciones
                </Card.Header>
                <Card.Body>
                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th>Métrica</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Media</strong></td>
                        <td>{analytics.publications.reactionStats.mean}</td>
                      </tr>
                      <tr>
                        <td><strong>Mediana</strong></td>
                        <td>{analytics.publications.reactionStats.median}</td>
                      </tr>
                      <tr>
                        <td><strong>Moda</strong></td>
                        <td>{analytics.publications.reactionStats.mode}</td>
                      </tr>
                      <tr>
                        <td><strong>Desviación Estándar</strong></td>
                        <td>{analytics.publications.reactionStats.stdDev}</td>
                      </tr>
                      <tr>
                        <td><strong>Total Reacciones</strong></td>
                        <td>{analytics.publications.totalReactions}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* ============================================ */}
        {/* TAB: EVENTOS */}
        {/* ============================================ */}
        <Tab eventKey="events" title="Eventos">
          <Row className="mb-4">
            <Col md={12}>
              <h4>KPIs de Eventos</h4>
            </Col>
            <Col md={4}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Promedio Asistentes</h6>
                  <h2>{analytics.events.kpis.avgAttendees}</h2>
                  <Badge bg="success">Por evento</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Total Eventos</h6>
                  <h2>{analytics.events.kpis.totalEvents}</h2>
                  <Badge bg="info">Creados</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Ciudades Activas</h6>
                  <h2>{analytics.events.kpis.topCityEvents}</h2>
                  <Badge bg="primary">Con eventos</Badge>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <FaMapMarkerAlt className="me-2" />
                  Eventos por Ciudad (Top 10)
                </Card.Header>
                <Card.Body>
                  <Bar
                    data={{
                      labels: Object.keys(analytics.events.byCiudad).slice(0, 10),
                      datasets: [{
                        label: 'Eventos',
                        data: Object.values(analytics.events.byCiudad).slice(0, 10),
                        backgroundColor: chartColors.primary
                      }]
                    }}
                    options={{
                      indexAxis: 'y',
                      responsive: true,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <FaChartLine className="me-2" />
                  Tendencia Mensual de Eventos
                </Card.Header>
                <Card.Body>
                  <Line
                    data={{
                      labels: Object.keys(analytics.events.trendByMonth).sort(),
                      datasets: [{
                        label: 'Eventos Creados',
                        data: Object.keys(analytics.events.trendByMonth).sort().map(k => analytics.events.trendByMonth[k]),
                        borderColor: chartColors.warning,
                        backgroundColor: chartColors.warning + '33',
                        tension: 0.4
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>
                  <FaTrophy className="me-2" />
                  Top 10 Eventos con Mayor Participación
                </Card.Header>
                <Card.Body>
                  <Table striped hover>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Título</th>
                        <th>Ciudad</th>
                        <th>Asistentes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.events.topEvents.map((event, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{event.titulo}</td>
                          <td>{event.ciudad}</td>
                          <td><Badge bg="success">{event.asistentes}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {/* ============================================ */}
        {/* TAB: PRODUCTOS */}
        {/* ============================================ */}
        <Tab eventKey="products" title="Productos">
          <Row className="mb-4">
            <Col md={12}>
              <h4>KPIs de Productos</h4>
            </Col>
            <Col md={3}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Precio Promedio</h6>
                  <h2>${analytics.products.kpis.avgPrice.toLocaleString()}</h2>
                  <Badge bg="success">COP</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Valoración Promedio</h6>
                  <h2>{analytics.products.kpis.avgRating}</h2>
                  <Badge bg="warning">De 5</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Tasa Usados</h6>
                  <h2>{analytics.products.kpis.usedRate}%</h2>
                  <Badge bg="info">Del total</Badge>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="kpi-card">
                <Card.Body>
                  <h6>Total Productos</h6>
                  <h2>{analytics.products.kpis.totalProducts}</h2>
                  <Badge bg="primary">Publicados</Badge>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <FaShoppingBag className="me-2" />
                  Distribución por Estado
                </Card.Header>
                <Card.Body>
                  <Pie
                    data={{
                      labels: Object.keys(analytics.products.byEstado),
                      datasets: [{
                        data: Object.values(analytics.products.byEstado),
                        backgroundColor: [chartColors.success, chartColors.warning]
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { position: 'bottom' }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} className="mb-4">
              <Card>
                <Card.Header>
                  <FaChartLine className="me-2" />
                  Productos por Tipo
                </Card.Header>
                <Card.Body>
                  <Bar
                    data={{
                      labels: Object.keys(analytics.products.byTipo),
                      datasets: [{
                        label: 'Cantidad',
                        data: Object.values(analytics.products.byTipo),
                        backgroundColor: chartColors.primary
                      }]
                    }}
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false }
                      }
                    }}
                  />
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Card>
                <Card.Header>
                  <FaChartLine className="me-2" />
                  Estadísticas Descriptivas - Precios
                </Card.Header>
                <Card.Body>
                  <Table striped bordered>
                    <thead>
                      <tr>
                        <th>Métrica</th>
                        <th>Valor (COP)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>Media</strong></td>
                        <td>${analytics.products.priceStats.mean.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td><strong>Mediana</strong></td>
                        <td>${analytics.products.priceStats.median.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td><strong>Moda</strong></td>
                        <td>${analytics.products.priceStats.mode.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td><strong>Desviación Estándar</strong></td>
                        <td>${analytics.products.priceStats.stdDev.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td><strong>Precio Mínimo</strong></td>
                        <td>${analytics.products.priceStats.min.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td><strong>Precio Máximo</strong></td>
                        <td>${analytics.products.priceStats.max.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

      </Tabs>
    </Container>
  );
};

export default AnalyticsDashboard;
