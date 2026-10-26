'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faEraser } from '@fortawesome/free-solid-svg-icons';
import type { Libro } from '@/types';
import Modal from '@/components/ui/Modal';
import f from '@/components/ui/form.module.css';
import styles from './ModalBusquedaAsistida.module.css';

interface ModalBusquedaAsistidaProps {
  open: boolean;
  onClose: () => void;
  libros: Libro[];
  onResultados: (resultados: Libro[]) => void;
}

type Operador = 'OR' | 'AND' | 'NOT';
type Campo =
  | 'nombre'
  | 'titulo'
  | 'tema'
  | 'inventario'
  | 'isbn'
  | 'categoria'
  | 'cualquiera';

const CAMPOS: { value: Campo; label: string }[] = [
  { value: 'nombre',     label: 'Nombre / autor' },
  { value: 'titulo',     label: 'Título' },
  { value: 'tema',       label: 'Tema / categoría' },
  { value: 'inventario', label: 'Inventario' },
  { value: 'isbn',       label: 'ISBN' },
  { value: 'categoria',  label: 'Categoría' },
  { value: 'cualquiera', label: 'Cualquier campo' },
];

interface Fila {
  operador: Operador;
  campo: Campo;
  query: string;
}

const emptyFila = (op: Operador): Fila => ({ operador: op, campo: 'cualquiera', query: '' });

const defaultFilas: Fila[] = [
  { operador: 'OR',  campo: 'nombre',    query: '' },
  { operador: 'OR',  campo: 'titulo',    query: '' },
  { operador: 'NOT', campo: 'tema',      query: '' },
  { operador: 'AND', campo: 'inventario',query: '' },
];

function matchCampo(libro: Libro, campo: Campo, q: string): boolean {
  const lq = q.toLowerCase();
  switch (campo) {
    case 'nombre':    return libro.autor.toLowerCase().includes(lq);
    case 'titulo':    return libro.titulo.toLowerCase().includes(lq);
    case 'tema':      return libro.categoria.toLowerCase().includes(lq);
    case 'inventario':return libro.copias.some((c) => c.inventarioNum.toLowerCase().includes(lq));
    case 'isbn':      return libro.isbn.toLowerCase().includes(lq);
    case 'categoria': return libro.categoria.toLowerCase().includes(lq);
    case 'cualquiera':
      return `${libro.titulo} ${libro.autor} ${libro.isbn} ${libro.categoria} ${libro.ubicacion}`
        .toLowerCase().includes(lq);
  }
}

function aplicarFilas(libros: Libro[], filas: Fila[], truncar: boolean): Libro[] {
  const filaActivas = filas.filter((f) => f.query.trim() !== '');
  if (filaActivas.length === 0) return libros;

  return libros.filter((libro) => {
    let resultado: boolean | null = null;

    for (const fila of filaActivas) {
      const q = truncar ? fila.query.trim() : fila.query.trim();
      const match = matchCampo(libro, fila.campo, q);

      if (resultado === null) {
        resultado = match;
      } else {
        switch (fila.operador) {
          case 'OR':  resultado = resultado || match;  break;
          case 'AND': resultado = resultado && match;  break;
          case 'NOT': resultado = resultado && !match; break;
        }
      }
    }
    return resultado ?? true;
  });
}

export default function ModalBusquedaAsistida({
  open, onClose, libros, onResultados,
}: ModalBusquedaAsistidaProps) {
  const [filas,   setFilas]   = useState<Fila[]>(defaultFilas);
  const [truncar, setTruncar] = useState(true);

  const setFila = (i: number, campo: Partial<Fila>) =>
    setFilas((prev) => prev.map((f, idx) => idx === i ? { ...f, ...campo } : f));

  const handleLimpiar = () => setFilas(defaultFilas.map((f) => ({ ...f, query: '' })));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const resultados = aplicarFilas(libros, filas, truncar);
    onResultados(resultados);
    onClose();
  };

  const OPERADORES: Operador[] = ['OR', 'AND', 'NOT'];

  return (
    <Modal open={open} onClose={onClose} title="Búsqueda asistida" id="modalBusquedaAsistida" size="md">
      <form id="formBusquedaAsistida" onSubmit={handleSubmit}>

        {/* Opciones superiores */}
        <div className={styles.topRow}>
          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              checked={truncar}
              onChange={(e) => setTruncar(e.target.checked)}
            />
            Truncar términos
          </label>
          <span className={styles.helpText}>Combina hasta cuatro criterios del catálogo</span>
        </div>

        {/* Filas de búsqueda */}
        <div className={styles.filasWrapper}>
          {filas.map((fila, i) => (
            <div key={i} className={styles.fila}>
              {/* Operador (primera fila: placeholder vacío) */}
              {i === 0 ? (
                <div className={styles.opPlaceholder} />
              ) : (
                <div className={styles.opGroup}>
                  {OPERADORES.map((op) => (
                    <button
                      key={op}
                      type="button"
                      className={`${styles.opBtn} ${fila.operador === op ? styles.opBtnActive : ''}`}
                      onClick={() => setFila(i, { operador: op })}
                    >
                      {op}
                    </button>
                  ))}
                </div>
              )}

              {/* Campo */}
              <select
                className={`${f.select} ${styles.fieldSelect}`}
                value={fila.campo}
                onChange={(e) => setFila(i, { campo: e.target.value as Campo })}
                id={`asistidaField${i + 1}`}
              >
                {CAMPOS.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>

              {/* Query */}
              <input
                type="text"
                className={`${f.input} ${styles.queryInput}`}
                placeholder="Escribí un término..."
                value={fila.query}
                onChange={(e) => setFila(i, { query: e.target.value })}
                id={`asistidaQuery${i + 1}`}
              />
            </div>
          ))}
        </div>

        <div className={f.actions}>
          <button type="button" className={f.btnCancel} onClick={onClose}>Cancelar</button>
          <button type="button" className={f.btnCancel} onClick={handleLimpiar}>
            <FontAwesomeIcon icon={faEraser} /> Limpiar
          </button>
          <button type="submit" className={f.btnSubmit}>
            <FontAwesomeIcon icon={faMagnifyingGlass} /> Buscar
          </button>
        </div>
      </form>
    </Modal>
  );
}
