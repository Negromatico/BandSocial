import { describe, test, expect } from 'vitest';
import { instrumentos } from '../data/opciones';

describe('opciones.js - Pruebas de Datos', () => {
  
  test('TC-023: Debe contener instrumentos básicos', () => {
    const valores = instrumentos.map(i => i.value);
    
    expect(valores).toContain('guitarra');
    expect(valores).toContain('bajo');
    expect(valores).toContain('bateria');
    expect(valores).toContain('voz');
    expect(valores).toContain('teclado');
  });

  test('TC-024: Todos los instrumentos deben tener value y label', () => {
    instrumentos.forEach(instrumento => {
      expect(instrumento).toHaveProperty('value');
      expect(instrumento).toHaveProperty('label');
      expect(typeof instrumento.value).toBe('string');
      expect(typeof instrumento.label).toBe('string');
      expect(instrumento.value.length).toBeGreaterThan(0);
      expect(instrumento.label.length).toBeGreaterThan(0);
    });
  });

  test('TC-025: Debe incluir opción "Otro"', () => {
    const tieneOtro = instrumentos.some(i => i.value === 'otro');
    expect(tieneOtro).toBe(true);
  });

  test('TC-026: No debe tener instrumentos duplicados', () => {
    const valores = instrumentos.map(i => i.value);
    const valoresUnicos = [...new Set(valores)];
    
    expect(valores.length).toBe(valoresUnicos.length);
  });

  test('TC-027: Debe tener al menos 20 instrumentos', () => {
    expect(instrumentos.length).toBeGreaterThanOrEqual(20);
  });

  test('TC-028: Labels deben estar capitalizados', () => {
    instrumentos.forEach(instrumento => {
      const primeraLetra = instrumento.label.charAt(0);
      expect(primeraLetra).toBe(primeraLetra.toUpperCase());
    });
  });
});
