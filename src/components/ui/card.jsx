import React from 'react';
import { cn } from './utils';

export const Card = React.forwardRef(function Card({ className = '', ...props }, ref) {
  return <section ref={ref} className={cn('border border-slate-200 bg-white text-slate-900', className)} {...props} />;
});

export const CardHeader = React.forwardRef(function CardHeader({ className = '', ...props }, ref) {
  return <div ref={ref} className={cn('p-6', className)} {...props} />;
});

export const CardTitle = React.forwardRef(function CardTitle({ className = '', ...props }, ref) {
  return <h3 ref={ref} className={cn('text-base font-semibold tracking-tight', className)} {...props} />;
});

export const CardContent = React.forwardRef(function CardContent({ className = '', ...props }, ref) {
  return <div ref={ref} className={cn('px-6 pb-6', className)} {...props} />;
});
