import { useState, useEffect, type InputHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface FormInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  showValidation?: boolean;
  isValid?: boolean;
  onChange?: (value: string) => void;
  onValidate?: (value: string) => string | undefined;
}

export function FormInput({
  label,
  error,
  hint,
  icon,
  showValidation = false,
  isValid,
  onChange,
  onValidate,
  type = 'text',
  className = '',
  ...props
}: FormInputProps) {
  const [internalValue, setInternalValue] = useState(props.value || '');
  const [internalError, setInternalError] = useState<string | undefined>(error);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (error) setInternalError(error);
  }, [error]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInternalValue(value);
    
    if (onValidate && touched) {
      const validationError = onValidate(value);
      setInternalError(validationError);
    }
    
    onChange?.(value);
  };

  const handleBlur = () => {
    setTouched(true);
    if (onValidate) {
      const validationError = onValidate(internalValue as string);
      setInternalError(validationError);
    }
  };

  const hasError = touched && internalError;
  const isValidState = touched && !internalError && internalValue;
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`form-input-wrapper ${className}`}>
      {label && (
        <label className="form-input-label">
          {label}
          {props.required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className={`form-input-container ${hasError ? 'has-error' : ''} ${isValidState ? 'is-valid' : ''}`}>
        {icon && <span className="form-input-icon">{icon}</span>}
        
        <input
          {...props}
          type={inputType}
          value={internalValue}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`form-input ${icon ? 'has-icon' : ''} ${type === 'password' ? 'has-toggle' : ''}`}
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined
          }
        />
        
        {type === 'password' && (
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
        
        {showValidation && touched && (
          <span className="validation-icon">
            {hasError ? (
              <AlertCircle size={18} className="error-icon" />
            ) : isValidState ? (
              <CheckCircle size={18} className="success-icon" />
            ) : null}
          </span>
        )}
      </div>
      
      {hasError && (
        <div id={`${props.id}-error`} className="form-input-error" role="alert">
          <AlertCircle size={14} />
          <span>{internalError}</span>
        </div>
      )}
      
      {hint && !hasError && (
        <div id={`${props.id}-hint`} className="form-input-hint">
          {hint}
        </div>
      )}
    </div>
  );
}

interface FormTextareaProps extends Omit<InputHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  maxLength?: number;
  showCharCount?: boolean;
  onChange?: (value: string) => void;
  rows?: number;
}

export function FormTextarea({
  label,
  error,
  hint,
  maxLength,
  showCharCount = false,
  onChange,
  rows = 4,
  className = '',
  ...props
}: FormTextareaProps) {
  const [value, setValue] = useState(props.value || '');
  const [touched, setTouched] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    
    setValue(newValue);
    onChange?.(newValue);
  };

  const charCount = (value as string).length;
  const hasError = touched && error;

  return (
    <div className={`form-input-wrapper ${className}`}>
      {label && (
        <label className="form-input-label">
          {label}
          {props.required && <span className="required-indicator">*</span>}
        </label>
      )}
      
      <div className={`form-input-container ${hasError ? 'has-error' : ''}`}>
        <textarea
          {...(props as any)}
          rows={rows}
          value={value}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          className="form-textarea"
          aria-invalid={hasError ? 'true' : 'false'}
          aria-describedby={
            hasError ? `${props.id}-error` : hint ? `${props.id}-hint` : undefined
          }
        />
      </div>
      
      {showCharCount && maxLength && (
        <div className="char-count">
          {charCount} / {maxLength}
        </div>
      )}
      
      {hasError && (
        <div id={`${props.id}-error`} className="form-input-error" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
      
      {hint && !hasError && (
        <div id={`${props.id}-hint`} className="form-input-hint">
          {hint}
        </div>
      )}
    </div>
  );
}

export const validators = {
  required: (value: string) => !value?.trim() ? 'This field is required' : undefined,
  
  email: (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) ? 'Please enter a valid email address' : undefined;
  },
  
  phone: (value: string) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return !phoneRegex.test(value) ? 'Please enter a valid phone number' : undefined;
  },
  
  minLength: (min: number) => (value: string) => {
    return value.length < min ? `Must be at least ${min} characters` : undefined;
  },
  
  maxLength: (max: number) => (value: string) => {
    return value.length > max ? `Must be no more than ${max} characters` : undefined;
  },
  
  password: (value: string) => {
    if (value.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter';
    if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter';
    if (!/[0-9]/.test(value)) return 'Password must contain a number';
    return undefined;
  },
  
  number: (value: string) => {
    return isNaN(Number(value)) ? 'Please enter a valid number' : undefined;
  },
  
  positiveNumber: (value: string) => {
    const num = Number(value);
    return isNaN(num) || num <= 0 ? 'Please enter a positive number' : undefined;
  },
  
  combine: (...validators: Array<(value: string) => string | undefined>) => {
    return (value: string) => {
      for (const validator of validators) {
        const error = validator(value);
        if (error) return error;
      }
      return undefined;
    };
  },
};
