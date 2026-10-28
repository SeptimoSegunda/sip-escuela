'use client';

import { useState, useCallback, useEffect } from 'react';
import type { AuditLog, CategoriaAudit, TurnoAdmin } from '@/types';
import { api } from '@/lib/api';

/* ────────────────────────────────────────
   useAuditoria — Log de auditoría vía API
 ──────────────────────────────────────── */

function turnoToAdmin(turno: string): TurnoAdmin {
  return turno === 'tarde' ? 'Turno Tarde' : 'Turno Mañana';
}

function categoriaDeEndpoint(endpoint: string): CategoriaAudit {
  const e = (endpoint ?? '').toLowerCase();
  if (e.includes('libro')) return 'Libros';
  if (e.includes('prestamo')) return 'Préstamos';
  if (e.includes('socio')) return 'Socios';
  if (e.includes('dano')) return 'Daños';
  return 'Sistema';
}

function mapAuditoriaDto(dto: any): AuditLog {
  return {
    id:        `LOG-${dto.id ?? Date.now()}`,
    fecha:     dto.created_at ?? new Date().toISOString(),
    admin:     turnoToAdmin(dto.turno ?? 'mañana'),
    categoria: categoriaDeEndpoint(dto.endpoint ?? ''),
    accion:    dto.metodo ?? '',
    descripcion: `${dto.metodo ?? ''} ${dto.endpoint ?? ''} — turno ${dto.turno ?? '-'}`,
  };
}

export function useAuditoria() {
  const [logs, setLogs] = useState<AuditLog[]>([]);

  /* ── Cargar ── */
  const cargarLogs = useCallback(async () => {
    try {
      const dtos = await api.getAuditoria();
      setLogs(dtos.map(mapAuditoriaDto));
    } catch (err) {
      console.error('[useAuditoria] Error cargando auditoría:', err);
    }
  }, []);

  useEffect(() => {
    cargarLogs();
  }, [cargarLogs]);

  const exportarJson = useCallback(() => {
    const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const a = document.createElement('a');
    a.href = data;
    a.download = `auditoria_sip_${Date.now()}.json`;
    a.click();
  }, [logs]);

  return { logs, registrarAccion: () => {}, exportarJson, recargarAuditoria: cargarLogs };
}