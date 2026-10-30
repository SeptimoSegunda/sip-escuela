'use client';

import { useState, useCallback } from 'react';
import type { AuditLog, CategoriaAudit, TurnoAdmin } from '@/types';
import { storage } from '@/lib/storage';

/* ────────────────────────────────────────
   useAuditoria
   Hook base de auditoría — se llama desde
   los demás hooks para registrar acciones.
──────────────────────────────────────── */

function generarIdLog(): string {
  return `LOG-${Date.now().toString().slice(-6)}`;
}

export function useAuditoria() {
  const [logs, setLogs] = useState<AuditLog[]>(() => storage.getAuditLog());

  const registrarAccion = useCallback(
    (
      categoria: CategoriaAudit,
      accion: string,
      descripcion: string,
      turno: TurnoAdmin
    ) => {
      const entrada: AuditLog = {
        id:          generarIdLog(),
        fecha:       new Date().toISOString(),
        admin:       turno,
        categoria,
        accion,
        descripcion,
      };

      setLogs((prev) => {
        const actualizado = [entrada, ...prev];
        storage.setAuditLog(actualizado);
        return actualizado;
      });
    },
    []
  );

  const exportarJson = useCallback(() => {
    const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const a = document.createElement('a');
    a.href = data;
    a.download = `auditoria_sip_${Date.now()}.json`;
    a.click();
  }, [logs]);

  return { logs, registrarAccion, exportarJson };
}
