import axios from 'axios';

const BASE_URL = 'https://api-colombia.com/api/v1';

class ColombiaAPIService {
  async getDepartamentos() {
    try {
      const response = await axios.get(`${BASE_URL}/Department`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener departamentos:', error);
      throw error;
    }
  }

  async getDepartamentoById(id) {
    try {
      const response = await axios.get(`${BASE_URL}/Department/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener departamento ${id}:`, error);
      throw error;
    }
  }

  async getCiudadesByDepartamento(departamentoId) {
    try {
      const response = await axios.get(`${BASE_URL}/Department/${departamentoId}/cities`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener ciudades del departamento ${departamentoId}:`, error);
      throw error;
    }
  }

  async getAllCiudades() {
    try {
      const response = await axios.get(`${BASE_URL}/City`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener ciudades:', error);
      throw error;
    }
  }

  async getCiudadById(id) {
    try {
      const response = await axios.get(`${BASE_URL}/City/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error al obtener ciudad ${id}:`, error);
      throw error;
    }
  }

  async searchCiudades(nombre) {
    try {
      const response = await axios.get(`${BASE_URL}/City/name/${nombre}`);
      return response.data;
    } catch (error) {
      console.error(`Error al buscar ciudad ${nombre}:`, error);
      throw error;
    }
  }

  getDepartamentosFormateados(departamentos) {
    return departamentos
      .filter(dept => dept.name !== 'Bogotá' && dept.name !== 'Bogotá D.C.' && dept.name !== 'Bogotá, D.C.')
      .map(dept => ({
        value: dept.id,
        label: dept.name,
        capital: dept.cityCapital?.name || '',
        region: dept.regionId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  getCiudadesFormateadas(ciudades) {
    return ciudades
      .map(city => ({
        value: city.id,
        label: city.name,
        departamentoId: city.departmentId
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }
}

export default new ColombiaAPIService();
