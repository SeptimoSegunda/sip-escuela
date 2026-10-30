'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Libro, Copia, EstadoCopia, TurnoAdmin } from '@/types';
import {
  api,
  toFrontendId,
  toBackendId,
} from '@/lib/api';

/* ────────────────────────────────────────
   useLibros — CRUD de libros y copias vía API
 ──────────────────────────────────────── */

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

function mapLibroDto(dto: any): Libro {
  return {
    id:           toFrontendId('libro', dto.id),
    isbn:         dto.isbn ?? '',
    titulo:       dto.titulo,
    subtitulo:    dto.subtitulo ?? undefined,
    autor:        dto.autor ?? '',
    categoria:    dto.temas ?? 'General',
    ubicacion:    dto.ubicacion ?? 'Estante Principal',
    portadaUrl:   undefined,
    copias:       (dto.copias ?? []).map((c: any) => ({
      id:           toFrontendId('copia', c.id),
      inventarioNum: c.inventario_num,
      estado:       c.estado as EstadoCopia,
    })),
    fechaAgregado: dto.created_at ?? new Date().toISOString(),
    edicion:              dto.edicion ?? undefined,
    extension:            dto.extension ?? undefined,
    inventario:           dto.numero_de_inventario ?? undefined,
    clasificacion:        dto.clasificacion ?? undefined,
    libristica:           dto.libristica ?? undefined,
    tomo:                 dto.numero ?? undefined,
    editorial:            dto.editorial ?? undefined,
    fechaPublicacion:     dto.publicacion ?? undefined,
    lugarPublicacion:     dto.lugar_publicacion ?? undefined,
    temas:                dto.temas ?? undefined,
    terminoMateria:       dto.termino_material ?? undefined,
    coleccionPersonal:    undefined,
    coleccionInstitucional: undefined,
    notaGeneral:          dto.nota_general ?? undefined,
    notaContenido:        dto.nota_contenido ?? undefined,
  };
}

export function useLibros(
  turnoAdmin: TurnoAdmin,
  registrarAccion: (cat: 'Libros', accion: string, desc: string, turno: TurnoAdmin) => void
) {
  const [libros, setLibros] = useState<Libro[]>([]);

  /* ── Cargar ── */
  const cargarLibros = useCallback(async () => {
    try {
      const dtos = await api.getLibros();
      setLibros(dtos.map(mapLibroDto));
    } catch (err) {
      console.error('[useLibros] Error cargando libros:', err);
    }
  }, []);

  useEffect(() => {
    cargarLibros();
  }, [cargarLibros]);

  /* ── Crear ── */
  const crearLibro = useCallback(
    async (data: NuevoLibroData): Promise<Libro | null> => {
      try {
        const dto = await api.createLibro({
          titulo: data.titulo,
          subtitulo: data.subtitulo,
          autor: data.autor,
          isbn: data.isbn,
          editorial: data.editorial,
          anio_publicacion: data.fechaPublicacion ? parseInt(data.fechaPublicacion, 10) : undefined,
          cantidad: 1,
          ubicacion: data.ubicacion,
          libristica: data.libristica,
          numero_de_inventario: data.inventario,
          publicacion: data.fechaPublicacion,
          edicion: data.edicion,
          lugar_publicacion: data.lugarPublicacion,
          temas: data.temas,
          numero: data.tomo,
          termino_material: data.terminoMateria,
          extension: data.extension ? parseInt(data.extension, 10) : undefined,
          nota_general: data.notaGeneral,
          nota_contenido: data.notaContenido,
        });

        const libro = mapLibroDto(dto);

        setLibros((prev) => [libro, ...prev]);

        registrarAccion(
          'Libros',
          'Libro Añadido al Catálogo',
          `Añadido "${libro.titulo}" de ${libro.autor} (ISBN: ${libro.isbn}).`,
          turnoAdmin
        );

        return libro;
      } catch (err) {
        console.error('[useLibros] Error creando libro:', err);
        return null;
      }
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Editar ── */
  const editarLibro = useCallback(
    async (id: string, cambios: Partial<Omit<Libro, 'id' | 'copias' | 'fechaAgregado'>>): Promise<void> => {
      const libroId = toBackendId(id);
      try {
        const dto = await api.updateLibro(libroId, {
          titulo: cambios.titulo,
          subtitulo: cambios.subtitulo,
          autor: cambios.autor,
          isbn: cambios.isbn,
          editorial: cambios.editorial,
          anio_publicacion: cambios.fechaPublicacion ? parseInt(cambios.fechaPublicacion, 10) : undefined,
          cantidad: cambios.extension ? 1 : undefined,
          ubicacion: cambios.ubicacion,
          libristica: cambios.libristica,
          numero_de_inventario: cambios.inventario,
          publicacion: cambios.fechaPublicacion,
          edicion: cambios.edicion,
          lugar_publicacion: cambios.lugarPublicacion,
          temas: cambios.temas,
          numero: cambios.tomo,
          termino_material: cambios.terminoMateria,
          extension: cambios.extension ? parseInt(cambios.extension, 10) : undefined,
          nota_general: cambios.notaGeneral,
          nota_contenido: cambios.notaContenido,
        });

        setLibros((prev) => prev.map((l) => (l.id === id ? { ...l, ...mapLibroDto(dto) } : l)));

        const libro = mapLibroDto(dto);
        registrarAccion(
          'Libros',
          'Libro Modificado',
          `Actualizados datos de "${libro.titulo}" (ID: ${id}).`,
          turnoAdmin
        );
      } catch (err) {
        console.error('[useLibros] Error editando libro:', err);
      }
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Eliminar ── */
  const eliminarLibros = useCallback(
    async (ids: string[]): Promise<void> => {
      try {
        for (const id of ids) {
          await api.deleteLibro(toBackendId(id));
        }
        setLibros((prev) => prev.filter((l) => !ids.includes(l.id)));

        ids.forEach((id) => {
          const l = libros.find((x) => x.id === id);
          if (l) {
            registrarAccion(
              'Libros',
              'Libro Eliminado del Catálogo',
              `Eliminado "${l.titulo}" (ISBN: ${l.isbn}).`,
              turnoAdmin
            );
          }
        });
      } catch (err) {
        console.error('[useLibros] Error eliminando libros:', err);
      }
    },
    [libros, turnoAdmin, registrarAccion]
  );

  /* ── Agregar copia ── */
  const agregarCopia = useCallback(
    async (libroId: string): Promise<Copia | null> => {
      const libroBackendId = toBackendId(libroId);
      try {
        const dto = await api.createCopia({
          inventario_num: `INV-${libroBackendId.toString().padStart(4, '0')}-001`,
          estado: 'disponible',
          libro_id: libroBackendId,
        });

        const nuevaCopia: Copia = {
          id:           toFrontendId('copia', dto.id),
          inventarioNum: dto.inventario_num,
          estado:       dto.estado as EstadoCopia,
        };

        setLibros((prev) =>
          prev.map((l) => {
            if (l.id !== libroId) return l;
            return { ...l, copias: [...l.copias, nuevaCopia] };
          })
        );

        registrarAccion(
          'Libros',
          'Copia Añadida',
          `Nueva copia (${nuevaCopia.inventarioNum}) añadida.`,
          turnoAdmin
        );

        return nuevaCopia;
      } catch (err) {
        console.error('[useLibros] Error añadiendo copia:', err);
        return null;
      }
    },
    [turnoAdmin, registrarAccion]
  );

  /* ── Quitar copia ── */
  const disminuirCopia = useCallback(
    async (libroId: string): Promise<void> => {
      try {
        const libro = libros.find((l) => l.id === libroId);
        if (!libro || libro.copias.length <= 1) return;

        const copia = libro.copias[libro.copias.length - 1];
        await api.deleteCopia(toBackendId(copia.id));

        setLibros((prev) =>
          prev.map((l) => {
            if (l.id !== libroId) return l;
            return {
              ...l,
              copias: l.copias.filter((_, i) => i !== l.copias.length - 1),
            };
          })
        );

        registrarAccion(
          'Libros',
          'Copia Eliminada',
          `Copia (${copia.inventarioNum}) eliminada.`,
          turnoAdmin
        );
      } catch (err) {
        console.error('[useLibros] Error eliminando copia:', err);
      }
    },
    [libros, turnoAdmin, registrarAccion]
  );

  /* ── Cambiar estado de copia ── */
  const cambiarEstadoCopia = useCallback(
    async (libroId: string, copiaId: string, estado: EstadoCopia): Promise<void> => {
      const copiaBackendId = toBackendId(copiaId);
      if (copiaBackendId <= 0) {
        console.error(
          `[useLibros] copiaId inválido ("${copiaId}"); se omite el cambio de estado.`
        );
        return;
      }

      try {
        await api.updateCopia(copiaBackendId, { estado });

        setLibros((prev) =>
          prev.map((l) => {
            if (l.id !== libroId) return l;
            return {
              ...l,
              copias: l.copias.map((c) =>
                c.id === copiaId ? { ...c, estado } : c
              ),
            };
          })
        );
      } catch (err) {
        console.error('[useLibros] Error cambiando estado de copia:', err);
      }
    },
    []
  );

  return {
    libros,
    crearLibro,
    editarLibro,
    eliminarLibros,
    agregarCopia,
    disminuirCopia,
    cambiarEstadoCopia,
    recargarLibros: cargarLibros,
  };
}