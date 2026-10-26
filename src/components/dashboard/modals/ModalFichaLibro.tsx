'use client';

import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCopy,
  faCirclePlus,
  faCircleMinus,
  faFloppyDisk,
  faAddressCard,
  faPrint,
  faTags,
  faBuildingColumns,
  faFileLines,
  faClockRotateLeft,
} from '@fortawesome/free-solid-svg-icons';
import type { Libro, Prestamo } from '@/types';
import Modal from '@/components/ui/Modal';
import f from '@/components/ui/form.module.css';
import styles from './ModalFichaLibro.module.css';

interface ModalFichaLibroProps {
  open: boolean;
  onClose: () => void;
  libro: Libro | null;
  prestamos: Prestamo[];
  onGuardar: (libroId: string, data: Partial<LibroExtra>) => void;
  onIncrementarCopia: (libroId: string) => void;
  onDisminuirCopia:   (libroId: string) => void;
  onDuplicar:         (libro: Libro) => void;
}

export interface LibroExtra {
  titulo:               string;
  subtitulo?:           string;
  autor:                string;
  isbn:                 string;
  categoria:            string;
  ubicacion:            string;
  clasificacion?:       string;
  libristica?:          string;
  editorial?:           string;
  fechaPublicacion?:    string;
  lugarPublicacion?:    string;
  edicion?:             string;
  extension?:           string;
  temas?:               string;
  terminoMateria?:      string;
  coleccionPersonal?:   string;
  coleccionInstitucional?: string;
  tomo?:                string;
  notaGeneral?:         string;
  notaContenido?:       string;
  portadaUrl?:          string;
}

const empty: LibroExtra = {
  titulo: '', subtitulo: '', autor: '', isbn: '', categoria: '',
  ubicacion: '', clasificacion: '', libristica: '', editorial: '',
  fechaPublicacion: '', lugarPublicacion: '', edicion: '', extension: '',
  temas: '', terminoMateria: '', coleccionPersonal: '',
  coleccionInstitucional: '', tomo: '', notaGeneral: '', notaContenido: '',
  portadaUrl: '',
};

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return iso; }
}

export default function ModalFichaLibro({
  open, onClose, libro, prestamos,
  onGuardar, onIncrementarCopia, onDisminuirCopia, onDuplicar,
}: ModalFichaLibroProps) {
  const [form, setForm] = useState<LibroExtra>(empty);

  useEffect(() => {
    if (open && libro) {
      setForm({
        titulo:                libro.titulo,
        subtitulo:             '',
        autor:                 libro.autor,
        isbn:                  libro.isbn,
        categoria:             libro.categoria,
        ubicacion:             libro.ubicacion,
        clasificacion:         '',
        libristica:            '',
        editorial:             '',
        fechaPublicacion:      '',
        lugarPublicacion:      '',
        edicion:               '',
        extension:             '',
        temas:                 '',
        terminoMateria:        '',
        coleccionPersonal:     '',
        coleccionInstitucional: '',
        tomo:                  '',
        notaGeneral:           '',
        notaContenido:         '',
        portadaUrl:            libro.portadaUrl ?? '',
      });
    }
  }, [open, libro]);

  const set = <K extends keyof LibroExtra>(k: K, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  /* Historial de préstamos de este libro */
  const historial = useMemo(
    () => libro ? prestamos.filter((p) => p.libroId === libro.id) : [],
    [libro, prestamos]
  );

  const copias         = libro?.copias ?? [];
  const totalCopias    = copias.length;
  const disponibles    = copias.filter((c) => c.estado === 'disponible').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!libro) return;
    onGuardar(libro.id, form);
    onClose();
  };

  if (!libro) return null;

  return (
    <Modal open={open} onClose={onClose} title="Ficha y Gestión del Libro" id="modalDetalleLibro" size="lg">
      {/* ── Control de copias ── */}
      <div className={styles.copiesBox}>
        <div className={styles.copiesLeft}>
          <div className={styles.copiesIcon}><FontAwesomeIcon icon={faCopy} /></div>
          <div>
            <p className={styles.copiesLabel}>Copias y Ejemplares Registrados</p>
            <div className={styles.copiesCountRow}>
              <span className={styles.copiesTotalBadge}>
                <strong id="detailTotalCopiesCount">{totalCopias}</strong> ejemplar(es)
              </span>
              <span className={`${styles.copiesAvailable} ${disponibles === 0 ? styles.copiesAvailableEmpty : ''}`}
                id="detailAvailableCopiesText">
                {disponibles} disponible{disponibles !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
        <div className={styles.copiesActions}>
          <button
            type="button"
            className={styles.btnIncrementar}
            id="btnIncrementarCopias"
            onClick={() => onIncrementarCopia(libro.id)}
          >
            <FontAwesomeIcon icon={faCirclePlus} /> Aumentar Copias
          </button>
          <button
            type="button"
            className={styles.btnDisminuir}
            id="btnDisminuirCopias"
            onClick={() => onDisminuirCopia(libro.id)}
            disabled={totalCopias <= 1}
          >
            <FontAwesomeIcon icon={faCircleMinus} /> Disminuir Copias
          </button>
          <button
            type="button"
            className={styles.btnDuplicar}
            id="btnDuplicarLibroModal"
            onClick={() => onDuplicar(libro)}
          >
            <FontAwesomeIcon icon={faCopy} /> Duplicar a Nuevo Libro
          </button>
        </div>
      </div>

      {/* ── Formulario principal ── */}
      <form id="formEdicionCopia" onSubmit={handleSubmit}>

        {/* Portada + Título + Estado */}
        <div className={styles.portadaRow}>
          {form.portadaUrl && (
            <img
              id="detailPortadaImg"
              src={form.portadaUrl}
              alt="Portada"
              className={styles.portadaImg}
            />
          )}
          <div className={styles.portadaFields}>
            <div className={f.formGroup}>
              <label htmlFor="editCopyTitulo" className={f.label} style={{ fontSize: '0.75rem' }}>Título del libro</label>
              <input id="editCopyTitulo" className={`${f.input} ${styles.inputTitulo}`}
                value={form.titulo} onChange={(e) => set('titulo', e.target.value)} required />
            </div>
            <div className={f.formGroup}>
              <label htmlFor="editCopySubtitulo" className={f.labelOptional} style={{ fontSize: '0.75rem' }}>Subtítulo</label>
              <input id="editCopySubtitulo" className={f.input}
                placeholder="Subtítulo opcional"
                value={form.subtitulo} onChange={(e) => set('subtitulo', e.target.value)} />
            </div>
            <div className={f.formGroup}>
              <label htmlFor="inputPortadaUrl" className={f.labelOptional} style={{ fontSize: '0.75rem' }}>URL de Portada</label>
              <input id="inputPortadaUrl" className={f.input} type="url"
                placeholder="https://..."
                value={form.portadaUrl} onChange={(e) => set('portadaUrl', e.target.value)} />
            </div>
          </div>
        </div>

        {/* ── Secciones de detalles ── */}
        <div className={styles.detailsGrid}>

          {/* Identificación e Inventario */}
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <FontAwesomeIcon icon={faAddressCard} /> Identificación e Inventario
            </div>
            <div className={styles.detailFields}>
              <div className={f.formGroup}>
                <label htmlFor="editCopyIsbn" className={f.label}>Código ISBN</label>
                <input id="editCopyIsbn" className={f.input} value={form.isbn}
                  onChange={(e) => set('isbn', e.target.value)} required />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyUbicacion" className={f.label}>Ubicación Física *</label>
                <input id="editCopyUbicacion" className={f.input} value={form.ubicacion}
                  onChange={(e) => set('ubicacion', e.target.value)} required />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyClasificacion" className={f.labelOptional}>Clasificación CDU</label>
                <input id="editCopyClasificacion" className={f.input} value={form.clasificacion}
                  onChange={(e) => set('clasificacion', e.target.value)} />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyLibristica" className={f.labelOptional}>Librística</label>
                <input id="editCopyLibristica" className={f.input} value={form.libristica}
                  onChange={(e) => set('libristica', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Publicación y Autor */}
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <FontAwesomeIcon icon={faPrint} /> Publicación y Autor
            </div>
            <div className={styles.detailFields}>
              <div className={f.formGroup}>
                <label htmlFor="editCopyAutor" className={f.label}>Autor *</label>
                <input id="editCopyAutor" className={f.input} value={form.autor}
                  onChange={(e) => set('autor', e.target.value)} required />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyEditorial" className={f.labelOptional}>Editorial</label>
                <input id="editCopyEditorial" className={f.input} value={form.editorial}
                  onChange={(e) => set('editorial', e.target.value)} />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyFecha" className={f.labelOptional}>Año de Publicación</label>
                <input id="editCopyFecha" className={f.input} value={form.fechaPublicacion}
                  onChange={(e) => set('fechaPublicacion', e.target.value)} />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyLugar" className={f.labelOptional}>Lugar de Publicación</label>
                <input id="editCopyLugar" className={f.input} value={form.lugarPublicacion}
                  onChange={(e) => set('lugarPublicacion', e.target.value)} />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyEdicion" className={f.labelOptional}>Edición</label>
                <input id="editCopyEdicion" className={f.input} value={form.edicion}
                  onChange={(e) => set('edicion', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Clasificación y Extensión */}
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <FontAwesomeIcon icon={faTags} /> Clasificación y Extensión
            </div>
            <div className={styles.detailFields}>
              <div className={f.formGroup}>
                <label htmlFor="editCopyCategoria" className={f.label}>Categoría *</label>
                <input id="editCopyCategoria" className={f.input} value={form.categoria}
                  onChange={(e) => set('categoria', e.target.value)} required />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyExtension" className={f.labelOptional}>Extensión (Páginas)</label>
                <input id="editCopyExtension" className={f.input} type="number" min="1"
                  value={form.extension} onChange={(e) => set('extension', e.target.value)} />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyTemas" className={f.labelOptional}>Palabras Clave</label>
                <input id="editCopyTemas" className={f.input} placeholder="Separadas por coma"
                  value={form.temas} onChange={(e) => set('temas', e.target.value)} />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyTerminoMateria" className={f.labelOptional}>Término Materia</label>
                <input id="editCopyTerminoMateria" className={f.input}
                  value={form.terminoMateria} onChange={(e) => set('terminoMateria', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Colecciones */}
          <div className={styles.detailCard}>
            <div className={styles.detailCardHeader}>
              <FontAwesomeIcon icon={faBuildingColumns} /> Colecciones
            </div>
            <div className={styles.detailFields}>
              <div className={f.formGroup}>
                <label htmlFor="editCopyColeccionPersonal" className={f.labelOptional}>Dirección Personal</label>
                <input id="editCopyColeccionPersonal" className={f.input}
                  value={form.coleccionPersonal} onChange={(e) => set('coleccionPersonal', e.target.value)} />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyColeccionInstitucional" className={f.labelOptional}>Dirección Institucional</label>
                <input id="editCopyColeccionInstitucional" className={f.input}
                  value={form.coleccionInstitucional} onChange={(e) => set('coleccionInstitucional', e.target.value)} />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyNumero" className={f.labelOptional}>Tomo o Identificador</label>
                <input id="editCopyNumero" className={f.input}
                  value={form.tomo} onChange={(e) => set('tomo', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Notas — span 2 */}
          <div className={`${styles.detailCard} ${styles.detailCardFull}`}>
            <div className={styles.detailCardHeader}>
              <FontAwesomeIcon icon={faFileLines} /> Notas Particulares de este Ejemplar
            </div>
            <div className={styles.detailFieldsCol}>
              <div className={f.formGroup}>
                <label htmlFor="editCopyNotaGeneral" className={f.labelOptional}>Nota General</label>
                <textarea id="editCopyNotaGeneral" className={f.textarea} rows={2}
                  value={form.notaGeneral} onChange={(e) => set('notaGeneral', e.target.value)} />
              </div>
              <div className={f.formGroup}>
                <label htmlFor="editCopyNotaContenido" className={f.labelOptional}>Estado Físico del Ejemplar</label>
                <textarea id="editCopyNotaContenido" className={f.textarea} rows={2}
                  value={form.notaContenido} onChange={(e) => set('notaContenido', e.target.value)} />
              </div>
            </div>
          </div>

          {/* Historial de préstamos — span 2 */}
          <div className={`${styles.detailCard} ${styles.detailCardFull}`}>
            <div className={styles.detailCardHeader}>
              <FontAwesomeIcon icon={faClockRotateLeft} /> Historial de Préstamos
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.dataTable} id="bookHistoryTableBody">
                <thead>
                  <tr>
                    <th>ID Préstamo</th>
                    <th>Socio</th>
                    <th>Fecha Préstamo</th>
                    <th>Fecha Límite</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {historial.length === 0 ? (
                    <tr>
                      <td colSpan={5} className={styles.emptyHistory} id="noBookHistoryMessage">
                        Sin préstamos históricos registrados.
                      </td>
                    </tr>
                  ) : (
                    historial.map((p) => (
                      <tr key={p.id}>
                        <td className={styles.cellMono}>{p.id}</td>
                        <td>{p.socioNombre}</td>
                        <td>{formatFecha(p.fechaPrestamo)}</td>
                        <td>{formatFecha(p.fechaLimite)}</td>
                        <td>
                          <span className={`${styles.estadoBadge} ${styles['estado_' + p.estado]}`}>
                            {p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>Cerrar</button>
          <button type="submit" className={f.btnSubmit}>
            <FontAwesomeIcon icon={faFloppyDisk} /> Guardar Cambios del Libro
          </button>
        </div>
      </form>
    </Modal>
  );
}
