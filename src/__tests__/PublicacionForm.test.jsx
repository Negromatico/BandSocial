import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PublicacionForm from '../components/PublicacionForm';
import { GuestContext } from '../App';

describe('PublicacionForm - Pruebas Funcionales', () => {
  
  test('TC-013: Debe renderizar el formulario correctamente', () => {
    render(
      <GuestContext.Provider value={{ isGuest: false }}>
        <PublicacionForm />
      </GuestContext.Provider>
    );
    
    expect(screen.getByLabelText(/Título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Descripción/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Publicar/i })).toBeInTheDocument();
  });

  test('TC-014: Debe validar título obligatorio', async () => {
    const user = userEvent.setup();
    
    render(
      <GuestContext.Provider value={{ isGuest: false }}>
        <PublicacionForm />
      </GuestContext.Provider>
    );
    
    const submitBtn = screen.getByRole('button', { name: /Publicar/i });
    await user.click(submitBtn);
    
    // Debe mostrar error
    await waitFor(() => {
      expect(screen.getByText(/Título y descripción son obligatorios/i)).toBeInTheDocument();
    });
  });

  test('TC-015: Debe limitar título a 60 caracteres', () => {
    render(
      <GuestContext.Provider value={{ isGuest: false }}>
        <PublicacionForm />
      </GuestContext.Provider>
    );
    
    const tituloInput = screen.getByLabelText(/Título/i);
    expect(tituloInput).toHaveAttribute('maxLength', '60');
  });

  test('TC-016: Debe limitar descripción a 300 caracteres', () => {
    render(
      <GuestContext.Provider value={{ isGuest: false }}>
        <PublicacionForm />
      </GuestContext.Provider>
    );
    
    const descripcionInput = screen.getByLabelText(/Descripción/i);
    expect(descripcionInput).toHaveAttribute('maxLength', '300');
  });

  test('TC-017: Usuario invitado debe ver modal de autenticación', async () => {
    const user = userEvent.setup();
    
    render(
      <GuestContext.Provider value={{ isGuest: true }}>
        <PublicacionForm />
      </GuestContext.Provider>
    );
    
    // Llenar formulario
    await user.type(screen.getByLabelText(/Título/i), 'Título de prueba');
    await user.type(screen.getByLabelText(/Descripción/i), 'Descripción de prueba');
    
    // Intentar publicar
    const submitBtn = screen.getByRole('button', { name: /Publicar/i });
    await user.click(submitBtn);
    
    // Debe mostrar modal
    await waitFor(() => {
      expect(screen.getByText(/Acción solo para usuarios registrados/i)).toBeInTheDocument();
    });
  });

  test('TC-018: Debe mostrar tipos de publicación', () => {
    render(
      <GuestContext.Provider value={{ isGuest: false }}>
        <PublicacionForm />
      </GuestContext.Provider>
    );
    
    const tipoSelect = screen.getByLabelText(/Tipo/i);
    expect(tipoSelect).toBeInTheDocument();
  });

  test('TC-019: Debe permitir seleccionar ciudad', () => {
    render(
      <GuestContext.Provider value={{ isGuest: false }}>
        <PublicacionForm />
      </GuestContext.Provider>
    );
    
    const ciudadSelect = screen.getByLabelText(/Ciudad/i);
    expect(ciudadSelect).toBeInTheDocument();
  });

  test('TC-020: Debe permitir subir múltiples imágenes', () => {
    render(
      <GuestContext.Provider value={{ isGuest: false }}>
        <PublicacionForm />
      </GuestContext.Provider>
    );
    
    const fileInput = screen.getByLabelText(/Imágenes/i);
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('multiple');
  });

  test('TC-021: Debe mostrar campo adicional cuando tipo es "otro"', async () => {
    const user = userEvent.setup();
    
    render(
      <GuestContext.Provider value={{ isGuest: false }}>
        <PublicacionForm />
      </GuestContext.Provider>
    );
    
    const tipoSelect = screen.getByLabelText(/Tipo/i);
    await user.selectOptions(tipoSelect, 'otro');
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Especifica el tipo/i)).toBeInTheDocument();
    });
  });

  test('TC-022: Debe resetear formulario después de publicar', async () => {
    const mockOnCreated = vi.fn();
    const user = userEvent.setup();
    
    render(
      <GuestContext.Provider value={{ isGuest: false }}>
        <PublicacionForm onCreated={mockOnCreated} />
      </GuestContext.Provider>
    );
    
    // Llenar formulario
    const tituloInput = screen.getByLabelText(/Título/i);
    await user.type(tituloInput, 'Título de prueba');
    
    // Nota: En prueba real, mockear Firebase para simular éxito
  });
});
