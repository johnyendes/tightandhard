'use client';

import { cn } from '@/lib/utils';
import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

// Minimal Tailwind form primitives. Styled to feel modern without shadcn install.

export function Label({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) {
  return (
    <label htmlFor={htmlFor} className={cn('block text-sm font-medium mb-1.5', className)}>
      {children}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full h-10 px-3 rounded-md border border-border bg-background text-sm',
        'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring',
        'placeholder:text-muted-foreground',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        'w-full px-3 py-2 rounded-md border border-border bg-background text-sm',
        'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring',
        'placeholder:text-muted-foreground min-h-[80px]',
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full h-10 px-3 rounded-md border border-border bg-background text-sm',
        'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Button({
  children,
  variant = 'primary',
  size = 'default',
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
}) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'h-8 px-3 text-xs', default: 'h-10 px-4 text-sm', lg: 'h-12 px-8 text-base' };
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:opacity-90',
    secondary: 'bg-secondary text-secondary-foreground hover:opacity-80',
    ghost: 'hover:bg-secondary',
    destructive: 'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button className={cn(base, sizes[size], variants[variant], className)} {...props}>
      {children}
    </button>
  );
}

export function FieldRow({ children, columns = 2 }: { children: React.ReactNode; columns?: 1 | 2 | 3 }) {
  const grid = columns === 1 ? '' : columns === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3';
  return <div className={cn('grid grid-cols-1 gap-4', grid)}>{children}</div>;
}
