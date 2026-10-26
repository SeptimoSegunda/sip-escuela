'use client';

import { useState, useEffect } from 'react';
import type { Socio, TipoSocio } from '@/types';
import Modal from '@/components/ui/Modal';
import f from '@/components/ui/form.module.css';

interface ModalSocioProps {
  open: boolean;
  onClose: () => void;
  /** Si se pasa un socio existente, el modal actúa en modo edición */
  socioEditar?: Socio | null;
  onGuardar: (data: {
    apellido: string;
    nombre: string;
    tipo: Socio['tipo'];
    anio?: string;
    turno?: 'mañana' | 'tarde';
    email?: string;
  }) => void;
}

const TIPOS: { value: TipoSocio; label: string }[] = [
  { value: 'estudiante', label: 'Estudiante (Máx 1 libro)' },
  { value: 'docente',    label: 'Docente (Máx 3 libros)' },
  { value: 'otro',       label: 'Otro (Máx 1 libro)' },
];

const TURNOS: { value: 'mañana' | 'tarde'; label: string }[] = [
  { value: 'mañana', label: 'Mañana' },
  { value: 'tarde',  label: 'Tarde' },
];

const empty = { apellido: '', nombre: '', tipo: 'estudiante' as TipoSocio, anio: '', turno: undefined as 'mañana' | 'tarde' | undefined, email: '' };

export default function ModalSocio({ open, onClose, socioEditar, onGuardar }: ModalSocioProps) {
  const [form, setForm] = useState(empty);

  /* Rellenar con datos del socio al abrir en modo edición */
  useEffect(() => {
    if (open) {
      setForm(
        socioEditar
          ? { apellido: socioEditar.apellido, nombre: socioEditar.nombre, tipo: socioEditar.tipo, anio: socioEditar.anio ?? '', turno: socioEditar.turno, email: socioEditar.email ?? '' }
          : empty
      );
    }
  }, [open, socioEditar]);

  const set = (k: keyof typeof empty, v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGuardar({
      apellido: form.apellido.trim(),
      nombre:   form.nombre.trim(),
      tipo:     form.tipo,
      anio:     form.anio?.trim() || undefined,
      turno:    form.turno,
      email:    form.email?.trim() || undefined,
    });
    onClose();
  };

  const isEdit = !!socioEditar;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar Socio' : 'Registrar Nuevo Socio'}
      id="modalSocio"
    >
      <form id="formNuevoSocio" onSubmit={handleSubmit} autoComplete="off">
        <div className={f.formGrid}>
          <div className={f.formGroup}>
            <label htmlFor="inputSocioApellido" className={f.label}>Apellido *</label>
            <input id="inputSocioApellido" className={f.input} placeholder="Ej: Morales" required
              value={form.apellido} onChange={(e) => set('apellido', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="inputSocioNombre" className={f.label}>Nombre *</label>
            <input id="inputSocioNombre" className={f.input} placeholder="Ej: Valentina" required
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
            <label htmlFor="inputSocioAnio" className={f.labelOptional}>Año o Grado (Opcional)</label>
            <input id="inputSocioAnio" className={f.input} placeholder="Ej: 5° Año A"
              value={form.anio} onChange={(e) => set('anio', e.target.value)} />
          </div>

          <div className={f.formGroup}>
            <label htmlFor="selectSocioTurno" className={f.labelOptional}>Turno (Opcional)</label>
            <select id="selectSocioTurno" className={f.select}
              value={form.turno ?? ''} onChange={(e) => setForm((p) => ({ ...p, turno: (e.target.value as 'mañana' | 'tarde') || undefined }))}>
              <option value="">— Sin turno —</option>
              {TURNOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>

          <div className={f.formGroup}>
          <label htmlFor="inputSocioEmail" className={f.label}>Email *</label>
            <input id="inputSocioEmail" type="email" className={f.input} placeholder="Ej: valentina@email.com"
              required
              value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>
        </div>

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={f.btnSubmit}>
            {isEdit ? 'Guardar Cambios' : 'Registrar Socio'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
