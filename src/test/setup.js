// Setup para Vitest
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// Limpiar después de cada prueba
afterEach(() => {
  cleanup();
});

// Mock de Firebase
vi.mock('../services/firebase', () => ({
  auth: {
    currentUser: { uid: 'test-uid', email: 'test@test.com' },
    onAuthStateChanged: vi.fn((callback) => {
      callback({ uid: 'test-uid', email: 'test@test.com' });
      return vi.fn();
    }),
  },
  db: {},
  storage: {},
}));

// Mock de Cloudinary
vi.mock('../services/cloudinary', () => ({
  uploadToCloudinary: vi.fn(() => Promise.resolve('https://fake-url.com/image.jpg')),
}));

// Mock de fetch para API Colombia
global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      { name: 'Bogotá' },
      { name: 'Medellín' },
      { name: 'Cali' },
    ]),
  })
);
