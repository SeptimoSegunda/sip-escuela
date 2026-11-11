'use client';

import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faBarcode } from '@fortawesome/free-solid-svg-icons';
import type { Libro, Socio } from '@/types';
import Modal from '@/components/ui/Modal';
import f from '@/components/ui/form.module.css';

interface ModalPrestamoProps {
  open: boolean;
  onClose: () => void;
  libros: Libro[];
  socios: Socio[];
  onRegistrar: (libroId: string, copiaId: string | null, prestatario: string, socioId?: string) => void;
}

type SearchMode = 'titulo' | 'inventario';

export default function ModalPrestamo({ open, onClose, libros, socios, onRegistrar }: ModalPrestamoProps) {
  const [mode,          setMode]          = useState<SearchMode>('titulo');
  const [libroQ,        setLibroQ]        = useState('');
  const [socioQ,        setSocioQ]        = useState('');
  const [libroSel,      setLibroSel]      = useState<Libro | null>(null);
  const [socioSel,      setSocioSel]      = useState<Socio | null>(null);
  const [copiaSel,      setCopiaSel]      = useState<string | null>(null);
  const [showLibros,    setShowLibros]    = useState(false);
  const [showSocios,    setShowSocios]    = useState(false);
  const [error,         setError]         = useState('');

  useEffect(() => {
    if (open) {
      setMode('titulo'); setLibroQ(''); setSocioQ('');
      setLibroSel(null); setSocioSel(null); setCopiaSel(null);
      setShowLibros(false); setShowSocios(false); setError('');
    }
  }, [open]);

  /* ── Libros disponibles ── */
  const librosDisp = useMemo(() => libros.filter((l) =>
    l.copias.some((c) => c.estado === 'disponible')
  ), [libros]);

  const sugerenciasLibro = useMemo(() => {
    if (!libroQ.trim()) return [];
    const q = libroQ.toLowerCase();
    if (mode === 'titulo') return librosDisp.filter((l) =>
      l.titulo.toLowerCase().includes(q) || l.isbn.toLowerCase().includes(q)
    ).slice(0, 8);
    return librosDisp.filter((l) =>
      l.copias.some((c) => c.inventarioNum.toLowerCase().includes(q) && c.estado === 'disponible')
    ).slice(0, 8);
  }, [libroQ, librosDisp, mode]);

  /* ── Socios activos como sugerencias ── */
  const sociosActivos = useMemo(() => socios.filter((s) => s.estado === 'activo'), [socios]);

  const sugerenciasSocio = useMemo(() => {
    if (!socioQ.trim()) return [];
    const q = socioQ.toLowerCase();
    return sociosActivos.filter((s) =>
      s.apellido.toLowerCase().includes(q) ||
      s.nombre.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [socioQ, sociosActivos]);

  const seleccionarLibro = (libro: Libro, copiaId?: string) => {
    setLibroSel(libro);
    setCopiaSel(copiaId ?? null);
    setLibroQ(mode === 'titulo' ? libro.titulo : (copiaId ? libro.copias.find(c => c.id === copiaId)?.inventarioNum ?? '' : libro.titulo));
    setShowLibros(false);
    setError('');
  };

  const seleccionarSocio = (socio: Socio) => {
    setSocioSel(socio);
    setSocioQ(`${socio.apellido}, ${socio.nombre}`);
    setShowSocios(false);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!libroSel)         { setError('Selecciona un libro disponible.'); return; }
    if (!socioSel)         { setError('Selecciona un socio registrado activo.'); return; }
    onRegistrar(libroSel.id, copiaSel, `${socioSel.apellido}, ${socioSel.nombre}`, socioSel.id);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Registrar Nuevo Préstamo" id="modalPrestamo">
      <form id="formNuevoPrestamo" onSubmit={handleSubmit} autoComplete="off">

        {/* Selector de modo */}
        <div style={{ marginBottom: '0.75rem' }}>
          <label className={f.label} style={{ marginBottom: '0.4rem', display: 'block' }}>
            Buscar ejemplar por
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['titulo', 'inventario'] as SearchMode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => { setMode(m); setLibroQ(''); setLibroSel(null); setCopiaSel(null); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.4rem',
                  border: '1.5px solid',
                  borderColor: mode === m ? 'var(--accent-brown)' : 'var(--beige-dark)',
                  background: mode === m ? 'var(--beige-anchor)' : 'var(--bg-base)',
                  color: mode === m ? 'var(--accent-brown)' : 'var(--text-muted)',
                  borderRadius: '20px', padding: '0.4rem 0.9rem',
                  fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                }}
              >
                <FontAwesomeIcon icon={m === 'titulo' ? faBook : faBarcode} />
                {m === 'titulo' ? 'Título' : 'Número de inventario'}
              </button>
            ))}
          </div>
        </div>

        {/* Campo libro con autocomplete */}
        <div className={f.formGroup} style={{ position: 'relative', marginBottom: '1rem' }}>
          <label htmlFor="inputLibro" className={f.label}>
            {mode === 'titulo' ? 'Título del Libro *' : 'Número de Inventario *'}
          </label>
          <input
            id="inputLibro"
            className={f.input}
            value={libroQ}
            onChange={(e) => { setLibroQ(e.target.value); setLibroSel(null); setShowLibros(true); }}
            onFocus={() => setShowLibros(true)}
            required
          />
          {showLibros && sugerenciasLibro.length > 0 && (
            <ul className={f.suggestionList}>
              {sugerenciasLibro.map((l) => {
                if (mode === 'inventario') {
                  return l.copias
                    .filter((c) => c.estado === 'disponible' && c.inventarioNum.toLowerCase().includes(libroQ.toLowerCase()))
                    .map((c) => (
                      <li key={c.id} className={f.suggestionItem} onMouseDown={() => seleccionarLibro(l, c.id)}>
                        <strong>{c.inventarioNum}</strong>
                        <span className={f.suggestionSub}> — {l.titulo}</span>
                      </li>
                    ));
                }
                return (
                  <li key={l.id} className={f.suggestionItem} onMouseDown={() => seleccionarLibro(l)}>
                    <strong>{l.titulo}</strong>
                    <span className={f.suggestionSub}> — ISBN: {l.isbn}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Campo prestatario — solo socios registrados */}
        <div className={f.formGroup} style={{ position: 'relative', marginBottom: '1rem' }}>
          <label htmlFor="inputPrestatario" className={f.label}>
            Prestatario (Socio Registrado) *
          </label>
          <input
            id="inputPrestatario"
            className={f.input}
            value={socioQ}
            onChange={(e) => { setSocioQ(e.target.value); setSocioSel(null); setShowSocios(true); setError(''); }}
            onFocus={() => setShowSocios(true)}
            required
          />
          {showSocios && sugerenciasSocio.length > 0 && (
            <ul className={f.suggestionList}>
              {sugerenciasSocio.map((s) => (
                <li key={s.id} className={f.suggestionItem} onMouseDown={() => seleccionarSocio(s)}>
                  <strong>{s.apellido}, {s.nombre}</strong>
                  <span className={f.suggestionSub}> — {s.id} · {s.tipo}{s.anio ? ` ${s.anio}` : ''}</span>
                </li>
              ))}
            </ul>
          )}
          {showSocios && socioQ.trim().length > 0 && sugerenciasSocio.length === 0 && (
            <ul className={f.suggestionList}>
              <li className={f.suggestionItem} style={{ color: 'var(--text-muted)', cursor: 'default' }}>
                Sin socios activos que coincidan
              </li>
            </ul>
          )}
        </div>

        {error && <p className={f.errorMsg}>{error}</p>}

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={f.btnSubmit}>Registrar Préstamo</button>
        </div>
      </form>
    </Modal>
  );
}
