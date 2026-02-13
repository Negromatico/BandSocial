import { useState, useEffect, useCallback } from 'react';
import colombiaAPI from '../services/colombiaAPI';

export const useDepartamentos = () => {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarDepartamentos = async () => {
      try {
        setLoading(true);
        const data = await colombiaAPI.getDepartamentos();
        setDepartamentos(colombiaAPI.getDepartamentosFormateados(data));
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar departamentos:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDepartamentos();
  }, []);

  return { departamentos, loading, error };
};

export const useCiudades = (departamentoId = null) => {
  const [ciudades, setCiudades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!departamentoId) {
      setCiudades([]);
      return;
    }

    const cargarCiudades = async () => {
      try {
        setLoading(true);
        const data = await colombiaAPI.getCiudadesByDepartamento(departamentoId);
        setCiudades(colombiaAPI.getCiudadesFormateadas(data));
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar ciudades:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarCiudades();
  }, [departamentoId]);

  return { ciudades, loading, error };
};

export const useBuscarCiudad = () => {
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buscar = useCallback(async (nombre) => {
    if (!nombre || nombre.length < 2) {
      setResultados([]);
      return;
    }

    try {
      setLoading(true);
      const data = await colombiaAPI.searchCiudades(nombre);
      setResultados(colombiaAPI.getCiudadesFormateadas(data));
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error al buscar ciudad:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return { resultados, loading, error, buscar };
};

export const useDepartamento = (departamentoId) => {
  const [departamento, setDepartamento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!departamentoId) {
      setDepartamento(null);
      return;
    }

    const cargarDepartamento = async () => {
      try {
        setLoading(true);
        const data = await colombiaAPI.getDepartamentoById(departamentoId);
        setDepartamento(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar departamento:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarDepartamento();
  }, [departamentoId]);

  return { departamento, loading, error };
};

export const useCiudad = (ciudadId) => {
  const [ciudad, setCiudad] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ciudadId) {
      setCiudad(null);
      return;
    }

    const cargarCiudad = async () => {
      try {
        setLoading(true);
        const data = await colombiaAPI.getCiudadById(ciudadId);
        setCiudad(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error al cargar ciudad:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarCiudad();
  }, [ciudadId]);

  return { ciudad, loading, error };
};
