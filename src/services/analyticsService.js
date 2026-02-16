import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import colombiaAPI from './colombiaAPI';

class AnalyticsService {
  constructor() {
    this.departamentosMap = {};
    this.ciudadesMap = {};
    this.mapsLoaded = false;
  }

  /**
   * Carga los mapeos de departamentos y ciudades desde la API
   */
  async loadLocationMaps() {
    if (this.mapsLoaded) return;

    try {
      const [departamentos, ciudades] = await Promise.all([
        colombiaAPI.getDepartamentos(),
        colombiaAPI.getAllCiudades()
      ]);

      // Crear mapeo de departamentos
      departamentos.forEach(dept => {
        this.departamentosMap[dept.id] = dept.name;
      });

      // Crear mapeo de ciudades
      ciudades.forEach(city => {
        this.ciudadesMap[city.id] = city.name;
      });

      this.mapsLoaded = true;
    } catch (error) {
      console.error('Error cargando mapeos de ubicaciones:', error);
    }
  }

  /**
   * Convierte un ID de departamento a nombre
   */
  getDepartamentoName(value) {
    if (!value || value === 'N/A') return 'N/A';
    
    // Si es objeto, extraer label o value
    if (typeof value === 'object') {
      return value.label || value.value || 'N/A';
    }
    
    // Si es número o string numérico, buscar en el mapa
    if (typeof value === 'number' || !isNaN(value)) {
      const id = typeof value === 'string' ? parseInt(value) : value;
      return this.departamentosMap[id] || `ID: ${value}`;
    }
    
    // Si es string no numérico, devolver tal cual
    return value;
  }

  /**
   * Convierte un ID de ciudad a nombre
   */
  getCiudadName(value) {
    if (!value || value === 'N/A') return 'N/A';
    
    // Si es objeto, extraer label o value
    if (typeof value === 'object') {
      return value.label || value.value || 'N/A';
    }
    
    // Si es número o string numérico, buscar en el mapa
    if (typeof value === 'number' || !isNaN(value)) {
      const id = typeof value === 'string' ? parseInt(value) : value;
      return this.ciudadesMap[id] || `ID: ${value}`;
    }
    
    // Si es string no numérico, devolver tal cual
    return value;
  }
  // ============================================
  // UTILIDADES DE LIMPIEZA Y PROCESAMIENTO
  // ============================================

  /**
   * Convierte tiempo en formato "37m", "2h 30m", "5d 3h" a minutos
   */
  parseTimeToMinutes(timeString) {
    if (!timeString || timeString === 'N/A') return 0;
    
    let totalMinutes = 0;
    const dayMatch = timeString.match(/(\d+)d/);
    const hourMatch = timeString.match(/(\d+)h/);
    const minuteMatch = timeString.match(/(\d+)m/);
    
    if (dayMatch) totalMinutes += parseInt(dayMatch[1]) * 24 * 60;
    if (hourMatch) totalMinutes += parseInt(hourMatch[1]) * 60;
    if (minuteMatch) totalMinutes += parseInt(minuteMatch[1]);
    
    return totalMinutes;
  }

  /**
   * Calcula estadísticas descriptivas básicas
   */
  calculateDescriptiveStats(values) {
    if (!values || values.length === 0) {
      return { mean: 0, median: 0, mode: 0, stdDev: 0, min: 0, max: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    // Media
    const mean = sorted.reduce((sum, val) => sum + val, 0) / n;
    
    // Mediana
    const median = n % 2 === 0
      ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
      : sorted[Math.floor(n / 2)];
    
    // Moda
    const frequency = {};
    let maxFreq = 0;
    let mode = sorted[0];
    sorted.forEach(val => {
      frequency[val] = (frequency[val] || 0) + 1;
      if (frequency[val] > maxFreq) {
        maxFreq = frequency[val];
        mode = val;
      }
    });
    
    // Desviación estándar
    const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    const stdDev = Math.sqrt(variance);
    
    return {
      mean: parseFloat(mean.toFixed(2)),
      median: parseFloat(median.toFixed(2)),
      mode,
      stdDev: parseFloat(stdDev.toFixed(2)),
      min: sorted[0],
      max: sorted[n - 1]
    };
  }

  /**
   * Agrupa datos por campo y cuenta ocurrencias
   */
  groupByField(data, field) {
    const grouped = {};
    data.forEach(item => {
      const value = item[field] || 'N/A';
      grouped[value] = (grouped[value] || 0) + 1;
    });
    return grouped;
  }

  // ============================================
  // ANÁLISIS DE USUARIOS
  // ============================================

  async analyzeUsers(users) {
    // Cargar mapeos de ubicaciones
    await this.loadLocationMaps();

    // Filtrar usuarios válidos
    const validUsers = users.filter(u => u.nombre && u.email);

    // 1. Distribución por tipo
    const byType = this.groupByField(validUsers, 'type');

    // 2. Distribución por plan
    const byPlan = this.groupByField(validUsers, 'planActual');
    const premiumPercentage = ((byPlan.premium || 0) / validUsers.length * 100).toFixed(2);

    // 3. Tiempo en plataforma
    const timeValues = validUsers
      .map(u => this.parseTimeToMinutes(u.tiempoEnPlataforma))
      .filter(t => t > 0);
    const timeStats = this.calculateDescriptiveStats(timeValues);

    // 4. Distribución geográfica (convertir IDs a nombres)
    const byDepartamento = {};
    const byMunicipio = {};
    
    validUsers.forEach(user => {
      const deptName = this.getDepartamentoName(user.departamento);
      const munName = this.getCiudadName(user.municipio || user.ciudad);
      
      byDepartamento[deptName] = (byDepartamento[deptName] || 0) + 1;
      byMunicipio[munName] = (byMunicipio[munName] || 0) + 1;
    });

    // 5. Crecimiento por mes
    const byMonth = {};
    validUsers.forEach(user => {
      if (user.fechaRegistro || user.createdAt) {
        const date = user.fechaRegistro?.toDate ? user.fechaRegistro.toDate() : new Date(user.fechaRegistro || user.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
      }
    });

    return {
      total: validUsers.length,
      byType,
      byPlan,
      premiumPercentage: parseFloat(premiumPercentage),
      timeStats,
      avgTimeMinutes: timeStats.mean,
      byDepartamento,
      byMunicipio,
      growthByMonth: byMonth,
      kpis: {
        premiumRate: parseFloat(premiumPercentage),
        avgTimeHours: parseFloat((timeStats.mean / 60).toFixed(2)),
        totalActive: validUsers.length
      }
    };
  }

  // ============================================
  // ANÁLISIS DE PUBLICACIONES
  // ============================================

  async analyzePublications(publications) {
    const validPubs = publications.filter(p => p.contenido || p.texto);

    // 1. Total y por tipo
    const byType = this.groupByField(validPubs, 'tipo');

    // 2. Reacciones
    const reactionValues = validPubs.map(p => p.reacciones || p.likes || 0);
    const reactionStats = this.calculateDescriptiveStats(reactionValues);

    // 3. Engagement rate
    const totalReactions = reactionValues.reduce((sum, val) => sum + val, 0);
    const engagementRate = validPubs.length > 0 
      ? (totalReactions / validPubs.length).toFixed(2) 
      : 0;

    // 4. Actividad por fecha
    const byDate = {};
    validPubs.forEach(pub => {
      if (pub.createdAt || pub.fecha) {
        const date = pub.createdAt?.toDate ? pub.createdAt.toDate() : new Date(pub.createdAt || pub.fecha);
        const dateKey = date.toISOString().split('T')[0];
        byDate[dateKey] = (byDate[dateKey] || 0) + 1;
      }
    });

    // 5. Promedio de reacciones por tipo
    const avgReactionsByType = {};
    Object.keys(byType).forEach(type => {
      const typePubs = validPubs.filter(p => (p.tipo || 'N/A') === type);
      const typeReactions = typePubs.map(p => p.reacciones || p.likes || 0);
      avgReactionsByType[type] = typeReactions.length > 0
        ? (typeReactions.reduce((sum, val) => sum + val, 0) / typeReactions.length).toFixed(2)
        : 0;
    });

    return {
      total: validPubs.length,
      byType,
      reactionStats,
      totalReactions,
      engagementRate: parseFloat(engagementRate),
      avgReactionsByType,
      activityByDate: byDate,
      kpis: {
        engagementRate: parseFloat(engagementRate),
        avgReactions: reactionStats.mean,
        totalPublications: validPubs.length
      }
    };
  }

  // ============================================
  // ANÁLISIS DE EVENTOS
  // ============================================

  async analyzeEvents(events) {
    // Cargar mapeos de ubicaciones
    await this.loadLocationMaps();

    const validEvents = events.filter(e => e.titulo);

    // 1. Total de eventos
    const total = validEvents.length;

    // 2. Asistentes
    const attendeeValues = validEvents.map(e => e.asistentes?.length || 0);
    const attendeeStats = this.calculateDescriptiveStats(attendeeValues);

    // 3. Distribución geográfica (convertir IDs a nombres)
    const byCiudad = {};
    const byDepartamento = {};
    
    validEvents.forEach(event => {
      const cityName = this.getCiudadName(event.ciudad);
      const deptName = this.getDepartamentoName(event.departamento);
      
      byCiudad[cityName] = (byCiudad[cityName] || 0) + 1;
      byDepartamento[deptName] = (byDepartamento[deptName] || 0) + 1;
    });

    // 4. Eventos con mayor participación (top 10)
    const topEvents = validEvents
      .map(e => ({
        titulo: e.titulo,
        asistentes: e.asistentes?.length || 0,
        ciudad: this.getCiudadName(e.ciudad)
      }))
      .sort((a, b) => b.asistentes - a.asistentes)
      .slice(0, 10);

    // 5. Tendencia temporal
    const byMonth = {};
    validEvents.forEach(event => {
      if (event.fecha || event.createdAt) {
        const dateStr = event.fecha || event.createdAt;
        const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr.toDate();
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;
      }
    });

    // 6. Tasa de participación por ciudad
    const participationByCiudad = {};
    Object.keys(byCiudad).forEach(ciudad => {
      const cityEvents = validEvents.filter(e => (e.ciudad || 'N/A') === ciudad);
      const totalAttendees = cityEvents.reduce((sum, e) => sum + (e.asistentes?.length || 0), 0);
      participationByCiudad[ciudad] = {
        events: byCiudad[ciudad],
        totalAttendees,
        avgAttendees: (totalAttendees / byCiudad[ciudad]).toFixed(2)
      };
    });

    return {
      total,
      attendeeStats,
      avgAttendees: attendeeStats.mean,
      byCiudad,
      byDepartamento,
      topEvents,
      trendByMonth: byMonth,
      participationByCiudad,
      kpis: {
        avgAttendees: attendeeStats.mean,
        totalEvents: total,
        topCityEvents: Object.keys(byCiudad).length
      }
    };
  }

  // ============================================
  // ANÁLISIS DE PRODUCTOS
  // ============================================

  async analyzeProducts(products) {
    const validProducts = products.filter(p => p.nombre);

    // 1. Precio
    const priceValues = validProducts.map(p => p.precio || 0).filter(p => p > 0);
    const priceStats = this.calculateDescriptiveStats(priceValues);

    // 2. Distribución por estado
    const byEstado = this.groupByField(validProducts, 'estado');
    const usedPercentage = ((byEstado['Usado'] || 0) / validProducts.length * 100).toFixed(2);

    // 3. Valoración
    const ratingValues = validProducts.map(p => p.rating || 0).filter(r => r > 0);
    const ratingStats = this.calculateDescriptiveStats(ratingValues);

    // 4. Distribución geográfica
    const byUbicacion = this.groupByField(validProducts, 'ubicacion');

    // 5. Tipo de producto
    const byTipo = this.groupByField(validProducts, 'categoria');

    // 6. Precio promedio por tipo
    const avgPriceByType = {};
    Object.keys(byTipo).forEach(tipo => {
      const typeProducts = validProducts.filter(p => (p.categoria || 'N/A') === tipo);
      const typePrices = typeProducts.map(p => p.precio || 0).filter(p => p > 0);
      avgPriceByType[tipo] = typePrices.length > 0
        ? (typePrices.reduce((sum, val) => sum + val, 0) / typePrices.length).toFixed(2)
        : 0;
    });

    return {
      total: validProducts.length,
      priceStats,
      avgPrice: priceStats.mean,
      byEstado,
      usedPercentage: parseFloat(usedPercentage),
      ratingStats,
      avgRating: ratingStats.mean,
      byUbicacion,
      byTipo,
      avgPriceByType,
      kpis: {
        avgPrice: priceStats.mean,
        avgRating: ratingStats.mean,
        usedRate: parseFloat(usedPercentage),
        totalProducts: validProducts.length
      }
    };
  }

  // ============================================
  // DASHBOARD GENERAL CONSOLIDADO
  // ============================================

  /**
   * Analiza estadísticas de eliminación de cuentas
   */
  async analyzeDeletions() {
    try {
      const encuestasSnapshot = await getDocs(collection(db, 'encuestasEliminacion'));
      const encuestas = encuestasSnapshot.docs.map(doc => doc.data());

      if (encuestas.length === 0) {
        return {
          total: 0,
          deleted: 0,
          deactivated: 0,
          reasonsChart: null,
          actionChart: null,
          profileTypeChart: null,
          planChart: null,
          topReasons: []
        };
      }

      // Contadores
      const deleted = encuestas.filter(e => e.accion === 'delete').length;
      const deactivated = encuestas.filter(e => e.accion === 'deactivate').length;

      // Mapeo de razones a etiquetas legibles
      const reasonLabels = {
        'no_uso': 'No uso la plataforma con frecuencia',
        'encontre_alternativa': 'Encontré una alternativa mejor',
        'problemas_tecnicos': 'Problemas técnicos o errores',
        'falta_funciones': 'Falta de funciones que necesito',
        'privacidad': 'Preocupaciones de privacidad',
        'spam': 'Demasiado spam o contenido no deseado',
        'costo': 'Problemas con el costo o plan premium',
        'comunidad': 'No encontré la comunidad que buscaba',
        'temporal': 'Solo necesito un descanso temporal',
        'otro': 'Otra razón'
      };

      // Análisis por razón
      const reasonCounts = {};
      const reasonActions = {};
      encuestas.forEach(e => {
        const razon = e.razon || 'otro';
        reasonCounts[razon] = (reasonCounts[razon] || 0) + 1;
        if (!reasonActions[razon]) {
          reasonActions[razon] = { delete: 0, deactivate: 0 };
        }
        reasonActions[razon][e.accion]++;
      });

      // Top razones
      const topReasons = Object.entries(reasonCounts)
        .map(([key, count]) => ({
          label: reasonLabels[key] || key,
          count,
          percentage: ((count / encuestas.length) * 100).toFixed(1),
          commonAction: reasonActions[key].delete > reasonActions[key].deactivate ? 'delete' : 'deactivate'
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      // Gráfico de razones
      const reasonsChart = {
        labels: topReasons.map(r => r.label),
        datasets: [{
          label: 'Cantidad',
          data: topReasons.map(r => r.count),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
            '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
          ]
        }]
      };

      // Gráfico de acción
      const actionChart = {
        labels: ['Eliminación Permanente', 'Desactivación Temporal'],
        datasets: [{
          data: [deleted, deactivated],
          backgroundColor: ['#dc3545', '#ffc107']
        }]
      };

      // Análisis por tipo de perfil
      const profileTypes = {};
      encuestas.forEach(e => {
        const tipo = e.perfilTipo || 'N/A';
        profileTypes[tipo] = (profileTypes[tipo] || 0) + 1;
      });

      const profileTypeChart = {
        labels: Object.keys(profileTypes),
        datasets: [{
          label: 'Cantidad',
          data: Object.values(profileTypes),
          backgroundColor: '#36A2EB'
        }]
      };

      // Análisis por plan
      const plans = {};
      encuestas.forEach(e => {
        const plan = e.planActual || 'free';
        plans[plan] = (plans[plan] || 0) + 1;
      });

      const planChart = {
        labels: Object.keys(plans).map(p => p === 'free' ? 'Gratis' : 'Premium'),
        datasets: [{
          label: 'Cantidad',
          data: Object.values(plans),
          backgroundColor: '#FFCE56'
        }]
      };

      return {
        total: encuestas.length,
        deleted,
        deactivated,
        reasonsChart,
        actionChart,
        profileTypeChart,
        planChart,
        topReasons
      };
    } catch (error) {
      console.error('Error analizando eliminaciones:', error);
      return {
        total: 0,
        deleted: 0,
        deactivated: 0,
        reasonsChart: null,
        actionChart: null,
        profileTypeChart: null,
        planChart: null,
        topReasons: []
      };
    }
  }

  async generateConsolidatedDashboard(users, publications, events, products) {
    const userAnalysis = await this.analyzeUsers(users);
    const pubAnalysis = await this.analyzePublications(publications);
    const eventAnalysis = await this.analyzeEvents(events);
    const productAnalysis = await this.analyzeProducts(products);
    const deletionAnalysis = await this.analyzeDeletions();

    return {
      users: userAnalysis,
      publications: pubAnalysis,
      events: eventAnalysis,
      products: productAnalysis,
      deletions: deletionAnalysis,
      summary: {
        totalUsers: userAnalysis.total,
        totalPublications: pubAnalysis.total,
        totalEvents: eventAnalysis.total,
        totalProducts: productAnalysis.total,
        premiumRate: userAnalysis.kpis.premiumRate,
        engagementRate: pubAnalysis.kpis.engagementRate,
        avgEventAttendees: eventAnalysis.kpis.avgAttendees,
        avgProductPrice: productAnalysis.kpis.avgPrice
      }
    };
  }
}

export default new AnalyticsService();
