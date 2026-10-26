'use client';

import { useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  size?: 'md' | 'lg';
  children: React.ReactNode;
  id?: string;
}

export default function Modal({ open, onClose, title, size = 'lg', children, id }: ModalProps) {
  /* Cerrar con Escape */
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  /* Bloquear scroll del body */
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      id={id}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`${styles.card} ${size === 'lg' ? styles.cardLg : styles.cardMd}`}>
        <div className={styles.header}>
          <h2 id={`${id}-title`} className={styles.title}>{title}</h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar modal"
            type="button"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
}
