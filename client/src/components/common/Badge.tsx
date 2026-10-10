import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'copper' | 'olive' | 'stone' | 'outline' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'stone',
  size = 'md',
  className = ''
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs';

  const variantClasses = {
    copper: 'bg-copper-light text-copper-dark border border-copper-border font-medium',
    olive: 'bg-olive-light text-olive-dark border border-olive-border font-medium',
    stone: 'bg-stone-100 text-charcoal-muted border border-stone-200 font-medium',
    outline: 'bg-transparent text-charcoal-muted border border-stone-300 font-medium',
    danger: 'bg-red-50 text-red-700 border border-red-200 font-medium',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200 font-medium',
    info: 'bg-blue-50 text-blue-800 border border-blue-200 font-medium',
  }[variant];

  return (
    <span className={`inline-flex items-center rounded-full tracking-wide ${sizeClasses} ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};
