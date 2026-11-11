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
  const { prestamos, crearPrestamo, registrarDevolucion, eliminarPrestamos } = usePrestamos(
    turnoAdmin,
    (_, accion, desc) => logPrestamos(accion, desc),
    cambiarEstadoCopia,
  );

  /* ── Daños ── */
  const { danos, registrarDano, eliminarDanos } = useDanos(
    turnoAdmin,
    (_, accion, desc) => logDanos(accion, desc),
    (libroId, copiaId, estado) => cambiarEstadoCopia(libroId, copiaId, estado)
  );

  /* ── Crear préstamo + ajustar contador del socio ── */
  const crearPrestamoConSocio = useCallback(
    (data: Parameters<typeof crearPrestamo>[0]) => {
      const resultado = crearPrestamo(data);
      if (resultado && data.socioId) {
        ajustarPrestamosActivos(data.socioId, 1);
      }
      return resultado;
    },
    [crearPrestamo, ajustarPrestamosActivos]
  );

  /* ── Eliminar préstamos + ajustar contador del socio ── */
  const eliminarPrestamosConSocio = useCallback(
    (ids: string[]) => {
      const activos = storage.getPrestamos().filter(
        (p) =>
          ids.includes(p.id) &&
          (p.estado === 'prestado' || p.estado === 'moroso') &&
          p.socioId
      );
      eliminarPrestamos(ids);
      activos.forEach((p) => ajustarPrestamosActivos(p.socioId!, -1));
    },
    [eliminarPrestamos, ajustarPrestamosActivos]
  );

  /* ── Devolución con daño — orquesta préstamos + daños ── */
  const registrarDevolucionConDano = useCallback(
    (data: Parameters<typeof registrarDevolucion>[0]) => {
      // Leer el préstamo ANTES de registrar la devolución
      const prestamo = storage.getPrestamos().find((p) => p.id === data.prestamoId);

      // 1. Registrar la devolución (actualiza estado del préstamo y la copia)
      registrarDevolucion(data);

      if (prestamo) {
        // 2. Decrementar contador del socio si el préstamo estaba activo/moroso
        if (
          (prestamo.estado === 'prestado' || prestamo.estado === 'moroso') &&
          prestamo.socioId
        ) {
          ajustarPrestamosActivos(prestamo.socioId, -1);
        }

        // 3. Si hay daño, crear el registro en el módulo de daños
        if (data.dano) {
          registrarDano({
            libroId:     prestamo.libroId,
            libroTitulo: prestamo.libroTitulo,
            copiaId:     prestamo.copiaId,
            responsable: prestamo.prestatario,
            socioId:     prestamo.socioId,
            severidad:   data.dano.severidad,
            descripcion: data.dano.descripcion,
          });
        }
      }
    },
    [registrarDevolucion, registrarDano, ajustarPrestamosActivos]
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
    crearPrestamo: crearPrestamoConSocio,
    registrarDevolucion: registrarDevolucionConDano,
    eliminarPrestamos: eliminarPrestamosConSocio,

    /* Acciones — Daños */
    registrarDano,
    eliminarDanos,

    /* Auditoría */
    exportarAuditoria,
  };
}
