import { forwardRef, InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const inputClasses = `
      block w-full px-4 py-3
      border-2 rounded-lg 
      text-gray-900 placeholder-gray-400
      focus:outline-none focus:ring-2 focus:ring-offset-0
      transition-all duration-200
      disabled:bg-gray-100 disabled:cursor-not-allowed
      ${
        error
          ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200 bg-danger-50'
          : 'border-gray-300 focus:border-primary-500 focus:ring-primary-200 hover:border-gray-400'
      }
      ${className}
    `;

    return (
      <div className="w-full">
        {label && <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>}
        <input ref={ref} className={inputClasses} {...props} />
        {error && (
          <p className="mt-2 text-sm text-danger-600 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && <p className="mt-2 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
