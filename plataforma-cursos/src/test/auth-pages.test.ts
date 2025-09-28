import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { PasswordResetForm } from '../components/auth/PasswordResetForm';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(() => null),
  }),
}));

// Mock fetch
global.fetch = vi.fn();

describe('Authentication Pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('LoginForm', () => {
    it('should render login form with all required fields', () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <LoginForm onSubmit={mockOnSubmit} />
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      expect(screen.getByText(/esqueceu sua senha/i)).toBeInTheDocument();
      expect(screen.getByText(/não tem uma conta/i)).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <LoginForm onSubmit={mockOnSubmit} />
      );

      const submitButton = screen.getByRole('button', { name: /entrar/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <LoginForm onSubmit={mockOnSubmit} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit form with valid data', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      
      render(
        <LoginForm onSubmit={mockOnSubmit} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should display error message', () => {
      const mockOnSubmit = vi.fn();
      const errorMessage = 'Credenciais inválidas';
      
      render(
        <LoginForm onSubmit={mockOnSubmit} error={errorMessage} />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show loading state', () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <LoginForm onSubmit={mockOnSubmit} loading={true} />
      );

      expect(screen.getByText(/entrando/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled();
    });
  });

  describe('RegisterForm', () => {
    it('should render register form with all required fields', () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <RegisterForm onSubmit={mockOnSubmit} />
      );

      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/aceito os termos/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar conta grátis/i })).toBeInTheDocument();
      expect(screen.getByText(/já tem uma conta/i)).toBeInTheDocument();
    });

    it('should validate all required fields', async () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <RegisterForm onSubmit={mockOnSubmit} />
      );

      const submitButton = screen.getByRole('button', { name: /criar conta grátis/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
        expect(screen.getByText(/senha é obrigatória/i)).toBeInTheDocument();
        expect(screen.getByText(/confirmação de senha é obrigatória/i)).toBeInTheDocument();
        expect(screen.getByText(/você deve aceitar os termos/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should validate password confirmation', async () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <RegisterForm onSubmit={mockOnSubmit} />
      );

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^senha$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const termsCheckbox = screen.getByLabelText(/aceito os termos/i);
      const submitButton = screen.getByRole('button', { name: /criar conta grátis/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different-password' } });
      fireEvent.click(termsCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit form with valid data', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      
      render(
        <RegisterForm onSubmit={mockOnSubmit} />
      );

      const nameInput = screen.getByLabelText(/nome completo/i);
      const emailInput = screen.getByLabelText(/^email$/i);
      const passwordInput = screen.getByLabelText(/^senha$/i);
      const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
      const termsCheckbox = screen.getByLabelText(/aceito os termos/i);
      const submitButton = screen.getByRole('button', { name: /criar conta grátis/i });

      fireEvent.change(nameInput, { target: { value: 'Test User' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(termsCheckbox);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      });
    });

    it('should show trial information', () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <RegisterForm onSubmit={mockOnSubmit} />
      );

      expect(screen.getByText(/teste gratuito de 4 horas/i)).toBeInTheDocument();
      expect(screen.getByText(/r\$ 30,00\/mês/i)).toBeInTheDocument();
    });
  });

  describe('PasswordResetForm', () => {
    it('should render password reset form', () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <PasswordResetForm onSubmit={mockOnSubmit} />
      );

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /enviar link de recuperação/i })).toBeInTheDocument();
      expect(screen.getByText(/voltar para o login/i)).toBeInTheDocument();
    });

    it('should validate email field', async () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <PasswordResetForm onSubmit={mockOnSubmit} />
      );

      const submitButton = screen.getByRole('button', { name: /enviar link de recuperação/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/email é obrigatório/i)).toBeInTheDocument();
      });

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit form with valid email', async () => {
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      
      render(
        <PasswordResetForm onSubmit={mockOnSubmit} />
      );

      const emailInput = screen.getByLabelText(/email/i);
      const submitButton = screen.getByRole('button', { name: /enviar link de recuperação/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('should show success state', () => {
      const mockOnSubmit = vi.fn();
      
      render(
        <PasswordResetForm onSubmit={mockOnSubmit} success={true} />
      );

      expect(screen.getByText(/email enviado/i)).toBeInTheDocument();
      expect(screen.getByText(/enviar novamente/i)).toBeInTheDocument();
    });
  });
});

describe('Authentication Context', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should provide authentication context', () => {
    const TestComponent = () => {
      return <div>Test Component</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});