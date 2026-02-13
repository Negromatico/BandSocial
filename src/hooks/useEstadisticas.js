import { useState, useEffect, useCallback } from 'react';
import estadisticasService from '../services/estadisticasService';

export const useEstadisticas = (tipo = 'general', filtros = {}) => {
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargarEstadisticas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let resultado;
      
      switch (tipo) {
        case 'general':
          resultado = await estadisticasService.getEstadisticasGenerales();
          break;
        case 'departamento':
          resultado = await estadisticasService.getEstadisticasPorDepartamento(filtros.departamentoId);
          break;
        case 'municipio':
          resultado = await estadisticasService.getEstadisticasPorMunicipio(filtros.municipioId);
          break;
        case 'instrumentos':
          resultado = await estadisticasService.getEstadisticasPorInstrumento();
          break;
        case 'generos':
          resultado = await estadisticasService.getEstadisticasPorGeneroMusical();
          break;
        case 'eventos':
          resultado = await estadisticasService.getEstadisticasEventos(filtros);
          break;
        case 'publicaciones':
          resultado = await estadisticasService.getEstadisticasPublicaciones(filtros);
          break;
        case 'usuarios':
          resultado = await estadisticasService.getEstadisticasUsuarios();
          break;
        case 'productos':
          resultado = await estadisticasService.getEstadisticasProductos(filtros);
          break;
        default:
          throw new Error(`Tipo de estadística no válido: ${tipo}`);
      }
      
      setDatos(resultado);
    } catch (err) {
      setError(err.message);
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  }, [tipo, JSON.stringify(filtros)]);

  useEffect(() => {
    cargarEstadisticas();
  }, [cargarEstadisticas]);

  const refrescar = () => {
    cargarEstadisticas();
  };

  return { datos, loading, error, refrescar };
};

export const useEstadisticasDepartamento = (departamentoId) => {
  return useEstadisticas('departamento', { departamentoId });
};

export const useEstadisticasMunicipio = (municipioId) => {
  return useEstadisticas('municipio', { municipioId });
};

export const useEstadisticasInstrumentos = () => {
  return useEstadisticas('instrumentos');
};

export const useEstadisticasGeneros = () => {
  return useEstadisticas('generos');
};

export const useEstadisticasEventos = (filtros = {}) => {
  return useEstadisticas('eventos', filtros);
};

export const useEstadisticasPublicaciones = (filtros = {}) => {
  return useEstadisticas('publicaciones', filtros);
};

export const useEstadisticasUsuarios = () => {
  return useEstadisticas('usuarios');
};

export const useEstadisticasProductos = (filtros = {}) => {
  return useEstadisticas('productos', filtros);
};
