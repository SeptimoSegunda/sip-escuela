'use client';

import { useState, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faBook,
  faClockRotateLeft,
  faCalendarCheck,
  faTriangleExclamation,
  faCalendarDays,
  faUserClock,
  faFire,
  faChevronLeft,
  faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import type { Libro, Prestamo, Dano, AuditLog } from '@/types';
import MetricCard from '@/components/dashboard/ui/MetricCard';
import ReportCard, { BarChart, DonutChart } from '@/components/dashboard/ui/ReportCard';
import Badge from '@/components/dashboard/ui/Badge';
import { formatFecha, estadoPrestamoToBadge } from '@/lib/utils';
import styles from './ViewInicio.module.css';

interface ViewInicioProps {
  libros: Libro[];
  prestamos: Prestamo[];
  danos: Dano[];
  auditLogs: AuditLog[];
}

/* ── Meses y años validos ── */
const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Generar años desde 2020 hasta el año actual
const ANIOS = (() => {
  const year = new Date().getFullYear();
  const years = [];
  for (let i = 2020; i <= year; i++) years.push(i);
  return years;
})();

function formatPeriodo(mes: number, anio: number): string {
  const mm = mes.toString().padStart(2, '0');
  return `${mm}-${anio}`;
}

function matchPeriodo(isoDate: string, periodo: string): boolean {
  if (periodo === 'all') return true;
  const [mm, yyyy] = periodo.split('-');
  const d = new Date(isoDate);
  return (
    d.getMonth() + 1 === parseInt(mm) &&
    d.getFullYear() === parseInt(yyyy)
  );
}

export default function ViewInicio({ libros, prestamos, danos, auditLogs }: ViewInicioProps) {
  const [mesSeleccionado, setMesSeleccionado] = useState(9); // Septiembre como default
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  // Convertir a string para matchPeriodo
  const periodo = formatPeriodo(mesSeleccionado, anioSeleccionado);

  const prestamosPeriodo = useMemo(
    () => prestamos.filter((p) => matchPeriodo(p.fechaPrestamo, periodo)),
    [prestamos, periodo]
  );
  const auditPeriodo = useMemo(
    () => auditLogs.filter((l) => matchPeriodo(l.fecha, periodo)),
    [auditLogs, periodo]
  );

  /* ── Métricas globales (sin filtro de período) ── */
  const librosEnEstanteria = useMemo(
    () => libros.reduce((acc, l) => acc + l.copias.filter((c) => c.estado === 'disponible').length, 0),
    [libros]
  );
  const prestamosActivos = prestamos.filter((p) => p.estado === 'prestado' || p.estado === 'moroso').length;
  const totalIncidencias = danos.length;

  /* ── Métricas de período ── */
  const totalPrestamosMes  = prestamosPeriodo.length;
  const prestadosPeriodo   = prestamosPeriodo.filter((p) => p.estado !== 'devuelto').length;
  const devueltosPeriodo   = prestamosPeriodo.filter((p) => p.estado === 'devuelto').length;

  /* ── Acciones por turno (audit del período) ── */
  const accionesManana = auditPeriodo.filter((l) => l.admin === 'Turno Mañana').length;
  const accionesTarde  = auditPeriodo.filter((l) => l.admin === 'Turno Tarde').length;
  const maxAcciones    = Math.max(accionesManana, accionesTarde, 1);

  /* ── Top 5 libros más solicitados en el período ── */
  const topLibros = useMemo(() => {
    const conteo = new Map<string, { titulo: string; count: number }>();
    prestamosPeriodo.forEach((p) => {
      const entry = conteo.get(p.libroId) ?? { titulo: p.libroTitulo, count: 0 };
      entry.count++;
      conteo.set(p.libroId, entry);
    });
    return Array.from(conteo.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [prestamosPeriodo]);

  const maxTopCount = topLibros[0]?.count ?? 1;

  return (
    <div className={styles.viewWrapper}>
      {/* Encabezado con selector de período */}
      <section className={styles.welcomeSection}>
        <div>
          <h1 className={styles.viewTitle}>
            <FontAwesomeIcon icon={faHouse} /> Inicio
          </h1>
          <p className={styles.viewSubtitle}>
            Estado integral de la biblioteca, estadísticas de circulación y métricas en tiempo real.
          </p>
        </div>
        <div className={styles.periodoSelector}>
          <label className={styles.periodoLabel}>
            <FontAwesomeIcon icon={faCalendarDays} /> Período:
          </label>
          <div className={styles.calendarpicker}>
            <button
              type="button"
              className={styles.calNavBtn}
              onClick={() => setAnioSeleccionado((a) => Math.max(2020, a - 1))}
              aria-label="Año anterior"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <select
              className={styles.calSelect}
              value={anioSeleccionado}
              onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
            >
              {ANIOS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
            <select
              className={styles.calSelect}
              value={mesSeleccionado}
              onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={i + 1}>{MESES[i]}</option>
              ))}
            </select>
            <button
              type="button"
              className={styles.calNavBtn}
              onClick={() => setAnioSeleccionado((a) => Math.min(new Date().getFullYear(), a + 1))}
              aria-label="Año siguiente"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </section>

      {/* Métricas KPI ×4 */}
      <section className={styles.metricsGrid}>
        <MetricCard
          icon={faBook}
          value={librosEnEstanteria}
          label="Libros en Estantería"
          variant="salvia"
          id="statEstanteria"
        />
        <MetricCard
          icon={faClockRotateLeft}
          value={prestamosActivos}
          label="Préstamos Activos"
          variant="salvia"
          id="statPrestamos"
        />
        <MetricCard
          icon={faCalendarCheck}
          value={totalPrestamosMes}
          label="Préstamos en Período"
          variant="mustard"
          id="repTotalPrestamosMes"
        />
        <MetricCard
          icon={faTriangleExclamation}
          value={totalIncidencias}
          label="Total Incidencias"
          variant="terracotta"
          id="statTotalIncidencias"
        />
      </section>

      {/* Fila de gráficos: Distribución + Acciones de turnos */}
      <div className={styles.dashGrid}>
        <ReportCard
          title="Distribución de Libros"
          subtitle="Estado de ejemplares en el período: Prestados, Devueltos y Dañados"
          id="repDonutChartContainer"
        >
          <DonutChart
            label="ejemplares"
            slices={[
              { label: 'Prestados / Morosos', value: prestadosPeriodo, color: 'var(--navy)' },
              { label: 'Devueltos',           value: devueltosPeriodo, color: 'var(--accent-salvia)' },
              { label: 'Incidencias (daños)', value: danos.length,     color: '#e07b54' },
            ]}
          />
        </ReportCard>

        <ReportCard
          title="Acciones de Turnos"
          subtitle="Acciones totales elaboradas por las bibliotecarias en el período"
          id="repTurnosActionsContainer"
        >
          <BarChart
            items={[
              {
                label: `Turno Mañana (${accionesManana})`,
                value: accionesManana,
                maxValue: maxAcciones,
                variant: 'default',
              },
              {
                label: `Turno Tarde (${accionesTarde})`,
                value: accionesTarde,
                maxValue: maxAcciones,
                variant: 'salvia',
              },
            ]}
          />
          <div className={styles.chartFontIconWrapper}>
            <FontAwesomeIcon icon={faUserClock} className={styles.chartBgIcon} />
          </div>
        </ReportCard>
      </div>

      {/* Fila inferior: Historial + Top libros */}
      <div className={styles.dashGrid}>
        {/* Historial de préstamos */}
        <ReportCard
          title="Historial de Préstamos"
          subtitle="Registro de movimientos en el período seleccionado"
          id="repTableBody"
        >
          <div className={styles.historialHeader}>
            <Badge variant="available" >
              {prestamosPeriodo.length} movimiento{prestamosPeriodo.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          <div className={styles.tableWrapper}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>ID Préstamo</th>
                  <th>Libro</th>
                  <th>Socio</th>
                  <th>Fecha Préstamo</th>
                  <th>Fecha Límite</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {prestamosPeriodo.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      No hay movimientos en este período.
                    </td>
                  </tr>
                ) : (
                  prestamosPeriodo.map((p) => {
                    const vencido = p.estado === 'moroso';
                    return (
                      <tr key={p.id}>
                        <td className={styles.cellMono}>{p.id}</td>
                        <td>{p.libroTitulo}</td>
                        <td>{p.prestatario}</td>
                        <td>{formatFecha(p.fechaPrestamo)}</td>
                        <td className={vencido ? styles.fechaVencida : ''}>
                          {formatFecha(p.fechaLimite)}
                          {vencido && ' ⚠'}
                        </td>
                        <td>
                          <Badge variant={estadoPrestamoToBadge(p.estado)}>
                            {p.estado === 'prestado' ? 'Activo' : p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </ReportCard>

        {/* Top 5 libros más solicitados */}
        <ReportCard
          title="Libros Más Solicitados"
          subtitle="Top 5 títulos con mayor demanda en el período"
          id="repTopLibrosContainer"
        >
          <BarChart
            items={topLibros.map((l) => ({
              label: l.titulo.length > 28 ? l.titulo.slice(0, 28) + '…' : l.titulo,
              value: l.count,
              maxValue: maxTopCount,
              variant: 'default' as const,
            }))}
          />
          {topLibros.length === 0 && (
            <p className={styles.emptyChart}>Sin datos en el período.</p>
          )}
          <div className={styles.chartFontIconWrapper}>
            <FontAwesomeIcon icon={faFire} className={styles.chartBgIcon} />
          </div>
        </ReportCard>
      </div>
    </div>
  );
}
