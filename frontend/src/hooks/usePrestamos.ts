'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Prestamo, Libro, Socio, TurnoAdmin, SeveridadDano } from '@/types';
import { api, toFrontendId, toBackendId } from '@/lib/api';

/* ────────────────────────────────────────
   usePrestamos — Préstamos y devoluciones vía API
 ──────────────────────────────────────── */

const DIAS_LIMITE_PRESTAMO = 7;

export interface NuevoPrestamoData {
  libro: Libro;
  copiaId: string | null;
  socio: Socio;
}

export interface DevolucionData {
  prestamoId: string;
  dano?: {
    severidad: SeveridadDano;
    descripcion: string;
  };
}

function mapPrestamoDto(dto: any): Prestamo {
  return {
    id:             toFrontendId('prestamo', dto.id),
    libroId:        toFrontendId('libro', dto.id_libro),
    libroTitulo:    dto.libro?.titulo ?? '',
    copiaId:        toFrontendId('copia', dto.copia_id ?? 0),
    socioId:        toFrontendId('socio', dto.id_socio),
    socioNombre:    `${dto.socio?.apellido ?? ''}, ${dto.socio?.nombre ?? ''}`,
    fechaPrestamo:  dto.fecha_prestamo ?? new Date().toISOString(),
    fechaLimite:    dto.fecha_limite ?? new Date().toISOString(),
    fechaDevolucion: dto.fecha_devolucion ?? undefined,
    estado:         (dto.estado ?? 'prestado') as 'prestado' | 'devuelto' | 'moroso',
    turnoAdmin:     (dto.turno === 'mañana' ? 'Turno Mañana' : 'Turno Tarde') as TurnoAdmin,
  };
}

export function usePrestamos(
  turnoAdmin: TurnoAdmin,
  registrarAccion: (cat: 'Préstamos', accion: string, desc: string, turno: TurnoAdmin) => void,
  onCopiaEstado: (libroId: string, copiaId: string, estado: 'prestado' | 'disponible' | 'dañado') => void,
  onSocioAjuste: (socioId: string, delta: 1 | -1) => void
) {
  const [prestamos, setPrestamos] = useState<Prestamo[]>([]);

  /* ── Cargar ── */
  const cargarPrestamos = useCallback(async () => {
    try {
      const dtos = await api.getPrestamos();
      setPrestamos(dtos.map(mapPrestamoDto));
    } catch (err) {
      console.error('[usePrestamos] Error cargando préstamos:', err);
    }
  }, []);

  useEffect(() => {
    cargarPrestamos();
  }, [cargarPrestamos]);

  /* ── Verificar morosidad ── */
  const actualizarMorosidad = useCallback((lista: Prestamo[]): Prestamo[] => {
    const ahora = new Date();
    return lista.map((p) => {
      if (p.estado === 'devuelto') return p;
      const limite = new Date(p.fechaLimite);
      if (limite < ahora && p.estado !== 'moroso') return { ...p, estado: 'moroso' };
      return p;
    });
  }, []);

  /* ── Crear préstamo ── */
  const crearPrestamo = useCallback(
    async (data: NuevoPrestamoData): Promise<Prestamo | null> => {
      const { libro, socio } = data;

      // Encontrar copia disponible
      const copia =
        (data.copiaId ? libro.copias.find((c) => c.id === data.copiaId) : null) ??
        libro.copias.find((c) => c.estado === 'disponible');

      if (!copia || copia.estado !== 'disponible') return null;

      const ahora = new Date();
      const limite = new Date(ahora.getTime() + DIAS_LIMITE_PRESTAMO * 24 * 60 * 60 * 1000);

      try {
        const dto = await api.createPrestamo({
          id_prestamo: `PRE-${Date.now()}`,
          fecha_prestamo: ahora.toISOString(),
          fecha_limite: limite.toISOString(),
          estado: 'prestado',
          id_libro: toBackendId(libro.id),
          id_socio: toBackendId(socio.id),
          // id_usuario se inyecta desde el header X-Active-Shift en el backend
        });

        const prestamo = mapPrestamoDto(dto);

        setPrestamos((prev) => [prestamo, ...prev]);

        // Efectos secundarios
        void onCopiaEstado(libro.id, copia.id, 'prestado');
        void onSocioAjuste(socio.id, 1);

        registrarAccion(
          'Préstamos',
          'Nuevo Préstamo Registrado',
          `Préstamo ${prestamo.id} de "${libro.titulo}" otorgado a ${prestamo.socioNombre} (Vencimiento: ${limite.toLocaleDateString('es-AR')}).`,
          turnoAdmin
        );

        return prestamo;
      } catch (err) {
        console.error('[usePrestamos] Error creando préstamo:', err);
        return null;
      }
    },
    [turnoAdmin, registrarAccion, onCopiaEstado, onSocioAjuste]
  );

  /* ── Registrar devolución ── */
  const registrarDevolucion = useCallback(
    async (data: DevolucionData): Promise<void> => {
      const prestamo = prestamos.find((p) => p.id === data.prestamoId);
      if (!prestamo) return;

      try {
        const dto = await api.updatePrestamo(toBackendId(data.prestamoId), {
          estado: 'devuelto',
          fecha_devolucion: new Date().toISOString(),
        });

        const prestamoActualizado = mapPrestamoDto(dto);

        setPrestamos((prev) =>
          prev.map((p) =>
            p.id === data.prestamoId ? { ...p, ...prestamoActualizado } : p
          )
        );

        // Efectos secundarios
        const estadoCopia = data.dano ? 'dañado' : 'disponible';
        void onCopiaEstado(prestamo.libroId, prestamo.copiaId, estadoCopia);
        void onSocioAjuste(prestamo.socioId, -1);

        registrarAccion(
          'Préstamos',
          'Devolución Registrada',
          `Devuelto préstamo ${prestamo.id} — "${prestamo.libroTitulo}" por ${prestamo.socioNombre}.${data.dano ? ` Con daño: ${data.dano.descripcion}` : ''}`,
          turnoAdmin
        );
      } catch (err) {
        console.error('[usePrestamos] Error registrando devolución:', err);
      }
    },
    [prestamos, turnoAdmin, registrarAccion, onCopiaEstado, onSocioAjuste]
  );

  /* ── Lista con morosidad actualizada ── */
  const prestamosActualizados = actualizarMorosidad(prestamos);

  return {
    prestamos: prestamosActualizados,
    crearPrestamo,
    registrarDevolucion,
    recargarPrestamos: cargarPrestamos,
  };
}