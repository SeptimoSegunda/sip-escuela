'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faEdit, faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import type { Autor, NuevoAutorData } from '@/types';
import Modal from '@/components/ui/Modal';
import f from '@/components/ui/form.module.css';
import styles from './ModalSocio.module.css';

interface ModalAutorProps {
  open: boolean;
  onClose: () => void;
  autorEditar?: Autor | null;
  onGuardar: (data: NuevoAutorData) => void;
}

const empty: NuevoAutorData = { apellido: '', nombre: '' };

function formatFecha(iso: string): string {
  try { return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

export default function ModalAutor({ open, onClose, autorEditar, onGuardar }: ModalAutorProps) {
  const [form, setForm] = useState<NuevoAutorData>(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(
        autorEditar
          ? { apellido: autorEditar.apellido, nombre: autorEditar.nombre }
          : empty
      );
      setError('');
    }
  }, [open, autorEditar]);

  const set = (k: keyof NuevoAutorData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.apellido.trim()) { setError('El apellido es requerido.'); return; }
    if (!form.nombre.trim()) { setError('El nombre es requerido.'); return; }

    onGuardar({
      apellido: form.apellido.trim(),
      nombre:   form.nombre.trim(),
    });
    onClose();
  };

  const isEdit = !!autorEditar;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Autor' : 'Registrar Nuevo Autor'} id="modalAutor" size="md">
      <form id="formNuevoAutor" onSubmit={handleSubmit} autoComplete="off">
        {/* ── Información del Autor ── */}
        <div className={f.formGrid}>
          <div className={f.formGroup}>
            <label htmlFor="inputAutorApellido" className={f.label}>Apellido *</label>
            <input id="inputAutorApellido" className={f.input} required
              value={form.apellido} onChange={(e) => set('apellido', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputAutorNombre" className={f.label}>Nombre *</label>
            <input id="inputAutorNombre" className={f.input} required
              value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          </div>
        </div>

        {/* ── Fechas de auditoría (solo lectura) ── */}
        {isEdit && autorEditar && (
          <div className={styles.auditSection}>
            <h4 className={styles.auditTitle}>
              <FontAwesomeIcon icon={faCalendarDay} /> Fechas de Auditoría
            </h4>
            <div className={styles.auditItem}>
              <label>Fecha de registro:</label>
              <span className={styles.auditValue}>{formatFecha(autorEditar.fechaRegistro)}</span>
            </div>
            <div className={styles.auditItem}>
              <label>Última actualización:</label>
              <span className={styles.auditValue}>
                {autorEditar.fechaUltimaActualizacion ? formatFecha(autorEditar.fechaUltimaActualizacion) : '—'}
              </span>
            </div>
          </div>
        )}

        {error && <p className={f.errorMsg}>{error}</p>}

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={f.btnSubmit}>
            {isEdit ? <><FontAwesomeIcon icon={faEdit} /> Guardar Cambios</> : 'Registrar Autor'}
          </button>
        </div>
      </form>
    </Modal>
  );
}