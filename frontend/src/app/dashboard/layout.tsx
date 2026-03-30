// src/app/dashboard/layout.tsx — wrapper para páginas autenticadas
// Este layout envuelve todas las páginas del app principal
import AppLayout from '@/components/layout/AppLayout';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
