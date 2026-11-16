'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faEdit } from '@fortawesome/free-solid-svg-icons';
import type { Editorial, NuevoEditorialData } from '@/types';
import Modal from '@/components/ui/Modal';
import f from '@/components/ui/form.module.css';

interface ModalEditorialProps {
  open: boolean;
  onClose: () => void;
  editorialEditar?: Editorial | null;
  onGuardar: (data: NuevoEditorialData) => void;
}

const empty: NuevoEditorialData = { nombre: '' };

function formatFecha(iso: string): string {
  try { return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return iso; }
}

export default function ModalEditorial({ open, onClose, editorialEditar, onGuardar }: ModalEditorialProps) {
  const [form, setForm] = useState<NuevoEditorialData>(empty);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setForm(
        editorialEditar
          ? { nombre: editorialEditar.nombre }
          : empty
      );
      setError('');
    }
  }, [open, editorialEditar]);

  const set = (k: keyof NuevoEditorialData, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim()) { setError('El nombre de la editorial es requerido.'); return; }

    onGuardar({
      nombre: form.nombre.trim(),
    });
    onClose();
  };

  const isEdit = !!editorialEditar;

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Editar Editorial' : 'Registrar Nueva Editorial'} id="modalEditorial" size="md">
      <form id="formNuevaEditorial" onSubmit={handleSubmit} autoComplete="off">
        {/* ── Información de la Editorial ── */}
        <div className={f.formGroup}>
          <label htmlFor="inputEditorialNombre" className={f.label}>Nombre de la Editorial *</label>
          <input id="inputEditorialNombre" className={f.input} required
            value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
        </div>

        {/* ── Fechas de auditoría (solo lectura) ── */}
        {isEdit && editorialEditar && (
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: 'var(--bg-surface)', borderRadius: '8px' }}>
            <strong style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Fecha de registro: </strong>
            <span style={{ color: 'var(--text-main)' }}>{formatFecha(editorialEditar.fechaRegistro)}</span>
            {editorialEditar.fechaUltimaActualizacion && (
              <span style={{ marginLeft: '0.5rem' }}>• Última actualización: {formatFecha(editorialEditar.fechaUltimaActualizacion)}</span>
            )}
          </div>
        )}

        {error && <p className={f.errorMsg}>{error}</p>}

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={f.btnSubmit}>
            {isEdit ? <><FontAwesomeIcon icon={faEdit} /> Guardar Cambios</> : 'Registrar Editorial'}
          </button>
        </div>
      </form>
    </Modal>
  );
}