'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faPen,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import type { Socio, EstadoSocio, Prestamo } from '@/types';
import DataTable, { type Column } from '@/components/dashboard/ui/DataTable';
import Badge, { type BadgeVariant } from '@/components/dashboard/ui/Badge';
import styles from './ViewSocios.module.css';

interface ViewSociosProps {
  socios: Socio[];
  prestamos: Prestamo[];
  onNuevo: () => void;
  onEditar: (socio: Socio) => void;
  onEliminar: (socioId: string) => void;
}

function estadoToBadge(estado: EstadoSocio): BadgeVariant {
  switch (estado) {
    case 'activo':     return 'available';
    case 'suspendido': return 'low';
    case 'inactivo':   return 'neutral';
  }
}

function estadoLabel(estado: EstadoSocio): string {
  switch (estado) {
    case 'activo':     return 'Activo';
    case 'suspendido': return 'Suspendido';
    case 'inactivo':   return 'Inactivo';
  }
}

export default function ViewSocios({
  socios,
  prestamos,
  onNuevo,
  onEditar,
  onEliminar,
}: ViewSociosProps) {
  const [busqueda, setBusqueda] = useState('');

  /* ── Mapa socioId → préstamos activos (calculado desde préstamos reales) ── */
  const prestamosActivosPorSocio = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const p of prestamos) {
      if ((p.estado === 'prestado' || p.estado === 'moroso') && p.socioId) {
        mapa[p.socioId] = (mapa[p.socioId] ?? 0) + 1;
      }
    }
    return mapa;
  }, [prestamos]);

  /* ── Filtrado ── */
  const sociosFiltrados = useMemo(() => {
    const q = busqueda.toLowerCase();
    if (!q) return socios;
    return socios.filter((s) =>
      `${s.id} ${s.apellido} ${s.nombre} ${s.tipo} ${s.dni} ${s.anio ?? ''} ${s.email ?? ''}`
        .toLowerCase()
        .includes(q)
    );
  }, [socios, busqueda]);

  /* ── Columnas ── */
  const columns: Column<Socio>[] = [
    { key: 'id', header: 'ID Usuario', width: '110px' },
    {
      key: 'apellido',
      header: 'Apellido y Nombre',
      render: (row) => `${row.apellido}, ${row.nombre}`,
    },
    {
      key: 'dni',
      header: 'DNI',
      width: '110px',
      render: (row) => row.dni ?? '—',
    },
    {
      key: 'tipo',
      header: 'Tipo de Socio',
      width: '120px',
      render: (row) => (
        <span className={styles.tipoChip}>
          {row.tipo.charAt(0).toUpperCase() + row.tipo.slice(1)}
        </span>
      ),
    },
    {
      key: 'anio',
      header: 'Año / Grado',
      width: '130px',
      render: (row) => row.anio ?? '—',
    },
    {
      key: 'email',
      header: 'Email',
      render: (row) => row.email ?? '—',
    },
    {
      key: 'prestamosActivos',
      header: 'Préstamos Activos',
      width: '140px',
      render: (row) => {
        const activos = prestamosActivosPorSocio[row.id] ?? 0;
        return (
          <span className={activos > 0 ? styles.prestamosActivos : styles.prestamosNone}>
            {activos}
          </span>
        );
      },
    },
    {
      key: 'estado',
      header: 'Estado',
      width: '110px',
      render: (row) => (
        <Badge variant={estadoToBadge(row.estado)}>
          {estadoLabel(row.estado)}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      width: '100px',
      render: (row) => (
        <div className={styles.actionBtns}>
          <button
            className={styles.btnEdit}
            title="Editar socio"
            onClick={() => onEditar(row)}
            aria-label={`Editar ${row.apellido}`}
          >
            <FontAwesomeIcon icon={faPen} />
          </button>
          <button
            className={styles.btnDelete}
            title="Eliminar socio"
            onClick={() => onEliminar(row.id)}
            aria-label={`Eliminar ${row.apellido}`}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.viewWrapper}>
      {/* Encabezado */}
      <section className={styles.welcomeSection}>
        <div>
          <h1 className={styles.viewTitle}>Gestión Integral de Sujetos Educativos</h1>
          <p className={styles.viewSubtitle}>
            Administración de estudiantes, docentes y personal habilitado.
          </p>
        </div>
        <button
          id="btnAbrirNuevoSocio"
          className={styles.btnPrimary}
          onClick={onNuevo}
        >
          <FontAwesomeIcon icon={faUserPlus} />
          Registrar Socio
        </button>
      </section>

      {/* Tabla */}
      <DataTable
        columns={columns}
        rows={sociosFiltrados}
        keyField="id"
        emptyMessage="No hay socios registrados."
        id="sociosTableBody"
        header={
          <div className={styles.tableHeader}>
            <span className={styles.countLabel}>
              {sociosFiltrados.length} socio{sociosFiltrados.length !== 1 ? 's' : ''}
            </span>
            <div className={styles.searchBar}>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className={styles.searchInput}
                id="sociosSearchInput"
              />
            </div>
          </div>
        }
      />
    </div>
  );
}
