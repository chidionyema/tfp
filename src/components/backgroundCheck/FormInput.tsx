// File: src/components/backgroundCheck/FormInput.tsx
// Purpose: Reusable form input component

import React from 'react';

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
}

export const FormInput: React.FC<FormInputProps> = ({ 
  id, 
  label, 
  type = "text", 
  value, 
  onChange, 
  error, 
  placeholder, 
  maxLength, 
  required = false 
}) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
        error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
      }`}
      placeholder={placeholder}
      maxLength={maxLength}
    />
    {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
  </div>
);