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
} from '@fortawesome/free-solid-svg-icons';
import type { Dano, SeveridadDano } from '@/types';
import MetricCard from '@/components/dashboard/ui/MetricCard';
import Badge, { type BadgeVariant } from '@/components/dashboard/ui/Badge';
import styles from './ViewDanos.module.css';

interface ViewDanosProps {
  danos: Dano[];
  onRegistrarDano: () => void;
  onEliminar: (ids: string[]) => void;
}

/* ── Tipos derivados para la tabla de antecedentes ── */
interface AntecedentePersona {
  responsable: string;
  totalIncidencias: number;
  severidadMax: SeveridadDano;
  desglose: { leve: number; moderado: number; catastrofico: number };
  esCritico: boolean;
}

type FiltroAntecedente = 'all' | 'criticos';

function severidadToBadge(s: SeveridadDano): BadgeVariant {
  switch (s) {
    case 'leve':         return 'available';
    case 'moderado':     return 'warning';
    case 'catastrofico': return 'low';
  }
}

function severidadLabel(s: SeveridadDano): string {
  switch (s) {
    case 'leve':         return 'Leve';
    case 'moderado':     return 'Moderado';
    case 'catastrofico': return 'CATASTRÓFICO';
  }
}

function ordenSeveridad(s: SeveridadDano): number {
  return s === 'catastrofico' ? 3 : s === 'moderado' ? 2 : 1;
}

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function ViewDanos({ danos, onRegistrarDano, onEliminar }: ViewDanosProps) {
  const [filtro, setFiltro] = useState<FiltroAntecedente>('all');
  const [busqueda, setBusqueda] = useState('');
  const [modoBorrado, setModoBorrado] = useState(false);
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set());

  /* ── Métricas ── */
  const totalDanos     = danos.length;
  const danosLeves     = danos.filter((d) => d.severidad === 'leve').length;
  const danosModerados = danos.filter((d) => d.severidad === 'moderado').length;
  const danosCat       = danos.filter((d) => d.severidad === 'catastrofico').length;

  /* ── Antecedentes agrupados por responsable ── */
  const antecedentes = useMemo<AntecedentePersona[]>(() => {
    const map = new Map<string, AntecedentePersona>();

    danos.forEach((d) => {
      if (!map.has(d.responsable)) {
        map.set(d.responsable, {
          responsable: d.responsable,
          totalIncidencias: 0,
          severidadMax: 'leve',
          desglose: { leve: 0, moderado: 0, catastrofico: 0 },
          esCritico: false,
        });
      }

      const entry = map.get(d.responsable)!;
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
  }, [danos]);

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

  /* ── Selección grupal ── */
  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleTodos = (checked: boolean) => {
    setSeleccionados(checked ? new Set(danosFiltrados.map((d) => d.id)) : new Set());
  };

  const handleCancelar = () => {
    setModoBorrado(false);
    setSeleccionados(new Set());
  };

  const handleEliminar = () => {
    if (seleccionados.size === 0) return;
    onEliminar(Array.from(seleccionados));
    handleCancelar();
  };

  const todosSeleccionados =
    danosFiltrados.length > 0 && seleccionados.size === danosFiltrados.length;

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
              placeholder={modoBorrado ? 'Buscar por responsable, libro o ID...' : 'Buscar responsable por nombre...'}
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
            <FontAwesomeIcon icon={faTrashCan} /> Modo Borrado Grupal
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

        {/* Tabla */}
        <div className={styles.tableWrapper}>
          {modoBorrado ? (
            /* Vista de registros individuales con checkboxes */
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th className={styles.thCheck}>
                    <input
                      type="checkbox"
                      title="Seleccionar todos"
                      checked={todosSeleccionados}
                      onChange={(e) => toggleTodos(e.target.checked)}
                    />
                  </th>
                  <th>ID</th>
                  <th>Libro</th>
                  <th>Responsable</th>
                  <th>Severidad</th>
                  <th>Descripción</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody id="danosIndividualTableBody">
                {danosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      No hay registros de daños para mostrar.
                    </td>
                  </tr>
                ) : (
                  danosFiltrados.map((d) => (
                    <tr key={d.id} className={seleccionados.has(d.id) ? styles.rowSeleccionada : undefined}>
                      <td>
                        <input
                          type="checkbox"
                          checked={seleccionados.has(d.id)}
                          onChange={() => toggleSeleccion(d.id)}
                          aria-label={`Seleccionar daño ${d.id}`}
                        />
                      </td>
                      <td className={styles.cellMono}>{d.id}</td>
                      <td>{d.libroTitulo}</td>
                      <td>{d.responsable}</td>
                      <td>
                        <Badge variant={severidadToBadge(d.severidad)}>
                          {severidadLabel(d.severidad)}
                        </Badge>
                      </td>
                      <td className={styles.descripcionCell}>{d.descripcion}</td>
                      <td className={styles.cellMono}>{formatFecha(d.fecha)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            /* Vista agrupada por responsable (vista normal) */
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Responsable</th>
                  <th>Total Incidencias</th>
                  <th>Severidad Máxima</th>
                  <th>Desglose</th>
                  <th>Estado Disciplinario</th>
                </tr>
              </thead>
              <tbody id="antecedentesTableBody">
                {antecedentesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={5} className={styles.emptyState}>
                      No hay registros de daños para mostrar.
                    </td>
                  </tr>
                ) : (
                  antecedentesFiltrados.map((a) => (
                    <tr key={a.responsable}>
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
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
