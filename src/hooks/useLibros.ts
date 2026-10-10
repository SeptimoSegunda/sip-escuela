'use client';

import { useState, useCallback } from 'react';
import type { Libro, Copia, EstadoCopia, TurnoAdmin } from '@/types';
import { storage } from '@/lib/storage';

/* ────────────────────────────────────────
   useLibros — CRUD de libros y copias
──────────────────────────────────────── */

function generarIdLibro(): string {
  return `L-${Date.now().toString().slice(-7)}`;
}

function generarIdCopia(libro: Libro): string {
  const nums = libro.copias
    .map((c) => parseInt(c.inventarioNum.replace(/\D/g, ''), 10))
    .filter((n) => !isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 1000;
  return `INV-${max + 1}`;
}

export interface NuevoLibroData {
  isbn: string;
  titulo: string;
  subtitulo?: string;
  autor: string;
  categoria: string;
  ubicacion: string;
  portadaUrl?: string;
  edicion?: string;
  extension?: string;
  inventario?: string;
  clasificacion?: string;
  libristica?: string;
  tomo?: string;
  editorial?: string;
  fechaPublicacion?: string;
  lugarPublicacion?: string;
  temas?: string;
  terminoMateria?: string;
  coleccionPersonal?: string;
  coleccionInstitucional?: string;
  notaGeneral?: string;
  notaContenido?: string;
}

export function useLibros(
  turnoAdmin: TurnoAdmin,
  registrarAccion: (cat: 'Libros', accion: string, desc: string, turno: TurnoAdmin) => void
) {
  const [libros, setLibros] = useState<Libro[]>(() => storage.getLibros());

  /* ── Crear libro ── */
  const crearLibro = useCallback(
    (data: NuevoLibroData): Libro => {
      const actual = storage.getLibros();
      const nuevo: Libro = {
        id:                   generarIdLibro(),
        isbn:                 data.isbn.trim(),
        titulo:               data.titulo.trim(),
        subtitulo:            data.subtitulo?.trim() || undefined,
        autor:                data.autor.trim(),
        categoria:            data.categoria.trim(),
        ubicacion:            data.ubicacion.trim() || 'Estante Principal',
        portadaUrl:           data.portadaUrl || undefined,
        copias:               [],
        fechaAgregado:        new Date().toISOString(),
        edicion:              data.edicion?.trim() || undefined,
        extension:            data.extension?.trim() || undefined,
        inventario:           data.inventario?.trim() || undefined,
        clasificacion:        data.clasificacion?.trim() || undefined,
        libristica:           data.libristica?.trim() || undefined,
        tomo:                 data.tomo?.trim() || undefined,
        editorial:            data.editorial?.trim() || undefined,
        fechaPublicacion:     data.fechaPublicacion?.trim() || undefined,
        lugarPublicacion:     data.lugarPublicacion?.trim() || undefined,
        temas:                data.temas?.trim() || undefined,
        terminoMateria:       data.terminoMateria?.trim() || undefined,
        coleccionPersonal:    data.coleccionPersonal?.trim() || undefined,
        coleccionInstitucional: data.coleccionInstitucional?.trim() || undefined,
        notaGeneral:          data.notaGeneral?.trim() || undefined,
        notaContenido:        data.notaContenido?.trim() || undefined,
      };

      const actualizado = [nuevo, ...actual];
      storage.setLibros(actualizado);
      setLibros(actualizado);

      registrarAccion(
        'Libros',
        'Libro Añadido al Catálogo',
        `Añadido "${nuevo.titulo}" de ${nuevo.autor} (ISBN: ${nuevo.isbn}).`,
        turnoAdmin
      );

      return nuevo;
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Editar libro ── */
  const editarLibro = useCallback(
    (id: string, cambios: Partial<Omit<Libro, 'id' | 'copias' | 'fechaAgregado'>>): void => {
      setLibros((prev) => {
        const actualizado = prev.map((l) =>
          l.id === id ? { ...l, ...cambios } : l
        );
        storage.setLibros(actualizado);

        const libro = actualizado.find((l) => l.id === id);
        if (libro) {
          registrarAccion(
            'Libros',
            'Libro Modificado',
            `Actualizados datos de "${libro.titulo}" (ID: ${id}).`,
            turnoAdmin
          );
        }
        return actualizado;
      });
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Eliminar uno o varios libros ── */
  const eliminarLibros = useCallback(
    (ids: string[]): void => {
      setLibros((prev) => {
        const eliminados = prev.filter((l) => ids.includes(l.id));
        const actualizado = prev.filter((l) => !ids.includes(l.id));
        storage.setLibros(actualizado);

        eliminados.forEach((l) => {
          registrarAccion(
            'Libros',
            'Libro Eliminado del Catálogo',
            `Eliminado "${l.titulo}" (ISBN: ${l.isbn}) y sus ${l.copias.length} copia(s).`,
            turnoAdmin
          );
        });
        return actualizado;
      });
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Agregar copia a un libro ── */
  const agregarCopia = useCallback(
    (libroId: string): Copia | null => {
      let nuevaCopia: Copia | null = null;

      setLibros((prev) => {
        const actualizado = prev.map((l) => {
          if (l.id !== libroId) return l;
          nuevaCopia = {
            id:           `C-${Date.now()}`,
            inventarioNum: generarIdCopia(l),
            estado:       'disponible',
          };
          registrarAccion(
            'Libros',
            'Copia Añadida',
            `Nueva copia (${nuevaCopia.inventarioNum}) añadida a "${l.titulo}".`,
            turnoAdmin
          );
          return { ...l, copias: [...l.copias, nuevaCopia] };
        });
        storage.setLibros(actualizado);
        return actualizado;
      });

      return nuevaCopia;
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Quitar la última copia disponible de un libro ── */
  const disminuirCopia = useCallback(
    (libroId: string): void => {
      setLibros((prev) => {
        const actualizado = prev.map((l) => {
          if (l.id !== libroId || l.copias.length <= 1) return l;
          // Preferir eliminar la última copia disponible; si no hay, la última
          const idxDisp = [...l.copias].reverse().findIndex((c) => c.estado === 'disponible');
          const removeIdx =
            idxDisp !== -1
              ? l.copias.length - 1 - idxDisp
              : l.copias.length - 1;
          const copia = l.copias[removeIdx];
          registrarAccion(
            'Libros',
            'Copia Eliminada',
            `Copia (${copia.inventarioNum}) eliminada de "${l.titulo}".`,
            turnoAdmin
          );
          return { ...l, copias: l.copias.filter((_, i) => i !== removeIdx) };
        });
        storage.setLibros(actualizado);
        return actualizado;
      });
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Cambiar estado de una copia ── */
  const cambiarEstadoCopia = useCallback(
    (libroId: string, copiaId: string, estado: EstadoCopia): void => {
      setLibros((prev) => {
        const actualizado = prev.map((l) => {
          if (l.id !== libroId) return l;
          return {
            ...l,
            copias: l.copias.map((c) =>
              c.id === copiaId ? { ...c, estado } : c
            ),
          };
        });
        storage.setLibros(actualizado);
        return actualizado;
      });
    },
    []
  );

  return { libros, crearLibro, editarLibro, eliminarLibros, agregarCopia, disminuirCopia, cambiarEstadoCopia };
}
