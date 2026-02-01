/**
 * FormInput Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '../utils';
import { FormInput, FormTextarea, validators } from '../../components/UI/FormInput';

describe('FormInput', () => {
  it('renders with label', () => {
    render(<FormInput label="Email" />);
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders required indicator', () => {
    render(<FormInput label="Email" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<FormInput label="Email" onChange={handleChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });
    
    expect(handleChange).toHaveBeenCalledWith('test@example.com');
  });

  it('shows error message', () => {
    render(<FormInput label="Email" error="Invalid email" />);
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('shows hint text', () => {
    render(<FormInput label="Email" hint="Enter your email address" />);
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    render(<FormInput label="Password" type="password" />);
    
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('type', 'password');
    
    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);
    
    expect(input).toHaveAttribute('type', 'text');
  });

  it('validates on blur when showValidation is true', async () => {
    const validateFn = vi.fn().mockReturnValue('Invalid');
    render(
      <FormInput 
        label="Email" 
        showValidation 
        onValidate={validateFn}
      />
    );
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test' } });
    fireEvent.blur(input);
    
    await waitFor(() => {
      expect(validateFn).toHaveBeenCalledWith('test');
    });
  });
});

describe('FormTextarea', () => {
  it('renders with label', () => {
    render(<FormTextarea label="Description" />);
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('shows character count when showCharCount is true', () => {
    render(<FormTextarea label="Description" showCharCount maxLength={100} value="Hello" />);
    expect(screen.getByText('5 / 100')).toBeInTheDocument();
  });

  it('calls onChange when value changes', () => {
    const handleChange = vi.fn();
    render(<FormTextarea label="Description" onChange={handleChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'Test description' } });
    
    expect(handleChange).toHaveBeenCalledWith('Test description');
  });
});

describe('validators', () => {
  describe('required', () => {
    it('returns error for empty string', () => {
      expect(validators.required('')).toBe('This field is required');
    });

    it('returns null for non-empty string', () => {
      expect(validators.required('test')).toBeNull();
    });
  });

  describe('email', () => {
    it('returns error for invalid email', () => {
      expect(validators.email('invalid')).toBe('Please enter a valid email address');
    });

    it('returns null for valid email', () => {
      expect(validators.email('test@example.com')).toBeNull();
    });
  });

  describe('phone', () => {
    it('returns error for invalid phone', () => {
      expect(validators.phone('123')).toBe('Please enter a valid phone number');
    });

    it('returns null for valid phone', () => {
      expect(validators.phone('+263 77 123 4567')).toBeNull();
    });
  });

  describe('minLength', () => {
    it('returns error for short string', () => {
      const validate = validators.minLength(5);
      expect(validate('abc')).toBe('Must be at least 5 characters');
    });

    it('returns null for long enough string', () => {
      const validate = validators.minLength(5);
      expect(validate('abcdef')).toBeNull();
    });
  });

  describe('maxLength', () => {
    it('returns error for long string', () => {
      const validate = validators.maxLength(5);
      expect(validate('abcdefgh')).toBe('Must be no more than 5 characters');
    });

    it('returns null for short enough string', () => {
      const validate = validators.maxLength(5);
      expect(validate('abc')).toBeNull();
    });
  });

  describe('combine', () => {
    it('returns first error from combined validators', () => {
      const validate = validators.combine(validators.required, validators.email);
      expect(validate('')).toBe('This field is required');
    });

    it('returns null when all validators pass', () => {
      const validate = validators.combine(validators.required, validators.email);
      expect(validate('test@example.com')).toBeNull();
    });
  });
});
