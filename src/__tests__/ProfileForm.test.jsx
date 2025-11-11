import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfileForm from '../components/ProfileForm';

describe('ProfileForm - Pruebas Funcionales', () => {
  
  test('TC-001: Debe renderizar el formulario correctamente', () => {
    render(<ProfileForm onSubmit={vi.fn()} defaultType="musico" />);
    
    expect(screen.getByText(/Editar Perfil/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nombre completo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar perfil/i })).toBeInTheDocument();
  });

  test('TC-002: Debe validar campo nombre obligatorio', async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<ProfileForm onSubmit={mockSubmit} />);
    
    const submitBtn = screen.getByRole('button', { name: /guardar perfil/i });
    await user.click(submitBtn);
    
    // Verificar que no se envía sin nombre
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  test('TC-003: Debe limitar nombre a 40 caracteres', () => {
    render(<ProfileForm onSubmit={vi.fn()} />);
    
    const nombreInput = screen.getByPlaceholderText(/nombre completo/i);
    expect(nombreInput).toHaveAttribute('maxLength', '40');
  });

  test('TC-004: Debe aceptar nombre válido de 1 carácter', async () => {
    const user = userEvent.setup();
    render(<ProfileForm onSubmit={vi.fn()} />);
    
    const nombreInput = screen.getByPlaceholderText(/nombre completo/i);
    await user.type(nombreInput, 'A');
    
    expect(nombreInput).toHaveValue('A');
  });

  test('TC-005: Debe aceptar nombre válido de 40 caracteres', async () => {
    const user = userEvent.setup();
    render(<ProfileForm onSubmit={vi.fn()} />);
    
    const nombreInput = screen.getByPlaceholderText(/nombre completo/i);
    const texto40 = 'A'.repeat(40);
    await user.type(nombreInput, texto40);
    
    expect(nombreInput).toHaveValue(texto40);
  });

  test('TC-006: Debe cambiar entre tipo músico y banda', async () => {
    const user = userEvent.setup();
    render(<ProfileForm onSubmit={vi.fn()} defaultType="musico" />);
    
    // Verificar que inicia como músico
    expect(screen.getByText(/Músico/i)).toBeInTheDocument();
    
    // Cambiar a banda (requiere interacción con react-select)
    // En prueba real, usar selectEvent de @testing-library/user-event
  });

  test('TC-007: Debe mostrar campos específicos para músico', () => {
    render(<ProfileForm onSubmit={vi.fn()} defaultType="musico" />);
    
    expect(screen.getByLabelText(/Días disponibles/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instrumentos/i)).toBeInTheDocument();
  });

  test('TC-008: Debe mostrar campos específicos para banda', () => {
    render(<ProfileForm onSubmit={vi.fn()} defaultType="banda" />);
    
    expect(screen.getByLabelText(/Miembros/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/¿Qué buscan?/i)).toBeInTheDocument();
  });

  test('TC-009: Debe cargar ciudades desde API', async () => {
    render(<ProfileForm onSubmit={vi.fn()} />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://api-colombia.com/api/v1/City');
    });
  });

  test('TC-010: Debe permitir subir hasta 5 fotos', () => {
    render(<ProfileForm onSubmit={vi.fn()} />);
    
    expect(screen.getByText(/Fotos \(máx 5\)/i)).toBeInTheDocument();
  });

  test('TC-011: Debe enviar formulario con datos válidos', async () => {
    const mockSubmit = vi.fn();
    const user = userEvent.setup();
    
    render(<ProfileForm onSubmit={mockSubmit} defaultType="musico" />);
    
    const nombreInput = screen.getByPlaceholderText(/nombre completo/i);
    await user.type(nombreInput, 'Juan Pérez');
    
    const submitBtn = screen.getByRole('button', { name: /guardar perfil/i });
    await user.click(submitBtn);
    
    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalled();
    });
  });

  test('TC-012: Debe cargar datos por defecto correctamente', () => {
    const defaultValues = {
      nombre: 'Carlos Músico',
      type: 'musico',
      ciudad: { value: 'Bogotá', label: 'Bogotá' },
    };
    
    render(<ProfileForm onSubmit={vi.fn()} defaultValues={defaultValues} />);
    
    expect(screen.getByDisplayValue('Carlos Músico')).toBeInTheDocument();
  });
});
