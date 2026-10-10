import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styles from './MetricCard.module.css';

export type MetricVariant = 'salvia' | 'terracotta' | 'mustard' | 'catastrofico';

interface MetricCardProps {
  icon: IconDefinition;
  value: number | string;
  label: string;
  variant?: MetricVariant;
  id?: string;
}

export default function MetricCard({
  icon,
  value,
  label,
  variant = 'salvia',
  id,
}: MetricCardProps) {
  return (
    <div className={styles.metricCard}>
      <div className={`${styles.metricIcon} ${styles[`icon--${variant}`]}`}>
        <FontAwesomeIcon icon={icon} />
      </div>
      <div className={styles.metricData}>
        <h3 id={id}>{value}</h3>
        <p>{label}</p>
      </div>
    </div>
  );
}
