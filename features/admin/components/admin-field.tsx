import type { ReactNode } from 'react';

interface AdminFieldProps {
  children: ReactNode;
  label: string;
  required?: boolean;
}

export function AdminField({ children, label, required = false }: AdminFieldProps) {
  return (
    <div>
      <p className="mb-1 text-sm font-bold text-gray-600">
        {label}{required && <span className="ml-1 text-pink-500" aria-hidden>*</span>}
      </p>
      {children}
    </div>
  );
}
