'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faMagnifyingGlass,
  faSearch,
  faTrashCan,
  faTrash,
  faPen,
  faEye,
  faBook,
  faUser,
  faBuilding,
  faChevronDown,
} from '@fortawesome/free-solid-svg-icons';
import type { Libro, Editorial, Autor } from '@/types';
import Badge, { type BadgeVariant } from '@/components/dashboard/ui/Badge';
import { formatFecha } from '@/lib/utils';
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
  onBusquedaAsistida?: () => void;
  filtroActivo?: boolean;
  onLimpiarFiltro?: () => void;
  readOnly?: boolean;
}

type VistaCatalogo = 'libros' | 'editoriales' | 'autores';

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
  onBusquedaAsistida,
  filtroActivo = false,
  onLimpiarFiltro,
  readOnly = false,
}: ViewCatalogoProps) {
  const [busqueda, setBusqueda] = useState('');
  const [modoBorradoGrupal, setModoBorradoGrupal] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());
  const [vistaActiva, setVistaActiva] = useState<VistaCatalogo>('libros');

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

  const handleEliminarGrupal = () => {
    if (seleccionados.size === 0) return;
    if (vistaActiva === 'autores') {
      onEliminarAutor(Array.from(seleccionados)[0]);
    } else if (vistaActiva === 'editoriales') {
      onEliminarEditorial(Array.from(seleccionados)[0]);
    } else {
      onEliminar(Array.from(seleccionados));
    }
    handleCancelarGrupal();
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
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--beige-dark)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 100,
                display: 'none',
                minWidth: '180px',
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
              <hr style={{ margin: '0.5rem 0', border: 'none', borderTop: '1px solid var(--beige-dark)' }} />
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
          onClick={() => setVistaActiva('libros')}
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
          onClick={() => setVistaActiva('editoriales')}
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
          onClick={() => setVistaActiva('autores')}
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
              <FontAwesomeIcon icon={faTrashCan} /> Modo Borrado Grupal
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
                              <button
                                className={styles.btnEdit}
                                onClick={() => onEditar(libro)}
                                title="Editar libro"
                                aria-label={`Editar ${libro.titulo}`}
                              >
                                <FontAwesomeIcon icon={faPen} />
                              </button>
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
                    <td colSpan={!readOnly ? 5 : 4} className={styles.emptyState}>
                      No hay autores que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  autoresFiltrados.map((autor) => (
                    <tr key={autor.id}>
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
                              onClick={() => {
                                if (confirm(`¿Editar a ${autor.nombre} ${autor.apellido}?`)) {
                                  // TODO: abrir modal de edición
                                }
                              }}
                              title="Editar autor"
                              aria-label={`Editar ${autor.nombre} ${autor.apellido}`}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button
                              className={styles.btnDelete}
                              onClick={() => {
                                if (confirm(`¿Eliminar a ${autor.nombre} ${autor.apellido}?`)) {
                                  onEliminarAutor(autor.id);
                                }
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
                  <th>Nombre</th>
                  <th>Fecha de Registro</th>
                  {!readOnly && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody id="catalogTableBody">
                {editorialesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={!readOnly ? 3 : 2} className={styles.emptyState}>
                      No hay editoriales que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  editorialesFiltrados.map((editorial) => (
                    <tr key={editorial.id}>
                      <td>{editorial.nombre}</td>
                      <td className={styles.cellMono}>{formatFecha(editorial.fechaRegistro)}</td>
                      {!readOnly && (
                        <td>
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.btnEdit}
                              onClick={() => {
                                if (confirm(`¿Editar a ${editorial.nombre}?`)) {
                                  // TODO: abrir modal de edición
                                }
                              }}
                              title="Editar editorial"
                              aria-label={`Editar ${editorial.nombre}`}
                            >
                              <FontAwesomeIcon icon={faPen} />
                            </button>
                            <button
                              className={styles.btnDelete}
                              onClick={() => {
                                if (confirm(`¿Eliminar a ${editorial.nombre}?`)) {
                                  onEliminarEditorial(editorial.id);
                                }
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
    </div>
  );
}