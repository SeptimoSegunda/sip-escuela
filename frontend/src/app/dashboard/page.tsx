'use client';

/**
 * /dashboard — Wrapper con ssr:false.
 *
 * Se carga exclusivamente en el cliente porque:
 *  - Depende de localStorage para autenticación y datos.
 *  - Usa new Date() en el cuerpo del render (cálculo de morosidad),
 *    lo que Next.js 16 prohíbe en el prerender de Client Components.
 */
import dynamic from 'next/dynamic';

const DashboardClient = dynamic(() => import('./DashboardClient'), {
  ssr: false,
  loading: () => null,
});

export default function DashboardPage() {
  return <DashboardClient />;
}
