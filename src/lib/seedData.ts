/**
 * SIPnr — Inicialización del sistema
 * Llama a `loadSeedData()` al arrancar el dashboard.
 * El sistema inicia con todas las colecciones vacías.
 */

import { storage } from './storage';

/**
 * Inicializa las colecciones en localStorage si no existen.
 * No precarga ningún dato de ejemplo.
 */
export function loadSeedData(): void {
  if (typeof window === 'undefined') return;

  if (storage.getLibros().length === 0)   storage.setLibros([]);
  if (storage.getSocios().length === 0)   storage.setSocios([]);
  if (storage.getPrestamos().length === 0) storage.setPrestamos([]);
  if (storage.getDanos().length === 0)    storage.setDanos([]);
  if (storage.getAuditLog().length === 0) storage.setAuditLog([]);
}
