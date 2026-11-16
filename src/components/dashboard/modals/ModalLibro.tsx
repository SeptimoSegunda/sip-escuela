'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCirclePlus, faCircleMinus, faCopy } from '@fortawesome/free-solid-svg-icons';
import type { Libro, Copia, EstadoCopia, AutorEntry, RolAutor, Prestamo, EstadoPrestamo, Autor, Editorial } from '@/types';
import Badge from '@/components/dashboard/ui/Badge';
import f from '@/components/ui/form.module.css';
import styles from './ModalLibro.module.css';
import type { NuevoLibroData } from '@/hooks/useLibros';
import Modal from '@/components/ui/Modal';

interface ModalLibroProps {
  open: boolean;
  onClose: () => void;
  libroEditar?: Libro | null;
  libroDuplicar?: Libro | null;
  onGuardar: (data: NuevoLibroData) => void;
  prestamos?: Prestamo[];
  autoresDisponibles?: Autor[];
  editorialesDisponibles?: Editorial[];
  onDuplicar?: (libro: Libro) => void;
}

type FormState = Omit<NuevoLibroData, 'autores' | 'copias'> & { copias?: Copia[], autores: AutorEntry[], editorialId?: string };

const empty: FormState = {
  isbn: '', titulo: '', subtitulo: '', autor: '', categoria: '',
  ubicacion: '', portadaUrl: '',
  edicion: '', extension: '', inventario: '', clasificacion: '',
  libristica: '', tomo: '', mencionResponsabilidad: '', colaboradores: '',
  nivel: '', idioma: '', editorial: '', fechaPublicacion: '',
  lugarPublicacion: '', temas: '', terminoMateria: '',
  coleccionPersonal: '', coleccionInstitucional: '',
  notaGeneral: '', notaContenido: '',
  autores: [{ nombre: '', rol: 'principal' }],
  copias: [],
};

function libroToForm(l: Libro, editoriales?: Editorial[]): FormState {
  const editorialId = l.editorial && editoriales
    ? editoriales.find(e => e.nombre === l.editorial)?.id
    : undefined;
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
    mencionResponsabilidad: l.mencionResponsabilidad ?? '',
    colaboradores:          l.colaboradores ?? '',
    nivel:                  l.nivel ?? '',
    idioma:                 l.idioma ?? '',
    editorial:              l.editorial ?? '',
    editorialId:            editorialId,
    fechaPublicacion:       l.fechaPublicacion ?? '',
    lugarPublicacion:       l.lugarPublicacion ?? '',
    temas:                  l.temas ?? '',
    terminoMateria:         l.terminoMateria ?? '',
    coleccionPersonal:      l.coleccionPersonal ?? '',
    coleccionInstitucional: l.coleccionInstitucional ?? '',
    notaGeneral:            l.notaGeneral ?? '',
    notaContenido:          l.notaContenido ?? '',
    autores:                l.autores && l.autores.length > 0
      ? l.autores
      : [{ nombre: l.autor, rol: 'principal' }],
    copias:                 l.copias ?? [],
  };
}

function formatFecha(iso: string): string {
  try { return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return iso; }
}

function estadoToBadge(estado: EstadoCopia): 'available' | 'borrowed' | 'warning' | 'low' | 'neutral' {
  if (estado === 'disponible') return 'available';
  if (estado === 'prestado') return 'borrowed';
  if (estado === 'dañado') return 'low';
  if (estado === 'perdido') return 'neutral';
  return 'warning';
}

function EstadoLabel(estado: EstadoPrestamo): string {
  if (estado === 'prestado') return 'Activo';
  if (estado === 'moroso') return 'Moroso';
  return 'Devuelto';
}

function prestamoEstadoToBadge(estado: EstadoPrestamo): 'available' | 'borrowed' | 'warning' | 'low' | 'neutral' {
  if (estado === 'prestado') return 'borrowed';
  if (estado === 'moroso') return 'low';
  return 'available';
}

export default function ModalLibro({ open, onClose, libroEditar, libroDuplicar, onGuardar, prestamos, autoresDisponibles, editorialesDisponibles, onDuplicar }: ModalLibroProps) {
  const [form, setForm] = useState<FormState>(empty);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      if (libroDuplicar) {
        setForm(libroToForm(libroDuplicar, editorialesDisponibles));
      } else {
        setForm(libroEditar ? libroToForm(libroEditar, editorialesDisponibles) : empty);
      }
      if (fileRef.current) fileRef.current.value = '';
    }
  }, [open, libroEditar, libroDuplicar, editorialesDisponibles]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handlePortadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('portadaUrl', (ev.target?.result as string) ?? '');
    reader.readAsDataURL(file);
  };

  /* ── Autores ── */
  const updateAutor = (i: number, campo: keyof AutorEntry, v: string | RolAutor) =>
    set('autores', form.autores.map((a, idx) =>
      idx === i ? { ...a, [campo]: v } : a
    ));

  const addAutor = () => {
    // Agregar un nuevo autor - preseleccionar el primer autor disponible o vacío
    const existingNames = form.autores.map(a => a.nombre);
    const availableAutor = autoresDisponibles?.find(a => !existingNames.includes(a.nombre));
    set('autores', [...form.autores, {
      nombre: availableAutor?.nombre ?? '',
      rol: 'secundario'
    }]);
  };

  const removeAutor = (i: number) =>
    set('autores', form.autores.filter((_, idx) => idx !== i));

  /* ── Copias ── */
  const copias = form.copias ?? libroEditar?.copias ?? [];
  const totalCopias = copias.length;
  const disponibles = copias.filter((c) => c.estado === 'disponible').length;

  const handleIncrementar = () => set('copias', [...copias, {
    id: `C-${Date.now()}`,
    inventarioNum: `INV-${1001 + copias.length}`,
    estado: 'disponible'
  }]);

  const handleDisminuir = () => {
    if (totalCopias <= 1) return;
    const dispIdx = [...copias].reverse().findIndex((c) => c.estado === 'disponible');
    const removeIdx = dispIdx !== -1
      ? copias.length - 1 - dispIdx
      : copias.length - 1;
    set('copias', copias.filter((_, i) => i !== removeIdx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedEditorial = editorialesDisponibles?.find(e => e.id === form.editorialId)?.nombre ?? form.editorial;
    onGuardar({
      isbn:                   form.isbn.trim(),
      titulo:                 form.titulo.trim(),
      subtitulo:              form.subtitulo?.trim() || undefined,
      autor:                  form.autores[0]?.nombre.trim() || form.autor.trim(),
      autores:                form.autores,
      categoria:              form.categoria.trim(),
      ubicacion:              form.ubicacion.trim(),
      portadaUrl:             form.portadaUrl || undefined,
      edicion:                form.edicion?.trim() || undefined,
      extension:              form.extension?.trim() || undefined,
      inventario:             form.inventario?.trim() || undefined,
      clasificacion:          form.clasificacion?.trim() || undefined,
      libristica:             form.libristica?.trim() || undefined,
      tomo:                   form.tomo?.trim() || undefined,
      mencionResponsabilidad: form.mencionResponsabilidad?.trim() ?? undefined,
      colaboradores:          form.colaboradores?.trim() || undefined,
      nivel:                  form.nivel?.trim() || undefined,
      idioma:                 form.idioma?.trim() || undefined,
      editorial:              selectedEditorial,
      fechaPublicacion:       form.fechaPublicacion?.trim() || undefined,
      lugarPublicacion:       form.lugarPublicacion?.trim() || undefined,
      temas:                  form.temas?.trim() || undefined,
      terminoMateria:         form.terminoMateria?.trim() || undefined,
      coleccionPersonal:      form.coleccionPersonal?.trim() || undefined,
      coleccionInstitucional: form.coleccionInstitucional?.trim() || undefined,
      notaGeneral:            form.notaGeneral?.trim() || undefined,
      notaContenido:          form.notaContenido?.trim() || undefined,
    });
    onClose();
  };

  const isEdit = !!libroEditar;
  const isDuplicar = !!libroDuplicar;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Libro' : isDuplicar ? 'Duplicar Libro' : 'Añadir Libro'} id="modalNuevoLibro" size="lg">
      <form id="formNuevoLibro" onSubmit={handleSubmit}>
        <div className={f.formGrid}>

          {/* ══ Sección 1: Información Principal ══ */}
          <div className={f.sectionTitle}>Información Principal</div>

          {/* Portada — upload local */}
          <div className={`${f.formGroupFull} ${styles.portadaGroup}`}>
            <label htmlFor="inputPortadaLibro" className={f.labelOptional}>Foto de Portada (Opcional)</label>
            <input ref={fileRef} id="inputPortadaLibro" type="file" accept="image/*" className={styles.fileInput} onChange={handlePortadaChange} />
            {form.portadaUrl && (
              <div className={styles.portadaPreview}>
                <img id="imgPreviewPortada" src={form.portadaUrl} alt="Vista previa de portada" className={styles.portadaImg} />
                <button type="button" className={styles.btnClearPortada} onClick={() => { set('portadaUrl', ''); if (fileRef.current) fileRef.current.value = ''; }} title="Quitar imagen">✕ Quitar</button>
              </div>
            )}
          </div>

          {/* ══ Mensaje de duplicado ── */}
          {isDuplicar && (
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: '8px',
              marginBottom: '1rem'
            }}>
              <strong style={{ color: 'var(--text-main)' }}>Datos prellenados como placeholders:</strong> Título, ISBN, Editorial, Autores, Ubicación, Portada y más han sido cargados desde el libro "{libroDuplicar.titulo}".
            </div>
          )}

          <div className={f.formGroup}>
            <label htmlFor="inputTituloLibro" className={f.label}>Título *</label>
            <input id="inputTituloLibro" className={f.input} required value={form.titulo} onChange={(e) => set('titulo', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputSubtituloLibro" className={f.labelOptional}>Subtítulo</label>
            <input id="inputSubtituloLibro" className={f.input} value={form.subtitulo} onChange={(e) => set('subtitulo', e.target.value)} />
          </div>

          {/* ── Autor Principal (select si hay autores disponibles) ── */}
          {autoresDisponibles && autoresDisponibles.length > 0 ? (
            <div className={f.formGroup}>
              <label htmlFor="inputAutorLibro" className={f.label}>Autor Principal *</label>
              <select
                id="inputAutorLibro"
                className={f.select}
                required
                value={form.autores[0]?.nombre ?? ''}
                onChange={(e) => updateAutor(0, 'nombre', e.target.value)}
              >
                <option value="">Seleccionar autor principal</option>
                {autoresDisponibles.map(autor => (
                  <option key={autor.id} value={autor.nombre}>{autor.nombre}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className={f.formGroup}>
              <label htmlFor="inputAutorLibro" className={f.label}>Autor Principal *</label>
              <input id="inputAutorLibro" className={f.input} required value={form.autor} onChange={(e) => set('autor', e.target.value)} />
            </div>
          )}

          {/* ── Autores secundarios (select si hay autores disponibles) ── */}
          {autoresDisponibles && autoresDisponibles.length > 0 && (
            <div className={f.formGroupFull}>
              <div className={styles.autoresWrapper}>
                <span className={styles.autoresTitle}>Autores Adicionales</span>
                <div className={styles.autoresList}>
                  {form.autores.map((a, i) => (
                    <div key={i} className={styles.autorRow}>
                      <select
                        className={f.input}
                        value={a.nombre}
                        onChange={(e) => updateAutor(i, 'nombre', e.target.value)}
                      >
                        <option value="">Agregar autor...</option>
                        {autoresDisponibles.filter(auth => !form.autores.slice(0, i).some(existing => existing.nombre === auth.nombre)).map(autor => (
                          <option key={autor.id} value={autor.nombre}>{autor.nombre}</option>
                        ))}
                      </select>
                      <select className={`${f.select} ${styles.autorRolSelect}`} value={a.rol} onChange={(e) => updateAutor(i, 'rol', e.target.value as RolAutor)}>
                        <option value="principal">Principal</option>
                        <option value="secundario">Secundario</option>
                        <option value="institucional">Institucional</option>
                      </select>
                      {form.autores.length > 1 && <button type="button" className={styles.btnRemoveAutor} onClick={() => removeAutor(i)} title="Eliminar autor">✕</button>}
                    </div>
                  ))}
                </div>
                <button type="button" className={styles.btnAutores} onClick={addAutor}><FontAwesomeIcon icon={faPlus} /> Agregar autor</button>
              </div>
            </div>
          )}

          {/* ── Autores manuales (solo si no hay autores disponibles) ── */}
          {!autoresDisponibles || autoresDisponibles.length === 0 ? (
            <div className={f.formGroupFull}>
              <div className={styles.autoresWrapper}>
                <span className={styles.autoresTitle}>Autores</span>
                <div className={styles.autoresList}>
                  {form.autores.map((a, i) => (
                    <div key={i} className={styles.autorRow}>
                      <input className={f.input} placeholder="Nombre del autor" value={a.nombre} onChange={(e) => updateAutor(i, 'nombre', e.target.value)} />
                      <select className={`${f.select} ${styles.autorRolSelect}`} value={a.rol} onChange={(e) => updateAutor(i, 'rol', e.target.value as RolAutor)}>
                        <option value="principal">Principal</option>
                        <option value="secundario">Secundario</option>
                        <option value="institucional">Institucional</option>
                      </select>
                      {form.autores.length > 1 && <button type="button" className={styles.btnRemoveAutor} onClick={() => removeAutor(i)} title="Eliminar autor">✕</button>}
                    </div>
                  ))}
                </div>
                <button type="button" className={styles.btnAutores} onClick={addAutor}><FontAwesomeIcon icon={faPlus} /> Agregar autor</button>
              </div>
            </div>
          ) : null}

          <div className={f.formGroup}>
            <label htmlFor="inputEdicion" className={f.labelOptional}>Edición</label>
            <input id="inputEdicion" className={f.input} value={form.edicion} onChange={(e) => set('edicion', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputExtension" className={f.labelOptional}>Páginas</label>
            <input id="inputExtension" className={f.input} type="number" min="1" value={form.extension} onChange={(e) => set('extension', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputTemas" className={f.labelOptional}>Materias</label>
            <input id="inputTemas" className={f.input} value={form.temas} onChange={(e) => set('temas', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputCategoriaLibro" className={f.label}>Género *</label>
            <input id="inputCategoriaLibro" className={f.input} required value={form.categoria} onChange={(e) => set('categoria', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputIsbn" className={f.label}>ISBN *</label>
            <input id="inputIsbn" className={f.input} required value={form.isbn} onChange={(e) => set('isbn', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputMencion" className={f.labelOptional}>Mención de Responsabilidad</label>
            <input id="inputMencion" className={f.input} value={form.mencionResponsabilidad} onChange={(e) => set('mencionResponsabilidad', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputIdioma" className={f.labelOptional}>Idioma</label>
            <input id="inputIdioma" className={f.input} value={form.idioma} onChange={(e) => set('idioma', e.target.value)} />
          </div>

          {/* ══ Sección 2: Control de ejemplares ══ */}
          <div className={f.sectionTitle}>Control de ejemplares</div>

          <div className={styles.copiesBox}>
            <div className={styles.copiesLeft}>
              <div className={styles.copiesIcon}><FontAwesomeIcon icon={faCopy} /></div>
              <div>
                <p className={styles.copiesLabel}>Ejemplares Registrados</p>
                <div className={styles.copiesCountRow}>
                  <span className={styles.copiesTotalBadge}><strong>{totalCopias}</strong> ejemplar(s)</span>
                  <span className={styles.copiesAvailable}>{disponibles} disponible{disponibles !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>
            <div className={styles.copiesActions}>
              <button type="button" className={styles.btnIncrementar} onClick={handleIncrementar}><FontAwesomeIcon icon={faCirclePlus} /> Aumentar</button>
              <button type="button" className={styles.btnDisminuir} onClick={handleDisminuir} disabled={totalCopias <= 1}><FontAwesomeIcon icon={faCircleMinus} /> Disminuir</button>
            </div>
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputInventario" className={f.labelOptional}>Número de Inventario</label>
            <input id="inputInventario" className={f.input} value={form.inventario} onChange={(e) => set('inventario', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputClasificacion" className={f.labelOptional}>Clasificación CDU</label>
            <input id="inputClasificacion" className={f.input} value={form.clasificacion} onChange={(e) => set('clasificacion', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputUbicacion" className={f.label}>Ubicación Física *</label>
            <input id="inputUbicacion" className={f.input} required value={form.ubicacion} onChange={(e) => set('ubicacion', e.target.value)} />
          </div>

          {/* Historial de préstamos del libro (solo en edición) */}
          {isEdit && (
            <div className={`${f.formGroupFull} ${styles.historySection}`}>
              <h4 className={styles.historyTitle}>Historial de Préstamos</h4>
              <div className={styles.tableWrapperSmall}>
                <table className={styles.dataTableSmall}>
                  <thead>
                    <tr><th>ID Préstamo</th><th>Socio</th><th>Fecha</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {prestamos?.filter(p => p.libroId === libroEditar?.id).length ? (
                      prestamos.filter(p => p.libroId === libroEditar?.id).slice(0, 5).map(p => (
                        <tr key={p.id}>
                          <td className={styles.cellMono}>{p.id}</td>
                          <td>{p.prestatario}</td>
                          <td className={styles.cellMono}>{formatFecha(p.fechaPrestamo)}</td>
                          <td><Badge variant={prestamoEstadoToBadge(p.estado)}>{EstadoLabel(p.estado)}</Badge></td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4} className={styles.emptyState}>Sin préstamos registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ══ Sección 3: Datos de Publicación ══ */}
          <div className={f.sectionTitle}>Datos de Publicación</div>

          <div className={f.formGroup}>
            <label htmlFor="inputLugarPublicacion" className={f.labelOptional}>Lugar de Publicación</label>
            <input id="inputLugarPublicacion" className={f.input} value={form.lugarPublicacion} onChange={(e) => set('lugarPublicacion', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputFechaPublicacion" className={f.labelOptional}>Año de Publicación</label>
            <input id="inputFechaPublicacion" className={f.input} value={form.fechaPublicacion} onChange={(e) => set('fechaPublicacion', e.target.value)} />
          </div>

          {/* ── Editorial (select si hay editoriales disponibles) ── */}
          {editorialesDisponibles && editorialesDisponibles.length > 0 ? (
            <div className={f.formGroup}>
              <label htmlFor="inputEditorial" className={f.labelOptional}>Editorial</label>
              <select
                id="inputEditorial"
                className={f.select}
                value={form.editorialId ?? ''}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedEditorial = editorialesDisponibles.find(e => e.id === selectedId);
                  set('editorialId', selectedId);
                  set('editorial', selectedEditorial?.nombre ?? '');
                }}
              >
                <option value="">Seleccionar editorial</option>
                {editorialesDisponibles.map(edit => (
                  <option key={edit.id} value={edit.id}>{edit.nombre}</option>
                ))}
              </select>
            </div>
          ) : (
            <div className={f.formGroup}>
              <label htmlFor="inputEditorial" className={f.labelOptional}>Editorial</label>
              <input id="inputEditorial" className={f.input} value={form.editorial} onChange={(e) => set('editorial', e.target.value)} />
            </div>
          )}

          {/* ══ Sección 4: Descripción y Contenido ══ */}
          <div className={f.sectionTitle}>Descripción y Contenido</div>

          <div className={f.formGroupFull}>
            <label htmlFor="inputNotaGeneral" className={f.labelOptional}>Resumen</label>
            <textarea id="inputNotaGeneral" className={f.textarea} rows={2} value={form.notaGeneral} onChange={(e) => set('notaGeneral', e.target.value)} />
          </div>

          <div className={f.formGroupFull}>
            <label htmlFor="inputNotaContenido" className={f.labelOptional}>Contenido</label>
            <textarea id="inputNotaContenido" className={f.textarea} rows={2} value={form.notaContenido} onChange={(e) => set('notaContenido', e.target.value)} />
          </div>

        </div>

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={f.btnSubmit} id="btnGuardarLibroModal">
            {isEdit ? 'Guardar Cambios' : isDuplicar ? 'Duplicar Libro' : 'Añadir'}
          </button>
        </div>
      </form>
    </Modal>
  );
}