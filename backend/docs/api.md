# SIP-Escuela API — Documentación

API REST para gestionar una biblioteca escolar: libros, ejemplares, préstamos, daños, socios y auditoría.

```
Cliente → HTTP → FastAPI → SQLAlchemy → PostgreSQL
```

---

## Modelo de datos

| Tabla | Descripción |
|---|---|
| `usuarios` | Los 2 turnos fijos: `mañana` y `tarde`. |
| `socios` | Personas que piden préstamos. `dni` obligatorio y único; `email` opcional. |
| `autor` | Catálogo de autores (único por nombre, case-insensitive). |
| `editorial` | Catálogo de editoriales (único por nombre, case-insensitive). |
| `libros` | Metadatos del título (AGUAPEY). Autor y editorial por FK. |
| `copias` | Ejemplares físicos de un libro: inventario, clasificación, signatura, modalidad y estado. |
| `prestamo` | Préstamo de **una copia concreta** a un socio. |
| `danos` | Daño registrado sobre **una copia concreta**. |
| `auditoria` | Log automático de POST/PUT/PATCH/DELETE. |

### Relaciones

```
libros.id_autor      → autor.id
libros.id_editorial  → editorial.id
copias.libro_id      → libros.id
prestamo.copia_id    → copias.id      (el libro se obtiene desde la copia)
prestamo.id_socio    → socios.id
prestamo.id_usuario  → usuarios.id
danos.copia_id       → copias.id
danos.socio_id       → socios.id
danos.id_usuario     → usuarios.id
auditoria.id_usuario → usuarios.id    (ON DELETE SET NULL)
```

### Reglas de negocio

- Un préstamo y un daño siempre apuntan a un **ejemplar** (`copia_id`), no a un título.
- Al crear un préstamo, la copia pasa a `prestado`; al devolverlo, vuelve a `disponible`.
- No se puede prestar una copia que no esté `disponible`.
- `turno` **no se guarda** en préstamos, daños ni auditoría: se deriva de `id_usuario`.
- El usuario responsable se obtiene del header `X-Active-Shift`.
- `id_usuario` se inyecta automáticamente; no se envía en el body.
- Los estados están validados con `CHECK` en la base y con `Literal` en Pydantic.

---

## Endpoints

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/socios/` | Lista socios (`?q=` opcional) |
| `GET` | `/api/socios/{id}` | Obtiene un socio |
| `POST` | `/api/socios/` | Crea un socio |
| `PUT` | `/api/socios/{id}` | Actualiza un socio |
| `DELETE` | `/api/socios/{id}` | Elimina un socio |
| `GET` | `/api/autores/` | Lista autores (`?q=` opcional) |
| `GET` | `/api/autores/{id}` | Obtiene un autor |
| `POST` | `/api/autores/` | Crea o reutiliza un autor (idempotente: 201 nuevo / 200 existente) |
| `PUT` | `/api/autores/{id}` | Actualiza un autor |
| `DELETE` | `/api/autores/{id}` | Elimina un autor (409 si está en uso) |
| `GET` | `/api/editoriales/` | Lista editoriales (`?q=` opcional) |
| `GET` | `/api/editoriales/{id}` | Obtiene una editorial |
| `POST` | `/api/editoriales/` | Crea o reutiliza una editorial (201/200) |
| `PUT` | `/api/editoriales/{id}` | Actualiza una editorial |
| `DELETE` | `/api/editoriales/{id}` | Elimina una editorial (409 si está en uso) |
| `GET` | `/api/libros/` | Lista libros (`?q=` por título, autor, ISBN, serie o materias) |
| `GET` | `/api/libros/{id}` | Obtiene un libro con autor, editorial y copias |
| `POST` | `/api/libros/` | Crea un libro |
| `PUT` | `/api/libros/{id}` | Actualiza un libro |
| `DELETE` | `/api/libros/{id}` | Elimina un libro (409 si tiene copias) |
| `GET` | `/api/copias/` | Lista copias (`?libro_id=` opcional) |
| `POST` | `/api/copias/` | Crea una copia |
| `PUT` | `/api/copias/{id}` | Actualiza una copia |
| `DELETE` | `/api/copias/{id}` | Elimina una copia |
| `GET` | `/api/prestamos/` | Lista préstamos (`?estado=`, `?socio_id=`) |
| `GET` | `/api/prestamos/{id}` | Obtiene un préstamo |
| `POST` | `/api/prestamos/` | Crea un préstamo |
| `PUT` | `/api/prestamos/{id}` | Actualiza / devuelve un préstamo |
| `DELETE` | `/api/prestamos/{id}` | Elimina un préstamo |
| `GET` | `/api/danos/` | Lista daños |
| `POST` | `/api/danos/` | Registra un daño |
| `PUT` | `/api/danos/{id}` | Actualiza un daño |
| `DELETE` | `/api/danos/{id}` | Elimina un daño |
| `GET` | `/api/usuarios/` | Lista usuarios/turnos |
| `GET` | `/api/usuarios/{id}` | Obtiene un usuario |
| `POST` | `/api/usuarios/` | Crea un usuario/turno |
| `PUT` | `/api/usuarios/{id}` | Actualiza un usuario |
| `DELETE` | `/api/usuarios/{id}` | Elimina un usuario |
| `GET` | `/api/auditoria/` | Lista el log (`?skip=&limit=`) |
| `GET` | `/api/turno/actual` | Devuelve el turno del header |
| `GET` | `/api/turno/validar` | Valida un cambio de turno |

---

## Flujo recomendado para crear un libro

El frontend debe:

1. Llamar a `POST /api/autores/` con el nombre del autor.
2. Llamar a `POST /api/editoriales/` con el nombre de la editorial.
3. Usar los `id` devueltos en `POST /api/libros/`.

Ambos endpoints son **idempotentes**: si el nombre ya existe devuelven `200` con el registro existente; si no, `201`.

También se puede mandar `autor` y `editorial` como texto en el libro; el backend los crea/reutiliza automáticamente.

---

## Ejemplos

### Crear socio
```bash
curl -X POST http://localhost:8000/api/socios/ \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Lucía",
    "apellido": "González",
    "dni": "40123456",
    "email": "lucia@edu.ar",
    "tipo": "estudiante"
  }'
```

### Crear autor y editorial
```bash
curl -X POST http://localhost:8000/api/autores/ \
  -H "Content-Type: application/json" \
  -d '{"nombre_apellido": "Julio Cortázar"}'

curl -X POST http://localhost:8000/api/editoriales/ \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Sudamericana"}'
```

### Crear libro
```bash
curl -X POST http://localhost:8000/api/libros/ \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Rayuela",
    "id_autor": 1,
    "id_editorial": 1,
    "anio_publicacion": 1963,
    "isbn": "978-950-511-356-9",
    "paginas": 600,
    "idioma": "español"
  }'
```

### Crear copia
```bash
curl -X POST http://localhost:8000/api/copias/ \
  -H "Content-Type: application/json" \
  -d '{
    "libro_id": 1,
    "inventario_num": "007242",
    "clasificacion": "82-31",
    "signatura": "COR",
    "modalidad": "domicilio"
  }'
```

### Crear préstamo
```bash
curl -X POST http://localhost:8000/api/prestamos/ \
  -H "Content-Type: application/json" \
  -H "X-Active-Shift: mañana" \
  -d '{
    "id_prestamo": "PRE-001",
    "fecha_prestamo": "2026-11-12",
    "fecha_limite": "2026-11-26",
    "id_socio": 1,
    "copia_id": 1
  }'
```

### Devolver préstamo
```bash
curl -X PUT http://localhost:8000/api/prestamos/1 \
  -H "Content-Type: application/json" \
  -d '{"estado": "devuelto"}'
```

### Registrar daño
```bash
curl -X POST http://localhost:8000/api/danos/ \
  -H "Content-Type: application/json" \
  -H "X-Active-Shift: mañana" \
  -d '{
    "copia_id": 1,
    "socio_id": 1,
    "severidad": "leve",
    "descripcion": "Rastro de agua en la página 10"
  }'
```

---

## Puesta en marcha

```powershell
cd backend

# 1. Recrear el esquema (borra todos los datos)
python reset_db.py

# 2. Sembrar los 2 turnos
python seed.py

# 3. Importar el Excel AGUAPEY (709 libros, 2200 ejemplares)
python import_aguapey.py

# 4. Levantar la API
python -m uvicorn app.main:app --reload --port 8000

# 5. En otra terminal: tests
python test_api.py
```

Swagger UI: `http://localhost:8000/docs`

---

## Nota sobre Alembic

El esquema se crea desde `models.py` con `reset_db.py`, **no** con migraciones. La tabla `alembic_version` conserva la última revisión histórica (`2_add_prestamo_campos`) y queda desincronizada a propósito. Si en el futuro se retoman las migraciones, hay que generar una revisión baseline.
