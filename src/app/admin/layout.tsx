// src/app/admin/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Conexion 360 SAC',
  description: 'Panel de administración de Conexion 360 SAC',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}
