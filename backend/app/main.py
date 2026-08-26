from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.config import engine, Base, get_db
from app.models import Alumno, Autor, Editorial, Libro, Notebook, Prestamo, Usuario
from app.schemas import (
    AlumnoCreate, AlumnoUpdate, AlumnoResponse,
    AutorCreate, AutorUpdate, AutorResponse,
    EditorialCreate, EditorialUpdate, EditorialResponse,
    LibroCreate, LibroUpdate, LibroResponse,
    NotebookCreate, NotebookUpdate, NotebookResponse,
    PrestamoCreate, PrestamoUpdate, PrestamoResponse,
    UsuarioCreate, UsuarioUpdate, UsuarioResponse,
)

app = FastAPI(title="SIP-Escuela API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "SIP-Escuela API funcionando"}


# ── Alumnos ─────────────────────────────────────────────

@app.get("/api/alumnos/", response_model=list[AlumnoResponse])
def listar_alumnos(db: Session = Depends(get_db)):
    return db.query(Alumno).all()


@app.get("/api/alumnos/{alumno_id}", response_model=AlumnoResponse)
def obtener_alumno(alumno_id: int, db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    return alumno


@app.post("/api/alumnos/", response_model=AlumnoResponse, status_code=201)
def crear_alumno(data: AlumnoCreate, db: Session = Depends(get_db)):
    alumno = Alumno(**data.model_dump())
    db.add(alumno)
    db.commit()
    db.refresh(alumno)
    return alumno


@app.put("/api/alumnos/{alumno_id}", response_model=AlumnoResponse)
def actualizar_alumno(alumno_id: int, data: AlumnoUpdate, db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(alumno, key, value)
    db.commit()
    db.refresh(alumno)
    return alumno


@app.delete("/api/alumnos/{alumno_id}")
def eliminar_alumno(alumno_id: int, db: Session = Depends(get_db)):
    alumno = db.query(Alumno).filter(Alumno.id == alumno_id).first()
    if not alumno:
        raise HTTPException(status_code=404, detail="Alumno no encontrado")
    db.delete(alumno)
    db.commit()
    return {"detail": "Alumno eliminado"}


# ── Autores ─────────────────────────────────────────────

@app.get("/api/autores/", response_model=list[AutorResponse])
def listar_autores(db: Session = Depends(get_db)):
    return db.query(Autor).all()


@app.get("/api/autores/{autor_id}", response_model=AutorResponse)
def obtener_autor(autor_id: int, db: Session = Depends(get_db)):
    autor = db.query(Autor).filter(Autor.id == autor_id).first()
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    return autor


@app.post("/api/autores/", response_model=AutorResponse, status_code=201)
def crear_autor(data: AutorCreate, db: Session = Depends(get_db)):
    autor = Autor(**data.model_dump())
    db.add(autor)
    db.commit()
    db.refresh(autor)
    return autor


@app.put("/api/autores/{autor_id}", response_model=AutorResponse)
def actualizar_autor(autor_id: int, data: AutorUpdate, db: Session = Depends(get_db)):
    autor = db.query(Autor).filter(Autor.id == autor_id).first()
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(autor, key, value)
    db.commit()
    db.refresh(autor)
    return autor


@app.delete("/api/autores/{autor_id}")
def eliminar_autor(autor_id: int, db: Session = Depends(get_db)):
    autor = db.query(Autor).filter(Autor.id == autor_id).first()
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    db.delete(autor)
    db.commit()
    return {"detail": "Autor eliminado"}


# ── Editoriales ─────────────────────────────────────────

@app.get("/api/editoriales/", response_model=list[EditorialResponse])
def listar_editoriales(db: Session = Depends(get_db)):
    return db.query(Editorial).all()


@app.get("/api/editoriales/{editorial_id}", response_model=EditorialResponse)
def obtener_editorial(editorial_id: int, db: Session = Depends(get_db)):
    editorial = db.query(Editorial).filter(Editorial.id == editorial_id).first()
    if not editorial:
        raise HTTPException(status_code=404, detail="Editorial no encontrada")
    return editorial


@app.post("/api/editoriales/", response_model=EditorialResponse, status_code=201)
def crear_editorial(data: EditorialCreate, db: Session = Depends(get_db)):
    editorial = Editorial(**data.model_dump())
    db.add(editorial)
    db.commit()
    db.refresh(editorial)
    return editorial


@app.put("/api/editoriales/{editorial_id}", response_model=EditorialResponse)
def actualizar_editorial(editorial_id: int, data: EditorialUpdate, db: Session = Depends(get_db)):
    editorial = db.query(Editorial).filter(Editorial.id == editorial_id).first()
    if not editorial:
        raise HTTPException(status_code=404, detail="Editorial no encontrada")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(editorial, key, value)
    db.commit()
    db.refresh(editorial)
    return editorial


@app.delete("/api/editoriales/{editorial_id}")
def eliminar_editorial(editorial_id: int, db: Session = Depends(get_db)):
    editorial = db.query(Editorial).filter(Editorial.id == editorial_id).first()
    if not editorial:
        raise HTTPException(status_code=404, detail="Editorial no encontrada")
    db.delete(editorial)
    db.commit()
    return {"detail": "Editorial eliminada"}


# ── Libros ──────────────────────────────────────────────

@app.get("/api/libros/", response_model=list[LibroResponse])
def listar_libros(db: Session = Depends(get_db)):
    return db.query(Libro).all()


@app.get("/api/libros/{libro_id}", response_model=LibroResponse)
def obtener_libro(libro_id: int, db: Session = Depends(get_db)):
    libro = db.query(Libro).filter(Libro.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return libro


@app.post("/api/libros/", response_model=LibroResponse, status_code=201)
def crear_libro(data: LibroCreate, db: Session = Depends(get_db)):
    libro = Libro(**data.model_dump())
    db.add(libro)
    db.commit()
    db.refresh(libro)
    return libro


@app.put("/api/libros/{libro_id}", response_model=LibroResponse)
def actualizar_libro(libro_id: int, data: LibroUpdate, db: Session = Depends(get_db)):
    libro = db.query(Libro).filter(Libro.id == libro_id).first()
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(libro, key, value)
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


# ── Notebooks ───────────────────────────────────────────

@app.get("/api/notebooks/", response_model=list[NotebookResponse])
def listar_notebooks(db: Session = Depends(get_db)):
    return db.query(Notebook).all()


@app.get("/api/notebooks/{notebook_id}", response_model=NotebookResponse)
def obtener_notebook(notebook_id: int, db: Session = Depends(get_db)):
    notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook no encontrado")
    return notebook


@app.post("/api/notebooks/", response_model=NotebookResponse, status_code=201)
def crear_notebook(data: NotebookCreate, db: Session = Depends(get_db)):
    notebook = Notebook(**data.model_dump())
    db.add(notebook)
    db.commit()
    db.refresh(notebook)
    return notebook


@app.put("/api/notebooks/{notebook_id}", response_model=NotebookResponse)
def actualizar_notebook(notebook_id: int, data: NotebookUpdate, db: Session = Depends(get_db)):
    notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(notebook, key, value)
    db.commit()
    db.refresh(notebook)
    return notebook


@app.delete("/api/notebooks/{notebook_id}")
def eliminar_notebook(notebook_id: int, db: Session = Depends(get_db)):
    notebook = db.query(Notebook).filter(Notebook.id == notebook_id).first()
    if not notebook:
        raise HTTPException(status_code=404, detail="Notebook no encontrado")
    db.delete(notebook)
    db.commit()
    return {"detail": "Notebook eliminado"}


# ── Prestamos ───────────────────────────────────────────

@app.get("/api/prestamos/", response_model=list[PrestamoResponse])
def listar_prestamos(db: Session = Depends(get_db)):
    return db.query(Prestamo).all()


@app.get("/api/prestamos/{prestamo_id}", response_model=PrestamoResponse)
def obtener_prestamo(prestamo_id: int, db: Session = Depends(get_db)):
    prestamo = db.query(Prestamo).filter(Prestamo.id == prestamo_id).first()
    if not prestamo:
        raise HTTPException(status_code=404, detail="Prestamo no encontrado")
    return prestamo


@app.post("/api/prestamos/", response_model=PrestamoResponse, status_code=201)
def crear_prestamo(data: PrestamoCreate, db: Session = Depends(get_db)):
    prestamo = Prestamo(**data.model_dump())
    db.add(prestamo)
    db.commit()
    db.refresh(prestamo)
    return prestamo


@app.put("/api/prestamos/{prestamo_id}", response_model=PrestamoResponse)
def actualizar_prestamo(prestamo_id: int, data: PrestamoUpdate, db: Session = Depends(get_db)):
    prestamo = db.query(Prestamo).filter(Prestamo.id == prestamo_id).first()
    if not prestamo:
        raise HTTPException(status_code=404, detail="Prestamo no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(prestamo, key, value)
    db.commit()
    db.refresh(prestamo)
    return prestamo


@app.delete("/api/prestamos/{prestamo_id}")
def eliminar_prestamo(prestamo_id: int, db: Session = Depends(get_db)):
    prestamo = db.query(Prestamo).filter(Prestamo.id == prestamo_id).first()
    if not prestamo:
        raise HTTPException(status_code=404, detail="Prestamo no encontrado")
    db.delete(prestamo)
    db.commit()
    return {"detail": "Prestamo eliminado"}


# ── Usuarios ────────────────────────────────────────────

@app.get("/api/usuarios/", response_model=list[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).all()


@app.get("/api/usuarios/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@app.post("/api/usuarios/", response_model=UsuarioResponse, status_code=201)
def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    usuario = Usuario(**data.model_dump())
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


@app.put("/api/usuarios/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(usuario_id: int, data: UsuarioUpdate, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(usuario, key, value)
    db.commit()
    db.refresh(usuario)
    return usuario


@app.delete("/api/usuarios/{usuario_id}")
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return {"detail": "Usuario eliminado"}


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)
