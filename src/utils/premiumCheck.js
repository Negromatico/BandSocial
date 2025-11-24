/**
 * Verifica si un usuario tiene plan premium
 * @param {Object} perfil - Objeto del perfil del usuario desde Firestore
 * @returns {boolean} - true si el usuario es premium, false si no
 */
export const esPremium = (perfil) => {
  if (!perfil) return false;
  
  // Verificar ambos campos por compatibilidad
  return perfil.planActual === 'premium' || perfil.membershipPlan === 'premium';
};

/**
 * Verifica si un usuario tiene plan estándar/free
 * @param {Object} perfil - Objeto del perfil del usuario desde Firestore
 * @returns {boolean} - true si el usuario es estándar, false si no
 */
export const esEstandar = (perfil) => {
  return !esPremium(perfil);
};

/**
 * Obtiene el nombre del plan del usuario
 * @param {Object} perfil - Objeto del perfil del usuario desde Firestore
 * @returns {string} - 'premium' o 'estandar'
 */
export const obtenerPlan = (perfil) => {
  return esPremium(perfil) ? 'premium' : 'estandar';
};
