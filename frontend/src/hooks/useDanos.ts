'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Dano, SeveridadDano, TurnoAdmin } from '@/types';
import { api, toFrontendId, toBackendId } from '@/lib/api';

/* ────────────────────────────────────────
   useDanos — Registro de daños a libros vía API
 ──────────────────────────────────────── */

export interface NuevoDanoData {
  libroId: string;
  libroTitulo: string;
  copiaId: string;
  socioId: string;
  socioNombre: string;
  severidad: SeveridadDano;
  descripcion: string;
}

function mapDanoDto(dto: any): Dano {
  return {
    id:           toFrontendId('dano', dto.id),
    libroId:      toFrontendId('libro', dto.libro_id),
    libroTitulo:  dto.libro?.titulo ?? '',
    copiaId:      dto.copia_id ? toFrontendId('copia', dto.copia_id) : '',
    socioId:      toFrontendId('socio', dto.socio_id),
    socioNombre:  `${dto.socio?.apellido ?? ''}, ${dto.socio?.nombre ?? ''}`,
    severidad:    dto.severidad as SeveridadDano,
    descripcion:  dto.descripcion,
    fecha:        dto.fecha ?? new Date().toISOString(),
    turnoAdmin:   (dto.turno === 'mañana' ? 'Turno Mañana' : 'Turno Tarde') as TurnoAdmin,
  };
}

export function useDanos(
  turnoAdmin: TurnoAdmin,
  registrarAccion: (cat: 'Daños', accion: string, desc: string, turno: TurnoAdmin) => void,
  onCopiaEstado: (libroId: string, copiaId: string, estado: 'dañado' | 'disponible') => void
) {
  const [danos, setDanos] = useState<Dano[]>([]);

  /* ── Cargar ── */
  const cargarDanos = useCallback(async () => {
    try {
      const dtos = await api.getDanos();
      setDanos(dtos.map(mapDanoDto));
    } catch (err) {
      console.error('[useDanos] Error cargando daños:', err);
    }
  }, []);

  useEffect(() => {
    cargarDanos();
  }, [cargarDanos]);

  /* ── Registrar daño ── */
  const registrarDano = useCallback(
    async (data: NuevoDanoData): Promise<Dano | null> => {
      try {
        const dto = await api.createDano({
          libro_id: toBackendId(data.libroId),
          copia_id: data.copiaId ? toBackendId(data.copiaId) : undefined,
          socio_id: toBackendId(data.socioId),
          severidad: data.severidad,
          descripcion: data.descripcion,
          fecha: new Date().toISOString(),
          turno: turnoAdmin === 'Turno Mañana' ? 'mañana' : 'tarde',
        });

        const nuevo = mapDanoDto(dto);

        setDanos((prev) => [nuevo, ...prev]);

        // Si el daño es catastrófico, la copia queda fuera de circulación
        if (data.severidad === 'catastrofico' && data.copiaId) {
          void onCopiaEstado(data.libroId, data.copiaId, 'dañado');
        }

        registrarAccion(
          'Daños',
          'Reporte de Daño Físico',
          `Registrado daño [${severidadLabel(data.severidad)}] a "${data.libroTitulo}" atribuido a ${data.socioNombre}. Detalle: ${data.descripcion}`,
          turnoAdmin
        );

        return nuevo;
      } catch (err) {
        console.error('[useDanos] Error registrando daño:', err);
        return null;
      }
    },
    [turnoAdmin, registrarAccion, onCopiaEstado]
  );

  return { danos, registrarDano, recargarDanos: cargarDanos };
}

/* ── Helper local ── */
function severidadLabel(s: SeveridadDano): string {
  switch (s) {
    case 'leve':        return 'Daño Leve';
    case 'moderado':    return 'Daño Moderado';
    case 'catastrofico': return 'CATASTRÓFICO';
  }
}