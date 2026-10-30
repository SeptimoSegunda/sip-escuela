'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Prestamo, Libro, TurnoAdmin, SeveridadDano } from '@/types';
import { storage } from '@/lib/storage';

/* ────────────────────────────────────────
   usePrestamos — Crear préstamos y
   registrar devoluciones (con daño opcional)
──────────────────────────────────────── */

const DIAS_LIMITE_PRESTAMO = 7;

function generarIdPrestamo(prestamos: Prestamo[]): string {
  const nums = prestamos
    .map((p) => parseInt(p.id.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 999;
  return `#P-${max + 1}`;
}

export interface NuevoPrestamoData {
  libro: Libro;
  /** ID de la copia específica a prestar. Si es null, se usa la primera disponible. */
  copiaId: string | null;
  /** Nombre libre del prestatario (sin necesidad de socio registrado) */
  prestatario: string;
}

export interface DevolucionData {
  prestamoId: string;
  /** Si hubo daño al devolver */
  dano?: {
    severidad: SeveridadDano;
    descripcion: string;
  };
}

export function usePrestamos(
  turnoAdmin: TurnoAdmin,
  registrarAccion: (cat: 'Préstamos', accion: string, desc: string, turno: TurnoAdmin) => void,
  onCopiaEstado: (libroId: string, copiaId: string, estado: 'prestado' | 'disponible' | 'dañado') => void,
) {
  const [prestamos, setPrestamos] = useState<Prestamo[]>(() => storage.getPrestamos());

  /* ── Verificar morosidad al leer ── */
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
    (data: NuevoPrestamoData): Prestamo | null => {
      const { libro, prestatario } = data;

      // Encontrar copia disponible
      const copia =
        (data.copiaId ? libro.copias.find((c) => c.id === data.copiaId) : null) ??
        libro.copias.find((c) => c.estado === 'disponible');

      if (!copia || copia.estado !== 'disponible') return null;

      const ahora = new Date();
      const limite = new Date(ahora.getTime() + DIAS_LIMITE_PRESTAMO * 24 * 60 * 60 * 1000);

      const actual = storage.getPrestamos();
      const nuevo: Prestamo = {
        id:              generarIdPrestamo(actual),
        libroId:         libro.id,
        libroTitulo:     libro.titulo,
        copiaId:         copia.id,
        prestatario,
        fechaPrestamo:   ahora.toISOString(),
        fechaLimite:     limite.toISOString(),
        estado:          'prestado',
        turnoAdmin,
      };

      const actualizado = [nuevo, ...actual];
      storage.setPrestamos(actualizado);
      setPrestamos(actualizado);

      // Marcar copia como prestada
      onCopiaEstado(libro.id, copia.id, 'prestado');

      registrarAccion(
        'Préstamos',
        'Nuevo Préstamo Registrado',
        `Préstamo ${nuevo.id} de "${libro.titulo}" otorgado a ${prestatario} (Vencimiento: ${limite.toLocaleDateString('es-AR')}).`,
        turnoAdmin
      );

      return nuevo;
    },
    [turnoAdmin, registrarAccion, onCopiaEstado]
  );

  /* ── Registrar devolución ── */
  const registrarDevolucion = useCallback(
    (data: DevolucionData): void => {
      setPrestamos((prev) => {
        const prestamo = prev.find((p) => p.id === data.prestamoId);
        if (!prestamo) return prev;

        const actualizado = prev.map((p) =>
          p.id === data.prestamoId
            ? { ...p, estado: 'devuelto' as const, fechaDevolucion: new Date().toISOString() }
            : p
        );
        storage.setPrestamos(actualizado);

        // Marcar copia como disponible o dañada
        const estadoCopia = data.dano ? 'dañado' : 'disponible';
        onCopiaEstado(prestamo.libroId, prestamo.copiaId, estadoCopia);

        registrarAccion(
          'Préstamos',
          'Devolución Registrada',
          `Devuelto préstamo ${prestamo.id} — "${prestamo.libroTitulo}" por ${prestamo.prestatario}.${data.dano ? ` Con daño: ${data.dano.descripcion}` : ''}`,
          turnoAdmin
        );

        return actualizado;
      });
    },
    [turnoAdmin, registrarAccion, onCopiaEstado]
  );

  /* ── Eliminar préstamos por IDs ── */
  const eliminarPrestamos = useCallback(
    (ids: string[]): void => {
      setPrestamos((prev) => {
        const idSet = new Set(ids);
        // Restaurar copias a disponible si el préstamo estaba activo
        prev
          .filter((p) => idSet.has(p.id) && (p.estado === 'prestado' || p.estado === 'moroso'))
          .forEach((p) => onCopiaEstado(p.libroId, p.copiaId, 'disponible'));

        const actualizado = prev.filter((p) => !idSet.has(p.id));
        storage.setPrestamos(actualizado);

        registrarAccion(
          'Préstamos',
          'Préstamos Eliminados',
          `Se eliminaron ${ids.length} registro${ids.length !== 1 ? 's' : ''} de préstamos.`,
          turnoAdmin
        );
        return actualizado;
      });
    },
    [turnoAdmin, registrarAccion, onCopiaEstado]
  );

  /* ── Lista con morosidad actualizada ── */
  const prestamosActualizados = actualizarMorosidad(prestamos);

  return { prestamos: prestamosActualizados, crearPrestamo, registrarDevolucion, eliminarPrestamos };
}
