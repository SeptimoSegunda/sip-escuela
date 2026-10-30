'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHouse,
  faBook,
  faRepeat,
  faTriangleExclamation,
  faClipboardList,
} from '@fortawesome/free-solid-svg-icons';
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import styles from './Sidebar.module.css';

export type ViewId =
  | 'viewInicio'
  | 'viewCatalogo'
  | 'viewPrestamos'
  | 'viewDanos'
  | 'viewAuditoria';

interface NavItem {
  id: ViewId;
  label: string;
  icon: IconDefinition;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'viewInicio',     label: 'Inicio',               icon: faHouse },
  { id: 'viewCatalogo',   label: 'Catálogo',             icon: faBook },
  { id: 'viewPrestamos',  label: 'Préstamos',            icon: faRepeat },
  { id: 'viewDanos',      label: 'Registro de Daños',    icon: faTriangleExclamation },
  { id: 'viewAuditoria',  label: 'Bitácora',             icon: faClipboardList },
];

interface SidebarProps {
  activeView: ViewId;
  onNavigate: (view: ViewId) => void;
}

export default function Sidebar({ activeView, onNavigate }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          id={`nav-${item.id}`}
          className={`${styles.navButton} ${
            activeView === item.id ? styles.active : ''
          }`}
          onClick={() => onNavigate(item.id)}
          aria-current={activeView === item.id ? 'page' : undefined}
        >
          <FontAwesomeIcon icon={item.icon} />
          {item.label}
        </button>
      ))}
    </aside>
  );
}
