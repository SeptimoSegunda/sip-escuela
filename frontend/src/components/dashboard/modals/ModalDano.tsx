'use client';

import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import type { Libro, Socio, SeveridadDano } from '@/types';
import Modal from '@/components/ui/Modal';
import f from '@/components/ui/form.module.css';

interface ModalDanoProps {
  open: boolean;
  onClose: () => void;
  libros: Libro[];
  socios: Socio[];
  onRegistrar: (data: {
    libroId: string;
    libroTitulo: string;
    copiaId: string;
    socioId: string;
    socioNombre: string;
    severidad: SeveridadDano;
    descripcion: string;
    estadoPosterior: 'mantenimiento' | 'disponible';
  }) => void;
}

const NIVELES: { value: SeveridadDano; label: string }[] = [
  { value: 'leve',         label: '🟢 Daño leve (Hojas dobladas, marcas lápiz, desgaste menor)' },
  { value: 'moderado',     label: '🟠 Daño moderado (Manchas, birome, hojas sueltas)' },
  { value: 'catastrofico', label: '🔴 CATASTRÓFICO! (Páginas rotas, mojado, inutilizado)' },
];

export default function ModalDano({ open, onClose, libros, socios, onRegistrar }: ModalDanoProps) {
  const [libroQ,     setLibroQ]     = useState('');
  const [socioQ,     setSocioQ]     = useState('');
  const [libroSel,   setLibroSel]   = useState<Libro | null>(null);
  const [copiaSel,   setCopiaSel]   = useState('');
  const [socioSel,   setSocioSel]   = useState<Socio | null>(null);
  const [severidad,  setSeveridad]  = useState<SeveridadDano>('leve');
  const [descripcion, setDescripcion] = useState('');
  const [estadoPosterior, setEstadoPosterior] = useState<'mantenimiento' | 'disponible'>('mantenimiento');
  const [showLibros, setShowLibros] = useState(false);
  const [showSocios, setShowSocios] = useState(false);
  const [error,      setError]      = useState('');

  useEffect(() => {
    if (open) {
      setLibroQ(''); setSocioQ(''); setLibroSel(null);
      setCopiaSel(''); setSocioSel(null);
    setSeveridad('leve'); setDescripcion(''); setEstadoPosterior('mantenimiento');
      setShowLibros(false); setShowSocios(false); setError('');
    }
  }, [open]);

  /* Copias del libro seleccionado */
  const copias = useMemo(
    () => libroSel?.copias ?? [],
    [libroSel]
  );

  useEffect(() => {
    if (copias.length > 0) setCopiaSel(copias[0].id);
  }, [copias]);

  const sugerenciasLibro = useMemo(() => {
    if (!libroQ.trim()) return [];
    const q = libroQ.toLowerCase();
    return libros.filter((l) =>
      l.titulo.toLowerCase().includes(q) || l.isbn.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [libroQ, libros]);

  const sugerenciasSocio = useMemo(() => {
    if (!socioQ.trim()) return [];
    const q = socioQ.toLowerCase();
    return socios.filter((s) =>
      `${s.apellido} ${s.nombre} ${s.id}`.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [socioQ, socios]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!libroSel)         { setError('Selecciona un libro.'); return; }
    if (!copiaSel)         { setError('Selecciona una copia.'); return; }
    if (!socioSel)         { setError('Selecciona un socio responsable.'); return; }
    if (!descripcion.trim()) { setError('Describe el daño.'); return; }

    onRegistrar({
      libroId:     libroSel.id,
      libroTitulo: libroSel.titulo,
      copiaId:     copiaSel,
      socioId:     socioSel.id,
      socioNombre: `${socioSel.apellido}, ${socioSel.nombre}`,
      severidad,
      descripcion: descripcion.trim(),
      estadoPosterior,
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar Incidencia de Daño" id="modalNuevoDano">
      <form id="formNuevoDano" onSubmit={handleSubmit} autoComplete="off">
        {/* Libro afectado */}
        <div className={f.formGroup} style={{ position: 'relative', marginBottom: '1rem' }}>
          <label htmlFor="inputDanoLibro" className={f.label}>Libro Afectado *</label>
          <input
            id="inputDanoLibro"
            className={f.input}
            placeholder="Busca título de libro..."
            value={libroQ}
            onChange={(e) => { setLibroQ(e.target.value); setLibroSel(null); setShowLibros(true); }}
            onFocus={() => setShowLibros(true)}
            required
          />
          {showLibros && sugerenciasLibro.length > 0 && (
            <ul className={f.suggestionList}>
              {sugerenciasLibro.map((l) => (
                <li key={l.id} className={f.suggestionItem} onMouseDown={() => {
                  setLibroSel(l); setLibroQ(l.titulo); setShowLibros(false); setError('');
                }}>
                  <strong>{l.titulo}</strong>
                  <span className={f.suggestionSub}> — {l.autor}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Selector de copia */}
        {libroSel && copias.length > 0 && (
          <div className={f.formGroup} style={{ marginBottom: '1rem' }}>
            <label htmlFor="selectDanoCopia" className={f.label}>Ejemplar (Copia) *</label>
            <select id="selectDanoCopia" className={f.select}
              value={copiaSel} onChange={(e) => setCopiaSel(e.target.value)}>
              {copias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.inventarioNum} — {c.estado}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Socio responsable */}
        <div className={f.formGroup} style={{ position: 'relative', marginBottom: '1rem' }}>
          <label htmlFor="inputDanoSocio" className={f.label}>Usuario Responsable *</label>
          <input
            id="inputDanoSocio"
            className={f.input}
            placeholder="Busca socio por nombre o ID..."
            value={socioQ}
            onChange={(e) => { setSocioQ(e.target.value); setSocioSel(null); setShowSocios(true); }}
            onFocus={() => setShowSocios(true)}
            required
          />
          {showSocios && sugerenciasSocio.length > 0 && (
            <ul className={f.suggestionList}>
              {sugerenciasSocio.map((s) => (
                <li key={s.id} className={f.suggestionItem} onMouseDown={() => {
                  setSocioSel(s); setSocioQ(`${s.apellido}, ${s.nombre}`); setShowSocios(false); setError('');
                }}>
                  <strong>{s.apellido}, {s.nombre}</strong>
                  <span className={f.suggestionSub}> — ID: {s.id}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Nivel de daño */}
        <div className={f.formGroup} style={{ marginBottom: '1rem' }}>
          <label htmlFor="selectNivelDanoDirecto" className={f.label}>Nivel de Daño *</label>
          <select id="selectNivelDanoDirecto" className={f.select} required
            value={severidad} onChange={(e) => setSeveridad(e.target.value as SeveridadDano)}>
            {NIVELES.map((n) => <option key={n.value} value={n.value}>{n.label}</option>)}
          </select>
        </div>

        {/* Descripción */}
        <div className={f.formGroup} style={{ marginBottom: '0.5rem' }}>
          <label htmlFor="inputDescripcionDanoDirecto" className={f.label}>
            Descripción del Daño *
          </label>
          <textarea id="inputDescripcionDanoDirecto" className={f.textarea} rows={2}
            placeholder="Especifica qué daño tiene el ejemplar..."
            value={descripcion} required
            onChange={(e) => { setDescripcion(e.target.value); setError(''); }}
          />
        </div>

        {/* Estado posterior del ejemplar */}
        <div className={f.formGroup} style={{ marginBottom: '1rem' }}>
          <label htmlFor="selectAccionCopiaDirecto" className={f.label}>
            Estado Posterior del Ejemplar
          </label>
          <select
            id="selectAccionCopiaDirecto"
            className={f.select}
            value={estadoPosterior}
            onChange={(e) => setEstadoPosterior(e.target.value as 'mantenimiento' | 'disponible')}
          >
            <option value="mantenimiento">Pasar a &quot;En Mantenimiento&quot;</option>
            <option value="disponible">Mantener como &quot;Disponible&quot;</option>
          </select>
        </div>

        {error && <p className={f.errorMsg}>{error}</p>}

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={`${f.btnSubmit} ${f.btnSubmitDanger}`}>
            <FontAwesomeIcon icon={faTriangleExclamation} /> Registrar Daño
          </button>
        </div>
      </form>
    </Modal>
  );
}
