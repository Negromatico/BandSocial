/**
 * Formatea un nombre para que tenga la primera letra en mayúscula
 * y el resto en minúsculas. Maneja múltiples palabras.
 * 
 * @param {string} text - El texto a formatear
 * @returns {string} - El texto formateado
 */
export const formatearNombre = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  // No aplicar trim mientras el usuario está escribiendo para permitir espacios
  return text
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

/**
 * Valida que un nombre no esté completamente en mayúsculas o minúsculas
 * 
 * @param {string} text - El texto a validar
 * @returns {boolean} - true si el formato es válido
 */
export const validarFormatoNombre = (text) => {
  if (!text || typeof text !== 'string') return false;
  
  const trimmed = text.trim();
  if (trimmed.length === 0) return false;
  
  // No permitir todo en mayúsculas
  if (trimmed === trimmed.toUpperCase()) return false;
  
  // No permitir todo en minúsculas (excepto si tiene una sola letra)
  if (trimmed.length > 1 && trimmed === trimmed.toLowerCase()) return false;
  
  return true;
};
