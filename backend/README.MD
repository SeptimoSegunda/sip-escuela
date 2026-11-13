# SIP-Escuela — Backend

API REST para la gestión de una biblioteca escolar: catálogo de libros y ejemplares, socios, préstamos, daños, turnos y auditoría.

**Stack:** Python 3.13 · FastAPI · SQLAlchemy 2 · PostgreSQL 17 · Pydantic v2

---

## Estructura

```
backend/
├── app/
│   ├── main.py               # Endpoints de la API
│   ├── models.py             # Tablas SQLAlchemy
│   ├── schemas.py            # Validación de entrada/salida (Pydantic)
│   ├── config.py             # Conexión a PostgreSQL
│   ├── dependencies.py       # Validación del turno (X-Active-Shift)
│   └── middleware/
│       └── auditoria.py      # Log automático de mutaciones
├── alembic/                  # Migraciones (histórico)
├── database/
│   ├── backups/              # Respaldos
│   └── seed/aguapey_db.xlsx  # Fuente de libros y ejemplares
├── docs/api.md               # Documentación de endpoints
├── import_aguapey.py         # Importador del Excel AGUAPEY
├── reset_db.py               # Recrea el esquema desde models.py
├── seed.py                   # Siembra los 2 turnos
├── test_api.py               # Suite de pruebas (55 casos)
├── .env                      # Variables de desarrollo
└── requirements.txt
```

---

## Requisitos

- Python 3.13+
- PostgreSQL 17+
- Base de datos llamada `sip_escuela`

---

## Configuración

### 1. Crear la base

```sql
CREATE DATABASE sip_escuela;
```

### 2. Variables de entorno

El archivo `.env` incluido es **de desarrollo**:

```env
DATABASE_URL=postgresql+psycopg://postgres:admin@localhost:5432/sip_escuela
SECRET_KEY=cambiar_en_produccion_clave_secreta_12345
DEBUG=True
```

> En producción, cambiá usuario, contraseña y `SECRET_KEY`.

### 3. Instalar dependencias

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
```

---

## Puesta en marcha

```powershell
cd backend

# 1. Recrear el esquema (borra todos los datos)
python reset_db.py

# 2. Sembrar los 2 turnos (mañana y tarde)
python seed.py

# 3. Importar el catálogo AGUAPEY (709 libros / 2.200 ejemplares)
python import_aguapey.py

# 4. Levantar la API
python -m uvicorn app.main:app --reload --port 8000
```

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Reimportar el catálogo

```powershell
python import_aguapey.py --force
```

`--force` borra préstamos, daños, copias, libros, autores y editoriales antes de importar.

---

## Tests

Con el servidor levantado en el puerto 8000:

```powershell
python test_api.py
```

Resultado esperado: **55/55 OK**.

Para probar contra otro puerto:

```powershell
$env:SIP_API_URL="http://127.0.0.1:8001"
python test_api.py
```

Los tests crean y eliminan sus propios registros.

---

## Modelo de datos

| Tabla | Descripción |
|---|---|
| `usuarios` | Turnos fijos: `mañana` y `tarde` |
| `socios` | Personas que piden préstamos (`dni` único, `email` opcional) |
| `autor` | Catálogo de autores (único por nombre) |
| `editorial` | Catálogo de editoriales (único por nombre) |
| `libros` | Metadatos del título (formato AGUAPEY) |
| `copias` | Ejemplares físicos: inventario, clasificación, signatura, modalidad y estado |
| `prestamo` | Préstamo de una copia concreta a un socio |
| `danos` | Daño registrado sobre una copia concreta |
| `auditoria` | Log automático de POST/PUT/PATCH/DELETE |

### Relaciones

```
libros.id_autor      → autor.id
libros.id_editorial  → editorial.id
copias.libro_id      → libros.id
prestamo.copia_id    → copias.id
prestamo.id_socio    → socios.id
prestamo.id_usuario  → usuarios.id
danos.copia_id       → copias.id
danos.socio_id       → socios.id
danos.id_usuario     → usuarios.id
auditoria.id_usuario → usuarios.id
```

---

## Reglas de negocio

- Un préstamo y un daño apuntan a un **ejemplar** (`copia_id`), no a un título.
- Al crear un préstamo, la copia pasa a `prestado`; al devolverlo, vuelve a `disponible`.
- No se puede prestar una copia que no esté `disponible`.
- `turno` no se guarda en préstamos, daños ni auditoría: se deriva de `id_usuario`.
- El usuario responsable se obtiene del header `X-Active-Shift`.
- Estados validados con `CHECK` en la base y `Literal` en Pydantic:
  - copia: `disponible`, `prestado`, `dañado`, `perdido`
  - préstamo: `prestado`, `devuelto`, `moroso`
  - severidad: `leve`, `moderado`, `catastrofico`
  - socio: `estudiante`, `docente`, `otro`
  - idioma: `español`, `inglés`

### Header de turno

Todas las peticiones que crean préstamos o daños deben enviar:

```http
X-Active-Shift: mañana
```

También se acepta `manana` (sin acento). Valores inválidos devuelven `400`.

---

## Autores y editoriales al crear libros

Los endpoints son **idempotentes**:

- `POST /api/autores/` → `201` si lo crea, `200` si ya existe.
- `POST /api/editoriales/` → `201` si la crea, `200` si ya existe.

Flujo recomendado:

1. `POST /api/autores/` con `{"nombre_apellido": "Julio Cortázar"}`.
2. `POST /api/editoriales/` con `{"nombre": "Sudamericana"}`.
3. `POST /api/libros/` con `id_autor` e `id_editorial`.

También se puede enviar `autor` y `editorial` como texto en el libro y el backend los crea/reutiliza.

Ejemplo:

```bash
curl -X POST http://localhost:8000/api/libros/ \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Rayuela",
    "autor": "Julio Cortázar",
    "editorial": "Sudamericana",
    "anio_publicacion": 1963,
    "paginas": 600,
    "idioma": "español"
  }'
```

---

## Importación AGUAPEY

`import_aguapey.py` lee `database/seed/aguapey_db.xlsx` (hojas `Libros` y `Ejemplares`) sin dependencias externas.

Reglas aplicadas:

| Dato | Regla |
|---|---|
| Año | Se extrae el primer año de 4 dígitos; `s/f` → NULL |
| Páginas | Se extrae el primer número (`192 p.` → 192) |
| ISBN | UNIQUE; la primera aparición se conserva, las repetidas → NULL |
| Inventario | UNIQUE; la primera aparición se conserva, las repetidas → NULL |
| Idioma | Solo `español`/`inglés`; otro valor → NULL |
| Modalidad | `domicilio`/`sala`/`no disponible`; otro valor → NULL |
| Autor/editorial | Se crean o reutilizan por nombre |

Para usar otro archivo:

```powershell
python import_aguapey.py --archivo "C:\ruta\otro.xlsx"
```

---

## Migraciones (Alembic)

El esquema se crea con `reset_db.py` a partir de `models.py`.

La tabla `alembic_version` conserva la última revisión histórica (`2_add_prestamo_campos`) y **no refleja** el esquema actual. Esto es intencional para esta etapa de MVP.

Si en el futuro se quieren migraciones reproducibles:

1. Generar una revisión baseline contra una base vacía.
2. Aplicar `alembic stamp head` sobre la base existente.
3. Usar `alembic upgrade head` en entornos nuevos.

---

## Respaldos

- `database/backups/pre_reset_2026-11-12.json`: respaldo lógico previo al reset (uso local).
- Para respaldos reales se recomienda `pg_dump`:

```powershell
pg_dump -U postgres -d sip_escuela -F c -f database/backups/sip_escuela.dump
```

---

## Documentación adicional

- [`docs/api.md`](docs/api.md): endpoints, ejemplos y contrato para el frontend.
- Swagger generado automáticamente en `/docs`.
