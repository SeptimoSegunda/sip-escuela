'use client';

import { useCallback } from 'react';
import { useAuditoria }  from './useAuditoria';
import { useLibros }     from './useLibros';
import { useSocios }     from './useSocios';
import { usePrestamos }  from './usePrestamos';
import { useDanos }      from './useDanos';
import { storage }       from '@/lib/storage';
import type { TurnoAdmin } from '@/types';

/* ────────────────────────────────────────
   useDashboard
   Hook orquestador que conecta todos los
   hooks de dominio y expone el estado
   global del dashboard.
──────────────────────────────────────── */

export function useDashboard() {
  /* ── Turno del administrador activo ── */
  const sesion = storage.getSession();
  const turnoAdmin: TurnoAdmin = sesion?.turno ?? 'Turno Mañana';

  /* ── Auditoría (base) ── */
  const { logs: auditLogs, registrarAccion, exportarJson: exportarAuditoria } = useAuditoria();

  /* ── Callbacks de auditoría tipados por categoría ── */
  const logLibros = useCallback(
    (accion: string, desc: string) => registrarAccion('Libros', accion, desc, turnoAdmin),
    [registrarAccion, turnoAdmin]
  );
  const logSocios = useCallback(
    (accion: string, desc: string) => registrarAccion('Socios', accion, desc, turnoAdmin),
    [registrarAccion, turnoAdmin]
  );
  const logPrestamos = useCallback(
    (accion: string, desc: string) => registrarAccion('Préstamos', accion, desc, turnoAdmin),
    [registrarAccion, turnoAdmin]
  );
  const logDanos = useCallback(
    (accion: string, desc: string) => registrarAccion('Daños', accion, desc, turnoAdmin),
    [registrarAccion, turnoAdmin]
  );

  /* ── Libros ── */
  const {
    libros,
    crearLibro,
    editarLibro,
    eliminarLibros,
    agregarCopia,
    disminuirCopia,
    cambiarEstadoCopia,
  } = useLibros(turnoAdmin, (_, accion, desc) => logLibros(accion, desc));

  /* ── Socios ── */
  const {
    socios,
    crearSocio,
    editarSocio,
    cambiarEstado: cambiarEstadoSocio,
    eliminarSocio,
    ajustarPrestamosActivos,
  } = useSocios(turnoAdmin, (_, accion, desc) => logSocios(accion, desc));

  /* ── Préstamos ── */
  const { prestamos, crearPrestamo, registrarDevolucion } = usePrestamos(
    turnoAdmin,
    (_, accion, desc) => logPrestamos(accion, desc),
    cambiarEstadoCopia,
    ajustarPrestamosActivos
  );

  /* ── Daños ── */
  const { danos, registrarDano } = useDanos(
    turnoAdmin,
    (_, accion, desc) => logDanos(accion, desc),
    (libroId, copiaId, estado) => cambiarEstadoCopia(libroId, copiaId, estado)
  );

  return {
    /* Estado */
    turnoAdmin,
    libros,
    socios,
    prestamos,
    danos,
    auditLogs,

    /* Acciones — Libros */
    crearLibro,
    editarLibro,
    eliminarLibros,
    agregarCopia,
    incrementarCopia: agregarCopia,
    disminuirCopia,
    cambiarEstadoCopia,

    /* Acciones — Socios */
    crearSocio,
    editarSocio,
    cambiarEstadoSocio,
    eliminarSocio,

    /* Acciones — Préstamos */
    crearPrestamo,
    registrarDevolucion,

    /* Acciones — Daños */
    registrarDano,

    /* Auditoría */
    exportarAuditoria,
  };
}
