'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/hooks/useAuth';

/**
 * Guard del lado cliente para la página de login.
 * Si ya hay una sesión activa, redirige al dashboard.
 */
export default function LoginPageGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const sesion = obtenerSesion();
    if (sesion) {
      router.replace('/dashboard');
    }
  }, [router]);

  return <>{children}</>;
}
