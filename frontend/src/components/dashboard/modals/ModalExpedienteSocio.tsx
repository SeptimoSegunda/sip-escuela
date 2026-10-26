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
} from '@fortawesome/free-solid-svg-icons';
import type { Dano, Socio, SeveridadDano } from '@/types';
import Modal from '@/components/ui/Modal';
import styles from './ModalExpedienteSocio.module.css';

interface ModalExpedienteSocioProps {
  open: boolean;
  onClose: () => void;
  socioId: string | null;
  socios: Socio[];
  danos: Dano[];
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

export default function ModalExpedienteSocio({
  open, onClose, socioId, socios, danos,
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

  /* Estadísticas */
  const totalDanos   = danosSocio.length;
  const leves        = danosSocio.filter((d) => d.severidad === 'leve').length;
  const moderados    = danosSocio.filter((d) => d.severidad === 'moderado').length;
  const catastroficos = danosSocio.filter((d) => d.severidad === 'catastrofico').length;
  const esCritico    = catastroficos > 0;
  const severidadMax = danosSocio.reduce<SeveridadDano | null>((max, d) =>
    max === null || ordenSeveridad(d.severidad) > ordenSeveridad(max) ? d.severidad : max,
    null
  );

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
                {socio.anio && <span className={styles.socioPill}>{socio.anio}{socio.turno ? ` — ${socio.turno}` : ''}</span>}
                <span className={`${styles.socioPill} ${esCritico ? styles.socioPillCritico : styles.socioPillNormal}`}>
                  {esCritico ? '⚠ Caso Crítico' : 'Con Antecedentes'}
                </span>
              </div>
            </div>
          </div>

          {/* ── Stats grid ── */}
          <div className={styles.statsGrid} id="expedienteStatsGrid">
            <div className={styles.statCard}>
              <FontAwesomeIcon icon={faTriangleExclamation} className={styles.statIcon} />
              <span className={styles.statNum}>{totalDanos}</span>
              <span className={styles.statLabel}>Total Incidencias</span>
            </div>
            <div className={`${styles.statCard} ${styles.statCardLeve}`}>
              <FontAwesomeIcon icon={faLeaf} className={styles.statIcon} />
              <span className={styles.statNum}>{leves}</span>
              <span className={styles.statLabel}>Daños Leves</span>
            </div>
            <div className={`${styles.statCard} ${styles.statCardModerado}`}>
              <FontAwesomeIcon icon={faTriangleExclamation} className={styles.statIcon} />
              <span className={styles.statNum}>{moderados}</span>
              <span className={styles.statLabel}>Daños Moderados</span>
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

          {/* ── Historial cronológico ── */}
          <div className={styles.historialSection}>
            <div className={styles.historialHeader}>
              <h3 className={styles.historialTitle}>
                <FontAwesomeIcon icon={faClockRotateLeft} /> Historial Completo de Incidentes Registrados
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
