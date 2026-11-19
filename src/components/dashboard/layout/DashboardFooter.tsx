import styles from './DashboardFooter.module.css';

const YEAR = 2026;

export default function DashboardFooter() {
  return (
    <footer className={styles.dashboardFooter}>
      <div>
        <p>© {YEAR} Sistema SIP — Proyecto Escolar de Biblioteca</p>
      </div>
    </footer>
  );
}
