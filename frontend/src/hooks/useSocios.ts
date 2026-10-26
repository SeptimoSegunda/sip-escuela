'use client';

import { useState, useCallback } from 'react';
import type { Socio, TurnoAdmin, EstadoSocio } from '@/types';
import { storage } from '@/lib/storage';

/* ────────────────────────────────────────
   useSocios — CRUD completo de socios
──────────────────────────────────────── */

function generarIdSocio(socios: Socio[]): string {
  const nums = socios
    .map((s) => parseInt(s.id.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 1000;
  return `S-${max + 1}`;
}

export interface NuevoSocioData {
  apellido: string;
  nombre: string;
  tipo: Socio['tipo'];
  anio?: string;
  turno?: 'mañana' | 'tarde';
  email?: string;
}

export function useSocios(
  turnoAdmin: TurnoAdmin,
  registrarAccion: (cat: 'Socios', accion: string, desc: string, turno: TurnoAdmin) => void
) {
  const [socios, setSocios] = useState<Socio[]>(() => storage.getSocios());

  /* ── Crear ── */
  const crearSocio = useCallback(
    (data: NuevoSocioData): Socio => {
      const actual = storage.getSocios();
      const nuevo: Socio = {
        id:              generarIdSocio(actual),
        apellido:        data.apellido.trim(),
        nombre:          data.nombre.trim(),
        tipo:            data.tipo,
        anio:            data.anio?.trim(),
        turno:           data.turno,
        email:           data.email?.trim(),
        estado:          'activo',
        prestamosActivos: 0,
        fechaRegistro:   new Date().toISOString(),
      };

      const actualizado = [nuevo, ...actual];
      storage.setSocios(actualizado);
      setSocios(actualizado);

      registrarAccion(
        'Socios',
        'Nuevo Socio Registrado',
        `Registrado ${nuevo.tipo} ${nuevo.apellido}, ${nuevo.nombre} (ID: ${nuevo.id}).`,
        turnoAdmin
      );

      return nuevo;
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Editar ── */
  const editarSocio = useCallback(
    (id: string, cambios: Partial<Omit<Socio, 'id' | 'fechaRegistro'>>): void => {
      setSocios((prev) => {
        const actualizado = prev.map((s) =>
          s.id === id ? { ...s, ...cambios } : s
        );
        storage.setSocios(actualizado);

        const socio = actualizado.find((s) => s.id === id);
        if (socio) {
          registrarAccion(
            'Socios',
            'Socio Modificado',
            `Actualizados datos de ${socio.apellido}, ${socio.nombre} (ID: ${id}).`,
            turnoAdmin
          );
        }
        return actualizado;
      });
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Cambiar estado ── */
  const cambiarEstado = useCallback(
    (id: string, estado: EstadoSocio): void => {
      editarSocio(id, { estado });
    },
    [editarSocio]
  );

  /* ── Eliminar ── */
  const eliminarSocio = useCallback(
    (id: string): void => {
      setSocios((prev) => {
        const socio = prev.find((s) => s.id === id);
        const actualizado = prev.filter((s) => s.id !== id);
        storage.setSocios(actualizado);

        if (socio) {
          registrarAccion(
            'Socios',
            'Socio Eliminado',
            `Eliminado ${socio.tipo} ${socio.apellido}, ${socio.nombre} (ID: ${id}).`,
            turnoAdmin
          );
        }
        return actualizado;
      });
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Incrementar/decrementar préstamos activos ── */
  const ajustarPrestamosActivos = useCallback(
    (socioId: string, delta: 1 | -1): void => {
      setSocios((prev) => {
        const actualizado = prev.map((s) =>
          s.id === socioId
            ? { ...s, prestamosActivos: Math.max(0, s.prestamosActivos + delta) }
            : s
        );
        storage.setSocios(actualizado);
        return actualizado;
      });
    },
    []
  );

  return { socios, crearSocio, editarSocio, cambiarEstado, eliminarSocio, ajustarPrestamosActivos };
}
