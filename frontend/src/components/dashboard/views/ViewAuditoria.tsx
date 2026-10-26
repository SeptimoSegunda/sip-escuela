'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faListCheck,
  faSun,
  faCloudSun,
  faUserShield,
  faFilter,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import type { AuditLog, CategoriaAudit, TurnoAdmin } from '@/types';
import MetricCard from '@/components/dashboard/ui/MetricCard';
import DataTable, { type Column } from '@/components/dashboard/ui/DataTable';
import styles from './ViewAuditoria.module.css';

interface ViewAuditoriaProps {
  logs: AuditLog[];
}

const CATEGORIAS: CategoriaAudit[] = [
  'Libros',
  'Préstamos',
  'Socios',
  'Daños',
  'Sistema',
];

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default function ViewAuditoria({ logs }: ViewAuditoriaProps) {
  const [filtroTurno, setFiltroTurno] = useState<TurnoAdmin | 'all'>('all');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaAudit | 'all'>('all');
  const [busqueda, setBusqueda] = useState('');

  /* ── Métricas ── */
  const totalAcciones = logs.length;
  const accionesManana = logs.filter((l) => l.admin === 'Turno Mañana').length;
  const accionesTarde  = logs.filter((l) => l.admin === 'Turno Tarde').length;

  /* ── Filtrado ── */
  const logsFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return logs.filter((l) => {
      if (filtroTurno !== 'all' && l.admin !== filtroTurno) return false;
      if (filtroCategoria !== 'all' && l.categoria !== filtroCategoria) return false;
      if (q && !`${l.accion} ${l.descripcion} ${l.admin} ${l.categoria}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [logs, filtroTurno, filtroCategoria, busqueda]);

  /* ── Columnas ── */
  const columns: Column<AuditLog>[] = [
    {
      key: 'fecha',
      header: 'Fecha y Hora',
      width: '160px',
      render: (row) => <span className={styles.cellMono}>{formatFecha(row.fecha)}</span>,
    },
    {
      key: 'admin',
      header: 'Administrador',
      width: '140px',
      render: (row) => (
        <span className={row.admin === 'Turno Mañana' ? styles.turnoManana : styles.turnoTarde}>
          {row.admin}
        </span>
      ),
    },
    { key: 'categoria', header: 'Categoría', width: '130px' },
    { key: 'accion',    header: 'Acción' },
    { key: 'descripcion', header: 'Descripción y Detalles del Cambio' },
  ];

  return (
    <div className={styles.viewWrapper}>
      {/* Encabezado */}
      <section className={styles.welcomeSection}>
        <div>
          <h1 className={styles.viewTitle}>Bitácora de Auditoría y Acciones</h1>
          <p className={styles.viewSubtitle}>
            Registro cronológico de todas las acciones, adiciones y cambios realizados por los administradores.
          </p>
        </div>
      </section>

      {/* Métricas */}
      <section className={styles.metricsGrid}>
        <MetricCard
          icon={faListCheck}
          value={totalAcciones}
          label="Total de Acciones"
          variant="salvia"
          id="statAuditTotal"
        />
        <MetricCard
          icon={faSun}
          value={accionesManana}
          label="Acciones Turno Mañana"
          variant="mustard"
          id="statAuditManana"
        />
        <MetricCard
          icon={faCloudSun}
          value={accionesTarde}
          label="Acciones Turno Tarde"
          variant="terracotta"
          id="statAuditTarde"
        />
      </section>

      {/* Tabla con filtros */}
      <DataTable
        columns={columns}
        rows={logsFiltrados}
        keyField="id"
        emptyMessage="No hay registros que coincidan con los filtros."
        id="tablaAuditoria"
        header={
          <div className={styles.tableHeader}>
            {/* Filtros */}
            <div className={styles.filterGroup}>
              <div className={styles.filterPill}>
                <label htmlFor="selectAuditAdminFilter" className={styles.filterLabel}>
                  <FontAwesomeIcon icon={faUserShield} /> Turno:
                </label>
                <select
                  id="selectAuditAdminFilter"
                  className={styles.filterSelect}
                  value={filtroTurno}
                  onChange={(e) => setFiltroTurno(e.target.value as TurnoAdmin | 'all')}
                >
                  <option value="all">Todos los Turnos</option>
                  <option value="Turno Mañana">Turno Mañana</option>
                  <option value="Turno Tarde">Turno Tarde</option>
                </select>
              </div>

              <div className={styles.filterPill}>
                <label htmlFor="selectAuditCategoryFilter" className={styles.filterLabel}>
                  <FontAwesomeIcon icon={faFilter} /> Categoría:
                </label>
                <select
                  id="selectAuditCategoryFilter"
                  className={styles.filterSelect}
                  value={filtroCategoria}
                  onChange={(e) => setFiltroCategoria(e.target.value as CategoriaAudit | 'all')}
                >
                  <option value="all">Todas las Categorías</option>
                  {CATEGORIAS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Buscador */}
            <div className={styles.searchBar}>
              <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
              <input
                id="auditSearchInput"
                type="text"
                placeholder="Buscar en la bitácora..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>
        }
      />
    </div>
  );
}
