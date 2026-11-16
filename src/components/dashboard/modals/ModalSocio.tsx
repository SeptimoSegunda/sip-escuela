'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faEdit } from '@fortawesome/free-solid-svg-icons';
import type { Socio, TipoSocio } from '@/types';
import Modal from '@/components/ui/Modal';
import f from '@/components/ui/form.module.css';
import styles from './ModalSocio.module.css';

interface ModalSocioProps {
  open: boolean;
  onClose: () => void;
  socioEditar?: Socio | null;
  onGuardar: (data: {
    apellido: string;
    nombre: string;
    tipo: Socio['tipo'];
    dni: string;
    email?: string;
  }) => void;
}

const TIPOS: { value: TipoSocio; label: string }[] = [
  { value: 'estudiante', label: 'Estudiante (Máx 1 libro)' },
  { value: 'docente',    label: 'Docente (Máx 3 libros)' },
  { value: 'otro',       label: 'Otro (Máx 1 libro)' },
];

const empty = { apellido: '', nombre: '', tipo: 'estudiante' as TipoSocio, dni: '', email: '' };

function formatFecha(iso: string): string {
  try { return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

export default function ModalSocio({ open, onClose, socioEditar, onGuardar }: ModalSocioProps) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    if (open) {
      setForm(
        socioEditar
          ? { apellido: socioEditar.apellido, nombre: socioEditar.nombre, tipo: socioEditar.tipo, dni: socioEditar.dni ?? '', email: socioEditar.email ?? '' }
          : empty
      );
    }
  }, [open, socioEditar]);

  const set = (k: keyof typeof empty, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación del DNI: máximo 8 caracteres numéricos
    if (form.dni.length === 0) {
      // Mantener comportamiento existente - DNI requerido
    }
    if (form.dni.length > 8) {
      // Esto no debería ocurrir por la validación del input, pero por si acaso
      return;
    }

    onGuardar({
      apellido: form.apellido.trim(),
      nombre:   form.nombre.trim(),
      tipo:     form.tipo,
      dni:      form.dni.trim(),
      email:    form.email?.trim() ?? undefined,
    });
    onClose();
  };

  const isEdit = !!socioEditar;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Socio' : 'Registrar Nuevo Socio'} id="modalSocio" size="md">
      <form id="formNuevoSocio" onSubmit={handleSubmit} autoComplete="off">
        {/* ── Información del Socio ── */}
        <div className={f.formGrid}>
          <div className={f.formGroup}>
            <label htmlFor="inputSocioApellido" className={f.label}>Apellido *</label>
            <input id="inputSocioApellido" className={f.input} required
              value={form.apellido} onChange={(e) => set('apellido', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputSocioNombre" className={f.label}>Nombre *</label>
            <input id="inputSocioNombre" className={f.input} required
              value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="selectSocioTipo" className={f.label}>Tipo de Usuario *</label>
            <select id="selectSocioTipo" className={f.select} required
              value={form.tipo} onChange={(e) => set('tipo', e.target.value as Socio['tipo'])}>
              {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputSocioDni" className={f.label}>DNI *</label>
            <input id="inputSocioDni" className={f.input} required
              value={form.dni}
              onChange={(e) => {
                // Validación: solo números, máximo 8 caracteres
                const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                set('dni', value);
              }}
              maxLength={8}
              pattern="[0-9]{1,8}"
              title="Solo números, máximo 8 caracteres" />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputSocioEmail" className={f.labelOptional}>Email (Opcional)</label>
            <input id="inputSocioEmail" type="email" className={f.input}
              value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>

        {/* ── Fechas de auditoría (solo lectura) ── */}
        {isEdit && socioEditar && (
          <div className={styles.auditSection}>
            <h4 className={styles.auditTitle}>
              <FontAwesomeIcon icon={faCalendarDay} /> Fechas de Auditoría
            </h4>
            <div className={styles.auditItem}>
              <label>Fecha de creación:</label>
              <span className={styles.auditValue}>{formatFecha(socioEditar.fechaRegistro)}</span>
            </div>
            <div className={styles.auditItem}>
              <label>Última actualización:</label>
              <span className={styles.auditValue}>
                {socioEditar.fechaUltimaActualizacion ? formatFecha(socioEditar.fechaUltimaActualizacion) : '—'}
              </span>
            </div>
          </div>
        )}

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={f.btnSubmit}>
            {isEdit ? <><FontAwesomeIcon icon={faEdit} /> Guardar Cambios</> : 'Registrar Socio'}
          </button>
        </div>
      </form>
    </Modal>
  );
}