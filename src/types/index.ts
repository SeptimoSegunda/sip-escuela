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

export type RolAutor = 'principal' | 'secundario' | 'institucional';

export interface AutorEntry {
  nombre: string;
  rol: RolAutor;
}

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
  autores?:              AutorEntry[];
  fechaAgregado: string; // ISO date string
  /* Campos extendidos (compatibles con dashUpdate) */
  edicion?:              string;
  extension?:            string; // número de páginas
  inventario?:           string; // número de inventario inicial
  clasificacion?:        string; // CDU
  libristica?:           string;
  tomo?:                 string;
  mencionResponsabilidad?: string;
  colaboradores?:        string;
  nivel?:                string;
  idioma?:               string;
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

export const LIMITES_PRESTAMOS: Record<TipoSocio, number> = {
  estudiante: 1,
  docente:    3,
  otro:       1,
};

export interface Socio {
  id: string;
  apellido: string;
  nombre: string;
  tipo: TipoSocio;
  dni: string;
  email?: string;
  estado: EstadoSocio;
  prestamosActivos: number;
  fechaRegistro: string; // ISO date string - created_at
  fechaUltimaActualizacion?: string; // ISO date string - updated_at
}

/* ── Préstamo ──────────────────────────────────────────────── */
export type EstadoPrestamo = 'prestado' | 'devuelto' | 'moroso';

export interface Prestamo {
  id: string;
  libroId: string;
  libroTitulo: string;
  copiaId: string;
  /** Nombre libre del prestatario (sin necesidad de socio registrado) */
  prestatario: string;
  /** Referencia opcional al socio registrado */
  socioId?: string;
  fechaPrestamo: string;  // ISO date string
  fechaLimite: string;    // ISO date string
  fechaDevolucion?: string;
  estado: EstadoPrestamo;
  turnoAdmin: TurnoAdmin;
}

/* ── Daño ──────────────────────────────────────────────────── */
export type SeveridadDano = 'leve' | 'moderado' | 'catastrofico';
export type EstadoPosterior = 'disponible' | 'mantenimiento';

export interface Dano {
  id: string;
  libroId: string;
  libroTitulo: string;
  copiaId: string;
  /** Nombre libre del responsable (sin necesidad de socio registrado) */
  responsable: string;
  /** Referencia opcional al socio registrado */
  socioId?: string;
  severidad: SeveridadDano;
  descripcion: string;
  fecha: string;          // ISO date string
  turnoAdmin: TurnoAdmin;
  /** Estado posterior del ejemplar tras el daño (usado en devoluciones con daño) */
  estadoPosterior?: EstadoPosterior;
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

/* ── Autor ────────────────────────────────────────────────────── */
export interface Autor {
  id: string;
  nombre: string;
  apellido: string;
  fechaRegistro: string; // ISO date string
  fechaUltimaActualizacion?: string;
}

export interface NuevoAutorData {
  nombre: string;
  apellido: string;
}

/* ── Editorial ────────────────────────────────────────────────── */
export interface Editorial {
  id: string;
  nombre: string;
  fechaRegistro: string; // ISO date string
  fechaUltimaActualizacion?: string;
}

export interface NuevoEditorialData {
  nombre: string;
}
