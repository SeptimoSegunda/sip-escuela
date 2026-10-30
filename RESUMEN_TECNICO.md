# Resumen Técnico — SIP (Sistema de Biblioteca)

Este documento resume todos los cambios realizados para migrar el frontend de datos ficticios a un backend real (FastAPI + PostgreSQL) y los arreglos posteriores. Está escrito para orientar a otro LLM que continúe el trabajo.

---

## Estructura del proyecto

```
SIP-COMPLETO/
├── frontend/          # Next.js 16 + React 19 + TypeScript
│   ├── src/
│   │   ├── lib/
│   │   │   ├── api.ts          # Cliente API (fetch)
│   │   │   └── storage.ts      # Vacío (se eliminó localStorage)
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useLibros.ts
│   │   │   ├── useSocios.ts
│   │   │   ├── usePrestamos.ts
│   │   │   ├── useDanos.ts
│   │   │   ├── useAuditoria.ts
│   │   │   └── useDashboard.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   └── login/
│   │   └── components/
│   ├── next.config.ts
│   ├── .env.local
│   └── package.json
├── backend/           # FastAPI + SQLAlchemy + PostgreSQL
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   ├── dependencies.py
│   │   └── middleware/auditoria.py
│   ├── alembic/
│   │   └── versions/
│   │       ├── c42b265544a3_*.py (inicial)
│   │       └── 2_add_prestamo_campos.py (nuevo)
│   ├── .env
│   ├── seed.py
│   ├── test_api.py
│   └── requirements.txt
└── RESUMEN_TECNICO.md (este archivo)
```

---

## Cambios realizados

### 1. Frontend: `frontend/src/lib/api.ts`

| Cambio | Antes | Después |
|--------|-------|---------|
| Variable de entorno | `import.meta.env.VITE_API_URL` (Vite) | `process.env.NEXT_PUBLIC_API_URL` (Next.js) |
| `API_BASE` final | `http://localhost:8000/api` | `'/api'` (ruta relativa con proxy en next.config.ts) |
| Manejo de respuestas | `response.json()` siempre | Detecta `content-type`; si está vacío o no es JSON, lanza error descriptivo o devuelve `undefined` |
| `validarTurnoHeader` | `fetch` duplicado con manejo manual | Reutiliza `request()` con header `X-Active-Shift` |

**¿Por qué la ruta relativa?** Para evitar problemas de CORS entre el frontend (puerto 3000) y el backend (puerto 8000). Next.js hace el proxy vía `next.config.ts`.

### 2. Frontend: `frontend/.env.local` (nuevo)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

*Nota: Actualmente no se usa directamente porque `API_BASE` es `'/api'`, pero se mantiene por compatibilidad.*

### 3. Frontend: `frontend/next.config.ts`

Agregado `rewrites()` para proxyear `/api/:path*` → `http://localhost:8000/api/:path*`:

```typescript
async rewrites() {
  return [
    { source: '/api/:path*', destination: 'http://localhost:8000/api/:path*' },
  ];
},
```

### 4. Frontend: `frontend/src/hooks/useAuth.ts`

Agregada normalización de turno para el header `X-Active-Shift`:

```typescript
function turnoParaHeader(turno: string): string {
  const t = turno.trim().toLowerCase();
  if (t.includes('mañana') || t.includes('manana')) return 'mañana';
  if (t.includes('tarde')) return 'tarde';
  return turno;
}
```

`guardarSesion()` ahora llama a `setActiveTurno(turnoParaHeader(turno))` en lugar de pasar directamente el valor de UI (`'Turno Mañana'` → `'mañana'`).

### 5. Frontend: `frontend/src/hooks/usePrestamos.ts`

- **Fechas**: `ahora.toISOString()` → `ahora.toISOString().split('T')[0]` (formato `YYYY-MM-DD`, 10 caracteres) porque el campo `fecha_prestamo` en la BD es `String(20)` y el ISO completo supera ese tamaño.
- **Copia inválida**: Antes de llamar a `onCopiaEstado`, valida que `toBackendId(prestamo.copiaId) > 0`.

### 6. Frontend: `frontend/src/hooks/useLibros.ts`

- `cambiarEstadoCopia`: valida que `toBackendId(copiaId) > 0` antes de hacer el PUT. Si el ID es inválido (ej. `C-0000000` → `0`), lanza `console.error` y retorna temprano.

### 7. Backend: `backend/.env` (nuevo)

```env
DATABASE_URL=postgresql+psycopg://postgres:admin@localhost:5432/sip_escuela
SECRET_KEY=cambiar_en_produccion_clave_secreta_12345
DEBUG=True
```

### 8. Backend: `backend/app/models.py`

Modelo `Prestamo`:
- Agregado `fecha_devolucion: Optional[str]`
- Agregado `turno: str` (default `"mañana"`)
- Agregado `copia_id: Optional[int]` con FK a `copias.id`
- Agregada relación `copia`

### 9. Backend: `backend/app/schemas.py`

| Schema | Cambio |
|--------|--------|
| `SocioCreate.email` | `EmailStr` → `str | None = None` (el frontend envía `''` vacío) |
| `SocioUpdate.email` | `EmailStr` → `str | None = None` |
| `LibroResponse` | Agregado `copias: list[CopiaResponse] = []` |
| `PrestamoResponse` | Agregado `fecha_devolucion`, `turno`, `copia_id`, `libro` (anidado), `socio` (anidado) |
| `DanoResponse` | Agregado `libro` (anidado), `socio` (anidado) |

### 10. Backend: `backend/app/main.py`

En `crear_prestamo()`: ahora inyecta `turno` desde el usuario del header `X-Active-Shift`:

```python
prestamo_data["turno"] = usuario.turno
```

### 11. Backend: `backend/alembic/versions/2_add_prestamo_campos.py` (nuevo)

Migración para agregar columnas a la tabla `prestamo`:
- `fecha_devolucion` (String, nullable)
- `turno` (String, default 'mañana')
- `copia_id` (Integer, FK a copias.id)

---

## Estado actual de funcionamiento

| Funcionalidad | Estado |
|--------------|--------|
| Build de Next.js | ✅ Compila correctamente (Next.js 16.4.3) |
| TypeScript | ✅ Sin errores |
| Endpoints backend | ✅ Respondiendo (socios, libros, préstamos, daños, turno) |
| Crear préstamo | ✅ Funciona (201) |
| Crear daño | ✅ Funciona (201) |
| Cambiar estado de copia | ⚠️ Requiere `copiaId` válido (arreglado validación) |
| Sesión de usuario | ⚠️ Solo en memoria (se pierde al recargar) |

---

## Problemas conocidos y pendientes

### 1. Sesión en memoria (sin persistencia)
La sesión se guarda en una variable de módulo en `useAuth.ts`. Al recargar la página se pierde y hay que hacer login nuevamente.

**Posible solución:** Guardar turno/token en `localStorage` y restaurar al iniciar la app.

### 2. IDs de copia inválidos
Cuando `copia_id` es `null` en la BD, el frontend recibe `C-0000000` y `toBackendId` devuelve `0`. Ya se agregó validación para no enviar el PUT en ese caso, pero idealmente el backend debería manejar esto más elegantemente.

### 3. CORS
El backend tiene `allow_origins=["*"]` en `main.py`, lo cual está bien para desarrollo pero debería restringirse en producción.

---

## Cómo levantar el entorno (para otro LLM o desarrollador)

### Backend
```powershell
cd backend
# 1. Asegurar que PostgreSQL esté corriendo con DB 'sip_escuela'
# 2. Aplicar migraciones
alembic upgrade head
# 3. Poblar datos de ejemplo
python seed.py
# 4. Iniciar servidor
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```powershell
cd frontend
npm run dev
```

Luego abrir `http://localhost:3000/login`.

---

## Endpoints principales del backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/socios/` | Listar socios |
| GET | `/api/socios/{id}` | Obtener socio |
| POST | `/api/socios/` | Crear socio |
| PUT | `/api/socios/{id}` | Actualizar socio |
| DELETE | `/api/socios/{id}` | Eliminar socio |
| GET | `/api/libros/` | Listar libros (con copias anidadas) |
| POST | `/api/libros/` | Crear libro |
| PUT | `/api/libros/{id}` | Actualizar libro |
| DELETE | `/api/libros/{id}` | Eliminar libro |
| GET | `/api/copias/` | Listar copias |
| POST | `/api/copias/` | Crear copia |
| PUT | `/api/copias/{id}` | Actualizar copia |
| DELETE | `/api/copias/{id}` | Eliminar copia |
| GET | `/api/prestamos/` | Listar préstamos (con libro/socio anidados) |
| POST | `/api/prestamos/` | Crear préstamo |
| PUT | `/api/prestamos/{id}` | Actualizar préstamo |
| DELETE | `/api/prestamos/{id}` | Eliminar préstamo |
| GET | `/api/danos/` | Listar daños |
| POST | `/api/danos/` | Crear daño |
| GET | `/api/turno/actual` | Obtener turno actual (requiere header `X-Active-Shift`) |
| GET | `/api/turno/validar?turno_nuevo=...` | Validar cambio de turno |
| GET | `/api/auditoria/` | Listar log de auditoría |
| GET | `/api/usuarios/` | Listar usuarios |
| GET | `/api/autores/` | Listar autores |
| GET | `/api/editoriales/` | Listar editoriales |

---

## Archivos modificados (lista completa)

### Frontend
1. `frontend/src/lib/api.ts`
2. `frontend/.env.local` (nuevo)
3. `frontend/next.config.ts`
4. `frontend/src/hooks/useAuth.ts`
5. `frontend/src/hooks/usePrestamos.ts`
6. `frontend/src/hooks/useLibros.ts`

### Backend
1. `backend/.env` (nuevo)
2. `backend/app/models.py`
3. `backend/app/schemas.py`
4. `backend/app/main.py`
5. `backend/alembic/versions/2_add_prestamo_campos.py` (nuevo)

---

## Notas para el siguiente LLM

- No uses `import.meta.env` en Next.js; usa `process.env.NEXT_PUBLIC_*`.
- El proxy de Next.js (`rewrites`) evita problemas de CORS en desarrollo.
- Las fechas en el modelo `Prestamo` son `String(20)`, enviar `YYYY-MM-DD` no ISO completo.
- `toBackendId()` devuelve `0` si el ID no tiene dígitos; validar antes de usar.
- La sesión de auth es solo en memoria; se pierde al recargar.
- Si se agrega autenticación JWT, hay que agregar header `Authorization` en `getHeaders()` de `api.ts`.
