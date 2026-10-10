import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs font-medium rounded-md gap-1.5',
    md: 'px-3.5 py-2 text-sm font-medium rounded-md gap-2',
    lg: 'px-5 py-2.5 text-base font-medium rounded-lg gap-2.5',
  }[size];

  const variantClasses = {
    primary: 'bg-copper text-white hover:bg-copper-hover active:bg-copper-dark shadow-sm border border-copper focus:ring-2 focus:ring-copper/20',
    secondary: 'bg-olive text-white hover:bg-olive-hover active:bg-olive-dark shadow-sm border border-olive focus:ring-2 focus:ring-olive/20',
    outline: 'bg-white text-charcoal border border-stone-300 hover:bg-stone-50 active:bg-stone-100 shadow-sm focus:ring-2 focus:ring-stone-200',
    ghost: 'bg-transparent text-charcoal-muted hover:text-charcoal hover:bg-stone-200/50',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm border border-red-600',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : icon}
      {children}
    </button>
  );
};
