'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Socio, TurnoAdmin, EstadoSocio } from '@/types';
import { api, toFrontendId, toBackendId } from '@/lib/api';

/* ────────────────────────────────────────
   useSocios — CRUD completo de socios vía API
 ──────────────────────────────────────── */

export interface NuevoSocioData {
  apellido: string;
  nombre: string;
  tipo: Socio['tipo'];
  anio?: string;
  turno?: 'mañana' | 'tarde';
  email?: string;
}

function mapSocioDto(dto: any): Socio {
  return {
    id:               toFrontendId('socio', dto.id),
    apellido:         dto.apellido,
    nombre:           dto.nombre,
    tipo:             (dto.tipo ?? 'estudiante') as Socio['tipo'],
    anio:             dto.anio ?? undefined,
    turno:            dto.turno ?? undefined,
    email:            dto.email ?? undefined,
    estado:           'activo' as EstadoSocio,
    prestamosActivos: 0,
    fechaRegistro:    dto.created_at ?? new Date().toISOString(),
  };
}

export function useSocios(
  turnoAdmin: TurnoAdmin,
  registrarAccion: (cat: 'Socios', accion: string, desc: string, turno: TurnoAdmin) => void
) {
  const [socios, setSocios] = useState<Socio[]>([]);

  /* ── Cargar ── */
  const cargarSocios = useCallback(async () => {
    try {
      const dtos = await api.getSocios();
      setSocios(dtos.map(mapSocioDto));
    } catch (err) {
      console.error('[useSocios] Error cargando socios:', err);
    }
  }, []);

  useEffect(() => {
    cargarSocios();
  }, [cargarSocios]);

  /* ── Crear ── */
  const crearSocio = useCallback(
    async (data: NuevoSocioData): Promise<Socio | null> => {
      try {
        const dto = await api.createSocio({
          nombre: data.nombre,
          apellido: data.apellido,
          email: data.email ?? '',
          tipo: data.tipo,
          matricula: undefined,
          anio: data.anio,
          turno: data.turno,
        });

        const socio = mapSocioDto(dto);

        setSocios((prev) => [socio, ...prev]);

        registrarAccion(
          'Socios',
          'Nuevo Socio Registrado',
          `Registrado ${socio.tipo} ${socio.apellido}, ${socio.nombre} (ID: ${socio.id}).`,
          turnoAdmin
        );

        return socio;
      } catch (err) {
        console.error('[useSocios] Error creando socio:', err);
        return null;
      }
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Editar ── */
  const editarSocio = useCallback(
    async (id: string, cambios: Partial<Omit<Socio, 'id' | 'fechaRegistro'>>): Promise<void> => {
      const socioId = toBackendId(id);
      try {
        const dto = await api.updateSocio(socioId, {
          nombre: cambios.nombre,
          apellido: cambios.apellido,
          email: cambios.email,
          tipo: cambios.tipo,
          matricula: undefined,
          anio: cambios.anio,
          turno: cambios.turno,
        });

        setSocios((prev) => prev.map((s) => (s.id === id ? { ...s, ...mapSocioDto(dto) } : s)));

        const socio = mapSocioDto(dto);
        registrarAccion(
          'Socios',
          'Socio Modificado',
          `Actualizados datos de ${socio.apellido}, ${socio.nombre} (ID: ${id}).`,
          turnoAdmin
        );
      } catch (err) {
        console.error('[useSocios] Error editando socio:', err);
      }
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Cambiar estado ── */
  const cambiarEstado = useCallback(
    async (id: string, estado: EstadoSocio): Promise<void> => {
      await editarSocio(id, { estado });
    },
    [editarSocio]
  );

  /* ── Eliminar ── */
  const eliminarSocio = useCallback(
    async (id: string): Promise<void> => {
      try {
        const socio = socios.find((s) => s.id === id);
        await api.deleteSocio(toBackendId(id));

        setSocios((prev) => prev.filter((s) => s.id !== id));

        if (socio) {
          registrarAccion(
            'Socios',
            'Socio Eliminado',
            `Eliminado ${socio.tipo} ${socio.apellido}, ${socio.nombre} (ID: ${id}).`,
            turnoAdmin
          );
        }
      } catch (err) {
        console.error('[useSocios] Error eliminando socio:', err);
      }
    },
    [socios, turnoAdmin, registrarAccion]
  );

  /* ── Ajustar préstamos activos ── */
  const ajustarPrestamosActivos = useCallback(
    async (socioId: string, delta: 1 | -1): Promise<void> => {
      try {
        const socio = socios.find((s) => s.id === socioId);
        if (!socio) return;

        const nuevoActivos = Math.max(0, socio.prestamosActivos + delta);
        await api.updateSocio(toBackendId(socioId), {
          nombre: socio.nombre,
          apellido: socio.apellido,
          email: socio.email,
          tipo: socio.tipo,
          anio: socio.anio,
          turno: socio.turno,
        });

        setSocios((prev) =>
          prev.map((s) =>
            s.id === socioId ? { ...s, prestamosActivos: nuevoActivos } : s
          )
        );
      } catch (err) {
        console.error('[useSocios] Error ajustando préstamos activos:', err);
      }
    },
    [socios]
  );

  return {
    socios,
    crearSocio,
    editarSocio,
    cambiarEstado,
    eliminarSocio,
    ajustarPrestamosActivos,
    recargarSocios: cargarSocios,
  };
}