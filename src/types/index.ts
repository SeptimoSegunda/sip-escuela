/* ============================================================
   SIPnr — Tipos TypeScript compartidos
   ============================================================ */

/* ── Libro ─────────────────────────────────────────────────── */
export interface Copia {
  id: string;
  inventarioNum: string;
  estado: EstadoCopia;
}

export type EstadoCopia = 'disponible' | 'prestado' | 'dañado' | 'perdido';

export interface Libro {
  id: string;
  isbn: string;
  titulo: string;
  subtitulo?:            string;
  autor: string;
  categoria: string;
  ubicacion: string;
  portadaUrl?: string;   // base64 data URL o URL externa
  copias: Copia[];
  fechaAgregado: string; // ISO date string
  /* Campos extendidos (compatibles con dashUpdate) */
  edicion?:              string;
  extension?:            string; // número de páginas
  inventario?:           string; // número de inventario inicial
  clasificacion?:        string; // CDU
  libristica?:           string;
  tomo?:                 string;
  editorial?:            string;
  fechaPublicacion?:     string;
  lugarPublicacion?:     string;
  temas?:                string;
  terminoMateria?:       string;
  coleccionPersonal?:    string;
  coleccionInstitucional?: string;
  notaGeneral?:          string;
  notaContenido?:        string;
}

/* ── Socio ─────────────────────────────────────────────────── */
export type TipoSocio = 'estudiante' | 'docente' | 'otro';
export type EstadoSocio = 'activo' | 'suspendido' | 'inactivo';

export interface Socio {
  id: string;
  apellido: string;
  nombre: string;
  tipo: TipoSocio;
  anio?: string;        // e.g. "3°A"
  turno?: 'mañana' | 'tarde';
  email?: string;
  estado: EstadoSocio;
  prestamosActivos: number;
  fechaRegistro: string; // ISO date string
}

/* ── Préstamo ──────────────────────────────────────────────── */
export type EstadoPrestamo = 'prestado' | 'devuelto' | 'moroso';

export interface Prestamo {
  id: string;
  libroId: string;
  libroTitulo: string;
  copiaId: string;
  socioId: string;
  socioNombre: string;
  fechaPrestamo: string;  // ISO date string
  fechaLimite: string;    // ISO date string
  fechaDevolucion?: string;
  estado: EstadoPrestamo;
  turnoAdmin: TurnoAdmin;
}

/* ── Daño ──────────────────────────────────────────────────── */
export type SeveridadDano = 'leve' | 'moderado' | 'catastrofico';

export interface Dano {
  id: string;
  libroId: string;
  libroTitulo: string;
  copiaId: string;
  socioId: string;
  socioNombre: string;
  severidad: SeveridadDano;
  descripcion: string;
  fecha: string;          // ISO date string
  turnoAdmin: TurnoAdmin;
}

/* ── Auditoría ─────────────────────────────────────────────── */
export type CategoriaAudit =
  | 'Libros'
  | 'Préstamos'
  | 'Socios'
  | 'Daños'
  | 'Sistema';

export interface AuditLog {
  id: string;
  fecha: string;          // ISO date string
  admin: TurnoAdmin;
  categoria: CategoriaAudit;
  accion: string;
  descripcion: string;
}

/* ── Admin / Sesión ────────────────────────────────────────── */
export type TurnoAdmin = 'Turno Mañana' | 'Turno Tarde';

export interface SesionAdmin {
  usuario: string;
  turno: TurnoAdmin;
  horaIngreso: string;    // ISO date string
}

/* ── Reportes / Métricas ───────────────────────────────────── */
export interface MetricasInicio {
  librosEnEstanteria: number;
  prestamosActivos: number;
  prestamosPeriodo: number;
  totalIncidencias: number;
}

export interface TopLibro {
  libroId: string;
  titulo: string;
  totalPrestamos: number;
}
