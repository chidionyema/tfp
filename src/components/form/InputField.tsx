// src/components/form/InputField.tsx
import type { ReactNode } from 'react';

export interface InputFieldProps {
  /** Visible label text */
  label: string;
  /** Adds the red “*” and aria-required */
  required?: boolean;
  /** Validation error message */
  error?: string;
  /** Unique id passed to the underlying input / textarea */
  id?: string;
  /** The actual form control (input, textarea, select…) */
  children: ReactNode;
}

/**
 * Generic labelled form-control wrapper
 * – zero business logic, pure layout & a11y.
 */
export default function InputField({
  label,
  required,
  error,
  children,
  id,
}: InputFieldProps) {
  const errorId = id && error ? `${id}-error-desc` : undefined;

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2"
      >
        {label}{' '}
        {required && (
          <span className="text-red-500" aria-label="required">
            *
          </span>
        )}
      </label>

      {children}

      {error && (
        <p
          id={errorId}
          className="text-red-500 text-xs mt-1"
          role="status"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
