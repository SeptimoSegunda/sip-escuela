import styles from './DashboardFooter.module.css';

const VERSION = '0.5.0';
const YEAR = 2026;

export default function DashboardFooter() {
  return (
    <footer className={styles.dashboardFooter}>
      <div>
        <p>© {YEAR} Sistema SIP — Proyecto Escolar de Biblioteca</p>
      </div>
      <div className={styles.footerLinks}>
        <span className={styles.version}>Versión {VERSION}</span>
      </div>
    </footer>
  );
}
