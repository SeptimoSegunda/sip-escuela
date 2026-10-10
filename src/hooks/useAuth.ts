'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SIP_CURRENT_ADMIN_KEY = 'SIP_CURRENT_ADMIN';
const SIP_AUTH_USER_KEY = 'SIP_AUTH_USER';
const SIP_AUTH_TIME_KEY = 'SIP_AUTH_TIME';

export interface SesionAdmin {
  turno: string;
  usuario: string;
  horaIngreso: string;
}

/** Guarda la sesión en localStorage. */
export function guardarSesion(turno: string, usuario: string): void {
  localStorage.setItem(SIP_CURRENT_ADMIN_KEY, turno);
  localStorage.setItem(SIP_AUTH_USER_KEY, usuario);
  localStorage.setItem(SIP_AUTH_TIME_KEY, new Date().toISOString());
}

/** Obtiene la sesión activa, o null si no hay ninguna. */
export function obtenerSesion(): SesionAdmin | null {
  if (typeof window === 'undefined') return null;

  const turno = localStorage.getItem(SIP_CURRENT_ADMIN_KEY);
  const usuario = localStorage.getItem(SIP_AUTH_USER_KEY);
  const horaIngreso = localStorage.getItem(SIP_AUTH_TIME_KEY);

  if (!turno || !usuario || !horaIngreso) return null;
  return { turno, usuario, horaIngreso };
}

/** Cierra la sesión limpiando localStorage. */
export function cerrarSesion(): void {
  localStorage.removeItem(SIP_CURRENT_ADMIN_KEY);
  localStorage.removeItem(SIP_AUTH_USER_KEY);
  localStorage.removeItem(SIP_AUTH_TIME_KEY);
}

/**
 * Hook de guardia: redirige al login si no hay sesión activa.
 * Usar en páginas protegidas (dashboard).
 */
export function useRequireAuth(): SesionAdmin | null {
  const router = useRouter();
  const sesion = obtenerSesion();

  useEffect(() => {
    if (!sesion) {
      router.replace('/login');
    }
  }, [sesion, router]);

  return sesion;
}

/**
 * Hook de guardia inversa: redirige al dashboard si ya hay sesión.
 * Usar en la página de login.
 */
export function useRedirectIfAuth(): void {
  const router = useRouter();

  useEffect(() => {
    const sesion = obtenerSesion();
    if (sesion) {
      router.replace('/dashboard');
    }
  }, [router]);
}
