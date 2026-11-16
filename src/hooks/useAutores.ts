'use client';

import { useState, useCallback } from 'react';
import type { Autor, NuevoAutorData, TurnoAdmin } from '@/types';
import { storage } from '@/lib/storage';

/* ────────────────────────────────────────
   useAutores — CRUD de autores
──────────────────────────────────────── */

function generarIdAutor(autores: Autor[]): string {
  const nums = autores
    .map((a) => parseInt(a.id.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 1000;
  return `A-${max + 1}`;
}

export function useAutores(
  turnoAdmin: TurnoAdmin,
  registrarAccion: (cat: 'Libros', accion: string, desc: string, turno: TurnoAdmin) => void
) {
  const [autores, setAutores] = useState<Autor[]>(() => storage.getAutores());

  const crearAutor = useCallback(
    (data: NuevoAutorData): Autor => {
      const actual = storage.getAutores();
      const nuevo: Autor = {
        id:              generarIdAutor(actual),
        apellido:        data.apellido.trim(),
        nombre:          data.nombre.trim(),
        fechaRegistro:   new Date().toISOString(),
      };

      const actualizado = [nuevo, ...actual];
      storage.setAutores(actualizado);
      setAutores(actualizado);

      registrarAccion(
        'Libros',
        'Autor Registrado',
        `Registrado autor ${nuevo.apellido}, ${nuevo.nombre} (ID: ${nuevo.id}).`,
        turnoAdmin
      );

      return nuevo;
    },
    [turnoAdmin, registrarAccion]
  );

  const editarAutor = useCallback(
    (id: string, cambios: Partial<Omit<Autor, 'id' | 'fechaRegistro' | 'fechaUltimaActualizacion'>>): void => {
      setAutores((prev) => {
        const actualizado = prev.map((a) =>
          a.id === id ? { ...a, ...cambios, fechaUltimaActualizacion: new Date().toISOString() } : a
        );
        storage.setAutores(actualizado);

        const autor = actualizado.find((a) => a.id === id);
        if (autor) {
          registrarAccion(
            'Libros',
            'Autor Modificado',
            `Actualizados datos de ${autor.apellido}, ${autor.nombre} (ID: ${id}).`,
            turnoAdmin
          );
        }
        return actualizado;
      });
    },
    [turnoAdmin, registrarAccion]
  );

  const eliminarAutor = useCallback(
    (id: string): void => {
      setAutores((prev) => {
        const autor = prev.find((a) => a.id === id);
        const actualizado = prev.filter((a) => a.id !== id);
        storage.setAutores(actualizado);

        if (autor) {
          registrarAccion(
            'Libros',
            'Autor Eliminado',
            `Eliminado autor ${autor.apellido}, ${autor.nombre} (ID: ${id}).`,
            turnoAdmin
          );
        }
        return actualizado;
      });
    },
    [turnoAdmin, registrarAccion]
  );

  return { autores, crearAutor, editarAutor, eliminarAutor };
}