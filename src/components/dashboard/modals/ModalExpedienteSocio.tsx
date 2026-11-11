'use client';

import { useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserShield,
  faClockRotateLeft,
  faPrint,
  faCircleCheck,
  faSkullCrossbones,
  faTriangleExclamation,
  faLeaf,
  faRepeat,
} from '@fortawesome/free-solid-svg-icons';
import type { Dano, Prestamo, Socio, SeveridadDano } from '@/types';
import Modal from '@/components/ui/Modal';
import styles from './ModalExpedienteSocio.module.css';

interface ModalExpedienteSocioProps {
  open: boolean;
  onClose: () => void;
  socioId: string | null;
  socios: Socio[];
  danos: Dano[];
  prestamos: Prestamo[];
}

function ordenSeveridad(s: SeveridadDano): number {
  return s === 'catastrofico' ? 3 : s === 'moderado' ? 2 : 1;
}

function severidadLabel(s: SeveridadDano): string {
  switch (s) {
    case 'leve':        return '🟢 Leve';
    case 'moderado':    return '🟠 Moderado';
    case 'catastrofico': return '🔴 CATASTRÓFICO';
  }
}

function formatFechaHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function formatFecha(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return iso; }
}

const ESTADO_PRESTAMO_LABEL: Record<string, string> = {
  prestado: 'Activo',
  devuelto: 'Devuelto',
  moroso:   'Moroso',
};

const ESTADO_PRESTAMO_CLASS: Record<string, string> = {
  prestado: styles.estadoPrestado,
  devuelto: styles.estadoDevuelto,
  moroso:   styles.estadoMoroso,
};

export default function ModalExpedienteSocio({
  open, onClose, socioId, socios, danos, prestamos,
}: ModalExpedienteSocioProps) {
  const socio = useMemo(
    () => socios.find((s) => s.id === socioId) ?? null,
    [socios, socioId]
  );

  const danosSocio = useMemo(
    () => danos
      .filter((d) => d.socioId === socioId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [danos, socioId]
  );

  const prestamosSocio = useMemo(
    () => prestamos
      .filter((p) => p.socioId === socioId)
      .sort((a, b) => new Date(b.fechaPrestamo).getTime() - new Date(a.fechaPrestamo).getTime()),
    [prestamos, socioId]
  );

  /* Estadísticas de daños */
  const totalDanos    = danosSocio.length;
  const leves         = danosSocio.filter((d) => d.severidad === 'leve').length;
  const moderados     = danosSocio.filter((d) => d.severidad === 'moderado').length;
  const catastroficos = danosSocio.filter((d) => d.severidad === 'catastrofico').length;
  const esCritico     = catastroficos > 0;
  const severidadMax  = danosSocio.reduce<SeveridadDano | null>((max, d) =>
    max === null || ordenSeveridad(d.severidad) > ordenSeveridad(max) ? d.severidad : max,
    null
  );

  /* Estadísticas de préstamos */
  const totalPrestamos   = prestamosSocio.length;
  const prestamosActivos = prestamosSocio.filter((p) => p.estado === 'prestado').length;
  const morosos          = prestamosSocio.filter((p) => p.estado === 'moroso').length;

  const handlePrint = () => window.print();

  if (!socio && open) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Expediente de Antecedentes e Incidencias"
      id="modalExpedienteSocio"
      size="lg"
    >
      {socio && (
        <>
          {/* ── Banner del socio ── */}
          <div className={`${styles.socioBanner} ${esCritico ? styles.socioBannerCritico : ''}`}
            id="expedienteSocioHeader">
            <div className={styles.socioAvatar}>
              <FontAwesomeIcon icon={faUserShield} />
            </div>
            <div className={styles.socioInfo}>
              <h3 className={styles.socioNombre}>
                {socio.apellido}, {socio.nombre}
              </h3>
              <div className={styles.socioMeta}>
                <span className={styles.socioPill}>{socio.tipo.charAt(0).toUpperCase() + socio.tipo.slice(1)}</span>
                {socio.anio && <span className={styles.socioPill}>{socio.anio}</span>}
                {socio.dni && <span className={styles.socioPill}>DNI {socio.dni}</span>}
                <span className={`${styles.socioPill} ${esCritico ? styles.socioPillCritico : styles.socioPillNormal}`}>
                  {esCritico ? '⚠ Caso Crítico' : totalDanos > 0 ? 'Con Antecedentes' : 'Sin Antecedentes'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Stats grid — Daños ── */}
          <div className={styles.statsGrid} id="expedienteStatsGrid">
            <div className={styles.statCard}>
              <FontAwesomeIcon icon={faTriangleExclamation} className={styles.statIcon} />
              <span className={styles.statNum}>{totalDanos}</span>
              <span className={styles.statLabel}>Total Daños</span>
            </div>
            <div className={`${styles.statCard} ${styles.statCardLeve}`}>
              <FontAwesomeIcon icon={faLeaf} className={styles.statIcon} />
              <span className={styles.statNum}>{leves}</span>
              <span className={styles.statLabel}>Daños Leves</span>
            </div>
            <div className={`${styles.statCard} ${styles.statCardModerado}`}>
              <FontAwesomeIcon icon={faTriangleExclamation} className={styles.statIcon} />
              <span className={styles.statNum}>{moderados}</span>
              <span className={styles.statLabel}>Moderados</span>
            </div>
            <div className={`${styles.statCard} ${styles.statCardCatastrofico}`}>
              <FontAwesomeIcon icon={faSkullCrossbones} className={styles.statIcon} />
              <span className={styles.statNum}>{catastroficos}</span>
              <span className={styles.statLabel}>CATASTRÓFICOS</span>
            </div>
          </div>

          {/* Severidad máxima */}
          {severidadMax && (
            <div className={styles.severidadMaxRow}>
              <span className={styles.severidadMaxLabel}>Severidad máxima registrada:</span>
              <span className={styles.severidadMaxValue}>{severidadLabel(severidadMax)}</span>
            </div>
          )}

          {/* ── Historial de Daños ── */}
          <div className={styles.historialSection}>
            <div className={styles.historialHeader}>
              <h3 className={styles.historialTitle}>
                <FontAwesomeIcon icon={faClockRotateLeft} /> Historial de Incidentes de Daño
              </h3>
              <span className={styles.historialCount} id="expedienteTotalBadges">
                {totalDanos} registro{totalDanos !== 1 ? 's' : ''}
              </span>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID Daño</th>
                    <th>Fecha y Hora</th>
                    <th>Libro Afectado</th>
                    <th>Nivel de Daño</th>
                    <th>Descripción</th>
                    <th>Registrado Por</th>
                  </tr>
                </thead>
                <tbody id="expedienteHistorialTableBody">
                  {danosSocio.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyState} id="expedienteEmptyState">
                        <FontAwesomeIcon icon={faCircleCheck} className={styles.emptyIcon} />
                        <p className={styles.emptyTitle}>Sin antecedentes de daños ni incidencias.</p>
                        <span className={styles.emptySubtitle}>
                          Legajo en estado óptimo y sin penalizaciones activas.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    danosSocio.map((d) => (
                      <tr key={d.id} className={d.severidad === 'catastrofico' ? styles.rowCatastrofico : ''}>
                        <td className={styles.cellMono}>{d.id}</td>
                        <td className={styles.cellMono}>{formatFechaHora(d.fecha)}</td>
                        <td>{d.libroTitulo}</td>
                        <td>
                          <span className={`${styles.sevBadge} ${styles['sev_' + d.severidad]}`}>
                            {severidadLabel(d.severidad)}
                          </span>
                        </td>
                        <td className={styles.cellDesc}>{d.descripcion}</td>
                        <td>{d.turnoAdmin}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Divisor ── */}
          <div className={styles.sectionDivider} />

          {/* ── Historial de Préstamos ── */}
          <div className={styles.historialSection}>
            <div className={styles.historialHeader}>
              <h3 className={styles.historialTitle}>
                <FontAwesomeIcon icon={faRepeat} /> Historial de Préstamos
              </h3>
              <div className={styles.historialCountGroup}>
                <span className={styles.historialCount}>
                  {totalPrestamos} préstamo{totalPrestamos !== 1 ? 's' : ''}
                </span>
                {prestamosActivos > 0 && (
                  <span className={`${styles.historialCount} ${styles.historialCountActivo}`}>
                    {prestamosActivos} activo{prestamosActivos !== 1 ? 's' : ''}
                  </span>
                )}
                {morosos > 0 && (
                  <span className={`${styles.historialCount} ${styles.historialCountMoroso}`}>
                    {morosos} moroso{morosos !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID Préstamo</th>
                    <th>Fecha</th>
                    <th>Libro</th>
                    <th>Vencimiento</th>
                    <th>Devolución</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamosSocio.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyState}>
                        <FontAwesomeIcon icon={faCircleCheck} className={styles.emptyIcon} />
                        <p className={styles.emptyTitle}>Sin préstamos registrados.</p>
                        <span className={styles.emptySubtitle}>
                          Este socio no tiene préstamos en el historial.
                        </span>
                      </td>
                    </tr>
                  ) : (
                    prestamosSocio.map((p) => (
                      <tr key={p.id} className={p.estado === 'moroso' ? styles.rowMoroso : ''}>
                        <td className={styles.cellMono}>{p.id}</td>
                        <td className={styles.cellMono}>{formatFecha(p.fechaPrestamo)}</td>
                        <td>{p.libroTitulo}</td>
                        <td className={styles.cellMono}>{formatFecha(p.fechaLimite)}</td>
                        <td className={styles.cellMono}>
                          {p.fechaDevolucion ? formatFecha(p.fechaDevolucion) : '—'}
                        </td>
                        <td>
                          <span className={`${styles.estadoBadge} ${ESTADO_PRESTAMO_CLASS[p.estado] ?? ''}`}>
                            {ESTADO_PRESTAMO_LABEL[p.estado] ?? p.estado}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Acciones ── */}
          <div className={styles.footerActions}>
            <button
              type="button"
              className={styles.btnImprimir}
              id="btnImprimirExpediente"
              onClick={handlePrint}
            >
              <FontAwesomeIcon icon={faPrint} /> Imprimir Expediente
            </button>
            <button type="button" className={styles.btnCerrar} onClick={onClose}>
              Cerrar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
