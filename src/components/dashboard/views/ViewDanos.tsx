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
} from '@fortawesome/free-solid-svg-icons';
import type { Dano, Socio, SeveridadDano } from '@/types';
import MetricCard from '@/components/dashboard/ui/MetricCard';
import Badge, { type BadgeVariant } from '@/components/dashboard/ui/Badge';
import styles from './ViewDanos.module.css';

interface ViewDanosProps {
  danos: Dano[];
  socios: Socio[];
  onRegistrarDano: () => void;
  onVerDetalle: (socioId: string) => void;
}

/* ── Tipos derivados para la tabla de antecedentes ── */
interface AntecedenteSocio {
  socioId: string;
  nombre: string;
  tipo: string;
  cursoTurno: string;
  totalIncidencias: number;
  severidadMax: SeveridadDano;
  desglose: { leve: number; moderado: number; catastrofico: number };
  esCritico: boolean;
}

type FiltroAntecedente = 'all' | 'criticos';

function severidadToBadge(s: SeveridadDano): BadgeVariant {
  switch (s) {
    case 'leve':        return 'available';
    case 'moderado':    return 'warning';
    case 'catastrofico': return 'low';
  }
}

function severidadLabel(s: SeveridadDano): string {
  switch (s) {
    case 'leve':        return 'Leve';
    case 'moderado':    return 'Moderado';
    case 'catastrofico': return 'CATASTRÓFICO';
  }
}

function ordenSeveridad(s: SeveridadDano): number {
  return s === 'catastrofico' ? 3 : s === 'moderado' ? 2 : 1;
}

export default function ViewDanos({ danos, socios, onRegistrarDano, onVerDetalle }: ViewDanosProps) {
  const [filtro, setFiltro] = useState<FiltroAntecedente>('all');
  const [busqueda, setBusqueda] = useState('');

  /* ── Métricas ── */
  const totalDanos     = danos.length;
  const danosLeves     = danos.filter((d) => d.severidad === 'leve').length;
  const danosModerados = danos.filter((d) => d.severidad === 'moderado').length;
  const danosCat       = danos.filter((d) => d.severidad === 'catastrofico').length;

  /* ── Antecedentes por socio ── */
  const antecedentes = useMemo<AntecedenteSocio[]>(() => {
    const map = new Map<string, AntecedenteSocio>();

    danos.forEach((d) => {
      const socio = socios.find((s) => s.id === d.socioId);
      if (!map.has(d.socioId)) {
        map.set(d.socioId, {
          socioId: d.socioId,
          nombre: d.socioNombre,
          tipo: socio?.tipo ?? '—',
          cursoTurno: socio
            ? `${socio.anio ?? ''}${socio.turno ? ` — ${socio.turno}` : ''}`
            : '—',
          totalIncidencias: 0,
          severidadMax: 'leve',
          desglose: { leve: 0, moderado: 0, catastrofico: 0 },
          esCritico: false,
        });
      }

      const entry = map.get(d.socioId)!;
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

  const sociosConAntecedentes = antecedentes.length;

  /* ── Filtrado ── */
  const antecedetesFiltrados = useMemo(() => {
    let lista = filtro === 'criticos' ? antecedentes.filter((a) => a.esCritico) : antecedentes;
    const q = busqueda.toLowerCase();
    if (q) {
      lista = lista.filter((a) =>
        `${a.socioId} ${a.nombre} ${a.tipo} ${a.cursoTurno}`.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [antecedentes, filtro, busqueda]);

  return (
    <div className={styles.viewWrapper}>
      {/* Encabezado */}
      <section className={styles.welcomeSection}>
        <div>
          <h1 className={styles.viewTitle}>
            <FontAwesomeIcon icon={faTriangleExclamation} /> Registro y Control de Daños
          </h1>
          <p className={styles.viewSubtitle}>
            Seguimiento exclusivo de ejemplares deteriorados e historial disciplinario de alumnos con incidencias registradas.
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

      {/* Métricas ×5 */}
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
          value={sociosConAntecedentes}
          label="Alumnos con Daños"
          variant="catastrofico"
          id="statSociosConAntecedentes"
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

      {/* Tabla de antecedentes */}
      <section className={styles.tableSection}>
        {/* Cabecera con filtros */}
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
              placeholder="Buscar alumno con daño por nombre, ID o curso..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className={styles.searchInput}
            />
          </div>
        </div>

        {/* Tabla */}
        <div className={styles.tableWrapper}>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID Sujeto</th>
                <th>Apellido y Nombre</th>
                <th>Tipo</th>
                <th>Curso y Turno</th>
                <th>Total Incidencias</th>
                <th>Severidad Máxima</th>
                <th>Desglose</th>
                <th>Estado Disciplinario</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody id="antecedentesTableBody">
              {antecedetesFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyState}>
                    No hay registros de daños para mostrar.
                  </td>
                </tr>
              ) : (
                antecedetesFiltrados.map((a) => (
                  <tr key={a.socioId}>
                    <td className={styles.cellMono}>{a.socioId}</td>
                    <td>{a.nombre}</td>
                    <td className={styles.tipoChip}>
                      {a.tipo.charAt(0).toUpperCase() + a.tipo.slice(1)}
                    </td>
                    <td>{a.cursoTurno}</td>
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
                      <button
                        className={styles.btnDetalle}
                        onClick={() => onVerDetalle(a.socioId)}
                        aria-label={`Ver detalle de ${a.nombre}`}
                      >
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
