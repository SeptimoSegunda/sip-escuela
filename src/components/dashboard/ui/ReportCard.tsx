import styles from './ReportCard.module.css';

interface ReportCardProps {
  title: string;
  subtitle?: string;
  /** Slot para el contenido del gráfico o tabla interna */
  children: React.ReactNode;
  /** Cuántas columnas ocupa en el grid padre (1 o 2) */
  span?: 1 | 2;
  id?: string;
}

export default function ReportCard({
  title,
  subtitle,
  children,
  span = 1,
  id,
}: ReportCardProps) {
  return (
    <article
      className={`${styles.reportCard} ${span === 2 ? styles.spanTwo : ''}`}
      id={id}
    >
      <h3 className={styles.reportTitle}>{title}</h3>
      {subtitle && <p className={styles.reportSubtitle}>{subtitle}</p>}
      <div className={styles.chartContainer}>{children}</div>
    </article>
  );
}

/* ────────────────────────────────────────────────
   Sub-componentes de gráfico de barras horizontal
   Usados dentro de <ReportCard> para los charts
──────────────────────────────────────────────── */

interface BarItem {
  label: string;
  value: number;
  maxValue: number;
  variant?: 'default' | 'salvia';
}

export function BarChart({ items }: { items: BarItem[] }) {
  return (
    <div className={styles.barChart}>
      {items.map((item) => {
        const pct = item.maxValue > 0
          ? Math.round((item.value / item.maxValue) * 100)
          : 0;
        return (
          <div key={item.label} className={styles.barItem}>
            <div className={styles.barLabel}>
              <span>{item.label}</span>
              <span>{item.value}</span>
            </div>
            <div className={styles.barTrack}>
              <div
                className={`${styles.barFill} ${
                  item.variant === 'salvia' ? styles.barFillSalvia : ''
                }`}
                style={{ width: `${pct}%` }}
                role="progressbar"
                aria-valuenow={item.value}
                aria-valuemax={item.maxValue}
                aria-label={item.label}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ────────────────────────────────────────────────
   DonutChart — gráfico de torta tipo anillo SVG
   Usado en “Distribución de Libros” en ViewInicio
──────────────────────────────────────────────── */

export interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

export function DonutChart({ slices, label }: { slices: DonutSlice[]; label?: string }) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const R = 54;          // radio del anillo
  const r = 34;          // radio interior (grosor del anillo)
  const CX = 70;
  const CY = 70;
  const circumference = 2 * Math.PI * R;

  /* Calcular segmentos */
  let offset = 0;
  const segments = slices.map((s) => {
    const pct   = total > 0 ? s.value / total : 0;
    const dash  = pct * circumference;
    const gap   = circumference - dash;
    const seg   = { ...s, pct, dash, gap, offset };
    offset += dash;
    return seg;
  });

  return (
    <div className={styles.donutWrapper}>
      <svg
        viewBox="0 0 140 140"
        className={styles.donutSvg}
        aria-label="Gráfico de distribución de libros"
        role="img"
      >
        {/* Fondo del anillo */}
        <circle
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke="var(--beige-anchor)"
          strokeWidth={R - r}
        />
        {total === 0 && (
          <circle
            cx={CX} cy={CY} r={R}
            fill="none"
            stroke="var(--beige-dark)"
            strokeWidth={R - r}
          />
        )}
        {/* Segmentos */}
        {segments.map((seg) =>
          seg.value > 0 ? (
            <circle
              key={seg.label}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={R - r}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset}
              transform={`rotate(-90 ${CX} ${CY})`}
              style={{ transition: 'stroke-dasharray 0.5s ease' }}
            />
          ) : null
        )}
        {/* Etiqueta central */}
        <text
          x={CX} y={CY - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.donutCenterNum}
        >
          {total}
        </text>
        <text
          x={CX} y={CY + 10}
          textAnchor="middle"
          dominantBaseline="middle"
          className={styles.donutCenterLabel}
        >
          {label ?? 'total'}
        </text>
      </svg>

      {/* Leyenda */}
      <ul className={styles.donutLegend}>
        {slices.map((s) => (
          <li key={s.label} className={styles.donutLegendItem}>
            <span className={styles.donutDot} style={{ background: s.color }} />
            <span className={styles.donutLegendLabel}>{s.label}</span>
            <span className={styles.donutLegendVal}>
              {s.value}
              {total > 0 && (
                <span className={styles.donutLegendPct}>
                  {' '}({Math.round((s.value / total) * 100)}%)
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
