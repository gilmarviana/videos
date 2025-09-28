'use client';

import React from 'react';

interface ResponsiveFormProps {
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export function ResponsiveForm({ children, onSubmit, className = '' }: ResponsiveFormProps) {
  return (
    <form onSubmit={onSubmit} className={`form-responsive ${className}`}>
      {children}
    </form>
  );
}

interface ResponsiveInputProps {
  label: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  name?: string;
  autoComplete?: string;
  icon?: React.ReactNode;
}

export function ResponsiveInput({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  id,
  name,
  autoComplete,
  icon
}: ResponsiveInputProps) {
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 w-5 h-5">{icon}</span>
          </div>
        )}
        
        <input
          type={type}
          id={inputId}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete={autoComplete}
          className={`
            input-responsive
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
        />
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

interface ResponsiveTextareaProps {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  rows?: number;
  className?: string;
  id?: string;
  name?: string;
}

export function ResponsiveTextarea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  rows = 4,
  className = '',
  id,
  name
}: ResponsiveTextareaProps) {
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <textarea
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        rows={rows}
        className={`
          input-responsive resize-none
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
        `}
      />
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

interface ResponsiveSelectProps {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  name?: string;
}

export function ResponsiveSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  disabled = false,
  error,
  helperText,
  className = '',
  id,
  name
}: ResponsiveSelectProps) {
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={className}>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <select
        id={inputId}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`
          input-responsive
          ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
}

interface ResponsiveCheckboxProps {
  label: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  name?: string;
}

export function ResponsiveCheckbox({
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  helperText,
  className = '',
  id,
  name
}: ResponsiveCheckboxProps) {
  const inputId = id || name || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={className}>
      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            type="checkbox"
            id={inputId}
            name={name}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={`
              w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2
              ${error ? 'border-red-300' : ''}
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor={inputId} className={`font-medium text-gray-700 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
            {label}
          </label>
          {helperText && !error && (
            <p className="text-gray-500 mt-1">{helperText}</p>
          )}
          {error && (
            <p className="text-red-600 mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}