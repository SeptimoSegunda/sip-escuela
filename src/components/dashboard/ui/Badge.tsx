import styles from './Badge.module.css';

export type BadgeVariant =
  | 'available'   // azul — disponible
  | 'borrowed'    // violeta — prestado
  | 'low'         // rojo suave — stock bajo / vencido
  | 'warning'     // amarillo — por vencer
  | 'neutral';    // gris — sin estado especial

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
}

export default function Badge({ children, variant = 'neutral' }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      {children}
    </span>
  );
}
