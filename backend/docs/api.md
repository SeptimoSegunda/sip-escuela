# SIP-Escuela API - Documentación

## Qué es esto

Una API REST para gestionar una biblioteca escolar: libros, préstamos a socios, autores, editoriales y usuarios del sistema.

## Cómo funciona

```
Navegador/App → HTTP Request → FastAPI (routes) → SQLAlchemy (queries) → PostgreSQL
```

---

## Los 4 archivos

### `config.py` - Conexión a la DB

```python
# Lee las variables del .env (DATABASE_URL, SECRET_KEY, DEBUG)
settings = get_settings()

# Crea la conexión a PostgreSQL
engine = create_engine(settings.DATABASE_URL)

# Fábrica de sesiones (cada request usa una)
SessionLocal = sessionmaker(bind=engine)

# Base para todos los modelos ORM
class Base(DeclarativeBase): pass

# Dependencia de FastAPI: abre sesión, la usa, la cierra
def get_db():
    db = SessionLocal()
    try:
        yield db  # ← entrega la sesión al endpoint
    finally:
        db.close()  # ← siempre cierra
```

### `models.py` - Las tablas de la DB

Cada clase = una tabla. Los tipos `Mapped[T]` definen columnas:

```python
class Socio(Base):
    __tablename__ = "socios"
    id: Mapped[int]           # Columna entera, primary key
    nombre: Mapped[str]       # Columna texto, obligatoria
    email: Mapped[str]        # Columna texto, única
    tipo: Mapped[str]         # docente | alumno | otro
    created_at: Mapped[datetime]  # Se llena solo al crear
    updated_at: Mapped[datetime]  # Se actualiza solo

class Libro(Base):
    __tablename__ = "libros"
    titulo: Mapped[str]
    id_editorial: Mapped[int | None] = mapped_column(ForeignKey("editorial.id"))
    #  ↑ FK = referencia a otra tabla (nullable = puede ser null)
```

**Relaciones entre tablas:**
```
Libro ──id_autor──→ Autor
Libro ──id_editorial──→ Editorial
Prestamo ──id_libro──→ Libro (nullable)
Prestamo ──id_usuario──→ Usuario
Prestamo ──id_socio──→ Socio
```


### `schemas.py` - Validación de datos

Define qué datos **entran** y **salen** de la API:

```python
class LibroCreate(BaseModel):
    titulo: str          # Obligatorio
    isbn: str | None     # Opcional
    id_autor: int | None # Opcional

class LibroResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)  # ← convierte ORM a JSON
    id: int              # Siempre se incluye en la respuesta
    titulo: str
    # ... todos los campos
```

**Por qué 3 por entidad:** `Create` (POST), `Update` (PUT, todo opcional), `Response` (lo que devuelve la API).

### `main.py` - La API completa

Cada endpoint sigue el mismo patrón:

```python
@app.get("/api/libros/", response_model=list[LibroResponse])
def listar_libros(db: Session = Depends(get_db)):
    return db.query(Libro).all()
#      ↑ query SQL     ↑ tabla    ↑ todos los registros

@app.get("/api/libros/{libro_id}", response_model=LibroResponse)
def obtener_libro(libro_id: int, db: Session = Depends(get_db)):
    libro = db.query(Libro).filter(Libro.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return libro

@app.post("/api/libros/", response_model=LibroResponse, status_code=201)
def crear_libro(data: LibroCreate, db: Session = Depends(get_db)):
    libro = Libro(**data.model_dump())  # ← desempaqueta el dict en columnas
    db.add(libro)
    db.commit()          # ← ejecuta el INSERT
    db.refresh(libro)    # ← recarga el id y campos auto-generados
    return libro

@app.put("/api/libros/{libro_id}", ...)
def actualizar_libro(libro_id: int, data: LibroUpdate, db: Session = Depends(get_db)):
    libro = db.query(Libro).filter(Libro.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(libro, key, value)  # ← solo actualiza campos enviados
    db.commit()
    db.refresh(libro)
    return libro

@app.delete("/api/libros/{libro_id}")
def eliminar_libro(libro_id: int, db: Session = Depends(get_db)):
    libro = db.query(Libro).filter(Libro.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    db.delete(libro)
    db.commit()
    return {"detail": "Libro eliminado"}
```

---

## Endpoints disponibles (35 total)

| Método | Ruta | Qué hace |
|---|---|---|
| `GET` | `/api/socios/` | Lista todos los socios |
| `GET` | `/api/socios/{id}` | Obtiene un socio |
| `POST` | `/api/socios/` | Crea un socio |
| `PUT` | `/api/socios/{id}` | Actualiza un socio |
| `DELETE` | `/api/socios/{id}` | Elimina un socio |
| `GET` | `/api/autores/` | Lista todos los autores |
| `GET` | `/api/autores/{id}` | Obtiene un autor |
| `POST` | `/api/autores/` | Crea un autor |
| `PUT` | `/api/autores/{id}` | Actualiza un autor |
| `DELETE` | `/api/autores/{id}` | Elimina un autor |
| `GET` | `/api/editoriales/` | Lista todas las editoriales |
| `GET` | `/api/editoriales/{id}` | Obtiene una editorial |
| `POST` | `/api/editoriales/` | Crea una editorial |
| `PUT` | `/api/editoriales/{id}` | Actualiza una editorial |
| `DELETE` | `/api/editoriales/{id}` | Elimina una editorial |
| `GET` | `/api/libros/` | Lista todos los libros |
| `GET` | `/api/libros/{id}` | Obtiene un libro |
| `POST` | `/api/libros/` | Crea un libro |
| `PUT` | `/api/libros/{id}` | Actualiza un libro |
| `DELETE` | `/api/libros/{id}` | Elimina un libro |
| `GET` | `/api/prestamos/` | Lista todos los préstamos |
| `GET` | `/api/prestamos/{id}` | Obtiene un préstamo |
| `POST` | `/api/prestamos/` | Crea un préstamo |
| `PUT` | `/api/prestamos/{id}` | Actualiza un préstamo |
| `DELETE` | `/api/prestamos/{id}` | Elimina un préstamo |
| `GET` | `/api/usuarios/` | Lista todos los usuarios |
| `GET` | `/api/usuarios/{id}` | Obtiene un usuario |
| `POST` | `/api/usuarios/` | Crea un usuario |
| `PUT` | `/api/usuarios/{id}` | Actualiza un usuario |
| `DELETE` | `/api/usuarios/{id}` | Elimina un usuario |

---

## Ejemplos de requests

**Crear un libro:**
```bash
curl -X POST http://localhost:8000/api/libros/ \
  -H "Content-Type: application/json" \
  -d '{
    "titulo": "Don Quijote de la Mancha",
    "isbn": "978-84-376-0494-7",
    "cantidad": 3,
    "id_autor": 1,
    "id_editorial": 1
  }'
```

**Crear un préstamo (libro):**
```bash
curl -X POST http://localhost:8000/api/prestamos/ \
  -H "Content-Type: application/json" \
  -d '{
    "id_prestamo": "PRE-001",
    "fecha_prestamo": "2026-08-26",
    "fecha_limite": "2026-09-10",
    "estado": "activo",
    "id_usuario": 1,
    "id_libro": 1,
    "id_socio": 1
  }'
```

Swagger UI disponible en: `http://localhost:8000/docs`
