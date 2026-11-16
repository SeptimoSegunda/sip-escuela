/**
 * SIPnr — Utilidades compartidas
 * Funciones reutilizables entre componentes y hooks
 */

import type { SeveridadDano, EstadoSocio, EstadoCopia } from '@/types';
import type { BadgeVariant } from '@/components/dashboard/ui/Badge';

/* ── Formateo de fechas ── */
export function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatFechaHora(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

/* ── Severidad/Daño ── */
export function ordenSeveridad(s: SeveridadDano): number {
  return s === 'catastrofico' ? 3 : s === 'moderado' ? 2 : 1;
}

export function severidadLabel(s: SeveridadDano): string {
  switch (s) {
    case 'leve': return 'Daño Leve';
    case 'moderado': return 'Daño Moderado';
    case 'catastrofico': return 'CATASTRÓFICO';
    default: return 'Desconocido';
  }
}

export function severidadToBadge(s: SeveridadDano): BadgeVariant {
  switch (s) {
    case 'leve': return 'available';
    case 'moderado': return 'warning';
    case 'catastrofico': return 'low';
    default: return 'neutral';
  }
}

/* ── Estado socio ── */
export function estadoSocioToBadge(estado: EstadoSocio): BadgeVariant {
  switch (estado) {
    case 'activo': return 'available';
    case 'suspendido': return 'low';
    case 'inactivo': return 'neutral';
  }
}

export function estadoSocioLabel(estado: EstadoSocio): string {
  switch (estado) {
    case 'activo': return 'Activo';
    case 'suspendido': return 'Suspendido';
    case 'inactivo': return 'Inactivo';
  }
}

/* ── Estado copia ── */
export function estadoCopiaToBadge(estado: EstadoCopia): BadgeVariant {
  switch (estado) {
    case 'disponible': return 'available';
    case 'prestado': return 'borrowed';
    case 'dañado': return 'low';
    case 'perdido': return 'neutral';
  }
}

export function estadoPrestamoToBadge(estado: 'prestado' | 'devuelto' | 'moroso'): BadgeVariant {
  if (estado === 'prestado') return 'borrowed';
  if (estado === 'moroso') return 'low';
  return 'available';
}

export function estadoPrestamoLabel(estado: 'prestado' | 'devuelto' | 'moroso'): string {
  if (estado === 'prestado') return 'Activo';
  if (estado === 'moroso') return 'Moroso';
  return 'Devuelto';
}