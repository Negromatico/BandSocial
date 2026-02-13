import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp,
  addDoc,
  updateDoc,
  doc,
  getDoc
} from 'firebase/firestore';

/**
 * Servicio de Estadísticas Avanzadas
 * Proporciona análisis detallados con filtros temporales y gráficos circulares
 */
class EstadisticasAvanzadasService {
  
  // ============================================
  // UTILIDADES DE FILTROS TEMPORALES
  // ============================================
  
  /**
   * Obtiene el rango de fechas según el filtro temporal
   * @param {string} periodo - 'dia', 'semana', 'mes', 'año'
   * @returns {Object} { inicio, fin }
   */
  getRangoFechas(periodo) {
    const ahora = new Date();
    const fin = Timestamp.fromDate(ahora);
    let inicio;
    
    switch(periodo) {
      case 'dia':
        const inicioDia = new Date(ahora);
        inicioDia.setHours(0, 0, 0, 0);
        inicio = Timestamp.fromDate(inicioDia);
        break;
      
      case 'semana':
        const inicioSemana = new Date(ahora);
        inicioSemana.setDate(ahora.getDate() - 7);
        inicioSemana.setHours(0, 0, 0, 0);
        inicio = Timestamp.fromDate(inicioSemana);
        break;
      
      case 'mes':
        const inicioMes = new Date(ahora);
        inicioMes.setMonth(ahora.getMonth() - 1);
        inicioMes.setHours(0, 0, 0, 0);
        inicio = Timestamp.fromDate(inicioMes);
        break;
      
      case 'año':
        const inicioAño = new Date(ahora);
        inicioAño.setFullYear(ahora.getFullYear() - 1);
        inicioAño.setHours(0, 0, 0, 0);
        inicio = Timestamp.fromDate(inicioAño);
        break;
      
      default:
        // Todo el tiempo
        inicio = Timestamp.fromDate(new Date(2020, 0, 1));
    }
    
    return { inicio, fin };
  }

  // ============================================
  // ESTADÍSTICAS DE USUARIOS
  // ============================================
  
  /**
   * Obtiene estadísticas completas de usuarios
   * @param {string} periodo - 'dia', 'semana', 'mes', 'año', 'todo'
   */
  async getEstadisticasUsuarios(periodo = 'todo') {
    try {
      const { inicio, fin } = this.getRangoFechas(periodo);
      
      // Obtener usuarios de 'perfiles' (colección principal)
      const perfilesRef = collection(db, 'perfiles');
      let q = query(perfilesRef);
      
      if (periodo !== 'todo') {
        q = query(perfilesRef, where('createdAt', '>=', inicio), where('createdAt', '<=', fin));
      }
      
      const snapshot = await getDocs(q);
      
      const stats = {
        total: snapshot.size,
        porTipo: {},
        porDepartamento: {},
        porGeneroMusical: {},
        porInstrumento: {},
        porPlan: { free: 0, premium: 0 },
        nuevosRegistros: snapshot.size,
        activos: 0,
        inactivos: 0
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Por tipo de usuario
        const tipo = data.type || 'Sin especificar';
        stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
        
        // Por departamento
        const dept = data.departamento || data.ciudad || 'Sin especificar';
        stats.porDepartamento[dept] = (stats.porDepartamento[dept] || 0) + 1;
        
        // Por géneros musicales
        if (data.generosMusicales && Array.isArray(data.generosMusicales)) {
          data.generosMusicales.forEach(genero => {
            stats.porGeneroMusical[genero] = (stats.porGeneroMusical[genero] || 0) + 1;
          });
        }
        
        // Por instrumentos
        if (data.instrumentos && Array.isArray(data.instrumentos)) {
          data.instrumentos.forEach(inst => {
            stats.porInstrumento[inst] = (stats.porInstrumento[inst] || 0) + 1;
          });
        }
        
        // Por plan
        const plan = data.planActual || data.membershipPlan || 'free';
        if (plan === 'premium') {
          stats.porPlan.premium++;
        } else {
          stats.porPlan.free++;
        }
        
        // Activos vs inactivos (basado en última actividad)
        const ultimaActividad = data.ultimaActividad?.toDate();
        if (ultimaActividad) {
          const diasInactivo = (new Date() - ultimaActividad) / (1000 * 60 * 60 * 24);
          if (diasInactivo <= 30) {
            stats.activos++;
          } else {
            stats.inactivos++;
          }
        } else {
          stats.inactivos++;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      throw error;
    }
  }

  // ============================================
  // ESTADÍSTICAS DE PUBLICACIONES
  // ============================================
  
  /**
   * Obtiene estadísticas completas de publicaciones
   * @param {string} periodo - 'dia', 'semana', 'mes', 'año', 'todo'
   */
  async getEstadisticasPublicaciones(periodo = 'todo') {
    try {
      const { inicio, fin } = this.getRangoFechas(periodo);
      
      const publicacionesRef = collection(db, 'publicaciones');
      let q = query(publicacionesRef);
      
      if (periodo !== 'todo') {
        q = query(publicacionesRef, where('createdAt', '>=', inicio), where('createdAt', '<=', fin));
      }
      
      const snapshot = await getDocs(q);
      
      const stats = {
        total: snapshot.size,
        porTipo: {},
        porCiudad: {},
        conImagenes: 0,
        sinImagenes: 0,
        totalReacciones: 0,
        totalComentarios: 0,
        promedioReaccionesPorPublicacion: 0,
        promedioComentariosPorPublicacion: 0,
        masPopulares: []
      };
      
      const publicacionesData = [];
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        
        // Por tipo
        const tipo = data.tipo || 'Sin especificar';
        stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
        
        // Por ciudad
        const ciudad = data.ciudad || 'Sin especificar';
        stats.porCiudad[ciudad] = (stats.porCiudad[ciudad] || 0) + 1;
        
        // Con/sin imágenes
        if (data.imagenesUrl && data.imagenesUrl.length > 0) {
          stats.conImagenes++;
        } else {
          stats.sinImagenes++;
        }
        
        // Contar reacciones
        const reaccionesRef = collection(db, 'publicaciones', docSnap.id, 'reacciones');
        const reaccionesSnap = await getDocs(reaccionesRef);
        const numReacciones = reaccionesSnap.size;
        stats.totalReacciones += numReacciones;
        
        // Contar comentarios
        const comentariosRef = collection(db, 'publicaciones', docSnap.id, 'comentarios');
        const comentariosSnap = await getDocs(comentariosRef);
        const numComentarios = comentariosSnap.size;
        stats.totalComentarios += numComentarios;
        
        publicacionesData.push({
          id: docSnap.id,
          titulo: data.titulo,
          reacciones: numReacciones,
          comentarios: numComentarios,
          engagement: numReacciones + numComentarios
        });
      }
      
      // Calcular promedios
      if (stats.total > 0) {
        stats.promedioReaccionesPorPublicacion = (stats.totalReacciones / stats.total).toFixed(2);
        stats.promedioComentariosPorPublicacion = (stats.totalComentarios / stats.total).toFixed(2);
      }
      
      // Top 5 más populares
      stats.masPopulares = publicacionesData
        .sort((a, b) => b.engagement - a.engagement)
        .slice(0, 5);
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de publicaciones:', error);
      throw error;
    }
  }

  // ============================================
  // ESTADÍSTICAS DE EVENTOS
  // ============================================
  
  /**
   * Obtiene estadísticas completas de eventos
   * @param {string} periodo - 'dia', 'semana', 'mes', 'año', 'todo'
   */
  async getEstadisticasEventos(periodo = 'todo') {
    try {
      const { inicio, fin } = this.getRangoFechas(periodo);
      
      const eventosRef = collection(db, 'eventos');
      let q = query(eventosRef);
      
      if (periodo !== 'todo') {
        q = query(eventosRef, where('createdAt', '>=', inicio), where('createdAt', '<=', fin));
      }
      
      const snapshot = await getDocs(q);
      
      const stats = {
        total: snapshot.size,
        porTipo: {},
        porCiudad: {},
        porGenero: {},
        gratuitos: 0,
        pagos: 0,
        totalAsistentes: 0,
        promedioAsistentesPorEvento: 0,
        eventosPasados: 0,
        eventosProximos: 0,
        masPopulares: []
      };
      
      const ahora = new Date();
      const eventosData = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Por tipo
        const tipo = data.tipo || 'Sin especificar';
        stats.porTipo[tipo] = (stats.porTipo[tipo] || 0) + 1;
        
        // Por ciudad
        const ciudad = data.ciudad || 'Sin especificar';
        stats.porCiudad[ciudad] = (stats.porCiudad[ciudad] || 0) + 1;
        
        // Por género musical
        if (data.generos && Array.isArray(data.generos)) {
          data.generos.forEach(genero => {
            stats.porGenero[genero] = (stats.porGenero[genero] || 0) + 1;
          });
        }
        
        // Gratuitos vs pagos
        if (!data.precio || data.precio === '0' || data.precio === 0) {
          stats.gratuitos++;
        } else {
          stats.pagos++;
        }
        
        // Asistentes
        const numAsistentes = data.asistentes?.length || 0;
        stats.totalAsistentes += numAsistentes;
        
        // Pasados vs próximos
        let fechaEvento = null;
        if (data.fecha) {
          // Manejar diferentes formatos de fecha
          if (typeof data.fecha.toDate === 'function') {
            fechaEvento = data.fecha.toDate();
          } else if (data.fecha instanceof Date) {
            fechaEvento = data.fecha;
          } else if (typeof data.fecha === 'string') {
            fechaEvento = new Date(data.fecha);
          }
        }
        
        if (fechaEvento && !isNaN(fechaEvento.getTime())) {
          if (fechaEvento < ahora) {
            stats.eventosPasados++;
          } else {
            stats.eventosProximos++;
          }
        }
        
        eventosData.push({
          id: doc.id,
          titulo: data.titulo,
          asistentes: numAsistentes,
          fecha: fechaEvento
        });
      });
      
      // Calcular promedio de asistentes
      if (stats.total > 0) {
        stats.promedioAsistentesPorEvento = (stats.totalAsistentes / stats.total).toFixed(2);
      }
      
      // Top 5 más populares
      stats.masPopulares = eventosData
        .sort((a, b) => b.asistentes - a.asistentes)
        .slice(0, 5);
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de eventos:', error);
      throw error;
    }
  }

  // ============================================
  // ESTADÍSTICAS DE PRODUCTOS
  // ============================================
  
  /**
   * Obtiene estadísticas completas de productos
   * @param {string} periodo - 'dia', 'semana', 'mes', 'año', 'todo'
   */
  async getEstadisticasProductos(periodo = 'todo') {
    try {
      const { inicio, fin } = this.getRangoFechas(periodo);
      
      const productosRef = collection(db, 'productos');
      let q = query(productosRef);
      
      if (periodo !== 'todo') {
        q = query(productosRef, where('createdAt', '>=', inicio), where('createdAt', '<=', fin));
      }
      
      const snapshot = await getDocs(q);
      
      const stats = {
        total: snapshot.size,
        porCategoria: {},
        porEstado: {},
        porCiudad: {},
        precioPromedio: 0,
        precioMinimo: Infinity,
        precioMaximo: 0,
        totalValorInventario: 0,
        conImagenes: 0,
        sinImagenes: 0,
        masCaros: [],
        masBaratos: []
      };
      
      const productosData = [];
      let sumaPrecio = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Por categoría
        const categoria = data.categoria || 'Sin especificar';
        stats.porCategoria[categoria] = (stats.porCategoria[categoria] || 0) + 1;
        
        // Por estado
        const estado = data.estado || 'Sin especificar';
        stats.porEstado[estado] = (stats.porEstado[estado] || 0) + 1;
        
        // Por ciudad
        const ciudad = data.ubicacion || 'Sin especificar';
        stats.porCiudad[ciudad] = (stats.porCiudad[ciudad] || 0) + 1;
        
        // Precios
        const precio = parseFloat(data.precio) || 0;
        if (precio > 0) {
          sumaPrecio += precio;
          stats.totalValorInventario += precio;
          
          if (precio < stats.precioMinimo) stats.precioMinimo = precio;
          if (precio > stats.precioMaximo) stats.precioMaximo = precio;
          
          productosData.push({
            id: doc.id,
            nombre: data.nombre,
            precio: precio,
            categoria: categoria
          });
        }
        
        // Con/sin imágenes
        if (data.imagenes && data.imagenes.length > 0) {
          stats.conImagenes++;
        } else {
          stats.sinImagenes++;
        }
      });
      
      // Calcular precio promedio
      if (stats.total > 0) {
        stats.precioPromedio = (sumaPrecio / stats.total).toFixed(0);
      }
      
      if (stats.precioMinimo === Infinity) stats.precioMinimo = 0;
      
      // Top 5 más caros y más baratos
      const productosSorted = productosData.sort((a, b) => b.precio - a.precio);
      stats.masCaros = productosSorted.slice(0, 5);
      stats.masBaratos = productosSorted.slice(-5).reverse();
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de productos:', error);
      throw error;
    }
  }

  // ============================================
  // ESTADÍSTICAS DE SESIONES Y REGISTROS
  // ============================================
  
  /**
   * Registra un inicio de sesión
   * @param {string} userId - ID del usuario
   */
  async registrarInicioSesion(userId) {
    try {
      const sesionesRef = collection(db, 'sesiones');
      await addDoc(sesionesRef, {
        userId,
        tipo: 'login',
        timestamp: Timestamp.now(),
        fecha: new Date().toISOString().split('T')[0]
      });
      
      // Actualizar última actividad del usuario
      const userRef = doc(db, 'perfiles', userId);
      await updateDoc(userRef, {
        ultimaActividad: Timestamp.now()
      });
    } catch (error) {
      console.error('Error al registrar inicio de sesión:', error);
    }
  }
  
  /**
   * Registra un cierre de sesión
   * @param {string} userId - ID del usuario
   * @param {number} duracion - Duración de la sesión en minutos
   */
  async registrarCierreSesion(userId, duracion) {
    try {
      const sesionesRef = collection(db, 'sesiones');
      await addDoc(sesionesRef, {
        userId,
        tipo: 'logout',
        duracion,
        timestamp: Timestamp.now(),
        fecha: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      console.error('Error al registrar cierre de sesión:', error);
    }
  }
  
  /**
   * Obtiene estadísticas de sesiones y registros
   * @param {string} periodo - 'dia', 'semana', 'mes', 'año', 'todo'
   */
  async getEstadisticasSesiones(periodo = 'todo') {
    try {
      const { inicio, fin } = this.getRangoFechas(periodo);
      
      // Estadísticas de registros (nuevos usuarios)
      const perfilesRef = collection(db, 'perfiles');
      let qRegistros = query(perfilesRef);
      
      if (periodo !== 'todo') {
        qRegistros = query(perfilesRef, where('createdAt', '>=', inicio), where('createdAt', '<=', fin));
      }
      
      const registrosSnap = await getDocs(qRegistros);
      
      // Estadísticas de sesiones
      const sesionesRef = collection(db, 'sesiones');
      let qSesiones = query(sesionesRef);
      
      if (periodo !== 'todo') {
        qSesiones = query(sesionesRef, where('timestamp', '>=', inicio), where('timestamp', '<=', fin));
      }
      
      const sesionesSnap = await getDocs(qSesiones);
      
      const stats = {
        nuevosRegistros: registrosSnap.size,
        registrosPorDia: {},
        registrosPorTipo: {},
        totalIniciosSesion: 0,
        iniciosSesionPorDia: {},
        tiempoPromedioConexion: 0,
        tiempoTotalConexion: 0,
        sesionesActivas: 0,
        usuariosActivos: new Set()
      };
      
      // Procesar registros
      registrosSnap.forEach(doc => {
        const data = doc.data();
        const fecha = data.createdAt?.toDate().toISOString().split('T')[0] || 'Sin fecha';
        stats.registrosPorDia[fecha] = (stats.registrosPorDia[fecha] || 0) + 1;
        
        const tipo = data.type || 'Sin especificar';
        stats.registrosPorTipo[tipo] = (stats.registrosPorTipo[tipo] || 0) + 1;
      });
      
      // Procesar sesiones
      let sumaDuraciones = 0;
      let contadorDuraciones = 0;
      
      sesionesSnap.forEach(doc => {
        const data = doc.data();
        
        if (data.tipo === 'login') {
          stats.totalIniciosSesion++;
          const fecha = data.fecha || 'Sin fecha';
          stats.iniciosSesionPorDia[fecha] = (stats.iniciosSesionPorDia[fecha] || 0) + 1;
          stats.usuariosActivos.add(data.userId);
        }
        
        if (data.duracion) {
          sumaDuraciones += data.duracion;
          contadorDuraciones++;
          stats.tiempoTotalConexion += data.duracion;
        }
      });
      
      // Calcular promedio de tiempo de conexión
      if (contadorDuraciones > 0) {
        stats.tiempoPromedioConexion = (sumaDuraciones / contadorDuraciones).toFixed(2);
      }
      
      stats.usuariosActivosUnicos = stats.usuariosActivos.size;
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de sesiones:', error);
      throw error;
    }
  }

  // ============================================
  // ESTADÍSTICAS GENERALES (RESUMEN)
  // ============================================
  
  /**
   * Obtiene un resumen general de todas las estadísticas
   * @param {string} periodo - 'dia', 'semana', 'mes', 'año', 'todo'
   */
  async getResumenGeneral(periodo = 'todo') {
    try {
      const [usuarios, publicaciones, eventos, productos, sesiones] = await Promise.all([
        this.getEstadisticasUsuarios(periodo),
        this.getEstadisticasPublicaciones(periodo),
        this.getEstadisticasEventos(periodo),
        this.getEstadisticasProductos(periodo),
        this.getEstadisticasSesiones(periodo)
      ]);
      
      return {
        periodo,
        usuarios,
        publicaciones,
        eventos,
        productos,
        sesiones,
        generadoEn: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error al obtener resumen general:', error);
      throw error;
    }
  }
}

export default new EstadisticasAvanzadasService();
