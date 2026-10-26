'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faMagnifyingGlass,
  faSliders,
  faTrashCan,
  faTrash,
  faPen,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import type { Libro } from '@/types';
import Badge, { type BadgeVariant } from '@/components/dashboard/ui/Badge';
import styles from './ViewCatalogo.module.css';

interface ViewCatalogoProps {
  libros: Libro[];
  onNuevoLibro: () => void;
  onEditar: (libro: Libro) => void;
  onVerDetalle: (libro: Libro) => void;
  onEliminar: (libroIds: string[]) => void;
  onBusquedaAsistida: () => void;
  filtroActivo?: boolean;
  onLimpiarFiltro?: () => void;
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
  onNuevoLibro,
  onEditar,
  onVerDetalle,
  onEliminar,
  onBusquedaAsistida,
  filtroActivo = false,
  onLimpiarFiltro,
}: ViewCatalogoProps) {
  const [busqueda, setBusqueda] = useState('');
  const [modoBorradoGrupal, setModoBorradoGrupal] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

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

  /* ── Selección grupal ── */
  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTodos = (checked: boolean) => {
    setSeleccionados(checked ? new Set(librosFiltrados.map((l) => l.id)) : new Set());
  };

  const handleCancelarGrupal = () => {
    setModoBorradoGrupal(false);
    setSeleccionados(new Set());
  };

  const handleEliminarGrupal = () => {
    if (seleccionados.size === 0) return;
    onEliminar(Array.from(seleccionados));
    handleCancelarGrupal();
  };

  const todosSeleccionados =
    librosFiltrados.length > 0 && seleccionados.size === librosFiltrados.length;

  return (
    <div className={styles.viewWrapper}>
      {/* Encabezado */}
      <section className={styles.welcomeSection}>
        <div>
          <h1 className={styles.viewTitle}>Catálogo Completo de Libros</h1>
          <p className={styles.viewSubtitle}>Inventario general de títulos disponibles y en préstamo.</p>
        </div>
        <button
          id="btnAgregarNuevoLibro"
          className={styles.btnPrimary}
          onClick={onNuevoLibro}
        >
          <FontAwesomeIcon icon={faPlus} /> Añadir Nuevo Libro
        </button>
      </section>

      {/* Sección catálogo */}
      <section className={styles.catalogSection}>
        {/* Cabecera: título + conteo + herramientas de búsqueda */}
        <div className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Listado del Fondo Editorial</h2>
            <span className={styles.sectionCount}>
              Total Títulos: <strong id="totalLibrosCount">{librosFiltrados.length}</strong>
            </span>
          </div>
          <div className={styles.searchTools}>
            {filtroActivo && (
              <div className={styles.filtroActivoBanner}>
                <span>🔍 Filtro activo: {libros.length} resultado{libros.length !== 1 ? 's' : ''}</span>
                {onLimpiarFiltro && (
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
            <div className={styles.searchBar}>
              <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
              <input
                id="catalogSearchInput"
                type="text"
                placeholder="Buscar por título, autor, materia, ISBN o inventario..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button
              id="btnAbrirBusquedaAsistida"
              className={styles.btnAssistedSearch}
              onClick={onBusquedaAsistida}
              type="button"
            >
              <FontAwesomeIcon icon={faSliders} /> Búsqueda asistida
            </button>
          </div>
        </div>

        {/* Barra de acciones de catálogo */}
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
                {seleccionados.size} libro{seleccionados.size !== 1 ? 's' : ''} seleccionado{seleccionados.size !== 1 ? 's' : ''}
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

        {/* Tabla */}
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
                      checked={todosSeleccionados}
                      onChange={(e) => toggleTodos(e.target.checked)}
                    />
                  </th>
                )}
                <th>Código ISBN</th>
                <th>Portada</th>
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
                  <td colSpan={modoBorradoGrupal ? 9 : 8} className={styles.emptyState}>
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
                          <button
                            className={styles.btnView}
                            onClick={() => onVerDetalle(libro)}
                            title="Ver detalle"
                            aria-label={`Ver detalle de ${libro.titulo}`}
                          >
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button
                            className={styles.btnEdit}
                            onClick={() => onEditar(libro)}
                            title="Editar libro"
                            aria-label={`Editar ${libro.titulo}`}
                          >
                            <FontAwesomeIcon icon={faPen} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
