'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUserShield,
  faSun,
  faMoon,
  faRightFromBracket,
} from '@fortawesome/free-solid-svg-icons';
import { cerrarSesion, type SesionAdmin } from '@/hooks/useAuth';
import styles from './DashboardHeader.module.css';

interface DashboardHeaderProps {
  sesion: SesionAdmin;
}

export default function DashboardHeader({ sesion }: DashboardHeaderProps) {
  const router = useRouter();
  const esMañana =
    sesion.turno === 'Turno Mañana';

  const handleLogout = () => {
    cerrarSesion();
    router.push('/login');
  };

  return (
    <header className={styles.dashboardHeader}>
      {/* Logo + texto */}
      <Link href="/dashboard" className={styles.logoContainer} id="logoHome">
        <Image
          src="/logo.png"
          alt="SIP Logo"
          width={48}
          height={48}
          className={styles.logoImg}
          priority
        />
        <div className={styles.logoTextGroup}>
          <span className={styles.logoText}>SIP</span>
          <span className={styles.logoSubtitle}>Sistema de Préstamos Escolares</span>
        </div>
      </Link>

      {/* Control de administrador */}
      <div className={styles.headerAdminControl}>
        <div className={styles.adminSelectorWrapper}>
          <span className={styles.adminSelectorLabel}>
            <FontAwesomeIcon icon={faUserShield} /> Administrador en Turno:
          </span>

          <div className={styles.adminPill} title="Turno actual de administración">
            <span
              className={`${styles.adminAvatar} ${
                esMañana ? styles.manana : styles.tarde
              }`}
            >
              <FontAwesomeIcon icon={esMañana ? faSun : faMoon} />
            </span>
            <div className={styles.adminInfo}>
              <span className={styles.adminName}>{sesion.turno}</span>
              <span className={styles.adminBadgeRole}>Sesión Activa</span>
            </div>
          </div>
        </div>

        <button
          id="btnAdminLogout"
          className={styles.btnAdminLogout}
          title="Cerrar sesión"
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faRightFromBracket} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </header>
  );
}
