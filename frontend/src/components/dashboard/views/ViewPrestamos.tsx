'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faRepeat,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import type { Prestamo, EstadoPrestamo } from '@/types';
import Badge, { type BadgeVariant } from '@/components/dashboard/ui/Badge';
import DataTable, { type Column } from '@/components/dashboard/ui/DataTable';
import styles from './ViewPrestamos.module.css';

interface ViewPrestamosProps {
  prestamos: Prestamo[];
  onNuevoPrestamo: () => void;
  onDevolucion: () => void;
}

type FiltroEstado = EstadoPrestamo | 'all';

function estadoToBadge(estado: EstadoPrestamo): BadgeVariant {
  switch (estado) {
    case 'prestado':  return 'borrowed';
    case 'moroso':    return 'low';
    case 'devuelto':  return 'available';
  }
}

function estadoLabel(estado: EstadoPrestamo): string {
  switch (estado) {
    case 'prestado':  return 'Activo';
    case 'moroso':    return 'Moroso';
    case 'devuelto':  return 'Devuelto';
  }
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

const FILTROS: { value: FiltroEstado; label: string }[] = [
  { value: 'all',      label: 'Todos' },
  { value: 'prestado', label: 'Activos (Prestados)' },
  { value: 'moroso',   label: 'Morosos (Demorados)' },
  { value: 'devuelto', label: 'Devueltos' },
];

export default function ViewPrestamos({
  prestamos,
  onNuevoPrestamo,
  onDevolucion,
}: ViewPrestamosProps) {
  const [filtro, setFiltro] = useState<FiltroEstado>('all');
  const [busqueda, setBusqueda] = useState('');

  /* ── Filtrado ── */
  const prestamosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    return prestamos.filter((p) => {
      if (filtro !== 'all' && p.estado !== filtro) return false;
      if (q && !`${p.id} ${p.libroTitulo} ${p.socioNombre}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [prestamos, filtro, busqueda]);

  /* ── Columnas ── */
  const columns: Column<Prestamo>[] = [
    { key: 'id', header: 'ID Préstamo', width: '120px',
      render: (row) => <span className={styles.cellMono}>{row.id}</span> },
    { key: 'libroTitulo', header: 'Libro' },
    { key: 'socioNombre', header: 'Socio Solicitante' },
    {
      key: 'fechaPrestamo', header: 'Fecha Préstamo', width: '130px',
      render: (row) => formatFecha(row.fechaPrestamo),
    },
    {
      key: 'fechaLimite', header: 'Fecha Límite', width: '120px',
      render: (row) => {
        const vencido = row.estado !== 'devuelto' && new Date(row.fechaLimite) < new Date();
        return (
          <span className={vencido ? styles.fechaVencida : undefined}>
            {formatFecha(row.fechaLimite)}
          </span>
        );
      },
    },
    {
      key: 'estado', header: 'Estado del Préstamo', width: '140px',
      render: (row) => (
        <Badge variant={estadoToBadge(row.estado)}>
          {estadoLabel(row.estado)}
        </Badge>
      ),
    },
  ];

  return (
    <div className={styles.viewWrapper}>
      {/* Encabezado */}
      <section className={styles.welcomeSection}>
        <div>
          <h1 className={styles.viewTitle}>Historial de Préstamos</h1>
          <p className={styles.viewSubtitle}>
            Registro continuo de préstamos, entregas y cuenta regresiva de vencimiento.
          </p>
        </div>
        <div className={styles.actionGroup}>
          <button
            id="btnAbrirNuevoPrestamo"
            className={styles.btnPrimary}
            onClick={onNuevoPrestamo}
          >
            <FontAwesomeIcon icon={faPlus} /> Nuevo Préstamo
          </button>
          <button
            id="btnDevolucion"
            className={styles.btnSecondary}
            onClick={onDevolucion}
          >
            <FontAwesomeIcon icon={faRepeat} /> Registrar Devolución
          </button>
        </div>
      </section>

      {/* Tabla con filtros */}
      <DataTable
        columns={columns}
        rows={prestamosFiltrados}
        keyField="id"
        emptyMessage="No hay préstamos que coincidan con el filtro."
        id="loansTableBody"
        header={
          <div className={styles.tableHeader}>
            {/* Filtros de estado */}
            <div className={styles.filterBar}>
              {FILTROS.map((f) => (
                <button
                  key={f.value}
                  className={`${styles.filterBtn} ${filtro === f.value ? styles.filterBtnActive : ''}`}
                  onClick={() => setFiltro(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Buscador */}
            <div className={styles.searchBar}>
              <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Buscar por libro, socio o ID..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.searchInput}
                id="prestamosSearchInput"
              />
            </div>
          </div>
        }
      />
    </div>
  );
}
