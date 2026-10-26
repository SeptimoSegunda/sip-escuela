'use client';

import { useState, useEffect, useRef } from 'react';
import type { Libro } from '@/types';
import type { NuevoLibroData } from '@/hooks/useLibros';
import Modal from '@/components/ui/Modal';
import f from '@/components/ui/form.module.css';
import styles from './ModalLibro.module.css';

interface ModalLibroProps {
  open: boolean;
  onClose: () => void;
  libroEditar?: Libro | null;
  onGuardar: (data: NuevoLibroData) => void;
}

type FormState = {
  [K in keyof NuevoLibroData]-?: string;
};

const empty: FormState = {
  isbn: '', titulo: '', subtitulo: '', autor: '', categoria: '',
  ubicacion: '', portadaUrl: '',
  edicion: '', extension: '', inventario: '', clasificacion: '',
  libristica: '', tomo: '', editorial: '', fechaPublicacion: '',
  lugarPublicacion: '', temas: '', terminoMateria: '',
  coleccionPersonal: '', coleccionInstitucional: '',
  notaGeneral: '', notaContenido: '',
};

function libroToForm(l: Libro): FormState {
  return {
    isbn:                   l.isbn,
    titulo:                 l.titulo,
    subtitulo:              l.subtitulo ?? '',
    autor:                  l.autor,
    categoria:              l.categoria,
    ubicacion:              l.ubicacion,
    portadaUrl:             l.portadaUrl ?? '',
    edicion:                l.edicion ?? '',
    extension:              l.extension ?? '',
    inventario:             l.inventario ?? '',
    clasificacion:          l.clasificacion ?? '',
    libristica:             l.libristica ?? '',
    tomo:                   l.tomo ?? '',
    editorial:              l.editorial ?? '',
    fechaPublicacion:       l.fechaPublicacion ?? '',
    lugarPublicacion:       l.lugarPublicacion ?? '',
    temas:                  l.temas ?? '',
    terminoMateria:         l.terminoMateria ?? '',
    coleccionPersonal:      l.coleccionPersonal ?? '',
    coleccionInstitucional: l.coleccionInstitucional ?? '',
    notaGeneral:            l.notaGeneral ?? '',
    notaContenido:          l.notaContenido ?? '',
  };
}

export default function ModalLibro({ open, onClose, libroEditar, onGuardar }: ModalLibroProps) {
  const [form, setForm] = useState<FormState>(empty);
  const fileRef = useRef<HTMLInputElement>(null);

  /* Reset al abrir */
  useEffect(() => {
    if (open) {
      setForm(libroEditar ? libroToForm(libroEditar) : empty);
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [open, libroEditar]);

  const set = (k: keyof FormState, v: string) => setForm((p) => ({ ...p, [k]: v }));

  /* ── Portada local → base64 ── */
  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('portadaUrl', (ev.target?.result as string) ?? '');
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      isbn:                   form.isbn.trim(),
      titulo:                 form.titulo.trim(),
      subtitulo:              form.subtitulo.trim() || undefined,
      autor:                  form.autor.trim(),
      categoria:              form.categoria.trim(),
      ubicacion:              form.ubicacion.trim(),
      portadaUrl:             form.portadaUrl || undefined,
      edicion:                form.edicion.trim() || undefined,
      extension:              form.extension.trim() || undefined,
      inventario:             form.inventario.trim() || undefined,
      clasificacion:          form.clasificacion.trim() || undefined,
      libristica:             form.libristica.trim() || undefined,
      tomo:                   form.tomo.trim() || undefined,
      editorial:              form.editorial.trim() || undefined,
      fechaPublicacion:       form.fechaPublicacion.trim() || undefined,
      lugarPublicacion:       form.lugarPublicacion.trim() || undefined,
      temas:                  form.temas.trim() || undefined,
      terminoMateria:         form.terminoMateria.trim() || undefined,
      coleccionPersonal:      form.coleccionPersonal.trim() || undefined,
      coleccionInstitucional: form.coleccionInstitucional.trim() || undefined,
      notaGeneral:            form.notaGeneral.trim() || undefined,
      notaContenido:          form.notaContenido.trim() || undefined,
    });
    onClose();
  };

  const isEdit = !!libroEditar;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Libro' : 'Añadir Nuevo Libro al Catálogo'}
      id="modalNuevoLibro"
      size="lg"
    >
      <form id="formNuevoLibro" onSubmit={handleSubmit}>
        <div className={f.formGrid}>

          {/* ══ Sección 1: Información Principal y Portada ══ */}
          <div className={f.sectionTitle}>Información Principal y Portada</div>

          {/* Portada — upload local */}
          <div className={`${f.formGroupFull} ${styles.portadaGroup}`}>
            <label htmlFor="inputPortadaLibro" className={f.label}>
              Foto de Portada (Imagen del Libro)
            </label>
            <input
              ref={fileRef}
              id="inputPortadaLibro"
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={handlePortadaChange}
            />
            {form.portadaUrl && (
              <div className={styles.portadaPreview}>
                <img
                  id="imgPreviewPortada"
                  src={form.portadaUrl}
                  alt="Vista previa de portada"
                  className={styles.portadaImg}
                />
                <button
                  type="button"
                  className={styles.btnClearPortada}
                  onClick={() => { set('portadaUrl', ''); if (fileRef.current) fileRef.current.value = ''; }}
                  title="Quitar imagen"
                >
                  ✕ Quitar
                </button>
              </div>
            )}
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputTituloLibro" className={f.label}>Título *</label>
            <input id="inputTituloLibro" className={f.input}
              placeholder="Ej: Rayuela" required
              value={form.titulo} onChange={(e) => set('titulo', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputSubtituloLibro" className={f.labelOptional}>Subtítulo</label>
            <input id="inputSubtituloLibro" className={f.input}
              placeholder="Ej: Novela experimental"
              value={form.subtitulo} onChange={(e) => set('subtitulo', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputAutorLibro" className={f.label}>Autor *</label>
            <input id="inputAutorLibro" className={f.input}
              placeholder="Ej: Julio Cortázar" required
              value={form.autor} onChange={(e) => set('autor', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputCategoriaLibro" className={f.label}>Categoría Temática *</label>
            <input id="inputCategoriaLibro" className={f.input}
              placeholder="Ej: Novela" required
              value={form.categoria} onChange={(e) => set('categoria', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputIsbn" className={f.label}>Código ISBN *</label>
            <input id="inputIsbn" className={f.input}
              placeholder="Ej: 978-950-511-356-9" required
              value={form.isbn} onChange={(e) => set('isbn', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputEdicion" className={f.labelOptional}>Edición</label>
            <input id="inputEdicion" className={f.input}
              placeholder="Ej: 1ª Edición"
              value={form.edicion} onChange={(e) => set('edicion', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputExtension" className={f.labelOptional}>Extensión (Páginas)</label>
            <input id="inputExtension" className={f.input} type="number" min="1"
              placeholder="Ej: 600"
              value={form.extension} onChange={(e) => set('extension', e.target.value)} />
          </div>

          {/* ══ Sección 2: Inventario y Clasificación ══ */}
          <div className={f.sectionTitle}>Inventario y Clasificación de la Copia Inicial</div>

          <div className={f.formGroup}>
            <label htmlFor="inputLibristica" className={f.labelOptional}>Librística</label>
            <input id="inputLibristica" className={f.input}
              placeholder="Ej: LIBR-EXP"
              value={form.libristica} onChange={(e) => set('libristica', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputInventario" className={f.labelOptional}>Número de Inventario</label>
            <input id="inputInventario" className={f.input}
              placeholder="Ej: INV-74839"
              value={form.inventario} onChange={(e) => set('inventario', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputUbicacion" className={f.label}>Ubicación Física *</label>
            <input id="inputUbicacion" className={f.input}
              placeholder="Ej: Estante 4, Sector B" required
              value={form.ubicacion} onChange={(e) => set('ubicacion', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputClasificacion" className={f.labelOptional}>Clasificación CDU</label>
            <input id="inputClasificacion" className={f.input}
              placeholder="Ej: 863 C828r"
              value={form.clasificacion} onChange={(e) => set('clasificacion', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputNumero" className={f.labelOptional}>Tomo o Identificador</label>
            <input id="inputNumero" className={f.input}
              placeholder="Ej: Tomo 1"
              value={form.tomo} onChange={(e) => set('tomo', e.target.value)} />
          </div>

          {/* ══ Sección 3: Datos de Publicación ══ */}
          <div className={f.sectionTitle}>Datos de Publicación</div>

          <div className={f.formGroup}>
            <label htmlFor="inputEditorial" className={f.labelOptional}>Editorial</label>
            <input id="inputEditorial" className={f.input}
              placeholder="Ej: Sudamericana"
              value={form.editorial} onChange={(e) => set('editorial', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputFechaPublicacion" className={f.labelOptional}>Año de Publicación</label>
            <input id="inputFechaPublicacion" className={f.input}
              placeholder="Ej: 1963"
              value={form.fechaPublicacion} onChange={(e) => set('fechaPublicacion', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputLugarPublicacion" className={f.labelOptional}>Lugar de Publicación</label>
            <input id="inputLugarPublicacion" className={f.input}
              placeholder="Ej: Buenos Aires"
              value={form.lugarPublicacion} onChange={(e) => set('lugarPublicacion', e.target.value)} />
          </div>

          {/* ══ Sección 4: Temas y Colección ══ */}
          <div className={f.sectionTitle}>Temas y Colección</div>

          <div className={f.formGroup}>
            <label htmlFor="inputTemas" className={f.labelOptional}>Temas clave</label>
            <input id="inputTemas" className={f.input}
              placeholder="Separados por coma"
              value={form.temas} onChange={(e) => set('temas', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputTerminoMateria" className={f.labelOptional}>Término Materia</label>
            <input id="inputTerminoMateria" className={f.input}
              placeholder="Ej: Narrativa Argentina"
              value={form.terminoMateria} onChange={(e) => set('terminoMateria', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputColeccionPersonal" className={f.labelOptional}>Colección Personal</label>
            <input id="inputColeccionPersonal" className={f.input}
              placeholder="Ej: Bib. Privada"
              value={form.coleccionPersonal} onChange={(e) => set('coleccionPersonal', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputColeccionInstitucional" className={f.labelOptional}>Colección Institucional</label>
            <input id="inputColeccionInstitucional" className={f.input}
              placeholder="Ej: Fondo Histórico"
              value={form.coleccionInstitucional} onChange={(e) => set('coleccionInstitucional', e.target.value)} />
          </div>

          {/* ══ Sección 5: Notas ══ */}
          <div className={f.sectionTitle}>Notas</div>

          <div className={f.formGroupFull}>
            <label htmlFor="inputNotaGeneral" className={f.labelOptional}>Nota General</label>
            <textarea id="inputNotaGeneral" className={f.textarea} rows={2}
              value={form.notaGeneral} onChange={(e) => set('notaGeneral', e.target.value)} />
          </div>

          <div className={f.formGroupFull}>
            <label htmlFor="inputNotaContenido" className={f.labelOptional}>Nota de Contenido</label>
            <textarea id="inputNotaContenido" className={f.textarea} rows={2}
              value={form.notaContenido} onChange={(e) => set('notaContenido', e.target.value)} />
          </div>

        </div>

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={f.btnSubmit} id="btnGuardarLibroModal">
            {isEdit ? 'Guardar Cambios' : 'Añadir Libro'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
