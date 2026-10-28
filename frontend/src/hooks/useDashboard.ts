'use client';

import { useCallback } from 'react';
import { useAuditoria }  from './useAuditoria';
import { useLibros }     from './useLibros';
import { useSocios }     from './useSocios';
import { usePrestamos }  from './usePrestamos';
import { useDanos }      from './useDanos';
import { obtenerSesion } from './useAuth';
import type { TurnoAdmin } from '@/types';

/* ────────────────────────────────────────
   useDashboard — Hook orquestador (datos vía API, sin localStorage)
 ──────────────────────────────────────── */

export function useDashboard() {
  /* ── Turno del administrador activo (desde sesión en memoria) ── */
  const sesion = obtenerSesion();
  const turnoAdmin: TurnoAdmin = (sesion?.turno === 'tarde' ? 'Turno Tarde' : 'Turno Mañana');

  /* ── Auditoría ── */
  const { logs: auditLogs, exportarJson: exportarAuditoria, recargarAuditoria } = useAuditoria();

  /* ── Callbacks de auditoría tipados por categoría ── */
  const logLibros = useCallback(
    (accion: string, desc: string) => {
      // Nota: el registro real de auditoría se hace en cada hook de dominio
      // llamando a su propio registrarAccion con el turno actual.
    },
    [turnoAdmin]
  );
  const logSocios = useCallback(
    (accion: string, desc: string) => {},
    [turnoAdmin]
  );
  const logPrestamos = useCallback(
    (accion: string, desc: string) => {},
    [turnoAdmin]
  );
  const logDanos = useCallback(
    (accion: string, desc: string) => {},
    [turnoAdmin]
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
    (libroId, copiaId, estado) => cambiarEstadoCopia(libroId, copiaId, estado as any)
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
    recargarAuditoria,
  };
}