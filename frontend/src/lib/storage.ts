/**
 * SIP — localStorage eliminado.
 * Todos los datos viven ahora en el backend (FastAPI) y se acceden a través de @/lib/api.
 * Este archivo se mantiene vacío para no romper importaciones existentes.
 */

export const storage = {
  getSession: () => null,
  setSession: () => {},
  clearSession: () => {},
  isAuthenticated: () => false,
  getLibros: () => [],
  setLibros: () => {},
  getSocios: () => [],
  setSocios: () => {},
  getPrestamos: () => [],
  setPrestamos: () => {},
  getDanos: () => [],
  setDanos: () => {},
  getAuditLog: () => [],
  setAuditLog: () => {},
  appendAuditLog: () => {},
  clearAll: () => {},
};