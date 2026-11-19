'use client';

import { useMemo, useState } from 'react';
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
  faChevronLeft,
  faChevronRight,
  faPaintBrush,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import type { Dano, Prestamo, Socio, SeveridadDano, EstadoCopia, Libro } from '@/types';
import { formatFecha, formatFechaHora } from '@/lib/utils';
import Modal from '@/components/ui/Modal';
import styles from './ModalExpedienteSocio.module.css';

const PAGINACION_POR_PAGINA = 20;

interface ModalExpedienteSocioProps {
  open: boolean;
  onClose: () => void;
  socioId: string | null;
  socios: Socio[];
  danos: Dano[];
  prestamos: Prestamo[];
  libros?: Libro[];
  onCambiarEstadoCopia: (libroId: string, copiaId: string, estado: EstadoCopia) => void;
}

function ordenSeveridadModal(s: SeveridadDano): number {
  return s === 'catastrofico' ? 3 : s === 'moderado' ? 2 : 1;
}

function sevLabelModal(s: SeveridadDano): string {
  switch (s) {
    case 'leve': return 'Leve';
    case 'moderado': return 'Moderado';
    case 'catastrofico': return 'Catastrofico';
    default: return 'Desconocido';
  }
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

const ESTADOS_COPIA: { value: EstadoCopia; label: string }[] = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'prestado',   label: 'Prestado' },
  { value: 'dañado',     label: 'Danado' },
  { value: 'perdido',    label: 'Perdido' },
];

export default function ModalExpedienteSocio({
  open, onClose, socioId, socios, danos, prestamos, libros, onCambiarEstadoCopia,
}: ModalExpedienteSocioProps) {
  const socio = useMemo(() => socios.find((s) => s.id === socioId) ?? null, [socios, socioId]);

  const danosSocio = useMemo(() =>
    danos.filter((d) => d.socioId === socioId).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()),
    [danos, socioId]
  );

  const prestamosSocio = useMemo(() =>
    prestamos.filter((p) => p.socioId === socioId).sort((a, b) => new Date(b.fechaPrestamo).getTime() - new Date(a.fechaPrestamo).getTime()),
    [prestamos, socioId]
  );

  const [paginaActual, setPaginaActual] = useState(1);
  const totalPaginas = Math.ceil(prestamosSocio.length / PAGINACION_POR_PAGINA);
  const prestamosPagina = prestamosSocio.slice((paginaActual - 1) * PAGINACION_POR_PAGINA, paginaActual * PAGINACION_POR_PAGINA);

  const irAPagina = (pagina: number) => {
    setPaginaActual(Math.max(1, Math.min(pagina, totalPaginas)));
  };

  const totalDanos = danosSocio.length;
  const leves = danosSocio.filter((d) => d.severidad === 'leve').length;
  const moderados = danosSocio.filter((d) => d.severidad === 'moderado').length;
  const catastroficos = danosSocio.filter((d) => d.severidad === 'catastrofico').length;
  const esCritico = catastroficos > 0;
  const severidadMax = danosSocio.reduce<SeveridadDano | null>((max, d) =>
    max === null || ordenSeveridadModal(d.severidad) > ordenSeveridadModal(max) ? d.severidad : max, null
  );

  const totalPrestamos = prestamosSocio.length;
  const prestamosActivos = prestamosSocio.filter((p) => p.estado === 'prestado').length;
  const morosos = prestamosSocio.filter((p) => p.estado === 'moroso').length;

  const handlePrint = () => window.print();

  const estadoCopiaMap = useMemo(() => {
    const mapa = new Map<string, { estado: EstadoCopia; libroId: string }>();
    if (libros) {
      libros.forEach((l) => {
        l.copias.forEach((c) => {
          mapa.set(c.id, { estado: c.estado, libroId: l.id });
        });
      });
    }
    return mapa;
  }, [libros]);

  const [copiasRestauradas, setCopiasRestauradas] = useState<Set<string>>(new Set());

  const handleRestaurarCopia = (d: Dano) => {
    onCambiarEstadoCopia(d.libroId, d.copiaId, 'disponible');
    setCopiasRestauradas((prev) => new Set(prev).add(d.id));
  };

  if (!socio && open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Expediente de Antecedentes e Incidencias" id="modalExpedienteSocio" size="lg">
      {socio && (
        <>
          <div className={styles.socioBanner + (esCritico ? ' ' + styles.socioBannerCritico : '')} id="expedienteSocioHeader">
            <div className={styles.socioAvatar}>
              <FontAwesomeIcon icon={faUserShield} />
            </div>
            <div className={styles.socioInfo}>
              <h3 className={styles.socioNombre}>{socio.apellido}, {socio.nombre}</h3>
              <div className={styles.socioMeta}>
                <span className={styles.socioPill}>{socio.tipo.charAt(0).toUpperCase() + socio.tipo.slice(1)}</span>
                {socio.dni && <span className={styles.socioPill}>DNI {socio.dni}</span>}
                <span className={styles.socioPill + (esCritico ? ' ' + styles.socioPillCritico : ' ' + styles.socioPillNormal)}>
                  {esCritico ? 'Caso Critico' : totalDanos > 0 ? 'Con Antecedentes' : 'Sin Antecendentes'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.statsGrid} id="expedienteStatsGrid">
            <div className={styles.statCard}>
              <FontAwesomeIcon icon={faTriangleExclamation} className={styles.statIcon} />
              <span className={styles.statNum}>{totalDanos}</span>
              <span className={styles.statLabel}>Total Danos</span>
            </div>
            <div className={styles.statCard + ' ' + styles.statCardLeve}>
              <FontAwesomeIcon icon={faLeaf} className={styles.statIcon} />
              <span className={styles.statNum}>{leves}</span>
              <span className={styles.statLabel}>Danos Leves</span>
            </div>
            <div className={styles.statCard + ' ' + styles.statCardModerado}>
              <FontAwesomeIcon icon={faTriangleExclamation} className={styles.statIcon} />
              <span className={styles.statNum}>{moderados}</span>
              <span className={styles.statLabel}>Moderados</span>
            </div>
            <div className={styles.statCard + ' ' + styles.statCardCatastrofico}>
              <FontAwesomeIcon icon={faSkullCrossbones} className={styles.statIcon} />
              <span className={styles.statNum}>{catastroficos}</span>
              <span className={styles.statLabel}>CATATROFICO</span>
            </div>
          </div>

          {severidadMax && (
            <div className={styles.severidadMaxRow}>
              <span className={styles.severidadMaxLabel}>Severidad maxima registrada:</span>
              <span className={styles.severidadMaxValue}>{sevLabelModal(severidadMax)}</span>
            </div>
          )}

          <div className={styles.historialSection}>
            <div className={styles.historialHeader}>
              <h3 className={styles.historialTitle}><FontAwesomeIcon icon={faClockRotateLeft} /> Historial de Incidentes de Danio</h3>
              <span className={styles.historialCount} id="expedienteTotalBadges">{totalDanos} registro{totalDanos !== 1 ? 's' : ''}</span>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID Danio</th>
                    <th>Fecha y Hora</th>
                    <th>Libro Afectado</th>
                    <th>Nivel de Danio</th>
                    <th>Descripcion</th>
                    <th>Registrado Por</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody id="expedienteHistorialTableBody">
                  {danosSocio.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.emptyState} id="expedienteEmptyState">
                        <FontAwesomeIcon icon={faCircleCheck} className={styles.emptyIcon} />
                        <p className={styles.emptyTitle}>Sin antecedentes de danos ni incidencias.</p>
                        <span className={styles.emptySubtitle}>Legajo en estado optimo y sin penalizaciones activas.</span>
                      </td>
                    </tr>
                  ) : (
                    danosSocio.map((d) => {
                      const copiaInfo = estadoCopiaMap.get(d.copiaId);
                      const estadoCopiaActual = copiaInfo?.estado ?? 'disponible';
                      return (
                        <tr key={d.id} className={d.severidad === 'catastrofico' ? styles.rowCatastrofico : ''}>
                          <td className={styles.cellMono}>{d.id}</td>
                          <td className={styles.cellMono}>{formatFechaHora(d.fecha)}</td>
                          <td>{d.libroTitulo}</td>
                          <td><span className={styles.sevBadge + ' ' + styles['sev_' + d.severidad]}>{sevLabelModal(d.severidad)}</span></td>
                          <td className={styles.cellDesc}>{d.descripcion}</td>
                          <td>{d.turnoAdmin}</td>
                          <td style={{ display: copiasRestauradas.has(d.id) ? 'none' : 'block' }}>
                            <button
                              type="button"
                              className={styles.btnEstadoPequeño}
                              title="Restaurar"
                              onClick={() => handleRestaurarCopia(d)}
                              style={{ cursor: 'pointer' }}
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={styles.sectionDivider} />

          <div className={styles.historialSection}>
            <div className={styles.historialHeader}>
              <h3 className={styles.historialTitle}><FontAwesomeIcon icon={faRepeat} /> Historial de Prestamos</h3>
              <div className={styles.historialCountGroup}>
                <span className={styles.historialCount}>{totalPrestamos} prestamo{totalPrestamos !== 1 ? 's' : ''}</span>
                {prestamosActivos > 0 && <span className={styles.historialCount + ' ' + styles.historialCountActivo}>{prestamosActivos} activo{prestamosActivos !== 1 ? 's' : ''}</span>}
                {morosos > 0 && <span className={styles.historialCount + ' ' + styles.historialCountMoroso}>{morosos} moroso{morosos !== 1 ? 's' : ''}</span>}
              </div>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID Prestamo</th>
                    <th>Fecha</th>
                    <th>Libro</th>
                    <th>Vencimiento</th>
                    <th>Devolucion</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {prestamosSocio.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyState}>
                        <FontAwesomeIcon icon={faCircleCheck} className={styles.emptyIcon} />
                        <p className={styles.emptyTitle}>Sin prestamos registrados.</p>
                        <span className={styles.emptySubtitle}>Este socio no tiene prestamos en el historial.</span>
                      </td>
                    </tr>
                  ) : (
                    prestamosPagina.map((p) => (
                      <tr key={p.id} className={p.estado === 'moroso' ? styles.rowMoroso : ''}>
                        <td className={styles.cellMono}>{p.id}</td>
                        <td className={styles.cellMono}>{formatFecha(p.fechaPrestamo)}</td>
                        <td>{p.libroTitulo}</td>
                        <td className={styles.cellMono}>{formatFecha(p.fechaLimite)}</td>
                        <td className={styles.cellMono}>{p.fechaDevolucion ? formatFecha(p.fechaDevolucion) : '-'}</td>
                        <td><span className={styles.estadoBadge + ' ' + (ESTADO_PRESTAMO_CLASS[p.estado] ?? '')}>{ESTADO_PRESTAMO_LABEL[p.estado] ?? p.estado}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {totalPaginas > 1 && (
              <div className={styles.paginaContainer}>
                <span className={styles.paginaInfo}>Página {paginaActual} de {totalPaginas}</span>
                <div className={styles.paginaControls}>
                  <button type="button" className={styles.paginaBtn} onClick={() => irAPagina(paginaActual - 1)} disabled={paginaActual === 1}><FontAwesomeIcon icon={faChevronLeft} /></button>
                  <button type="button" className={styles.paginaBtn} onClick={() => irAPagina(paginaActual + 1)} disabled={paginaActual === totalPaginas}><FontAwesomeIcon icon={faChevronRight} /></button>
                </div>
              </div>
            )}
          </div>

          <div className={styles.footerActions}>
            <button type="button" className={styles.btnImprimir} id="btnImprimirExpediente" onClick={handlePrint}><FontAwesomeIcon icon={faPrint} /> Imprimir Expediente</button>
            <button type="button" className={styles.btnCerrar} onClick={onClose}>Cerrar</button>
          </div>
        </>
      )}
    </Modal>
  );
}