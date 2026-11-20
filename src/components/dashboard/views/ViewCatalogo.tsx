'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faMagnifyingGlass,
  faSearch,
  faTrash,
  faPen,
  faEye,
  faBook,
  faUser,
  faBuilding,
  faChevronDown,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import type { Libro, Editorial, Autor } from '@/types';
import Badge, { type BadgeVariant } from '@/components/dashboard/ui/Badge';
import { formatFecha } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import styles from './ViewCatalogo.module.css';

interface ViewCatalogoProps {
  libros: Libro[];
  autores: Autor[];
  editoriales: Editorial[];
  onNuevoLibro: () => void;
  onNuevoAutor: () => void;
  onNuevoEditorial: () => void;
  onEditar: (libro: Libro) => void;
  onVerDetalle: (libro: Libro) => void;
  onEliminar: (libroIds: string[]) => void;
  onEliminarAutor: (autorId: string) => void;
  onEliminarEditorial: (editorialId: string) => void;
  onEditarAutor?: (autor: Autor) => void;
  onEditarEditorial?: (editorial: Editorial) => void;
  onBusquedaAsistida?: () => void;
  filtroActivo?: boolean;
  onLimpiarFiltro?: () => void;
  readOnly?: boolean;
}

type VistaCatalogo = 'libros' | 'editoriales' | 'autores';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

function estadoDisponibilidad(libro: Libro): { label: string; variant: BadgeVariant } {
  const total = libro.copias.length;
  const disponibles = libro.copias.filter((c) => c.estado === 'disponible').length;
  if (total === 0) return { label: 'Sin copias', variant: 'neutral' };
  if (disponibles === 0) return { label: 'Agotado', variant: 'low' };
  if (disponibles < total) return { label: `${disponibles}/${total} disp.`, variant: 'warning' };
  return { label: `${disponibles}/${total} disp.`, variant: 'available' };
}

export default function ViewCatalogo({
  libros,
  autores,
  editoriales,
  onNuevoLibro,
  onNuevoAutor,
  onNuevoEditorial,
  onEditar,
  onVerDetalle,
  onEliminar,
  onEliminarAutor,
  onEliminarEditorial,
  onEditarAutor,
  onEditarEditorial,
  onBusquedaAsistida,
  filtroActivo = false,
  onLimpiarFiltro,
  readOnly = false,
}: ViewCatalogoProps) {
  const [busqueda, setBusqueda] = useState('');
  const [modoBorradoGrupal, setModoBorradoGrupal] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [vistaActiva, setVistaActiva] = useState<VistaCatalogo>('libros');
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  /* ── Filtrado ── */
  const librosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return libros;
    return libros.filter((l) =>
      `${l.titulo} ${l.autor} ${l.categoria} ${l.isbn} ${l.ubicacion} ${l.copias
        .map((c) => c.inventarioNum)
        .join(' ')}`.toLowerCase().includes(q)
    );
  }, [libros, busqueda]);

  const autoresFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return autores;
    return autores.filter(a =>
      `${a.nombre} ${a.apellido}`.toLowerCase().includes(q)
    );
  }, [autores, busqueda]);

  const editorialesFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return editoriales;
    return editoriales.filter(e =>
      e.nombre.toLowerCase().includes(q)
    );
  }, [editoriales, busqueda]);

  /* ── Selección grupal ── */
  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTodos = (checked: boolean) => {
    if (vistaActiva === 'autores') {
      setSeleccionados(checked ? new Set(autoresFiltrados.map((a) => a.id)) : new Set());
    } else if (vistaActiva === 'editoriales') {
      setSeleccionados(checked ? new Set(editorialesFiltrados.map((e) => e.id)) : new Set());
    } else {
      setSeleccionados(checked ? new Set(librosFiltrados.map((l) => l.id)) : new Set());
    }
  };

  const handleCancelarGrupal = () => {
    setModoBorradoGrupal(false);
    setSeleccionados(new Set());
  };

  const handleEliminarLibro = (libroId: string) => {
    onEliminar([libroId]);
    handleCancelarGrupal();
  };

  const handleEliminarAutor = (autorId: string) => {
    onEliminarAutor(autorId);
    handleCancelarGrupal();
  };

  const handleEliminarEditorial = (editorialId: string) => {
    onEliminarEditorial(editorialId);
    handleCancelarGrupal();
  };

  const handleEliminarGrupal = () => {
    if (seleccionados.size === 0) return;
    const ids = Array.from(seleccionados);
    setConfirmModal({
      open: true,
      title: 'Confirmar Borrado Grupal',
      message: `¿Estás seguro de que deseas eliminar permanentemente ${ids.length} registros seleccionados? Esta acción no se puede deshacer.`,
      onConfirm: () => {
        if (vistaActiva === 'autores') {
          ids.forEach((id) => onEliminarAutor(id));
        } else if (vistaActiva === 'editoriales') {
          ids.forEach((id) => onEliminarEditorial(id));
        } else {
          onEliminar(ids);
        }
        handleCancelarGrupal();
      },
    });
  };

  const getTotalItems = () => {
    if (vistaActiva === 'autores') return autoresFiltrados.length;
    if (vistaActiva === 'editoriales') return editorialesFiltrados.length;
    return librosFiltrados.length;
  };

  const getTodosSeleccionados = () => {
    if (vistaActiva === 'autores') return autoresFiltrados.length > 0 && seleccionados.size === autoresFiltrados.length;
    if (vistaActiva === 'editoriales') return editorialesFiltrados.length > 0 && seleccionados.size === editorialesFiltrados.length;
    return librosFiltrados.length > 0 && seleccionados.size === librosFiltrados.length;
  };

  return (
    <div className={styles.viewWrapper}>
      {/* Encabezado */}
      <section className={styles.welcomeSection}>
        <div>
          <h1 className={styles.viewTitle}>Catálogo Completo</h1>
          <p className={styles.viewSubtitle}>
            {vistaActiva === 'libros' && 'Inventario general de títulos disponibles y en préstamo.'}
            {vistaActiva === 'editoriales' && 'Listado de editoriales registradas en el sistema.'}
            {vistaActiva === 'autores' && 'Listado de autores registrados en el sistema.'}
          </p>
        </div>
        {!readOnly && (
          <div style={{ position: 'relative' }}>
            <button
              id="btnAgregarDropdown"
              className={styles.btnPrimary}
              onClick={() => {
                const sel = document.getElementById('dropdownMenu');
                if (sel) sel.style.display = sel.style.display === 'block' ? 'none' : 'block';
              }}
            >
              <FontAwesomeIcon icon={faPlus} />
              Añadir <FontAwesomeIcon icon={faChevronDown} style={{ marginLeft: '0.3rem', fontSize: '0.7em' }} />
            </button>
            {/* Menú desplegable */}
            <div
              id="dropdownMenu"
              style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                marginTop: '0.75rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--beige-dark)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 100,
                display: 'none',
                minWidth: '180px',
                gap: '0.25rem',
                padding: '0.5rem',
                flexDirection: 'column',
              }}
            >
              <button
                type="button"
                className={styles.btnSecondarySmall}
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => { document.getElementById('dropdownMenu')!.style.display = 'none'; onNuevoLibro(); }}
              >
                <FontAwesomeIcon icon={faBook} style={{ marginRight: '0.5rem' }} /> Libro
              </button>
              <button
                type="button"
                className={styles.btnSecondarySmall}
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => { document.getElementById('dropdownMenu')!.style.display = 'none'; onNuevoAutor(); }}
              >
                <FontAwesomeIcon icon={faUser} style={{ marginRight: '0.5rem' }} /> Autor
              </button>
              <button
                type="button"
                className={styles.btnSecondarySmall}
                style={{ width: '100%', justifyContent: 'flex-start' }}
                onClick={() => { document.getElementById('dropdownMenu')!.style.display = 'none'; onNuevoEditorial(); }}
              >
                <FontAwesomeIcon icon={faBuilding} style={{ marginRight: '0.5rem' }} /> Editorial
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Selector de vista */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <button
          type="button"
          onClick={() => { setVistaActiva('libros'); handleCancelarGrupal(); }}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: `1.5px solid ${vistaActiva === 'libros' ? 'var(--accent-brown)' : 'var(--beige-dark)'}`,
            background: vistaActiva === 'libros' ? 'var(--beige-anchor)' : 'var(--bg-base)',
            color: vistaActiva === 'libros' ? 'var(--accent-brown)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FontAwesomeIcon icon={faBook} /> Libros
        </button>
        <button
          type="button"
          onClick={() => { setVistaActiva('editoriales'); handleCancelarGrupal(); }}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: `1.5px solid ${vistaActiva === 'editoriales' ? 'var(--accent-brown)' : 'var(--beige-dark)'}`,
            background: vistaActiva === 'editoriales' ? 'var(--beige-anchor)' : 'var(--bg-base)',
            color: vistaActiva === 'editoriales' ? 'var(--accent-brown)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FontAwesomeIcon icon={faBuilding} /> Editoriales
        </button>
        <button
          type="button"
          onClick={() => { setVistaActiva('autores'); handleCancelarGrupal(); }}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: `1.5px solid ${vistaActiva === 'autores' ? 'var(--accent-brown)' : 'var(--beige-dark)'}`,
            background: vistaActiva === 'autores' ? 'var(--beige-anchor)' : 'var(--bg-base)',
            color: vistaActiva === 'autores' ? 'var(--accent-brown)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <FontAwesomeIcon icon={faUser} /> Autores
        </button>
      </div>

      {/* Sección catálogo */}
      <section className={styles.catalogSection}>
        {/* Cabecera: título + conteo + herramientas de búsqueda */}
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              {vistaActiva === 'libros' && 'Listado del Fondo Editorial'}
              {vistaActiva === 'editoriales' && 'Editoriales Registradas'}
              {vistaActiva === 'autores' && 'Autores Registrados'}
            </h2>
            <span className={styles.sectionCount}>
              {vistaActiva === 'libros' && `Total Títulos: ${getTotalItems()}`}
              {vistaActiva === 'editoriales' && `Total Editoriales: ${getTotalItems()}`}
              {vistaActiva === 'autores' && `Total Autores: ${getTotalItems()}`}
            </span>
          </div>
          <div className={styles.searchTools}>
            {filtroActivo && (
              <div className={styles.filtroActivoBanner}>
                <span>🔍 Filtro activo: {getTotalItems()} resultado{getTotalItems() !== 1 ? 's' : ''}</span>
                {!readOnly && onLimpiarFiltro && (
                  <button
                    type="button"
                    className={styles.btnLimpiarFiltro}
                    onClick={onLimpiarFiltro}
                  >
                    ✕ Limpiar filtro
                  </button>
                )}
              </div>
            )}
            {!readOnly && onBusquedaAsistida && (
              <button
                type="button"
                className={`${styles.btnSecondarySmall} ${styles.btnSearchIcon}`}
                onClick={onBusquedaAsistida}
                title="Búsqueda asistida"
                aria-label="Búsqueda asistida"
              >
                <FontAwesomeIcon icon={faSearch} />
              </button>
            )}
            <div className={styles.searchBar}>
              <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
              <input
                id="catalogSearchInput"
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.searchInput}
                placeholder={
                  vistaActiva === 'libros' ? 'Buscar por título, autor, ISBN...' :
                  vistaActiva === 'autores' ? 'Buscar por nombre...' :
                  'Buscar por nombre...'
                }
              />
            </div>
          </div>
        </div>

        {/* Barra de acciones de catálogo */}
        {!readOnly && (
          <div className={styles.actionsBar}>
            <button
              id="btnToggleModoBorradoGrupal"
              className={styles.btnSecondary}
              onClick={() => setModoBorradoGrupal((v) => !v)}
              type="button"
            >
              <FontAwesomeIcon icon={faTrash} /> Borrado grupal
            </button>

            {modoBorradoGrupal && seleccionados.size > 0 && (
              <div className={styles.groupDeleteBar} id="groupDeleteActionBar">
                <span id="groupDeleteCountText" className={styles.groupDeleteCount}>
                  {seleccionados.size} elemento{seleccionados.size !== 1 ? 's' : ''} seleccionado{seleccionados.size !== 1 ? 's' : ''}
                </span>
                <button
                  id="btnConfirmarBorradoGrupal"
                  className={styles.btnDanger}
                  onClick={handleEliminarGrupal}
                  type="button"
                >
                  <FontAwesomeIcon icon={faTrash} /> Eliminar Seleccionados
                </button>
                <button
                  id="btnCancelarModoGrupal"
                  className={styles.btnSecondarySmall}
                  onClick={handleCancelarGrupal}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tabla de Libros */}
        {vistaActiva === 'libros' && (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  {modoBorradoGrupal && (
                    <th id="thSelectAllCopies" className={styles.thCheck}>
                      <input
                        type="checkbox"
                        id="checkSelectAllNewCopies"
                        title="Seleccionar todos los libros"
                        checked={getTodosSeleccionados()}
                        onChange={(e) => toggleTodos(e.target.checked)}
                      />
                    </th>
                  )}
                  <th>Código ISBN</th>
                  <th>Título</th>
                  <th>Autor y Categoría</th>
                  <th>Ubicación Principal</th>
                  <th>Copias</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody id="catalogTableBody">
                {librosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={modoBorradoGrupal ? 8 : 7} className={styles.emptyState}>
                      No hay libros que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  librosFiltrados.map((libro) => {
                    const { label, variant } = estadoDisponibilidad(libro);
                    return (
                      <tr key={libro.id}>
                        {modoBorradoGrupal && (
                          <td>
                            <input
                              type="checkbox"
                              checked={seleccionados.has(libro.id)}
                              onChange={() => toggleSeleccion(libro.id)}
                              aria-label={`Seleccionar ${libro.titulo}`}
                            />
                          </td>
                        )}
                        <td className={styles.cellMono}>{libro.isbn}</td>
                        <td>
                          <div className={styles.tituloConPortada}>
                            {libro.portadaUrl ? (
                              <img
                                src={libro.portadaUrl}
                                alt={`Portada de ${libro.titulo}`}
                                className={styles.portadaThumb}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                              />
                            ) : (
                              <div className={styles.portadaPlaceholder} title="Sin portada">📚</div>
                            )}
                            <span className={styles.bookTitle}>{libro.titulo}</span>
                          </div>
                        </td>
                        <td>
                          <span className={styles.bookAuthor}>{libro.autor}</span>
                          <span className={styles.bookCategory}>{libro.categoria}</span>
                        </td>
                        <td>{libro.ubicacion}</td>
                        <td className={styles.copiesCount}>{libro.copias.length}</td>
                        <td>
                          <Badge variant={variant}>{label}</Badge>
                        </td>
                        <td>
                          <div className={styles.actionBtns}>
                            {!readOnly && (
                              <>
                                <button
                                  className={styles.btnEdit}
                                  onClick={() => onEditar(libro)}
                                  title="Editar libro"
                                  aria-label={`Editar ${libro.titulo}`}
                                >
                                  <FontAwesomeIcon icon={faPen} />
                                </button>
                                <button
                                  className={styles.btnDelete}
                                  onClick={() => {
                                    setConfirmModal({
                                      open: true,
                                      title: 'Eliminar Libro',
                                      message: `¿Estás seguro de que deseas eliminar permanentemente "${libro.titulo}"? Esta acción no se puede deshacer.`,
                                      onConfirm: () => handleEliminarLibro(libro.id),
                                    });
                                  }}
                                  title="Eliminar libro"
                                  aria-label={`Eliminar ${libro.titulo}`}
                                >
                                  <FontAwesomeIcon icon={faTrash} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabla de Autores */}
        {vistaActiva === 'autores' && (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  {modoBorradoGrupal && (
                    <th className={styles.thCheck}>
                      <input
                        type="checkbox"
                        title="Seleccionar todos los autores"
                        checked={getTodosSeleccionados()}
                        onChange={(e) => toggleTodos(e.target.checked)}
                      />
                    </th>
                  )}
                  <th>Nombre</th>
                  <th>Apellido</th>
                  <th>Fecha de Registro</th>
                  <th>Estado</th>
                  {!readOnly && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody id="catalogTableBody">
                {autoresFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={modoBorradoGrupal && !readOnly ? 6 : !readOnly ? 5 : 4} className={styles.emptyState}>
                      No hay autores que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  autoresFiltrados.map((autor) => (
                    <tr key={autor.id}>
                      {modoBorradoGrupal && (
                        <td>
                          <input
                            type="checkbox"
                            checked={seleccionados.has(autor.id)}
                            onChange={() => toggleSeleccion(autor.id)}
                            aria-label={`Seleccionar ${autor.nombre} ${autor.apellido}`}
                          />
                        </td>
                      )}
                      <td>{autor.nombre}</td>
                      <td>{autor.apellido}</td>
                      <td className={styles.cellMono}>{formatFecha(autor.fechaRegistro)}</td>
                      <td>
                        <Badge variant="available">Activo</Badge>
                      </td>
                      {!readOnly && (
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.btnEdit}
                              onClick={() => onEditarAutor && onEditarAutor(autor)}
                              title="Editar autor"
                              aria-label={`Editar ${autor.nombre} ${autor.apellido}`}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button
                              className={styles.btnDelete}
                              onClick={() => {
                                setConfirmModal({
                                  open: true,
                                  title: 'Eliminar Autor',
                                  message: `¿Estás seguro de que deseas eliminar permanentemente al autor ${autor.nombre} ${autor.apellido}? Esta acción no se puede deshacer.`,
                                  onConfirm: () => handleEliminarAutor(autor.id),
                                });
                              }}
                              title="Eliminar autor"
                              aria-label={`Eliminar ${autor.nombre} ${autor.apellido}`}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tabla de Editoriales */}
        {vistaActiva === 'editoriales' && (
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  {modoBorradoGrupal && (
                    <th className={styles.thCheck}>
                      <input
                        type="checkbox"
                        title="Seleccionar todas las editoriales"
                        checked={getTodosSeleccionados()}
                        onChange={(e) => toggleTodos(e.target.checked)}
                      />
                    </th>
                  )}
                  <th>Nombre</th>
                  <th>Fecha de Registro</th>
                  {!readOnly && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody id="catalogTableBody">
                {editorialesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={modoBorradoGrupal && !readOnly ? 4 : !readOnly ? 3 : 2} className={styles.emptyState}>
                      No hay editoriales que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  editorialesFiltrados.map((editorial) => (
                    <tr key={editorial.id}>
                      {modoBorradoGrupal && (
                        <td>
                          <input
                            type="checkbox"
                            checked={seleccionados.has(editorial.id)}
                            onChange={() => toggleSeleccion(editorial.id)}
                            aria-label={`Seleccionar ${editorial.nombre}`}
                          />
                        </td>
                      )}
                      <td>{editorial.nombre}</td>
                      <td className={styles.cellMono}>{formatFecha(editorial.fechaRegistro)}</td>
                      {!readOnly && (
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.btnEdit}
                              onClick={() => onEditarEditorial && onEditarEditorial(editorial)}
                              title="Editar editorial"
                              aria-label={`Editar ${editorial.nombre}`}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button
                              className={styles.btnDelete}
                              onClick={() => {
                                setConfirmModal({
                                  open: true,
                                  title: 'Eliminar Editorial',
                                  message: `¿Estás seguro de que deseas eliminar permanentemente la editorial ${editorial.nombre}? Esta acción no se puede deshacer.`,
                                  onConfirm: () => handleEliminarEditorial(editorial.id),
                                });
                              }}
                              title="Eliminar editorial"
                              aria-label={`Eliminar ${editorial.nombre}`}
                            >
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Modal de Confirmación */}
      <Modal
        open={confirmModal.open}
        onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
        title={confirmModal.title}
        size="md"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: '#fee2e2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              flexShrink: 0
            }}>
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>
            <p style={{ margin: 0, color: 'var(--text-main)', fontSize: '0.95rem', lineHeight: 1.5 }}>
              {confirmModal.message}
            </p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.6rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              className={styles.btnSecondarySmall}
              onClick={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.btnDanger}
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal((prev) => ({ ...prev, open: false }));
              }}
            >
              <FontAwesomeIcon icon={faTrash} style={{ marginRight: '0.4rem' }} /> Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
