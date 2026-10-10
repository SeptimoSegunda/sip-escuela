'use client';

import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import type { Prestamo, SeveridadDano } from '@/types';
import Modal from '@/components/ui/Modal';
import f from '@/components/ui/form.module.css';

interface ModalDevolucionProps {
  open: boolean;
  onClose: () => void;
  prestamosActivos: Prestamo[];
  onConfirmar: (prestamoId: string, dano?: { severidad: SeveridadDano; descripcion: string; estadoPosterior: 'mantenimiento' | 'disponible' }) => void;
}

const NIVELES: { value: SeveridadDano; label: string }[] = [
  { value: 'leve',         label: '🟢 Daño leve (Hojas dobladas, marcas de lápiz, desgaste menor)' },
  { value: 'moderado',     label: '🟠 Daño moderado (Manchas, subrayado en tinta, hojas sueltas, lomo resentido)' },
  { value: 'catastrofico', label: '🔴 CATASTRÓFICO! (Páginas rotas o arrancadas, mojado, pérdida total)' },
];

export default function ModalDevolucion({ open, onClose, prestamosActivos, onConfirmar }: ModalDevolucionProps) {
  const [prestamoId, setPrestamoId]   = useState('');
  const [conDano,    setConDano]      = useState(false);
  const [severidad,  setSeveridad]    = useState<SeveridadDano>('leve');
  const [descripcion, setDescripcion] = useState('');
  const [estadoPosterior, setEstadoPosterior] = useState<'mantenimiento' | 'disponible'>('mantenimiento');
  const [error, setError]             = useState('');

  useEffect(() => {
    if (open) {
      setPrestamoId(prestamosActivos[0]?.id ?? '');
      setConDano(false);
      setSeveridad('leve');
      setDescripcion('');
      setEstadoPosterior('mantenimiento');
      setError('');
    }
  }, [open, prestamosActivos]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prestamoId) { setError('Selecciona un préstamo.'); return; }
    if (conDano && !descripcion.trim()) { setError('Describe el daño antes de confirmar.'); return; }

    onConfirmar(
      prestamoId,
      conDano ? { severidad, descripcion: descripcion.trim(), estadoPosterior } : undefined
    );
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar Devolución de Libro" id="modalDevolucion">
      <form id="formDevolucion" onSubmit={handleSubmit}>
        {prestamosActivos.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem 0' }}>
            No hay préstamos activos pendientes de devolución.
          </p>
        ) : (
          <>
            <div className={f.formGroup} style={{ marginBottom: '1rem' }}>
              <label htmlFor="selectLibroDevolucion" className={f.label}>
                Selecciona el libro a devolver
              </label>
              <select
                id="selectLibroDevolucion"
                className={f.select}
                required
                value={prestamoId}
                onChange={(e) => { setPrestamoId(e.target.value); setError(''); }}
              >
                {prestamosActivos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.libroTitulo} — [{p.socioNombre}] ({p.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Caja de daño */}
            <div className={f.damageBox}>
              <label className={f.damageCheckLabel}>
                <input
                  type="checkbox"
                  id="checkDevolucionDano"
                  checked={conDano}
                  onChange={(e) => { setConDano(e.target.checked); setError(''); }}
                  style={{ width: 16, height: 16 }}
                />
                <span>
                  <FontAwesomeIcon icon={faTriangleExclamation} /> ¿El ejemplar presenta algún daño físico?
                </span>
              </label>

              {conDano && (
                <div className={f.damagePanel}>
                  <div className={f.formGroup}>
                    <label htmlFor="selectNivelDanoDevolucion" className={f.label}>
                      Nivel de Daño *
                    </label>
                    <select
                      id="selectNivelDanoDevolucion"
                      className={f.select}
                      value={severidad}
                      onChange={(e) => setSeveridad(e.target.value as SeveridadDano)}
                    >
                      {NIVELES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
                    </select>
                  </div>

                  <div className={f.formGroup}>
                    <label htmlFor="inputDescripcionDanoDevolucion" className={f.label}>
                      Descripción del Daño *
                    </label>
                    <textarea
                      id="inputDescripcionDanoDevolucion"
                      className={f.textarea}
                      rows={2}
                      placeholder="Ej: Presenta 4 hojas rotas con tinta y mancha en la contratapa"
                      value={descripcion}
                      onChange={(e) => { setDescripcion(e.target.value); setError(''); }}
                    />
                  </div>

                  <div className={f.formGroup}>
                    <label htmlFor="selectAccionCopiaDevolucion" className={f.label}>
                      Estado Posterior del Ejemplar
                    </label>
                    <select
                      id="selectAccionCopiaDevolucion"
                      className={f.select}
                      value={estadoPosterior}
                      onChange={(e) => setEstadoPosterior(e.target.value as 'mantenimiento' | 'disponible')}
                    >
                      <option value="disponible">Mantener Disponible (Apto para lectura)</option>
                      <option value="mantenimiento">Pasar a &quot;En Mantenimiento&quot; (Requiere restauración)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {error && <p className={f.errorMsg}>{error}</p>}

            <div className={f.actions}>
              <button type="button" className={f.btnCancel} onClick={onClose}>Cancelar</button>
              <button type="submit" className={f.btnSubmit}>Confirmar Devolución</button>
            </div>
          </>
        )}
      </form>
    </Modal>
  );
}
