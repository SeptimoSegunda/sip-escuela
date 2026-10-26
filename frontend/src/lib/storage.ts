/**
 * SIPnr — Abstracción de localStorage
 *
 * Todas las lecturas/escrituras de datos pasan por aquí.
 * Si localStorage no está disponible (SSR) devuelve valores vacíos.
 */

const KEYS = {
  AUTH_USER:    'SIP_AUTH_USER',
  CURRENT_ADMIN:'SIP_CURRENT_ADMIN',
  AUTH_TIME:    'SIP_AUTH_TIME',
  LIBROS:       'SIP_LIBROS',
  SOCIOS:       'SIP_SOCIOS',
  PRESTAMOS:    'SIP_PRESTAMOS',
  DANOS:        'SIP_DANOS',
  AUDIT_LOG:    'SIP_AUDIT_LOG',
} as const;

export type StorageKey = keyof typeof KEYS;

/* ── Helpers ───────────────────────────────────────────────── */

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getItem<T>(key: (typeof KEYS)[StorageKey]): T | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: (typeof KEYS)[StorageKey], value: T): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('[SIPnr storage] Error al guardar:', key, err);
  }
}

export function removeItem(key: (typeof KEYS)[StorageKey]): void {
  if (!isBrowser()) return;
  localStorage.removeItem(key);
}

export function clearAll(): void {
  if (!isBrowser()) return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}

/* ── Getters / Setters tipados ─────────────────────────────── */
import type {
  Libro,
  Socio,
  Prestamo,
  Dano,
  AuditLog,
  SesionAdmin,
  TurnoAdmin,
} from '@/types';

// Auth
export const storage = {
  // Sesión
  getSession(): SesionAdmin | null {
    const usuario = getItem<string>(KEYS.AUTH_USER);
    const turno   = getItem<TurnoAdmin>(KEYS.CURRENT_ADMIN);
    const hora    = getItem<string>(KEYS.AUTH_TIME);
    if (!usuario || !turno) return null;
    return { usuario, turno, horaIngreso: hora ?? '' };
  },

  setSession(usuario: string, turno: TurnoAdmin): void {
    setItem(KEYS.AUTH_USER,     usuario);
    setItem(KEYS.CURRENT_ADMIN, turno);
    setItem(KEYS.AUTH_TIME,     new Date().toISOString());
  },

  clearSession(): void {
    removeItem(KEYS.AUTH_USER);
    removeItem(KEYS.CURRENT_ADMIN);
    removeItem(KEYS.AUTH_TIME);
  },

  isAuthenticated(): boolean {
    return isBrowser() && !!localStorage.getItem(KEYS.AUTH_USER);
  },

  // Libros
  getLibros():           Libro[]    { return getItem<Libro[]>(KEYS.LIBROS)    ?? []; },
  setLibros(v: Libro[]): void       { setItem(KEYS.LIBROS, v); },

  // Socios
  getSocios():           Socio[]    { return getItem<Socio[]>(KEYS.SOCIOS)    ?? []; },
  setSocios(v: Socio[]): void       { setItem(KEYS.SOCIOS, v); },

  // Préstamos
  getPrestamos():              Prestamo[] { return getItem<Prestamo[]>(KEYS.PRESTAMOS) ?? []; },
  setPrestamos(v: Prestamo[]): void       { setItem(KEYS.PRESTAMOS, v); },

  // Daños
  getDanos():          Dano[]   { return getItem<Dano[]>(KEYS.DANOS)   ?? []; },
  setDanos(v: Dano[]): void     { setItem(KEYS.DANOS, v); },

  // Auditoría
  getAuditLog():             AuditLog[] { return getItem<AuditLog[]>(KEYS.AUDIT_LOG) ?? []; },
  setAuditLog(v: AuditLog[]): void      { setItem(KEYS.AUDIT_LOG, v); },

  appendAuditLog(entry: AuditLog): void {
    const log = this.getAuditLog();
    log.unshift(entry); // más reciente primero
    setItem(KEYS.AUDIT_LOG, log);
  },
};
