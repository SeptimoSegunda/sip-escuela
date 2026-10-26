'use client';

import { useState, useCallback } from 'react';
import type { Dano, SeveridadDano, TurnoAdmin } from '@/types';
import { storage } from '@/lib/storage';

/* ────────────────────────────────────────
   useDanos — Registro de daños a libros
──────────────────────────────────────── */

function generarIdDano(danos: Dano[]): string {
  const nums = danos
    .map((d) => parseInt(d.id.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 1000;
  return `#D-${max + 1}`;
}

export interface NuevoDanoData {
  libroId: string;
  libroTitulo: string;
  copiaId: string;
  socioId: string;
  socioNombre: string;
  severidad: SeveridadDano;
  descripcion: string;
}

export function useDanos(
  turnoAdmin: TurnoAdmin,
  registrarAccion: (cat: 'Daños', accion: string, desc: string, turno: TurnoAdmin) => void,
  onCopiaEstado: (libroId: string, copiaId: string, estado: 'dañado' | 'disponible') => void
) {
  const [danos, setDanos] = useState<Dano[]>(() => storage.getDanos());

  /* ── Registrar daño ── */
  const registrarDano = useCallback(
    (data: NuevoDanoData): Dano => {
      const actual = storage.getDanos();
      const nuevo: Dano = {
        id:          generarIdDano(actual),
        libroId:     data.libroId,
        libroTitulo: data.libroTitulo,
        copiaId:     data.copiaId,
        socioId:     data.socioId,
        socioNombre: data.socioNombre,
        severidad:   data.severidad,
        descripcion: data.descripcion,
        fecha:       new Date().toISOString(),
        turnoAdmin,
      };

      const actualizado = [nuevo, ...actual];
      storage.setDanos(actualizado);
      setDanos(actualizado);

      // Si el daño es catastrófico, la copia queda fuera de circulación
      if (data.severidad === 'catastrofico') {
        onCopiaEstado(data.libroId, data.copiaId, 'dañado');
      }

      registrarAccion(
        'Daños',
        'Reporte de Daño Físico',
        `Registrado daño [${severidadLabel(data.severidad)}] a "${data.libroTitulo}" atribuido a ${data.socioNombre}. Detalle: ${data.descripcion}`,
        turnoAdmin
      );

      return nuevo;
    },
    [turnoAdmin, registrarAccion, onCopiaEstado]
  );

  return { danos, registrarDano };
}

/* ── Helper local ── */
function severidadLabel(s: SeveridadDano): string {
  switch (s) {
    case 'leve':        return 'Daño Leve';
    case 'moderado':    return 'Daño Moderado';
    case 'catastrofico': return 'CATASTRÓFICO';
  }
}
