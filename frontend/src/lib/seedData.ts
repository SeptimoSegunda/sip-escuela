/**
 * SIPnr — Datos de ejemplo para demostración
 * Se cargan en localStorage sólo si las colecciones están vacías.
 * Importar y llamar a `loadSeedData()` al arrancar el dashboard.
 */

import { storage } from './storage';
import type { Libro, Socio, Prestamo, Dano, AuditLog } from '@/types';

/* ── Libros de ejemplo ── */
const SEED_LIBROS: Libro[] = [
  {
    id: 'L-0000001', isbn: '978-950-511-356-9',
    titulo: 'Rayuela', subtitulo: 'Novela experimental', autor: 'Julio Cortázar',
    categoria: 'Novela', ubicacion: 'Estante 2, Sector A',
    editorial: 'Sudamericana', fechaPublicacion: '1963',
    lugarPublicacion: 'Buenos Aires', edicion: '1ª Edición',
    fechaAgregado: '2026-03-01T08:00:00.000Z',
    copias: [
      { id: 'C-001', inventarioNum: 'INV-10001', estado: 'prestado' },
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
      { id: 'C-005', inventarioNum: 'INV-10005', estado: 'prestado' },
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
      { id: 'C-007', inventarioNum: 'INV-10007', estado: 'prestado' },
      { id: 'C-008', inventarioNum: 'INV-10008', estado: 'disponible' },
      { id: 'C-009', inventarioNum: 'INV-10009', estado: 'prestado' },
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

/* ── Socios de ejemplo ── */
const SEED_SOCIOS: Socio[] = [
  { id: 'S-10001', apellido: 'González',  nombre: 'Lucía',     tipo: 'estudiante', anio: '3°A', turno: 'mañana', estado: 'activo',     prestamosActivos: 1, fechaRegistro: '2026-03-01T00:00:00.000Z', email: 'lucia@edu.ar' },
  { id: 'S-10002', apellido: 'Martínez',  nombre: 'Tomás',     tipo: 'estudiante', anio: '2°B', turno: 'tarde',  estado: 'activo',     prestamosActivos: 1, fechaRegistro: '2026-03-01T00:00:00.000Z', email: 'tomas@edu.ar' },
  { id: 'S-10003', apellido: 'Rodríguez', nombre: 'Valentina', tipo: 'estudiante', anio: '4°A', turno: 'mañana', estado: 'activo',     prestamosActivos: 2, fechaRegistro: '2026-03-01T00:00:00.000Z', email: 'vale@edu.ar' },
  { id: 'S-10004', apellido: 'López',     nombre: 'Facundo',   tipo: 'estudiante', anio: '1°C', turno: 'tarde',  estado: 'suspendido', prestamosActivos: 0, fechaRegistro: '2026-03-05T00:00:00.000Z', email: 'facu@edu.ar' },
  { id: 'S-10005', apellido: 'Fernández', nombre: 'Camila',    tipo: 'estudiante', anio: '5°B', turno: 'mañana', estado: 'activo',     prestamosActivos: 0, fechaRegistro: '2026-03-10T00:00:00.000Z', email: 'cami@edu.ar' },
  { id: 'S-10006', apellido: 'Díaz',      nombre: 'Marcos',    tipo: 'estudiante', anio: '3°C', turno: 'tarde',  estado: 'activo',     prestamosActivos: 1, fechaRegistro: '2026-04-01T00:00:00.000Z', email: 'marcos@edu.ar' },
  { id: 'S-10007', apellido: 'Pérez',     nombre: 'Ana Laura', tipo: 'docente',                 estado: 'activo',     prestamosActivos: 0, fechaRegistro: '2026-03-01T00:00:00.000Z', email: 'aperez@edu.ar' },
  { id: 'S-10008', apellido: 'Suárez',    nombre: 'Diego',     tipo: 'estudiante', anio: '2°A', turno: 'mañana', estado: 'activo',     prestamosActivos: 0, fechaRegistro: '2026-05-10T00:00:00.000Z', email: 'diego@edu.ar' },
];

/* ── Préstamos de ejemplo (mezcla de períodos) ── */
const SEED_PRESTAMOS: Prestamo[] = [
  // Septiembre 2026 — activos y morosos
  { id: 'P-09001', libroId: 'L-0000001', libroTitulo: 'Rayuela',              copiaId: 'C-001', socioId: 'S-10001', socioNombre: 'González, Lucía',   fechaPrestamo: '2026-09-05T10:00:00Z', fechaLimite: '2026-09-19T10:00:00Z', estado: 'prestado', turnoAdmin: 'Turno Mañana' },
  { id: 'P-09002', libroId: 'L-0000003', libroTitulo: 'El túnel',             copiaId: 'C-005', socioId: 'S-10002', socioNombre: 'Martínez, Tomás',   fechaPrestamo: '2026-09-08T14:00:00Z', fechaLimite: '2026-09-22T14:00:00Z', estado: 'prestado', turnoAdmin: 'Turno Tarde' },
  { id: 'P-09003', libroId: 'L-0000005', libroTitulo: 'Cien años de soledad', copiaId: 'C-007', socioId: 'S-10003', socioNombre: 'Rodríguez, Valentina', fechaPrestamo: '2026-09-01T10:00:00Z', fechaLimite: '2026-09-15T10:00:00Z', estado: 'moroso',  turnoAdmin: 'Turno Mañana' },
  { id: 'P-09004', libroId: 'L-0000005', libroTitulo: 'Cien años de soledad', copiaId: 'C-009', socioId: 'S-10006', socioNombre: 'Díaz, Marcos',      fechaPrestamo: '2026-09-02T14:00:00Z', fechaLimite: '2026-09-16T14:00:00Z', estado: 'moroso',  turnoAdmin: 'Turno Tarde' },
  // Septiembre 2026 — devueltos
  { id: 'P-09005', libroId: 'L-0000002', libroTitulo: 'Ficciones',            copiaId: 'C-003', socioId: 'S-10005', socioNombre: 'Fernández, Camila', fechaPrestamo: '2026-09-03T10:00:00Z', fechaLimite: '2026-09-17T10:00:00Z', fechaDevolucion: '2026-09-16T11:00:00Z', estado: 'devuelto', turnoAdmin: 'Turno Mañana' },
  { id: 'P-09006', libroId: 'L-0000001', libroTitulo: 'Rayuela',              copiaId: 'C-002', socioId: 'S-10007', socioNombre: 'Pérez, Ana Laura',  fechaPrestamo: '2026-09-10T10:00:00Z', fechaLimite: '2026-09-24T10:00:00Z', fechaDevolucion: '2026-09-22T09:00:00Z', estado: 'devuelto', turnoAdmin: 'Turno Mañana' },
  { id: 'P-09007', libroId: 'L-0000007', libroTitulo: 'El eternauta',         copiaId: 'C-011', socioId: 'S-10003', socioNombre: 'Rodríguez, Valentina', fechaPrestamo: '2026-09-12T14:00:00Z', fechaLimite: '2026-09-26T14:00:00Z', fechaDevolucion: '2026-09-25T16:00:00Z', estado: 'devuelto', turnoAdmin: 'Turno Tarde' },
  { id: 'P-09008', libroId: 'L-0000004', libroTitulo: 'Santa Evita',          copiaId: 'C-006', socioId: 'S-10004', socioNombre: 'López, Facundo',    fechaPrestamo: '2026-09-15T10:00:00Z', fechaLimite: '2026-09-29T10:00:00Z', fechaDevolucion: '2026-09-28T10:00:00Z', estado: 'devuelto', turnoAdmin: 'Turno Tarde' },
  { id: 'P-09009', libroId: 'L-0000005', libroTitulo: 'Cien años de soledad', copiaId: 'C-008', socioId: 'S-10008', socioNombre: 'Suárez, Diego',    fechaPrestamo: '2026-09-18T10:00:00Z', fechaLimite: '2026-10-02T10:00:00Z', fechaDevolucion: '2026-09-30T10:00:00Z', estado: 'devuelto', turnoAdmin: 'Turno Mañana' },
  // Agosto 2026
  { id: 'P-08001', libroId: 'L-0000001', libroTitulo: 'Rayuela',              copiaId: 'C-001', socioId: 'S-10001', socioNombre: 'González, Lucía',   fechaPrestamo: '2026-08-05T10:00:00Z', fechaLimite: '2026-08-19T10:00:00Z', fechaDevolucion: '2026-08-18T10:00:00Z', estado: 'devuelto', turnoAdmin: 'Turno Mañana' },
  { id: 'P-08002', libroId: 'L-0000003', libroTitulo: 'El túnel',             copiaId: 'C-004', socioId: 'S-10002', socioNombre: 'Martínez, Tomás',   fechaPrestamo: '2026-08-10T14:00:00Z', fechaLimite: '2026-08-24T14:00:00Z', fechaDevolucion: '2026-08-23T14:00:00Z', estado: 'devuelto', turnoAdmin: 'Turno Tarde' },
  { id: 'P-08003', libroId: 'L-0000006', libroTitulo: 'La traición de Rita Hayworth', copiaId: 'C-010', socioId: 'S-10005', socioNombre: 'Fernández, Camila', fechaPrestamo: '2026-08-12T10:00:00Z', fechaLimite: '2026-08-26T10:00:00Z', fechaDevolucion: '2026-08-25T10:00:00Z', estado: 'devuelto', turnoAdmin: 'Turno Mañana' },
  // Octubre 2026
  { id: 'P-10001', libroId: 'L-0000008', libroTitulo: 'Martín Fierro',        copiaId: 'C-013', socioId: 'S-10005', socioNombre: 'Fernández, Camila', fechaPrestamo: '2026-10-02T10:00:00Z', fechaLimite: '2026-10-16T10:00:00Z', estado: 'prestado', turnoAdmin: 'Turno Mañana' },
  { id: 'P-10002', libroId: 'L-0000007', libroTitulo: 'El eternauta',         copiaId: 'C-012', socioId: 'S-10002', socioNombre: 'Martínez, Tomás',   fechaPrestamo: '2026-10-05T14:00:00Z', fechaLimite: '2026-10-19T14:00:00Z', estado: 'prestado', turnoAdmin: 'Turno Tarde' },
];

/* ── Daños de ejemplo ── */
const SEED_DANOS: Dano[] = [
  { id: 'D-001', libroId: 'L-0000004', libroTitulo: 'Santa Evita', copiaId: 'C-006', socioId: 'S-10004', socioNombre: 'López, Facundo', severidad: 'leve', descripcion: 'Lomo levemente desgastado por uso', fecha: '2026-09-28T10:30:00Z', turnoAdmin: 'Turno Tarde' },
  { id: 'D-002', libroId: 'L-0000003', libroTitulo: 'El túnel', copiaId: 'C-005', socioId: 'S-10006', socioNombre: 'Díaz, Marcos', severidad: 'moderado', descripcion: 'Manchas de lapicera en varias páginas', fecha: '2026-09-20T14:00:00Z', turnoAdmin: 'Turno Tarde' },
  { id: 'D-003', libroId: 'L-0000005', libroTitulo: 'Cien años de soledad', copiaId: 'C-009', socioId: 'S-10003', socioNombre: 'Rodríguez, Valentina', severidad: 'catastrofico', descripcion: 'Libro mojado, páginas pegadas, inutilizable', fecha: '2026-09-15T11:00:00Z', turnoAdmin: 'Turno Mañana' },
];

/* ── Auditoría de ejemplo ── */
const SEED_AUDIT: AuditLog[] = [
  { id: 'A-001', fecha: '2026-09-05T10:05:00Z', admin: 'Turno Mañana', categoria: 'Préstamos', accion: 'Préstamo Registrado', descripcion: 'Se prestó "Rayuela" a González, Lucía (ID: P-09001).' },
  { id: 'A-002', fecha: '2026-09-08T14:10:00Z', admin: 'Turno Tarde',  categoria: 'Préstamos', accion: 'Préstamo Registrado', descripcion: 'Se prestó "El túnel" a Martínez, Tomás (ID: P-09002).' },
  { id: 'A-003', fecha: '2026-09-16T11:00:00Z', admin: 'Turno Mañana', categoria: 'Préstamos', accion: 'Devolución Registrada', descripcion: '"Ficciones" devuelto por Fernández, Camila sin incidencias.' },
  { id: 'A-004', fecha: '2026-09-15T11:05:00Z', admin: 'Turno Mañana', categoria: 'Daños', accion: 'Incidencia Registrada', descripcion: '"Cien años de soledad" — daño CATASTRÓFICO. Socio: Rodríguez, Valentina.' },
  { id: 'A-005', fecha: '2026-09-20T14:05:00Z', admin: 'Turno Tarde',  categoria: 'Daños', accion: 'Incidencia Registrada', descripcion: '"El túnel" — daño moderado. Socio: Díaz, Marcos.' },
  { id: 'A-006', fecha: '2026-09-22T09:05:00Z', admin: 'Turno Mañana', categoria: 'Préstamos', accion: 'Devolución Registrada', descripcion: '"Rayuela" devuelto por Pérez, Ana Laura sin incidencias.' },
  { id: 'A-007', fecha: '2026-09-25T16:10:00Z', admin: 'Turno Tarde',  categoria: 'Préstamos', accion: 'Devolución Registrada', descripcion: '"El eternauta" devuelto por Rodríguez, Valentina sin incidencias.' },
  { id: 'A-008', fecha: '2026-09-28T10:35:00Z', admin: 'Turno Tarde',  categoria: 'Daños',     accion: 'Incidencia Registrada', descripcion: '"Santa Evita" — daño leve. Socio: López, Facundo.' },
  { id: 'A-009', fecha: '2026-09-28T10:30:00Z', admin: 'Turno Tarde',  categoria: 'Préstamos', accion: 'Devolución Registrada', descripcion: '"Santa Evita" devuelto por López, Facundo.' },
  { id: 'A-010', fecha: '2026-09-30T10:05:00Z', admin: 'Turno Mañana', categoria: 'Préstamos', accion: 'Devolución Registrada', descripcion: '"Cien años de soledad" devuelto por Suárez, Diego.' },
  { id: 'A-011', fecha: '2026-10-02T10:10:00Z', admin: 'Turno Mañana', categoria: 'Préstamos', accion: 'Préstamo Registrado', descripcion: 'Se prestó "Martín Fierro" a Fernández, Camila (ID: P-10001).' },
  { id: 'A-012', fecha: '2026-10-05T14:10:00Z', admin: 'Turno Tarde',  categoria: 'Préstamos', accion: 'Préstamo Registrado', descripcion: 'Se prestó "El eternauta" a Martínez, Tomás (ID: P-10002).' },
];

/**
 * Carga datos de ejemplo.
 * NOTA: ya no se usa localStorage. Los datos se siembran en el backend
 * con `python seed.py` y se consumen mediante la API.
 */
export function loadSeedData(): void {
  // No-op: los datos provienen del backend vía API.
}
