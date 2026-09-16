// ──────────────────────────────────────────────
// Entidades de datos
// ──────────────────────────────────────────────

export type LoanStatus = 'prestado' | 'devuelto' | 'moroso';
export type SocioTipo = 'estudiante' | 'docente' | 'otro';
export type ActiveView = 'inicio' | 'catalogo' | 'prestamos' | 'socios' | 'reportes';

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

export type ActiveModal =
  | 'prestamo'
  | 'devolucion'
  | 'socio'
  | 'nuevoLibro'
  | 'detalleLibro'
  | null;

export interface AppState {
  books: Book[];
  socios: Socio[];
  loans: Loan[];
  activeView: ActiveView;
  activeModal: ActiveModal;
  selectedBook: Book | null;
  catalogSearch: string;
  loansFilter: string;
  reportMonth: string;
}

export type AppAction =
  | { type: 'SET_VIEW'; view: ActiveView }
  | { type: 'OPEN_MODAL'; modal: ActiveModal; book?: Book }
  | { type: 'CLOSE_MODAL' }
  | { type: 'ADD_LOAN'; loan: Loan }
  | { type: 'RETURN_LOAN'; loanId: string }
  | { type: 'ADD_SOCIO'; socio: Socio }
  | { type: 'DELETE_SOCIO'; id: string }
  | { type: 'ADD_BOOK'; book: Book }
  | { type: 'UPDATE_BOOK_COPIES'; isbn: string; delta: number }
  | { type: 'SET_CATALOG_SEARCH'; term: string }
  | { type: 'SET_LOANS_FILTER'; filter: string }
  | { type: 'SET_REPORT_MONTH'; month: string };
