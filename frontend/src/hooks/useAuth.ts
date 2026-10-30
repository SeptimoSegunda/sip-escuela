'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setActiveTurno } from '@/lib/api';

export interface SesionAdmin {
  turno: string;
  usuario: string;
  horaIngreso: string;
}

/** Sesión en memoria (sin localStorage). Se pierde al recargar la página. */
let sessionState: SesionAdmin | null = null;

/** Normaliza el turno de la UI al valor que espera el header X-Active-Shift. */
function turnoParaHeader(turno: string): string {
  const t = turno.trim().toLowerCase();
  if (t.includes('mañana') || t.includes('manana')) return 'mañana';
  if (t.includes('tarde')) return 'tarde';
  return turno;
}

/** Guarda la sesión activa y configura el turno para las llamadas a la API. */
export function guardarSesion(turno: string, usuario: string): void {
  sessionState = { turno, usuario, horaIngreso: new Date().toISOString() };
  setActiveTurno(turnoParaHeader(turno));
}

/** Obtiene la sesión activa, o null si no hay ninguna. */
export function obtenerSesion(): SesionAdmin | null {
  return sessionState;
}

/** Cierra la sesión. */
export function cerrarSesion(): void {
  sessionState = null;
  setActiveTurno(null);
}

/**
 * Hook de guardia: redirige al login si no hay sesión activa.
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