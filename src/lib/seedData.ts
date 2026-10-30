/**
 * SIPnr — Datos iniciales del sistema
 * Se cargan en localStorage sólo si las colecciones están vacías.
 * Importar y llamar a `loadSeedData()` al arrancar el dashboard.
 *
 * Préstamos y Registros de Daños inician VACÍOS.
 */

import { storage } from './storage';
import type { Libro, Socio, AuditLog } from '@/types';

/* ── Libros del catálogo base ── */
const SEED_LIBROS: Libro[] = [
  {
    id: 'L-0000001', isbn: '978-950-511-356-9',
    titulo: 'Rayuela', subtitulo: 'Novela experimental', autor: 'Julio Cortázar',
    categoria: 'Novela', ubicacion: 'Estante 2, Sector A',
    editorial: 'Sudamericana', fechaPublicacion: '1963',
    lugarPublicacion: 'Buenos Aires', edicion: '1ª Edición',
    fechaAgregado: '2026-03-01T08:00:00.000Z',
    copias: [
      { id: 'C-001', inventarioNum: 'INV-10001', estado: 'disponible' },
      { id: 'C-002', inventarioNum: 'INV-10002', estado: 'disponible' },
    ],
  },
  {
    id: 'L-0000002', isbn: '978-950-07-0924-0',
    titulo: 'Ficciones', autor: 'Jorge Luis Borges',
    categoria: 'Cuento', ubicacion: 'Estante 1, Sector B',
    editorial: 'Emecé', fechaPublicacion: '1944',
    lugarPublicacion: 'Buenos Aires',
    fechaAgregado: '2026-03-05T08:00:00.000Z',
    copias: [
      { id: 'C-003', inventarioNum: 'INV-10003', estado: 'disponible' },
    ],
  },
  {
    id: 'L-0000003', isbn: '978-950-04-0247-3',
    titulo: 'El túnel', autor: 'Ernesto Sábato',
    categoria: 'Novela', ubicacion: 'Estante 3, Sector A',
    editorial: 'Emecé', fechaPublicacion: '1948',
    fechaAgregado: '2026-03-10T08:00:00.000Z',
    copias: [
      { id: 'C-004', inventarioNum: 'INV-10004', estado: 'disponible' },
      { id: 'C-005', inventarioNum: 'INV-10005', estado: 'disponible' },
    ],
  },
  {
    id: 'L-0000004', isbn: '978-950-15-2402-5',
    titulo: 'Santa Evita', autor: 'Tomás Eloy Martínez',
    categoria: 'Novela histórica', ubicacion: 'Estante 4, Sector C',
    editorial: 'Planeta', fechaPublicacion: '1995',
    lugarPublicacion: 'Buenos Aires',
    fechaAgregado: '2026-04-01T08:00:00.000Z',
    copias: [
      { id: 'C-006', inventarioNum: 'INV-10006', estado: 'disponible' },
    ],
  },
  {
    id: 'L-0000005', isbn: '978-84-204-5325-1',
    titulo: 'Cien años de soledad', autor: 'Gabriel García Márquez',
    categoria: 'Realismo mágico', ubicacion: 'Estante 1, Sector A',
    editorial: 'Sudamericana', fechaPublicacion: '1967',
    lugarPublicacion: 'Buenos Aires',
    fechaAgregado: '2026-03-15T08:00:00.000Z',
    copias: [
      { id: 'C-007', inventarioNum: 'INV-10007', estado: 'disponible' },
      { id: 'C-008', inventarioNum: 'INV-10008', estado: 'disponible' },
      { id: 'C-009', inventarioNum: 'INV-10009', estado: 'disponible' },
    ],
  },
  {
    id: 'L-0000006', isbn: '978-950-49-0397-1',
    titulo: 'La traición de Rita Hayworth', autor: 'Manuel Puig',
    categoria: 'Novela', ubicacion: 'Estante 5, Sector B',
    editorial: 'Jorge Álvarez', fechaPublicacion: '1968',
    fechaAgregado: '2026-05-01T08:00:00.000Z',
    copias: [
      { id: 'C-010', inventarioNum: 'INV-10010', estado: 'disponible' },
    ],
  },
  {
    id: 'L-0000007', isbn: '978-987-04-0005-7',
    titulo: 'El eternauta', autor: 'Héctor Germán Oesterheld',
    categoria: 'Historieta / Ciencia Ficción', ubicacion: 'Estante 6, Sector A',
    editorial: 'Record', fechaPublicacion: '1957',
    fechaAgregado: '2026-04-15T08:00:00.000Z',
    copias: [
      { id: 'C-011', inventarioNum: 'INV-10011', estado: 'disponible' },
      { id: 'C-012', inventarioNum: 'INV-10012', estado: 'disponible' },
    ],
  },
  {
    id: 'L-0000008', isbn: '978-950-581-336-7',
    titulo: 'Martín Fierro', autor: 'José Hernández',
    categoria: 'Poesía gauchesca', ubicacion: 'Estante 2, Sector C',
    editorial: 'Losada', fechaPublicacion: '1872',
    fechaAgregado: '2026-03-20T08:00:00.000Z',
    copias: [
      { id: 'C-013', inventarioNum: 'INV-10013', estado: 'disponible' },
    ],
  },
];

/* ── Socios iniciales ── */
const SEED_SOCIOS: Socio[] = [
  { id: 'S-10001', apellido: 'González',  nombre: 'Lucía',     tipo: 'estudiante', anio: '3°A', turno: 'mañana', estado: 'activo',     prestamosActivos: 0, fechaRegistro: '2026-03-01T00:00:00.000Z', email: 'lucia@edu.ar' },
  { id: 'S-10002', apellido: 'Martínez',  nombre: 'Tomás',     tipo: 'estudiante', anio: '2°B', turno: 'tarde',  estado: 'activo',     prestamosActivos: 0, fechaRegistro: '2026-03-01T00:00:00.000Z', email: 'tomas@edu.ar' },
  { id: 'S-10003', apellido: 'Rodríguez', nombre: 'Valentina', tipo: 'estudiante', anio: '4°A', turno: 'mañana', estado: 'activo',     prestamosActivos: 0, fechaRegistro: '2026-03-01T00:00:00.000Z', email: 'vale@edu.ar' },
  { id: 'S-10004', apellido: 'López',     nombre: 'Facundo',   tipo: 'estudiante', anio: '1°C', turno: 'tarde',  estado: 'suspendido', prestamosActivos: 0, fechaRegistro: '2026-03-05T00:00:00.000Z', email: 'facu@edu.ar' },
  { id: 'S-10005', apellido: 'Fernández', nombre: 'Camila',    tipo: 'estudiante', anio: '5°B', turno: 'mañana', estado: 'activo',     prestamosActivos: 0, fechaRegistro: '2026-03-10T00:00:00.000Z', email: 'cami@edu.ar' },
  { id: 'S-10006', apellido: 'Díaz',      nombre: 'Marcos',    tipo: 'estudiante', anio: '3°C', turno: 'tarde',  estado: 'activo',     prestamosActivos: 0, fechaRegistro: '2026-04-01T00:00:00.000Z', email: 'marcos@edu.ar' },
  { id: 'S-10007', apellido: 'Pérez',     nombre: 'Ana Laura', tipo: 'docente',                 estado: 'activo',     prestamosActivos: 0, fechaRegistro: '2026-03-01T00:00:00.000Z', email: 'aperez@edu.ar' },
  { id: 'S-10008', apellido: 'Suárez',    nombre: 'Diego',     tipo: 'estudiante', anio: '2°A', turno: 'mañana', estado: 'activo',     prestamosActivos: 0, fechaRegistro: '2026-05-10T00:00:00.000Z', email: 'diego@edu.ar' },
];

/* ── Auditoría inicial ── */
const SEED_AUDIT: AuditLog[] = [
  {
    id: 'A-000',
    fecha: '2026-03-01T08:00:00Z',
    admin: 'Turno Mañana',
    categoria: 'Libros',
    accion: 'Catálogo Inicializado',
    descripcion: 'Se cargó el catálogo base de la biblioteca en el sistema.',
  },
];

/* IDs de placeholders que pueden haber quedado en localStorage de versiones anteriores */
const LEGACY_PRESTAMO_IDS = new Set([
  'P-09001', 'P-09002', 'P-09003', 'P-09004', 'P-09005', 'P-09006',
  'P-09007', 'P-09008', 'P-09009', 'P-08001', 'P-08002', 'P-08003',
  'P-10001', 'P-10002',
]);
const LEGACY_DANO_IDS = new Set(['D-001', 'D-002', 'D-003']);
const LEGACY_AUDIT_IDS = new Set([
  'A-001', 'A-002', 'A-003', 'A-004', 'A-005', 'A-006',
  'A-007', 'A-008', 'A-009', 'A-010', 'A-011', 'A-012',
]);

/**
 * Carga datos iniciales en localStorage y elimina placeholders de versiones previas.
 * Préstamos y Registros de Daños siempre inician vacíos.
 */
export function loadSeedData(): void {
  if (typeof window === 'undefined') return;

  /* ── Seed inicial de libros y socios si están vacíos ── */
  if (storage.getLibros().length === 0) storage.setLibros(SEED_LIBROS);
  if (storage.getSocios().length === 0) storage.setSocios(SEED_SOCIOS);

  /* ── Eliminar préstamos placeholder de versiones anteriores ── */
  const prestamosActuales = storage.getPrestamos();
  if (prestamosActuales.some((p) => LEGACY_PRESTAMO_IDS.has(p.id))) {
    storage.setPrestamos(prestamosActuales.filter((p) => !LEGACY_PRESTAMO_IDS.has(p.id)));
  }

  /* ── Eliminar daños placeholder de versiones anteriores ── */
  const danosActuales = storage.getDanos();
  if (danosActuales.some((d) => LEGACY_DANO_IDS.has(d.id))) {
    storage.setDanos(danosActuales.filter((d) => !LEGACY_DANO_IDS.has(d.id)));
  }

  /* ── Limpiar auditoría placeholder y sembrar la entrada inicial ── */
  const auditActual = storage.getAuditLog();
  const auditLimpia = auditActual.filter((a) => !LEGACY_AUDIT_IDS.has(a.id));
  if (auditActual.length !== auditLimpia.length) {
    storage.setAuditLog(auditLimpia);
  }
  if (storage.getAuditLog().length === 0) {
    storage.setAuditLog(SEED_AUDIT);
  }

  /* ── Restaurar copias marcadas como 'prestado' por placeholders ── */
  const prestamosVigentes = storage.getPrestamos().filter(
    (p) => p.estado === 'prestado' || p.estado === 'moroso'
  );
  const copiasEnPrestamo = new Set(prestamosVigentes.map((p) => p.copiaId));

  const librosActuales = storage.getLibros();
  let huboCambios = false;
  const librosActualizados = librosActuales.map((libro) => {
    let copiaModificada = false;
    const nuevasCopias = libro.copias.map((copia) => {
      if (copia.estado === 'prestado' && !copiasEnPrestamo.has(copia.id)) {
        copiaModificada = true;
        return { ...copia, estado: 'disponible' as const };
      }
      return copia;
    });
    if (copiaModificada) {
      huboCambios = true;
      return { ...libro, copias: nuevasCopias };
    }
    return libro;
  });

  if (huboCambios) {
    storage.setLibros(librosActualizados);
  }
}
