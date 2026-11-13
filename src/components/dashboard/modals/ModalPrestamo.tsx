'use client';

import { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBook, faBarcode, faTriangleExclamation, faCircleExclamation } from '@fortawesome/free-solid-svg-icons';
import type { Libro, Socio, Prestamo } from '@/types';
import { LIMITES_PRESTAMOS } from '@/types';
import Modal from '@/components/ui/Modal';
import f from '@/components/ui/form.module.css';

interface ModalPrestamoProps {
  open: boolean;
  onClose: () => void;
  libros: Libro[];
  socios: Socio[];
  prestamos: Prestamo[];
  onRegistrar: (libroId: string, copiaId: string | null, prestatario: string, socioId?: string, diasDevolucion?: number) => void;
}

type SearchMode = 'titulo' | 'inventario';

export default function ModalPrestamo({ open, onClose, libros, socios, prestamos, onRegistrar }: ModalPrestamoProps) {
  const [mode,          setMode]          = useState<SearchMode>('titulo');
  const [libroQ,        setLibroQ]        = useState('');
  const [socioQ,        setSocioQ]        = useState('');
  const [libroSel,      setLibroSel]      = useState<Libro | null>(null);
  const [socioSel,      setSocioSel]      = useState<Socio | null>(null);
  const [copiaSel,      setCopiaSel]      = useState<string | null>(null);
  const [showLibros,    setShowLibros]    = useState(false);
  const [showSocios,    setShowSocios]    = useState(false);
  const [dias,          setDias]          = useState(7);
  const [error,         setError]         = useState('');
  const [bloqueoAlerta, setBloqueoAlerta] = useState<{
    socio: Socio;
    activos: number;
    limite: number;
  } | null>(null);

  useEffect(() => {
    if (open) {
      setMode('titulo'); setLibroQ(''); setSocioQ('');
      setLibroSel(null); setSocioSel(null); setCopiaSel(null);
      setShowLibros(false); setShowSocios(false); setDias(7); setError('');
      setBloqueoAlerta(null);
    }
  }, [open]);

  /* ── Mapa de préstamos activos por socio ── */
  const prestamosActivosPorSocio = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const p of prestamos) {
      if ((p.estado === 'prestado' || p.estado === 'moroso') && p.socioId) {
        mapa[p.socioId] = (mapa[p.socioId] ?? 0) + 1;
      }
    }
    return mapa;
  }, [prestamos]);

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
      s.id.toLowerCase().includes(q) ||
      s.dni.toLowerCase().includes(q)
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
    const activos = prestamosActivosPorSocio[socio.id] ?? 0;
    const limite = LIMITES_PRESTAMOS[socio.tipo] ?? 1;

    if (activos >= limite) {
      setBloqueoAlerta({ socio, activos, limite });
      setShowSocios(false);
      setSocioSel(null);
      setSocioQ('');
      setError(`No se puede otorgar el préstamo: ${socio.apellido}, ${socio.nombre} ya tiene ${activos} de ${limite} préstamo(s) activos permitidos.`);
      return;
    }

    setSocioSel(socio);
    setSocioQ(`${socio.apellido}, ${socio.nombre}`);
    setShowSocios(false);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!libroSel)         { setError('Selecciona un libro disponible.'); return; }
    if (!socioSel)         { setError('Selecciona un socio registrado activo.'); return; }
    
    // Doble validación en submit por seguridad
    const activos = prestamosActivosPorSocio[socioSel.id] ?? 0;
    const limite = LIMITES_PRESTAMOS[socioSel.tipo] ?? 1;
    if (activos >= limite) {
      setBloqueoAlerta({ socio: socioSel, activos, limite });
      setError(`Límite alcanzado: el socio ya posee ${activos} de ${limite} préstamos permitidos.`);
      return;
    }

    if (!dias || dias < 1) { setError('El plazo de devolución debe ser al menos 1 día.'); return; }
    onRegistrar(libroSel.id, copiaSel, `${socioSel.apellido}, ${socioSel.nombre}`, socioSel.id, dias);
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
              {sugerenciasSocio.map((s) => {
                const activos = prestamosActivosPorSocio[s.id] ?? 0;
                const limite = LIMITES_PRESTAMOS[s.tipo] ?? 1;
                const lleno = activos >= limite;

                return (
                  <li
                    key={s.id}
                    className={f.suggestionItem}
                    onMouseDown={() => seleccionarSocio(s)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backgroundColor: lleno ? '#fef2f2' : undefined,
                    }}
                  >
                    <div>
                      <strong style={{ color: lleno ? '#991b1b' : undefined }}>{s.apellido}, {s.nombre}</strong>
                      <span className={f.suggestionSub}> — {s.id} · {s.tipo}{s.anio ? ` ${s.anio}` : ''}</span>
                    </div>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '12px',
                        backgroundColor: lleno ? '#fee2e2' : '#e0f2fe',
                        color: lleno ? '#b91c1c' : '#0369a1',
                      }}
                    >
                      {lleno ? `Cupo lleno (${activos}/${limite})` : `${activos}/${limite} libros`}
                    </span>
                  </li>
                );
              })}
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

        {/* Plazo de devolución */}
        <div className={f.formGroup} style={{ marginBottom: '1rem' }}>
          <label htmlFor="inputDiasPrestamo" className={f.label}>
            Plazo de devolución (días) *
          </label>
          <input
            id="inputDiasPrestamo"
            type="number"
            min={1}
            max={365}
            className={f.input}
            value={dias}
            onChange={(e) => setDias(Math.max(1, parseInt(e.target.value) || 1))}
            style={{ width: '120px' }}
          />
          <p style={{ margin: '0.3rem 0 0', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            El préstamo pasará a moroso al superar este plazo.
          </p>
        </div>

        {error && <p className={f.errorMsg}>{error}</p>}

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="submit" className={f.btnSubmit}>Registrar Préstamo</button>
        </div>
      </form>

      {/* Popup / Alerta Emergente de Cupo Máximo */}
      {bloqueoAlerta && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setBloqueoAlerta(null);
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '450px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
              textAlign: 'center',
              borderTop: '5px solid #dc2626',
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                margin: '0 auto 1rem',
              }}
            >
              <FontAwesomeIcon icon={faTriangleExclamation} />
            </div>

            <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', color: '#111827', fontWeight: 700 }}>
              Límite de Préstamos Alcanzado
            </h3>

            <p style={{ margin: '0 0 1rem', fontSize: '0.92rem', color: '#4b5563', lineHeight: '1.5' }}>
              El socio <strong>{bloqueoAlerta.socio.apellido}, {bloqueoAlerta.socio.nombre}</strong> (categoría <em>{bloqueoAlerta.socio.tipo}</em>) ya tiene <strong>{bloqueoAlerta.activos}</strong> de <strong>{bloqueoAlerta.limite}</strong> préstamo(s) activos permitidos.
            </p>

            <div
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '0.75rem 0.9rem',
                fontSize: '0.84rem',
                color: '#991b1b',
                marginBottom: '1.25rem',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                lineHeight: '1.4',
              }}
            >
              <FontAwesomeIcon icon={faCircleExclamation} style={{ marginTop: '2px', flexShrink: 0 }} />
              <span>
                Para solicitar un nuevo ejemplar, este socio debe devolver primero los libros que tiene actualmente en préstamo.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setBloqueoAlerta(null)}
              style={{
                background: 'var(--accent-brown, #5c2d16)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1.25rem',
                fontSize: '0.92rem',
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
                transition: 'opacity 0.15s ease',
              }}
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
