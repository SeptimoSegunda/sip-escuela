from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime

from app.config import engine, Base, get_db
from app.models import Autor, Copia, Dano, Editorial, Libro, Prestamo, Socio, Usuario, Auditoria
from app.schemas import (
    AutorCreate, AutorUpdate, AutorResponse,
    CopiaCreate, CopiaUpdate, CopiaResponse,
    DanoCreate, DanoUpdate, DanoResponse,
    EditorialCreate, EditorialUpdate, EditorialResponse,
    LibroCreate, LibroUpdate, LibroResponse,
    PrestamoCreate, PrestamoUpdate, PrestamoResponse,
    SocioCreate, SocioUpdate, SocioResponse,
    UsuarioCreate, UsuarioUpdate, UsuarioResponse,
    UsuarioTurnoResponse, AuditoriaResponse,
)

# --- NUEVO: import middleware y dependencia ---
from app.middleware.auditoria import AuditoriaMiddleware
from app.dependencies import get_turno_actual

app = FastAPI(title="SIP-Escuela API", version="0.1.0")

# --- NUEVO: registrar middleware de auditoría ---
app.add_middleware(AuditoriaMiddleware)

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


# ── Socios ──────────────────────────────────────────────

@app.get("/api/socios/", response_model=list[SocioResponse])
def listar_socios(db: Session = Depends(get_db)):
    return db.query(Socio).all()


@app.get("/api/socios/{socio_id}", response_model=SocioResponse)
def obtener_socio(socio_id: int, db: Session = Depends(get_db)):
    socio = db.query(Socio).filter(Socio.id == socio_id).first()
    if not socio:
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    return socio


@app.post("/api/socios/", response_model=SocioResponse, status_code=201)
def crear_socio(data: SocioCreate, db: Session = Depends(get_db)):
    socio = Socio(**data.model_dump())
    db.add(socio)
    db.commit()
    db.refresh(socio)
    return socio


@app.put("/api/socios/{socio_id}", response_model=SocioResponse)
def actualizar_socio(socio_id: int, data: SocioUpdate, db: Session = Depends(get_db)):
    socio = db.query(Socio).filter(Socio.id == socio_id).first()
    if not socio:
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(socio, key, value)
    db.commit()
    db.refresh(socio)
    return socio


@app.delete("/api/socios/{socio_id}")
def eliminar_socio(socio_id: int, db: Session = Depends(get_db)):
    socio = db.query(Socio).filter(Socio.id == socio_id).first()
    if not socio:
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    db.delete(socio)
    db.commit()
    return {"detail": "Socio eliminado"}


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


# ── Copias ──────────────────────────────────────────────

@app.get("/api/copias/", response_model=list[CopiaResponse])
def listar_copias(db: Session = Depends(get_db)):
    return db.query(Copia).all()


@app.post("/api/copias/", response_model=CopiaResponse, status_code=201)
def crear_copia(data: CopiaCreate, db: Session = Depends(get_db)):
    copia = Copia(**data.model_dump())
    db.add(copia)
    db.commit()
    db.refresh(copia)
    return copia


@app.put("/api/copias/{copia_id}", response_model=CopiaResponse)
def actualizar_copia(copia_id: int, data: CopiaUpdate, db: Session = Depends(get_db)):
    copia = db.query(Copia).filter(Copia.id == copia_id).first()
    if not copia:
        raise HTTPException(status_code=404, detail="Copia no encontrada")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(copia, key, value)
    db.commit()
    db.refresh(copia)
    return copia


@app.delete("/api/copias/{copia_id}")
def eliminar_copia(copia_id: int, db: Session = Depends(get_db)):
    copia = db.query(Copia).filter(Copia.id == copia_id).first()
    if not copia:
        raise HTTPException(status_code=404, detail="Copia no encontrada")
    db.delete(copia)
    db.commit()
    return {"detail": "Copia eliminada"}


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
def crear_prestamo(
    data: PrestamoCreate,
    usuario: Usuario = Depends(get_turno_actual),   # ← inyecta el usuario del turno actual
    db: Session = Depends(get_db)
):
    # data.id_usuario y turno vienen del frontend, pero los sobrescribimos con el turno real del header
    prestamo_data = data.model_dump(exclude_unset=True)
    prestamo_data["id_usuario"] = usuario.id
    prestamo_data["turno"] = usuario.turno
    prestamo = Prestamo(**prestamo_data)
    db.add(prestamo)
    db.commit()
    db.refresh(prestamo)
    return prestamo


@app.put("/api/prestamos/{prestamo_id}", response_model=PrestamoResponse)
def actualizar_prestamo(prestamo_id: int, data: PrestamoUpdate, db: Session = Depends(get_db)):
    print(f">>> [DEVOLUCION] Llegó petición para prestamo_id={prestamo_id}, datos={data.model_dump(exclude_unset=True)}")
    prestamo = db.query(Prestamo).filter(Prestamo.id == prestamo_id).first()
    if not prestamo:
        print(f">>> [DEVOLUCION] Préstamo {prestamo_id} NO encontrado en BD")
        raise HTTPException(status_code=404, detail="Prestamo no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(prestamo, key, value)
    db.commit()
    db.refresh(prestamo)
    print(f">>> [DEVOLUCION] Éxito: prestamo_id={prestamo.id} estado={prestamo.estado} fecha_devolucion={prestamo.fecha_devolucion}")
    return prestamo


@app.delete("/api/prestamos/{prestamo_id}")
def eliminar_prestamo(prestamo_id: int, db: Session = Depends(get_db)):
    prestamo = db.query(Prestamo).filter(Prestamo.id == prestamo_id).first()
    if not prestamo:
        raise HTTPException(status_code=404, detail="Prestamo no encontrado")
    db.delete(prestamo)
    db.commit()
    return {"detail": "Prestamo eliminado"}


# ── Danos ───────────────────────────────────────────────

@app.get("/api/danos/", response_model=list[DanoResponse])
def listar_danos(db: Session = Depends(get_db)):
    return db.query(Dano).all()


@app.post("/api/danos/", response_model=DanoResponse, status_code=201)
def crear_dano(
    data: DanoCreate,
    usuario: Usuario = Depends(get_turno_actual),
    db: Session = Depends(get_db)
):
    dano_data = data.model_dump()
    dano_data["turno"] = usuario.turno
    dano = Dano(**dano_data)
    db.add(dano)
    db.commit()
    db.refresh(dano)
    return dano


@app.put("/api/danos/{dano_id}", response_model=DanoResponse)
def actualizar_dano(dano_id: int, data: DanoUpdate, db: Session = Depends(get_db)):
    dano = db.query(Dano).filter(Dano.id == dano_id).first()
    if not dano:
        raise HTTPException(status_code=404, detail="Daño no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(dano, key, value)
    db.commit()
    db.refresh(dano)
    return dano


@app.delete("/api/danos/{dano_id}")
def eliminar_dano(dano_id: int, db: Session = Depends(get_db)):
    dano = db.query(Dano).filter(Dano.id == dano_id).first()
    if not dano:
        raise HTTPException(status_code=404, detail="Daño no encontrado")
    db.delete(dano)
    db.commit()
    return {"detail": "Daño eliminado"}


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


# --- NUEVO: Auditoría ---
@app.get("/api/auditoria/", response_model=list[AuditoriaResponse])
def listar_auditoria(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    return db.query(Auditoria).order_by(Auditoria.created_at.desc()).offset(skip).limit(limit).all()


# --- NUEVO: Endpoint para obtener el turno actual (útil para frontend) ---
@app.get("/api/turno/actual", response_model=UsuarioTurnoResponse)
def obtener_turno_actual(usuario: Usuario = Depends(get_turno_actual)):
    """
    Devuelve info del turno actual basado en el header X-Active-Shift.
    El frontend puede usarlo para mostrar 'Turno Mañana' / 'Turno Tarde'.
    """
    return usuario


# --- NUEVO: Endpoint validar cambio de turno (opcional) ---
@app.get("/api/turno/validar")
def validar_cambio(turno_nuevo: str, usuario_actual: Usuario = Depends(get_turno_actual)):
    """
    Frontend llama antes de hacer el switch.
    Reglas de negocio: ej. no permitir 'tarde' antes de las 13:00.
    """
    turno_nuevo = turno_nuevo.lower().strip()
    if turno_nuevo not in ("mañana", "tarde"):
        return {"permitido": False, "motivo": "Turno inválido"}

    ahora = datetime.now().hour
    if turno_nuevo == "tarde" and ahora < 13:
        return {"permitido": False, "motivo": "El turno tarde empieza a las 13:00"}
    if turno_nuevo == "mañana" and ahora >= 13:
        return {"permitido": False, "motivo": "El turno mañana terminó a las 13:00"}

    return {"permitido": True}


@app.on_event("startup")
def startup():
    print(">>> [STARTUP] SIP-Escuela API arrancada y escuchando")
    Base.metadata.create_all(bind=engine)
