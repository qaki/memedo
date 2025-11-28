import { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card = ({
  children,
  padding = 'md',
  className = '',
  hover = false,
  ...props
}: CardProps) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover
    ? 'transition-all duration-200 hover:shadow-large hover:-translate-y-1 cursor-pointer'
    : '';

  return (
    <div
      className={`bg-white rounded-xl border border-gray-100 shadow-soft ${paddingClasses[padding]} ${hoverClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
