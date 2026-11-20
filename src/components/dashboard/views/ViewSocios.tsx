'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserPlus,
  faPen,
  faTrash,
  faTriangleExclamation,
  faFolderOpen,
} from '@fortawesome/free-solid-svg-icons';
import type { Socio, Prestamo } from '@/types';
import DataTable, { type Column } from '@/components/dashboard/ui/DataTable';
import Badge from '@/components/dashboard/ui/Badge';
import Modal from '@/components/ui/Modal';
import { estadoSocioToBadge, estadoSocioLabel } from '@/lib/utils';
import styles from './ViewSocios.module.css';

interface ConfirmState {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
}

interface ViewSociosProps {
  socios: Socio[];
  prestamos: Prestamo[];
  onNuevo: () => void;
  onEditar: (socio: Socio) => void;
  onEliminar: (socioId: string) => void;
  onVerDetalle: (socioId: string) => void;
}

export default function ViewSocios({
  socios,
  prestamos,
  onNuevo,
  onEditar,
  onEliminar,
  onVerDetalle,
}: ViewSociosProps) {
  const [busqueda, setBusqueda] = useState('');
  const [confirmModal, setConfirmModal] = useState<ConfirmState>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

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
      `${s.id} ${s.apellido} ${s.nombre} ${s.tipo} ${s.dni} ${s.email ?? ''}`
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
        <Badge variant={estadoSocioToBadge(row.estado)}>
          {estadoSocioLabel(row.estado)}
        </Badge>
      ),
    },
    {
      key: 'acciones',
      header: 'Acciones',
      width: '135px',
      render: (row) => (
        <div className={styles.actionBtns}>
          <button
            className={styles.btnExpediente}
            title="Ver expediente e historial de préstamos"
            onClick={() => onVerDetalle(row.id)}
            aria-label={`Ver expediente de ${row.apellido}`}
          >
            <FontAwesomeIcon icon={faFolderOpen} />
          </button>
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
            onClick={() => {
              setConfirmModal({
                open: true,
                title: 'Eliminar Socio',
                message: `¿Estás seguro de que deseas eliminar permanentemente a ${row.apellido}, ${row.nombre}? Esta acción no se puede deshacer.`,
                onConfirm: () => onEliminar(row.id),
              });
            }}
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

      {/* Modal de Confirmación */}
      <Modal
        open={confirmModal.open}
        onClose={() => setConfirmModal((prev: ConfirmState) => ({ ...prev, open: false }))}
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
              onClick={() => setConfirmModal((prev: ConfirmState) => ({ ...prev, open: false }))}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={styles.btnDanger}
              onClick={() => {
                confirmModal.onConfirm();
                setConfirmModal((prev: ConfirmState) => ({ ...prev, open: false }));
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
