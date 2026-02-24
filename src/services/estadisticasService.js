import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  Timestamp 
} from 'firebase/firestore';

class EstadisticasService {
  async getEstadisticasPorDepartamento(departamentoId = null) {
    try {
      const usuarios = collection(db, 'usuarios');
      let q = query(usuarios);
      
      if (departamentoId) {
        q = query(usuarios, where('departamento', '==', departamentoId));
      }
      
      const snapshot = await getDocs(q);
      const stats = {
        totalUsuarios: 0,
        usuariosPorDepartamento: {},
        instrumentosPorDepartamento: {},
        generosPorDepartamento: {}
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const dept = data.departamento || 'Sin especificar';
        
        stats.totalUsuarios++;
        stats.usuariosPorDepartamento[dept] = (stats.usuariosPorDepartamento[dept] || 0) + 1;
        
        if (data.instrumentos) {
          if (!stats.instrumentosPorDepartamento[dept]) {
            stats.instrumentosPorDepartamento[dept] = {};
          }
          data.instrumentos.forEach(inst => {
            stats.instrumentosPorDepartamento[dept][inst] = 
              (stats.instrumentosPorDepartamento[dept][inst] || 0) + 1;
          });
        }
        
        if (data.generosMusicales) {
          if (!stats.generosPorDepartamento[dept]) {
            stats.generosPorDepartamento[dept] = {};
          }
          data.generosMusicales.forEach(genero => {
            stats.generosPorDepartamento[dept][genero] = 
              (stats.generosPorDepartamento[dept][genero] || 0) + 1;
          });
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas por departamento:', error);
      throw error;
    }
  }

  async getEstadisticasPorMunicipio(municipioId = null) {
    try {
      const usuarios = collection(db, 'usuarios');
      let q = query(usuarios);
      
      if (municipioId) {
        q = query(usuarios, where('municipio', '==', municipioId));
      }
      
      const snapshot = await getDocs(q);
      const stats = {
        totalUsuarios: 0,
        usuariosPorMunicipio: {},
        instrumentosPorMunicipio: {},
        generosPorMunicipio: {}
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const mun = data.municipio || 'Sin especificar';
        
        stats.totalUsuarios++;
        stats.usuariosPorMunicipio[mun] = (stats.usuariosPorMunicipio[mun] || 0) + 1;
        
        if (data.instrumentos) {
          if (!stats.instrumentosPorMunicipio[mun]) {
            stats.instrumentosPorMunicipio[mun] = {};
          }
          data.instrumentos.forEach(inst => {
            stats.instrumentosPorMunicipio[mun][inst] = 
              (stats.instrumentosPorMunicipio[mun][inst] || 0) + 1;
          });
        }
        
        if (data.generosMusicales) {
          if (!stats.generosPorMunicipio[mun]) {
            stats.generosPorMunicipio[mun] = {};
          }
          data.generosMusicales.forEach(genero => {
            stats.generosPorMunicipio[mun][genero] = 
              (stats.generosPorMunicipio[mun][genero] || 0) + 1;
          });
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas por municipio:', error);
      throw error;
    }
  }

  async getEstadisticasPorInstrumento() {
    try {
      const usuarios = collection(db, 'usuarios');
      const snapshot = await getDocs(usuarios);
      
      const stats = {
        totalInstrumentos: 0,
        instrumentos: {},
        usuariosPorInstrumento: {}
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.instrumentos && Array.isArray(data.instrumentos)) {
          data.instrumentos.forEach(inst => {
            stats.totalInstrumentos++;
            stats.instrumentos[inst] = (stats.instrumentos[inst] || 0) + 1;
            
            if (!stats.usuariosPorInstrumento[inst]) {
              stats.usuariosPorInstrumento[inst] = [];
            }
            stats.usuariosPorInstrumento[inst].push({
              id: doc.id,
              nombre: data.nombre || 'Sin nombre',
              ubicacion: data.municipio || data.departamento || 'Sin ubicación'
            });
          });
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas por instrumento:', error);
      throw error;
    }
  }

  async getEstadisticasPorGeneroMusical() {
    try {
      const usuarios = collection(db, 'usuarios');
      const snapshot = await getDocs(usuarios);
      
      const stats = {
        totalGeneros: 0,
        generos: {},
        usuariosPorGenero: {}
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.generosMusicales && Array.isArray(data.generosMusicales)) {
          data.generosMusicales.forEach(genero => {
            stats.totalGeneros++;
            stats.generos[genero] = (stats.generos[genero] || 0) + 1;
            
            if (!stats.usuariosPorGenero[genero]) {
              stats.usuariosPorGenero[genero] = [];
            }
            stats.usuariosPorGenero[genero].push({
              id: doc.id,
              nombre: data.nombre || 'Sin nombre',
              ubicacion: data.municipio || data.departamento || 'Sin ubicación'
            });
          });
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas por género musical:', error);
      throw error;
    }
  }

  async getEstadisticasEventos(filtros = {}) {
    try {
      const eventos = collection(db, 'eventos');
      let q = query(eventos);
      
      if (filtros.ciudad) {
        q = query(eventos, where('ciudad', '==', filtros.ciudad));
      }
      if (filtros.departamento) {
        q = query(eventos, where('departamento', '==', filtros.departamento));
      }
      
      const snapshot = await getDocs(q);
      
      const stats = {
        totalEventos: 0,
        eventosPorCiudad: {},
        eventosPorDepartamento: {},
        totalAsistentes: 0,
        asistentesPorCiudad: {},
        asistentesPorEvento: {},
        reaccionesPorCiudad: {},
        reaccionesPorEvento: {},
        eventosPorFecha: {}
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const ciudad = data.ciudad || 'Sin especificar';
        const dept = data.departamento || 'Sin especificar';
        
        stats.totalEventos++;
        stats.eventosPorCiudad[ciudad] = (stats.eventosPorCiudad[ciudad] || 0) + 1;
        stats.eventosPorDepartamento[dept] = (stats.eventosPorDepartamento[dept] || 0) + 1;
        
        const numAsistentes = data.asistentes?.length || 0;
        stats.totalAsistentes += numAsistentes;
        stats.asistentesPorCiudad[ciudad] = (stats.asistentesPorCiudad[ciudad] || 0) + numAsistentes;
        stats.asistentesPorEvento[doc.id] = {
          nombre: data.nombre || 'Sin nombre',
          asistentes: numAsistentes,
          ciudad: ciudad
        };
        
        const numReacciones = data.reacciones ? Object.keys(data.reacciones).length : 0;
        stats.reaccionesPorCiudad[ciudad] = (stats.reaccionesPorCiudad[ciudad] || 0) + numReacciones;
        stats.reaccionesPorEvento[doc.id] = {
          nombre: data.nombre || 'Sin nombre',
          reacciones: numReacciones,
          ciudad: ciudad
        };
        
        if (data.fecha) {
          const fecha = data.fecha.toDate ? data.fecha.toDate() : new Date(data.fecha);
          const fechaKey = fecha.toISOString().split('T')[0];
          stats.eventosPorFecha[fechaKey] = (stats.eventosPorFecha[fechaKey] || 0) + 1;
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de eventos:', error);
      throw error;
    }
  }

  async getEstadisticasPublicaciones(filtros = {}) {
    try {
      const publicaciones = collection(db, 'publicaciones');
      let q = query(publicaciones);
      
      if (filtros.tipo) {
        q = query(publicaciones, where('tipo', '==', filtros.tipo));
      }
      
      const snapshot = await getDocs(q);
      
      const stats = {
        totalPublicaciones: 0,
        publicacionesPorTipo: {},
        reaccionesPorTipo: {},
        reaccionesPorPublicacion: {},
        comentariosPorPublicacion: {},
        publicacionesPorUsuario: {}
      };
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const tipo = data.tipo || 'general';
        
        stats.totalPublicaciones++;
        stats.publicacionesPorTipo[tipo] = (stats.publicacionesPorTipo[tipo] || 0) + 1;
        
        const numReacciones = data.reacciones ? Object.keys(data.reacciones).length : 0;
        stats.reaccionesPorTipo[tipo] = (stats.reaccionesPorTipo[tipo] || 0) + numReacciones;
        stats.reaccionesPorPublicacion[doc.id] = {
          tipo: tipo,
          reacciones: numReacciones,
          autor: data.autorId || 'Desconocido'
        };
        
        const numComentarios = data.comentarios?.length || 0;
        stats.comentariosPorPublicacion[doc.id] = {
          tipo: tipo,
          comentarios: numComentarios,
          autor: data.autorId || 'Desconocido'
        };
        
        const autorId = data.autorId || 'Desconocido';
        stats.publicacionesPorUsuario[autorId] = (stats.publicacionesPorUsuario[autorId] || 0) + 1;
      });
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de publicaciones:', error);
      throw error;
    }
  }

  async getEstadisticasUsuarios() {
    try {
      const usuarios = collection(db, 'usuarios');
      const snapshot = await getDocs(usuarios);
      
      const stats = {
        totalUsuarios: 0,
        usuariosPremium: 0,
        usuariosGratis: 0,
        usuariosPorTipo: {},
        usuariosPorDepartamento: {},
        usuariosPorMunicipio: {},
        usuariosActivos: 0,
        usuariosInactivos: 0
      };
      
      const ahora = new Date();
      const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        stats.totalUsuarios++;
        
        if (data.premium) {
          stats.usuariosPremium++;
        } else {
          stats.usuariosGratis++;
        }
        
        const tipo = data.tipoCuenta || 'musico';
        stats.usuariosPorTipo[tipo] = (stats.usuariosPorTipo[tipo] || 0) + 1;
        
        const dept = data.departamento || 'Sin especificar';
        stats.usuariosPorDepartamento[dept] = (stats.usuariosPorDepartamento[dept] || 0) + 1;
        
        const mun = data.municipio || 'Sin especificar';
        stats.usuariosPorMunicipio[mun] = (stats.usuariosPorMunicipio[mun] || 0) + 1;
        
        if (data.ultimaActividad) {
          const ultimaActividad = data.ultimaActividad.toDate ? 
            data.ultimaActividad.toDate() : new Date(data.ultimaActividad);
          
          if (ultimaActividad >= hace30Dias) {
            stats.usuariosActivos++;
          } else {
            stats.usuariosInactivos++;
          }
        }
      });
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de usuarios:', error);
      throw error;
    }
  }

  async getEstadisticasProductos(filtros = {}) {
    try {
      const productos = collection(db, 'productos');
      let q = query(productos);
      
      if (filtros.estado) {
        q = query(productos, where('estado', '==', filtros.estado));
      }
      
      const snapshot = await getDocs(q);
      
      const stats = {
        totalProductos: 0,
        productosPorEstado: {},
        productosPorUbicacion: {},
        productosPorCategoria: {},
        valoracionPromedio: 0,
        totalValoraciones: 0,
        precioPromedio: 0,
        precioMinimo: Infinity,
        precioMaximo: 0,
        productosPorRangoPrecio: {
          '0-100000': 0,
          '100000-500000': 0,
          '500000-1000000': 0,
          '1000000+': 0
        }
      };
      
      let sumaValoraciones = 0;
      let sumaPrecio = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        
        stats.totalProductos++;
        
        const estado = data.estado || 'disponible';
        stats.productosPorEstado[estado] = (stats.productosPorEstado[estado] || 0) + 1;
        
        const ubicacion = data.ubicacion || data.ciudad || 'Sin especificar';
        stats.productosPorUbicacion[ubicacion] = (stats.productosPorUbicacion[ubicacion] || 0) + 1;
        
        const categoria = data.categoria || 'Sin categoría';
        stats.productosPorCategoria[categoria] = (stats.productosPorCategoria[categoria] || 0) + 1;
        
        if (data.valoracion) {
          sumaValoraciones += data.valoracion;
          stats.totalValoraciones++;
        }
        
        if (data.precio) {
          const precio = parseFloat(data.precio);
          sumaPrecio += precio;
          stats.precioMinimo = Math.min(stats.precioMinimo, precio);
          stats.precioMaximo = Math.max(stats.precioMaximo, precio);
          
          if (precio < 100000) {
            stats.productosPorRangoPrecio['0-100000']++;
          } else if (precio < 500000) {
            stats.productosPorRangoPrecio['100000-500000']++;
          } else if (precio < 1000000) {
            stats.productosPorRangoPrecio['500000-1000000']++;
          } else {
            stats.productosPorRangoPrecio['1000000+']++;
          }
        }
      });
      
      if (stats.totalValoraciones > 0) {
        stats.valoracionPromedio = sumaValoraciones / stats.totalValoraciones;
      }
      
      if (stats.totalProductos > 0) {
        stats.precioPromedio = sumaPrecio / stats.totalProductos;
      }
      
      if (stats.precioMinimo === Infinity) {
        stats.precioMinimo = 0;
      }
      
      return stats;
    } catch (error) {
      console.error('Error al obtener estadísticas de productos:', error);
      throw error;
    }
  }

  async getEstadisticasGenerales() {
    try {
      const [
        statsUsuarios,
        statsEventos,
        statsPublicaciones,
        statsInstrumentos,
        statsGeneros
      ] = await Promise.all([
        this.getEstadisticasUsuarios(),
        this.getEstadisticasEventos(),
        this.getEstadisticasPublicaciones(),
        this.getEstadisticasPorInstrumento(),
        this.getEstadisticasPorGeneroMusical()
      ]);
      
      return {
        usuarios: statsUsuarios,
        eventos: statsEventos,
        publicaciones: statsPublicaciones,
        instrumentos: statsInstrumentos,
        generos: statsGeneros,
        fechaGeneracion: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error al obtener estadísticas generales:', error);
      throw error;
    }
  }
}

export default new EstadisticasService();
