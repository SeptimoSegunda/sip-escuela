// ──────────────────────────────────────────────
// Entidades de datos
// ──────────────────────────────────────────────

export type LoanStatus = 'prestado' | 'devuelto' | 'moroso';
export type SocioTipo = 'estudiante' | 'docente' | 'otro';
export type ActiveView = 'inicio' | 'catalogo' | 'prestamos' | 'socios' | 'danos' | 'auditoria' | 'reportes';

export interface Book {
  isbn: string;
  titulo: string;
  subtitulo?: string;
  autor: string;
  categoria: string;
  libristica?: string;
  inventario: string;
  ubicacion: string;
  extension?: string;
  edicion?: string;
  lugarPublicacion?: string;
  fecha?: string;
  editorial?: string;
  temas?: string;
  numero?: string;
  terminoMateria?: string;
  clasificacion: string;
  coleccionPersonal?: string;
  coleccionInstitucional?: string;
  notaGeneral?: string;
  notaContenido?: string;
  copias: number;
}

export interface Socio {
  id: string;
  apellido: string;
  nombre: string;
  tipo: SocioTipo;
  anio: string;
  turno: string;
  email: string;
  estado: 'activo' | 'inactivo';
}

export interface Loan {
  id: string;
  libro: string;
  socioId: string;
  socioNombre: string;
  fechaPrestamo: string;
  fechaLimite: string;
  estado: LoanStatus;
}

export type NivelDano = 'Daño leve' | 'Daño moderado' | 'CATASTROFICO!';

export interface Dano {
  id: string;
  libroTitulo: string;
  socioId: string;
  socioNombre: string;
  nivelDano: NivelDano;
  descripcion: string;
  estadoPosterior: 'disponible' | 'mantenimiento';
  fechaHora: string;
  registradoPor: string;
}

export interface AuditLog {
  id: string;
  fechaHora: string;
  administrador: string;
  categoria: 'Libros' | 'Préstamos' | 'Socios' | 'Daños' | 'Sistema';
  accion: string;
  descripcion: string;
}

export type ActiveModal =
  | 'prestamo'
  | 'devolucion'
  | 'socio'
  | 'nuevoLibro'
  | 'detalleLibro'
  | 'nuevoDano'
  | 'expedienteSocio'
  | 'busquedaAsistida'
  | null;

export interface AppState {
  books: Book[];
  socios: Socio[];
  loans: Loan[];
  danos: Dano[];
  auditLogs: AuditLog[];
  activeView: ActiveView;
  activeModal: ActiveModal;
  selectedBook: Book | null;
  selectedSocioId: string | null;
  catalogSearch: string;
  loansFilter: string;
  reportMonth: string;
}

export type AppAction =
  | { type: 'SET_VIEW'; view: ActiveView }
  | { type: 'OPEN_MODAL'; modal: ActiveModal; book?: Book; socioId?: string }
  | { type: 'CLOSE_MODAL' }
  | { type: 'ADD_LOAN'; loan: Loan }
  | { type: 'RETURN_LOAN'; loanId: string; dano?: Omit<Dano, 'id' | 'fechaHora' | 'registradoPor'> }
  | { type: 'ADD_SOCIO'; socio: Socio }
  | { type: 'DELETE_SOCIO'; id: string }
  | { type: 'ADD_BOOK'; book: Book }
  | { type: 'UPDATE_BOOK_COPIES'; isbn: string; delta: number }
  | { type: 'SET_CATALOG_SEARCH'; term: string }
  | { type: 'SET_LOANS_FILTER'; filter: string }
  | { type: 'SET_REPORT_MONTH'; month: string }
  | { type: 'ADD_DANO'; dano: Dano }
  | { type: 'ADD_AUDIT_LOG'; log: AuditLog };
