import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | SIP — Sistema de Préstamos Escolares',
    default: 'SIP — Sistema de Préstamos Escolares',
  },
  description:
    'Gestiona préstamos, automatiza devoluciones y permite que alumnos y docentes exploren el catálogo completo desde cualquier dispositivo.',
  keywords: ['biblioteca', 'préstamos', 'escolar', 'libros', 'catálogo'],
  authors: [{ name: 'SIP' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
