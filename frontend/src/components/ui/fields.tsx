import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from 'react';

interface FieldWrapperProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}

function FieldWrapper({ id, label, error, required, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-600">*</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

const controlClass =
  'rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function borderClass(error?: string): string {
  return error ? 'border-red-400' : 'border-gray-300';
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
}

export function TextField({ id, label, error, required, ...rest }: TextFieldProps) {
  return (
    <FieldWrapper id={id} label={label} error={error} required={required}>
      <input
        id={id}
        className={`${controlClass} ${borderClass(error)}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
        {...rest}
      />
    </FieldWrapper>
  );
}

interface TextAreaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  id: string;
  label: string;
  error?: string;
}

export function TextAreaField({ id, label, error, required, ...rest }: TextAreaFieldProps) {
  return (
    <FieldWrapper id={id} label={label} error={error} required={required}>
      <textarea
        id={id}
        className={`${controlClass} ${borderClass(error)}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
        {...rest}
      />
    </FieldWrapper>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}

export function SelectField({ id, label, error, required, children, ...rest }: SelectFieldProps) {
  return (
    <FieldWrapper id={id} label={label} error={error} required={required}>
      <select
        id={id}
        className={`${controlClass} ${borderClass(error)}`}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        required={required}
        {...rest}
      >
        {children}
      </select>
    </FieldWrapper>
  );
}
