'use client';

import { useState, useCallback } from 'react';
import type { Editorial, NuevoEditorialData, TurnoAdmin } from '@/types';
import { storage } from '@/lib/storage';

/* ────────────────────────────────────────
   useEditoriales — CRUD de editoriales
──────────────────────────────────────── */

function generarIdEditorial(editoriales: Editorial[]): string {
  const nums = editoriales
    .map((e) => parseInt(e.id.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 1000;
  return `E-${max + 1}`;
}

export function useEditoriales(
  turnoAdmin: TurnoAdmin,
  registrarAccion: (cat: 'Libros', accion: string, desc: string, turno: TurnoAdmin) => void
) {
  const [editoriales, setEditoriales] = useState<Editorial[]>(() => storage.getEditoriales());

  const crearEditorial = useCallback(
    (data: NuevoEditorialData): Editorial => {
      const actual = storage.getEditoriales();
      const nuevo: Editorial = {
        id:              generarIdEditorial(actual),
        nombre:          data.nombre.trim(),
        fechaRegistro:   new Date().toISOString(),
      };

      const actualizado = [nuevo, ...actual];
      storage.setEditoriales(actualizado);
      setEditoriales(actualizado);

      registrarAccion(
        'Libros',
        'Editorial Registrada',
        `Registrada editorial "${nuevo.nombre}" (ID: ${nuevo.id}).`,
        turnoAdmin
      );

      return nuevo;
    },
    [turnoAdmin, registrarAccion]
  );

  const editarEditorial = useCallback(
    (id: string, cambios: Partial<Omit<Editorial, 'id' | 'fechaRegistro' | 'fechaUltimaActualizacion'>>): void => {
      setEditoriales((prev) => {
        const actualizado = prev.map((e) =>
          e.id === id ? { ...e, ...cambios, fechaUltimaActualizacion: new Date().toISOString() } : e
        );
        storage.setEditoriales(actualizado);

        const editorial = actualizado.find((e) => e.id === id);
        if (editorial) {
          registrarAccion(
            'Libros',
            'Editorial Modificada',
            `Actualizada editorial "${editorial.nombre}" (ID: ${id}).`,
            turnoAdmin
          );
        }
        return actualizado;
      });
    },
    [turnoAdmin, registrarAccion]
  );

  const eliminarEditorial = useCallback(
    (id: string): void => {
      setEditoriales((prev) => {
        const editorial = prev.find((e) => e.id === id);
        const actualizado = prev.filter((e) => e.id !== id);
        storage.setEditoriales(actualizado);

        if (editorial) {
          registrarAccion(
            'Libros',
            'Editorial Eliminada',
            `Eliminada editorial "${editorial.nombre}" (ID: ${id}).`,
            turnoAdmin
          );
        }
        return actualizado;
      });
    },
    [turnoAdmin, registrarAccion]
  );

  return { editoriales, crearEditorial, editarEditorial, eliminarEditorial };
}