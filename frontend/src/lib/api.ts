/**
 * SIP — Cliente API con fetch (sin localStorage).
 * Toda la lectura/escritura de datos va contra el backend FastAPI.
 * El header X-Active-Shift se inyecta automáticamente desde el turno activo.
 */

/**
 * En desarrollo se usa la ruta relativa '/api'; Next.js la proxya a FastAPI
 * mediante rewrites() en next.config.ts (evita problemas de CORS).
 * NEXT_PUBLIC_API_URL se mantiene por compatibilidad, pero no se usa aquí.
 */
const API_BASE = '/api'

/** Turno activo actual (mañana | tarde). Se establece al iniciar sesión. */
let activeTurno: string | null = null

export function setActiveTurno(turno: string | null): void {
  activeTurno = turno
}

export function getActiveTurno(): string | null {
  return activeTurno
}

function getHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (activeTurno) {
    headers['X-Active-Shift'] = activeTurno
  }
  return headers
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Error ${response.status}`)
  }
  if (response.status === 204) {
    return undefined as T
  }

  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('application/json')) {
    const text = await response.text()
    if (!text) return undefined as T
    throw new Error(
      `Respuesta inesperada del servidor (${response.status}): ${text.slice(0, 200)}`
    )
  }

  return response.json()
}

/* ─────────────────────────────────────────────────────────
   ID mapping: backend int IDs → frontend string IDs (L-0000001, S-00001, …)
   ───────────────────────────────────────────────────────── */

const ID_CONFIG = {
  libro:    { prefix: 'L', digits: 7 },
  socio:    { prefix: 'S', digits: 5 },
  prestamo: { prefix: 'P', digits: 5 },
  dano:     { prefix: 'D', digits: 3 },
  copia:    { prefix: 'C', digits: 3 },
  autor:    { prefix: 'A', digits: 3 },
  editorial:{ prefix: 'E', digits: 3 },
  usuario:  { prefix: 'U', digits: 3 },
} as const

export function toFrontendId(type: keyof typeof ID_CONFIG, id: number): string {
  const { prefix, digits } = ID_CONFIG[type]
  return `${prefix}-${id.toString().padStart(digits, '0')}`
}

export function toBackendId(frontendId: string): number {
  const match = frontendId.match(/(\d+)/)
  return match ? parseInt(match[1], 10) : 0
}

/* ─────────────────────────────────────────────────────────
   Recursos de la API
   ───────────────────────────────────────────────────────── */

export const api = {
  // ── Socios ──
  getSocios: () => request<any[]>('/socios/'),
  getSocio: (id: number) => request<any>(`/socios/${id}/`),
  createSocio: (data: any) =>
    request<any>('/socios/', { method: 'POST', body: JSON.stringify(data) }),
  updateSocio: (id: number, data: any) =>
    request<any>(`/socios/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteSocio: (id: number) =>
    request<void>(`/socios/${id}/`, { method: 'DELETE' }),

  // ── Libros ──
  getLibros: () => request<any[]>('/libros/'),
  getLibro: (id: number) => request<any>(`/libros/${id}/`),
  createLibro: (data: any) =>
    request<any>('/libros/', { method: 'POST', body: JSON.stringify(data) }),
  updateLibro: (id: number, data: any) =>
    request<any>(`/libros/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLibro: (id: number) =>
    request<void>(`/libros/${id}/`, { method: 'DELETE' }),

  // ── Copias ──
  getCopias: () => request<any[]>('/copias/'),
  createCopia: (data: any) =>
    request<any>('/copias/', { method: 'POST', body: JSON.stringify(data) }),
  updateCopia: (id: number, data: any) =>
    request<any>(`/copias/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCopia: (id: number) =>
    request<void>(`/copias/${id}/`, { method: 'DELETE' }),

  // ── Autores ──
  getAutores: () => request<any[]>('/autores/'),
  createAutor: (data: any) =>
    request<any>('/autores/', { method: 'POST', body: JSON.stringify(data) }),
  updateAutor: (id: number, data: any) =>
    request<any>(`/autores/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAutor: (id: number) =>
    request<void>(`/autores/${id}/`, { method: 'DELETE' }),

  // ── Editoriales ──
  getEditoriales: () => request<any[]>('/editoriales/'),
  createEditorial: (data: any) =>
    request<any>('/editoriales/', { method: 'POST', body: JSON.stringify(data) }),
  updateEditorial: (id: number, data: any) =>
    request<any>(`/editoriales/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteEditorial: (id: number) =>
    request<void>(`/editoriales/${id}/`, { method: 'DELETE' }),

  // ── Préstamos ──
  getPrestamos: () => request<any[]>('/prestamos/'),
  createPrestamo: (data: any) =>
    request<any>('/prestamos/', { method: 'POST', body: JSON.stringify(data) }),
  updatePrestamo: (id: number, data: any) =>
    request<any>(`/prestamos/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePrestamo: (id: number) =>
    request<void>(`/prestamos/${id}/`, { method: 'DELETE' }),

  // ── Daños ──
  getDanos: () => request<any[]>('/danos/'),
  createDano: (data: any) =>
    request<any>('/danos/', { method: 'POST', body: JSON.stringify(data) }),
  updateDano: (id: number, data: any) =>
    request<any>(`/danos/${id}/`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteDano: (id: number) =>
    request<void>(`/danos/${id}/`, { method: 'DELETE' }),

  // ── Usuarios / Turno ──
  getUsuarios: () => request<any[]>('/usuarios/'),
  getTurnoActual: () => request<any>('/turno/actual'),
  /** Valida un turno concreto enviando el header X-Active-Shift (útil en el login). */
  validarTurnoHeader: (turno: string) =>
    request<any>('/turno/actual', { headers: { 'X-Active-Shift': turno } }),
  validarTurno: (turnoNuevo: string) =>
    request<any>(`/turno/validar?turno_nuevo=${encodeURIComponent(turnoNuevo)}`),

  // ── Auditoría ──
  getAuditoria: () => request<any[]>('/auditoria/'),
}