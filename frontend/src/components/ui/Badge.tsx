import React from 'react';
import { cn } from '../../utils/cn';

interface BadgeProps {
  variant?: 'brand' | 'accent' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'brand',
  children,
  className
}) => {
  const baseClasses = 'inline-flex items-center gap-1 rounded-pill px-3 py-1 text-xs font-medium';
  
  const variants = {
    brand: 'bg-brand-50 text-brand-700',
    accent: 'bg-accent-100 text-accent-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-yellow-50 text-yellow-800',
    error: 'bg-red-50 text-red-700',
    info: 'bg-blue-50 text-blue-700'
  };

  return (
    <span className={cn(baseClasses, variants[variant], className)}>
      {children}
    </span>
  );
};

export default Badge;