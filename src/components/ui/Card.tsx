import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClass = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8 sm:p-10',
};

export const Card: React.FC<CardProps> = ({ children, className = '', padding = 'md' }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgb(7_26_51_/_0.06)] ${paddingClass[padding]} ${className}`}>
    {children}
  </div>
);
