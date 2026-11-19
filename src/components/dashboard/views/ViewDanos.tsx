'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileCircleExclamation,
  faUserXmark,
  faLeaf,
  faTriangleExclamation,
  faSkullCrossbones,
  faList,
  faMagnifyingGlass,
  faTrashCan,
  faTrash,
  faFolderOpen,
  faFolder,
  faChevronLeft,
  faChevronRight,
  faEye,
} from '@fortawesome/free-solid-svg-icons';
import type { Dano, Socio, SeveridadDano, Libro, EstadoCopia } from '@/types';
import Modal from '@/components/ui/Modal';
import MetricCard from '@/components/dashboard/ui/MetricCard';
import Badge from '@/components/dashboard/ui/Badge';
import { severidadToBadge, severidadLabel, ordenSeveridad, formatFecha, formatFechaHora } from '@/lib/utils';
import styles from './ViewDanos.module.css';

interface ViewDanosProps {
  danos: Dano[];
  socios: Socio[];
  libros?: Libro[];
  onRegistrarDano: () => void;
  onEliminar: (ids: string[]) => void;
  onVerDetalle: (socioId: string) => void;
  onCambiarEstadoCopia?: (libroId: string, copiaId: string, estado: EstadoCopia) => void;
  onBusquedaAsistida?: () => void;
}

/* ── Tipos derivados para la tabla de antecedentes ── */
interface AntecedentePersona {
  responsable: string;
  /** IDs de los daños asociados a este responsable */
  danosIds: string[];
  /** ID del socio registrado, si se encuentra en la lista de socios */
  socioId?: string;
  totalIncidencias: number;
  severidadMax: SeveridadDano;
  desglose: { leve: number; moderado: number; catastrofico: number };
  esCritico: boolean;
}

type FiltroAntecedente = 'all' | 'criticos';

export default function ViewDanos({ danos, socios, onRegistrarDano, onEliminar, onVerDetalle }: ViewDanosProps) {
  const [filtro, setFiltro] = useState<FiltroAntecedente>('all');
  const [busqueda, setBusqueda] = useState('');
  const [modoBorrado, setModoBorrado] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  /* ── Modal de detalle del daño ── */
  const [danoSeleccionado, setDanoSeleccionado] = useState<Dano | null>(null);
  const abiertoModalDetalle = !!danoSeleccionado;

  /* ── Datos ── */
  const totalDanos = danos.length;
  const danosLeves = danos.filter((d) => d.severidad === 'leve').length;
  const danosModerados = danos.filter((d) => d.severidad === 'moderado').length;
  const danosCat = danos.filter((d) => d.severidad === 'catastrofico').length;

  /* ── Antecedentes agrupados por responsable (filtrados por período) ── */
  const antecedentes = useMemo<AntecedentePersona[]>(() => {
    const map = new Map<string, AntecedentePersona>();

    danos.forEach((d) => {
      if (!map.has(d.responsable)) {
        // Buscar si el responsable corresponde a un socio registrado
        const socioMatch = d.socioId
          ? socios.find((s) => s.id === d.socioId)
          : socios.find((s) => `${s.apellido}, ${s.nombre}` === d.responsable);

        map.set(d.responsable, {
          responsable: d.responsable,
          danosIds: [],
          socioId: socioMatch?.id,
          totalIncidencias: 0,
          severidadMax: 'leve',
          desglose: { leve: 0, moderado: 0, catastrofico: 0 },
          esCritico: false,
        });
      }

      const entry = map.get(d.responsable)!;
      entry.danosIds.push(d.id);
      entry.totalIncidencias++;
      entry.desglose[d.severidad]++;
      if (ordenSeveridad(d.severidad) > ordenSeveridad(entry.severidadMax)) {
        entry.severidadMax = d.severidad;
      }
      if (d.severidad === 'catastrofico') entry.esCritico = true;
    });

    return Array.from(map.values()).sort(
      (a, b) => ordenSeveridad(b.severidadMax) - ordenSeveridad(a.severidadMax)
    );
  }, [danos, socios]);

  const personasConAntecedentes = antecedentes.length;

  /* ── Filtrado vista agrupada ── */
  const antecedentesFiltrados = useMemo(() => {
    let lista = filtro === 'criticos' ? antecedentes.filter((a) => a.esCritico) : antecedentes;
    const q = busqueda.toLowerCase();
    if (q) {
      lista = lista.filter((a) => a.responsable.toLowerCase().includes(q));
    }
    return lista;
  }, [antecedentes, filtro, busqueda]);

  /* ── Filtrado vista individual (modo borrado) ── */
  const danosFiltrados = useMemo(() => {
    let lista = danos;
    if (filtro === 'criticos') lista = lista.filter((d) => d.severidad === 'catastrofico');
    const q = busqueda.toLowerCase();
    if (q) lista = lista.filter((d) =>
      `${d.responsable} ${d.libroTitulo} ${d.id}`.toLowerCase().includes(q)
    );
    return lista;
  }, [danos, filtro, busqueda]);

  /* ── Borrado grupal ── */
  const toggleSeleccion = (ids: string[]) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      const todosEstan = ids.every((id) => next.has(id));
      if (todosEstan) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const todosDanosIds = useMemo(
    () => antecedentesFiltrados.flatMap((a) => a.danosIds),
    [antecedentesFiltrados]
  );

  const toggleTodos = (checked: boolean) => {
    if (checked) {
      setSeleccionados(new Set(todosDanosIds));
    } else {
      setSeleccionados(new Set());
    }
  };

  const handleCancelar = () => {
    setModoBorrado(false);
    setSeleccionados(new Set());
  };

  const handleEliminar = () => {
    if (seleccionados.size === 0) return;
    const cantidad = seleccionados.size;
    const confirmar = window.confirm(
      `¿Estás seguro de que deseas eliminar ${cantidad} registro${cantidad !== 1 ? 's' : ''} de daño${cantidad !== 1 ? 's' : ''}? Esta acción no se puede deshacer.`
    );
    if (!confirmar) return;
    onEliminar(Array.from(seleccionados));
    handleCancelar();
  };

  const getTodosSeleccionados = () =>
    todosDanosIds.length > 0 && todosDanosIds.every((id) => seleccionados.has(id));

  return (
    <div className={styles.viewWrapper}>
      {/* Encabezado */}
      <section className={styles.welcomeSection}>
        <div>
          <h1 className={styles.viewTitle}>
            <FontAwesomeIcon icon={faTriangleExclamation} /> Registro y Control de Daños
          </h1>
          <p className={styles.viewSubtitle}>
            Seguimiento de ejemplares deteriorados e historial de incidencias por responsable.
          </p>
        </div>
        <button
          id="btnAbrirModalNuevoDano"
          className={styles.btnPrimary}
          onClick={onRegistrarDano}
        >
          <FontAwesomeIcon icon={faTriangleExclamation} />
          Registrar Daño Manual
        </button>
      </section>

      {/* Métricas */}
      <section className={styles.metricsGrid}>
        <MetricCard
          icon={faFileCircleExclamation}
          value={totalDanos}
          label="Total Incidencias"
          variant="mustard"
          id="statDanosTotal"
        />
        <MetricCard
          icon={faUserXmark}
          value={personasConAntecedentes}
          label="Personas con Daños"
          variant="catastrofico"
          id="statPersonasConAntecedentes"
        />
        <MetricCard
          icon={faLeaf}
          value={danosLeves}
          label="Daño Leve"
          variant="salvia"
          id="statDanosLeves"
        />
        <MetricCard
          icon={faTriangleExclamation}
          value={danosModerados}
          label="Daño Moderado"
          variant="terracotta"
          id="statDanosModerados"
        />
        <MetricCard
          icon={faSkullCrossbones}
          value={danosCat}
          label="CATASTRÓFICO!"
          variant="catastrofico"
          id="statDanosCatastroficos"
        />
      </section>

      {/* Tabla de antecedentes / registros */}
      <section className={styles.tableSection}>
        {/* Cabecera con filtros y búsqueda */}
        <div className={styles.tableHeader}>
          <div className={styles.filterBar}>
            <button
              className={`${styles.filterBtn} ${filtro === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setFiltro('all')}
            >
              <FontAwesomeIcon icon={faList} /> Todos con Daños
            </button>
            <button
              className={`${styles.filterBtn} ${filtro === 'criticos' ? styles.filterBtnActive : ''}`}
              onClick={() => setFiltro('criticos')}
            >
              <FontAwesomeIcon icon={faSkullCrossbones} /> Casos Críticos
            </button>
          </div>

          <div className={styles.searchBar}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
            <input
              id="antecedentesSearchInput"
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Barra de borrado grupal */}
        <div className={styles.actionsBar}>
          <button
            id="btnToggleModoBorradoDanos"
            className={styles.btnBorradoGrupal}
            onClick={() => { setModoBorrado((v) => !v); setSeleccionados(new Set()); }}
            type="button"
          >
            <FontAwesomeIcon icon={faTrash} /> Borrado grupal
          </button>

          {modoBorrado && seleccionados.size > 0 && (
            <div className={styles.groupDeleteBar} id="danosGroupDeleteBar">
              <span className={styles.groupDeleteCount}>
                {seleccionados.size} registro{seleccionados.size !== 1 ? 's' : ''} seleccionado{seleccionados.size !== 1 ? 's' : ''}
              </span>
              <button
                id="btnConfirmarBorradoDanos"
                className={styles.btnDanger}
                onClick={handleEliminar}
                type="button"
              >
                <FontAwesomeIcon icon={faTrash} /> Eliminar Seleccionados
              </button>
              <button
                id="btnCancelarBorradoDanos"
                className={styles.btnSecondarySmall}
                onClick={handleCancelar}
                type="button"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Tabla fija de antecedentes con columna opcional de borrado */}
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                {modoBorrado && (
                  <th className={styles.thCheck}>
                    <input
                      type="checkbox"
                      title="Seleccionar todos"
                      checked={getTodosSeleccionados()}
                      onChange={(e) => toggleTodos(e.target.checked)}
                    />
                  </th>
                )}
                <th>Responsable</th>
                <th>Total Incidencias</th>
                <th>Severidad Máxima</th>
                <th>Desglose</th>
                <th>Estado Disciplinario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="antecedentesTableBody">
              {antecedentesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={modoBorrado ? 7 : 6} className={styles.emptyState}>
                    No hay registros de daños para mostrar.
                  </td>
                </tr>
              ) : (
                antecedentesFiltrados.map((a) => {
                  const estaSeleccionado = a.danosIds.length > 0 && a.danosIds.every((id) => seleccionados.has(id));
                  return (
                    <tr
                      key={a.responsable}
                      className={modoBorrado && estaSeleccionado ? styles.rowSeleccionada : undefined}
                    >
                      {modoBorrado && (
                        <td className={styles.thCheck}>
                          <input
                            type="checkbox"
                            checked={estaSeleccionado}
                            onChange={() => toggleSeleccion(a.danosIds)}
                            aria-label={`Seleccionar registros de ${a.responsable}`}
                          />
                        </td>
                      )}
                      <td>{a.responsable}</td>
                      <td className={styles.incidenciasNum}>{a.totalIncidencias}</td>
                      <td>
                        <Badge variant={severidadToBadge(a.severidadMax)}>
                          {severidadLabel(a.severidadMax)}
                        </Badge>
                      </td>
                      <td className={styles.desglose}>
                        <span className={styles.desgloseItem} title="Leves">L: {a.desglose.leve}</span>
                        <span className={styles.desgloseItem} title="Moderados">M: {a.desglose.moderado}</span>
                        <span className={`${styles.desgloseItem} ${a.desglose.catastrofico > 0 ? styles.desgloseRed : ''}`} title="Catastróficos">C: {a.desglose.catastrofico}</span>
                      </td>
                      <td>
                        <Badge variant={a.esCritico ? 'low' : 'warning'}>
                          {a.esCritico ? 'Caso Crítico' : 'Con Antecedentes'}
                        </Badge>
                      </td>
                      <td>
                        {a.socioId && (
                          <button
                            type="button"
                            className={styles.btnVerDetalle}
                            onClick={() => onVerDetalle(a.socioId!)}
                            title="Ver expediente del socio"
                          >
                            <FontAwesomeIcon icon={faFolderOpen} /> Ver detalle
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Modal de detalle del daño ── */}
      <Modal
        open={abiertoModalDetalle}
        onClose={() => setDanoSeleccionado(null)}
        title="Detalle del Daño"
        id="modalDetalleDano"
      >
        {danoSeleccionado && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            {/* Cabecera con severidad */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--text-main)'
                }}>
                  {danoSeleccionado.libroTitulo}
                </h3>
                <p style={{
                  margin: '0.25rem 0 0',
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)'
                }}>
                  ID: <span className={styles.cellMono}>{danoSeleccionado.id}</span>
                </p>
              </div>
              <Badge variant={severidadToBadge(danoSeleccionado.severidad)}>
                {severidadLabel(danoSeleccionado.severidad)}
              </Badge>
            </div>

            {/* Información del daño */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.75rem'
            }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Responsable</span>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: '0.9rem' }}>
                  {danoSeleccionado.responsable}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Fecha</span>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: '0.9rem' }}>
                  {formatFechaHora(danoSeleccionado.fecha)}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Turno</span>
                <p style={{ margin: '0.25rem 0 0', fontWeight: 600, fontSize: '0.9rem' }}>
                  {danoSeleccionado.turnoAdmin}
                </p>
              </div>
            </div>

            {/* Descripción completa */}
            <div>
              <span style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginBottom: '0.4rem',
                display: 'block'
              }}>
                Descripción del Daño
              </span>
              <div style={{
                backgroundColor: 'var(--bg-base)',
                border: '1px solid var(--beige-dark)',
                borderRadius: '8px',
                padding: '0.85rem',
                minHeight: '3.5rem',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                color: 'var(--text-main)'
              }}>
                {danoSeleccionado.descripcion}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}