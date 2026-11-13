from datetime import date, datetime

from fastapi import Depends, FastAPI, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.config import Base, engine, get_db
from app.models import (
    Auditoria,
    Autor,
    Copia,
    Dano,
    Editorial,
    Libro,
    Prestamo,
    Socio,
    Usuario,
)
from app.schemas import (
    AuditoriaResponse,
    AutorCreate,
    AutorResponse,
    AutorUpdate,
    CopiaCreate,
    CopiaResponse,
    CopiaUpdate,
    DanoCreate,
    DanoResponse,
    DanoUpdate,
    EditorialCreate,
    EditorialResponse,
    EditorialUpdate,
    LibroCreate,
    LibroResponse,
    LibroUpdate,
    PrestamoCreate,
    PrestamoResponse,
    PrestamoUpdate,
    SocioCreate,
    SocioResponse,
    SocioUpdate,
    UsuarioCreate,
    UsuarioResponse,
    UsuarioTurnoResponse,
    UsuarioUpdate,
)

from app.middleware.auditoria import AuditoriaMiddleware
from app.dependencies import get_turno_actual

app = FastAPI(title="SIP-Escuela API", version="0.2.0")

app.add_middleware(AuditoriaMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Helpers ─────────────────────────────────────────────

def _limpiar(valor: str | None) -> str | None:
    if valor is None:
        return None
    valor = " ".join(str(valor).split()).strip()
    return valor or None


def _get_or_create_autor(db: Session, nombre: str | None) -> Autor | None:
    nombre = _limpiar(nombre)
    if not nombre:
        return None
    existente = (
        db.query(Autor)
        .filter(func.lower(Autor.nombre_apellido) == nombre.lower())
        .first()
    )
    if existente:
        return existente
    autor = Autor(nombre_apellido=nombre, tipo_autor="escritor")
    db.add(autor)
    db.flush()
    return autor


def _get_or_create_editorial(db: Session, nombre: str | None) -> Editorial | None:
    nombre = _limpiar(nombre)
    if not nombre:
        return None
    existente = (
        db.query(Editorial)
        .filter(func.lower(Editorial.nombre) == nombre.lower())
        .first()
    )
    if existente:
        return existente
    editorial = Editorial(nombre=nombre)
    db.add(editorial)
    db.flush()
    return editorial


def _resolver_autor(
    db: Session, id_autor: int | None, nombre: str | None
) -> Autor | None:
    if id_autor is not None:
        autor = db.get(Autor, id_autor)
        if not autor:
            raise HTTPException(status_code=404, detail="Autor no encontrado")
        return autor
    return _get_or_create_autor(db, nombre)


def _resolver_editorial(
    db: Session, id_editorial: int | None, nombre: str | None
) -> Editorial | None:
    if id_editorial is not None:
        editorial = db.get(Editorial, id_editorial)
        if not editorial:
            raise HTTPException(status_code=404, detail="Editorial no encontrada")
        return editorial
    return _get_or_create_editorial(db, nombre)


@app.get("/")
def root():
    return {"message": "SIP-Escuela API funcionando"}


# ── Socios ──────────────────────────────────────────────

@app.get("/api/socios/", response_model=list[SocioResponse])
def listar_socios(q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Socio)
    if q:
        like = f"%{q.lower()}%"
        query = query.filter(
            or_(
                func.lower(Socio.nombre).like(like),
                func.lower(Socio.apellido).like(like),
                func.lower(Socio.dni).like(like),
                func.lower(Socio.email).like(like),
            )
        )
    return query.order_by(Socio.apellido, Socio.nombre).all()


@app.get("/api/socios/{socio_id}", response_model=SocioResponse)
def obtener_socio(socio_id: int, db: Session = Depends(get_db)):
    socio = db.get(Socio, socio_id)
    if not socio:
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    return socio


@app.post("/api/socios/", response_model=SocioResponse, status_code=201)
def crear_socio(data: SocioCreate, db: Session = Depends(get_db)):
    payload = data.model_dump()
    payload["dni"] = _limpiar(payload.get("dni"))
    payload["email"] = _limpiar(payload.get("email"))
    if not payload["dni"]:
        raise HTTPException(status_code=422, detail="El DNI es obligatorio")
    socio = Socio(**payload)
    db.add(socio)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Ya existe un socio con ese DNI o email"
        )
    db.refresh(socio)
    return socio


@app.put("/api/socios/{socio_id}", response_model=SocioResponse)
def actualizar_socio(
    socio_id: int, data: SocioUpdate, db: Session = Depends(get_db)
):
    socio = db.get(Socio, socio_id)
    if not socio:
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    payload = data.model_dump(exclude_unset=True)
    for campo in ("dni", "email"):
        if campo in payload:
            payload[campo] = _limpiar(payload[campo])
    if "dni" in payload and not payload["dni"]:
        raise HTTPException(status_code=422, detail="El DNI es obligatorio")
    for key, value in payload.items():
        setattr(socio, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Ya existe un socio con ese DNI o email"
        )
    db.refresh(socio)
    return socio


@app.delete("/api/socios/{socio_id}")
def eliminar_socio(socio_id: int, db: Session = Depends(get_db)):
    socio = db.get(Socio, socio_id)
    if not socio:
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    try:
        db.delete(socio)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="El socio tiene préstamos o daños asociados y no se puede eliminar",
        )
    return {"detail": "Socio eliminado"}


# ── Autores ─────────────────────────────────────────────

@app.get("/api/autores/", response_model=list[AutorResponse])
def listar_autores(q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Autor)
    if q:
        query = query.filter(
            func.lower(Autor.nombre_apellido).like(f"%{q.lower()}%")
        )
    return query.order_by(Autor.nombre_apellido).all()


@app.get("/api/autores/{autor_id}", response_model=AutorResponse)
def obtener_autor(autor_id: int, db: Session = Depends(get_db)):
    autor = db.get(Autor, autor_id)
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    return autor


@app.post("/api/autores/", response_model=AutorResponse)
def crear_autor(
    data: AutorCreate, response: Response, db: Session = Depends(get_db)
):
    """Idempotente: si el autor ya existe devuelve 200; si se crea, 201."""
    nombre = _limpiar(data.nombre_apellido)
    if not nombre:
        raise HTTPException(status_code=422, detail="nombre_apellido vacío")
    existente = (
        db.query(Autor)
        .filter(func.lower(Autor.nombre_apellido) == nombre.lower())
        .first()
    )
    if existente:
        response.status_code = 200
        return existente
    autor = Autor(nombre_apellido=nombre, tipo_autor=data.tipo_autor or "escritor")
    db.add(autor)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existente = (
            db.query(Autor)
            .filter(func.lower(Autor.nombre_apellido) == nombre.lower())
            .first()
        )
        if existente:
            response.status_code = 200
            return existente
        raise HTTPException(status_code=409, detail="No se pudo crear el autor")
    db.refresh(autor)
    response.status_code = 201
    return autor


@app.put("/api/autores/{autor_id}", response_model=AutorResponse)
def actualizar_autor(
    autor_id: int, data: AutorUpdate, db: Session = Depends(get_db)
):
    autor = db.get(Autor, autor_id)
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(autor, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Ya existe un autor con ese nombre"
        )
    db.refresh(autor)
    return autor


@app.delete("/api/autores/{autor_id}")
def eliminar_autor(autor_id: int, db: Session = Depends(get_db)):
    autor = db.get(Autor, autor_id)
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    en_uso = db.query(Libro).filter(Libro.id_autor == autor_id).count()
    if en_uso:
        raise HTTPException(
            status_code=409,
            detail=f"El autor está en uso por {en_uso} libro(s)",
        )
    db.delete(autor)
    db.commit()
    return {"detail": "Autor eliminado"}


# ── Editoriales ─────────────────────────────────────────

@app.get("/api/editoriales/", response_model=list[EditorialResponse])
def listar_editoriales(q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Editorial)
    if q:
        query = query.filter(func.lower(Editorial.nombre).like(f"%{q.lower()}%"))
    return query.order_by(Editorial.nombre).all()


@app.get("/api/editoriales/{editorial_id}", response_model=EditorialResponse)
def obtener_editorial(editorial_id: int, db: Session = Depends(get_db)):
    editorial = db.get(Editorial, editorial_id)
    if not editorial:
        raise HTTPException(status_code=404, detail="Editorial no encontrada")
    return editorial


@app.post("/api/editoriales/", response_model=EditorialResponse)
def crear_editorial(
    data: EditorialCreate, response: Response, db: Session = Depends(get_db)
):
    """Idempotente: si la editorial ya existe devuelve 200; si se crea, 201."""
    nombre = _limpiar(data.nombre)
    if not nombre:
        raise HTTPException(status_code=422, detail="nombre vacío")
    existente = (
        db.query(Editorial)
        .filter(func.lower(Editorial.nombre) == nombre.lower())
        .first()
    )
    if existente:
        response.status_code = 200
        return existente
    editorial = Editorial(nombre=nombre)
    db.add(editorial)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        existente = (
            db.query(Editorial)
            .filter(func.lower(Editorial.nombre) == nombre.lower())
            .first()
        )
        if existente:
            response.status_code = 200
            return existente
        raise HTTPException(
            status_code=409, detail="No se pudo crear la editorial"
        )
    db.refresh(editorial)
    response.status_code = 201
    return editorial


@app.put("/api/editoriales/{editorial_id}", response_model=EditorialResponse)
def actualizar_editorial(
    editorial_id: int, data: EditorialUpdate, db: Session = Depends(get_db)
):
    editorial = db.get(Editorial, editorial_id)
    if not editorial:
        raise HTTPException(status_code=404, detail="Editorial no encontrada")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(editorial, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Ya existe una editorial con ese nombre"
        )
    db.refresh(editorial)
    return editorial


@app.delete("/api/editoriales/{editorial_id}")
def eliminar_editorial(editorial_id: int, db: Session = Depends(get_db)):
    editorial = db.get(Editorial, editorial_id)
    if not editorial:
        raise HTTPException(status_code=404, detail="Editorial no encontrada")
    en_uso = db.query(Libro).filter(Libro.id_editorial == editorial_id).count()
    if en_uso:
        raise HTTPException(
            status_code=409,
            detail=f"La editorial está en uso por {en_uso} libro(s)",
        )
    db.delete(editorial)
    db.commit()
    return {"detail": "Editorial eliminada"}


# ── Libros ──────────────────────────────────────────────

@app.get("/api/libros/", response_model=list[LibroResponse])
def listar_libros(q: str | None = None, db: Session = Depends(get_db)):
    query = db.query(Libro)
    if q:
        like = f"%{q.lower()}%"
        query = query.outerjoin(Autor, Libro.id_autor == Autor.id).filter(
            or_(
                func.lower(Libro.titulo).like(like),
                func.lower(Libro.isbn).like(like),
                func.lower(Libro.serie).like(like),
                func.lower(Libro.materias).like(like),
                func.lower(Autor.nombre_apellido).like(like),
            )
        )
    return query.order_by(Libro.titulo).all()


@app.get("/api/libros/{libro_id}", response_model=LibroResponse)
def obtener_libro(libro_id: int, db: Session = Depends(get_db)):
    libro = db.get(Libro, libro_id)
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    return libro


@app.post("/api/libros/", response_model=LibroResponse, status_code=201)
def crear_libro(data: LibroCreate, db: Session = Depends(get_db)):
    payload = data.model_dump(exclude={"autor", "editorial"})
    autor = _resolver_autor(db, data.id_autor, data.autor)
    editorial = _resolver_editorial(db, data.id_editorial, data.editorial)
    payload["id_autor"] = autor.id if autor else None
    payload["id_editorial"] = editorial.id if editorial else None
    payload["titulo"] = _limpiar(payload.get("titulo"))
    payload["isbn"] = _limpiar(payload.get("isbn"))
    if not payload["titulo"]:
        raise HTTPException(status_code=422, detail="El título es obligatorio")
    libro = Libro(**payload)
    db.add(libro)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="ISBN duplicado o dato inválido"
        )
    db.refresh(libro)
    return libro


@app.put("/api/libros/{libro_id}", response_model=LibroResponse)
def actualizar_libro(
    libro_id: int, data: LibroUpdate, db: Session = Depends(get_db)
):
    libro = db.get(Libro, libro_id)
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    payload = data.model_dump(exclude_unset=True, exclude={"autor", "editorial"})
    if "id_autor" in payload or data.autor is not None:
        autor = _resolver_autor(db, payload.get("id_autor"), data.autor)
        payload["id_autor"] = autor.id if autor else None
    if "id_editorial" in payload or data.editorial is not None:
        editorial = _resolver_editorial(
            db, payload.get("id_editorial"), data.editorial
        )
        payload["id_editorial"] = editorial.id if editorial else None
    if "titulo" in payload:
        payload["titulo"] = _limpiar(payload["titulo"])
    if "isbn" in payload:
        payload["isbn"] = _limpiar(payload["isbn"])
    for key, value in payload.items():
        setattr(libro, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="ISBN duplicado o dato inválido"
        )
    db.refresh(libro)
    return libro


@app.delete("/api/libros/{libro_id}")
def eliminar_libro(libro_id: int, db: Session = Depends(get_db)):
    libro = db.get(Libro, libro_id)
    if not libro:
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    if libro.copias:
        raise HTTPException(
            status_code=409,
            detail=f"El libro tiene {len(libro.copias)} copia(s) y no se puede eliminar",
        )
    db.delete(libro)
    db.commit()
    return {"detail": "Libro eliminado"}


# ── Copias ──────────────────────────────────────────────

@app.get("/api/copias/", response_model=list[CopiaResponse])
def listar_copias(
    libro_id: int | None = None, db: Session = Depends(get_db)
):
    query = db.query(Copia)
    if libro_id is not None:
        query = query.filter(Copia.libro_id == libro_id)
    return query.order_by(Copia.id).all()


@app.post("/api/copias/", response_model=CopiaResponse, status_code=201)
def crear_copia(data: CopiaCreate, db: Session = Depends(get_db)):
    if not db.get(Libro, data.libro_id):
        raise HTTPException(status_code=404, detail="Libro no encontrado")
    payload = data.model_dump()
    payload["inventario_num"] = _limpiar(payload.get("inventario_num"))
    copia = Copia(**payload)
    db.add(copia)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Número de inventario duplicado"
        )
    db.refresh(copia)
    return copia


@app.put("/api/copias/{copia_id}", response_model=CopiaResponse)
def actualizar_copia(
    copia_id: int, data: CopiaUpdate, db: Session = Depends(get_db)
):
    copia = db.get(Copia, copia_id)
    if not copia:
        raise HTTPException(status_code=404, detail="Copia no encontrada")
    payload = data.model_dump(exclude_unset=True)
    if "inventario_num" in payload:
        payload["inventario_num"] = _limpiar(payload["inventario_num"])
    for key, value in payload.items():
        setattr(copia, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="Número de inventario duplicado"
        )
    db.refresh(copia)
    return copia


@app.delete("/api/copias/{copia_id}")
def eliminar_copia(copia_id: int, db: Session = Depends(get_db)):
    copia = db.get(Copia, copia_id)
    if not copia:
        raise HTTPException(status_code=404, detail="Copia no encontrada")
    try:
        db.delete(copia)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="La copia tiene préstamos o daños asociados y no se puede eliminar",
        )
    return {"detail": "Copia eliminada"}


# ── Prestamos ───────────────────────────────────────────

@app.get("/api/prestamos/", response_model=list[PrestamoResponse])
def listar_prestamos(
    estado: str | None = None,
    socio_id: int | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Prestamo)
    if estado:
        query = query.filter(Prestamo.estado == estado)
    if socio_id is not None:
        query = query.filter(Prestamo.id_socio == socio_id)
    return query.order_by(Prestamo.id.desc()).all()


@app.get("/api/prestamos/{prestamo_id}", response_model=PrestamoResponse)
def obtener_prestamo(prestamo_id: int, db: Session = Depends(get_db)):
    prestamo = db.get(Prestamo, prestamo_id)
    if not prestamo:
        raise HTTPException(status_code=404, detail="Prestamo no encontrado")
    return prestamo


@app.post("/api/prestamos/", response_model=PrestamoResponse, status_code=201)
def crear_prestamo(
    data: PrestamoCreate,
    usuario: Usuario = Depends(get_turno_actual),
    db: Session = Depends(get_db),
):
    if not db.get(Socio, data.id_socio):
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    copia = db.get(Copia, data.copia_id)
    if not copia:
        raise HTTPException(status_code=404, detail="Copia no encontrada")
    if copia.estado != "disponible":
        raise HTTPException(
            status_code=409,
            detail=f"La copia no está disponible (estado: {copia.estado})",
        )
    prestamo = Prestamo(
        id_prestamo=_limpiar(data.id_prestamo),
        fecha_prestamo=data.fecha_prestamo,
        fecha_limite=data.fecha_limite,
        estado=data.estado,
        id_socio=data.id_socio,
        copia_id=data.copia_id,
        id_usuario=usuario.id,
    )
    copia.estado = "prestado"
    db.add(prestamo)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="id_prestamo duplicado o dato inválido"
        )
    db.refresh(prestamo)
    return prestamo


@app.put("/api/prestamos/{prestamo_id}", response_model=PrestamoResponse)
def actualizar_prestamo(
    prestamo_id: int, data: PrestamoUpdate, db: Session = Depends(get_db)
):
    prestamo = db.get(Prestamo, prestamo_id)
    if not prestamo:
        raise HTTPException(status_code=404, detail="Prestamo no encontrado")

    payload = data.model_dump(exclude_unset=True)

    if "id_socio" in payload and not db.get(Socio, payload["id_socio"]):
        raise HTTPException(status_code=404, detail="Socio no encontrado")

    if "copia_id" in payload and payload["copia_id"] != prestamo.copia_id:
        nueva = db.get(Copia, payload["copia_id"])
        if not nueva:
            raise HTTPException(status_code=404, detail="Copia no encontrada")
        if nueva.estado != "disponible":
            raise HTTPException(
                status_code=409,
                detail=f"La copia no está disponible (estado: {nueva.estado})",
            )
        if prestamo.copia and prestamo.estado != "devuelto":
            prestamo.copia.estado = "disponible"
        nueva.estado = "prestado"
        prestamo.copia_id = nueva.id

    if "id_prestamo" in payload:
        payload["id_prestamo"] = _limpiar(payload["id_prestamo"])

    for key, value in payload.items():
        setattr(prestamo, key, value)

    estado_final = payload.get("estado", prestamo.estado)
    if estado_final == "devuelto":
        if not prestamo.fecha_devolucion:
            prestamo.fecha_devolucion = date.today()
        if prestamo.copia:
            prestamo.copia.estado = "disponible"
    elif prestamo.copia:
        prestamo.copia.estado = "prestado"

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409, detail="id_prestamo duplicado o dato inválido"
        )
    db.refresh(prestamo)
    return prestamo


@app.delete("/api/prestamos/{prestamo_id}")
def eliminar_prestamo(prestamo_id: int, db: Session = Depends(get_db)):
    prestamo = db.get(Prestamo, prestamo_id)
    if not prestamo:
        raise HTTPException(status_code=404, detail="Prestamo no encontrado")
    if prestamo.estado != "devuelto" and prestamo.copia:
        prestamo.copia.estado = "disponible"
    db.delete(prestamo)
    db.commit()
    return {"detail": "Prestamo eliminado"}


# ── Danos ───────────────────────────────────────────────

@app.get("/api/danos/", response_model=list[DanoResponse])
def listar_danos(db: Session = Depends(get_db)):
    return db.query(Dano).order_by(Dano.id.desc()).all()


@app.post("/api/danos/", response_model=DanoResponse, status_code=201)
def crear_dano(
    data: DanoCreate,
    usuario: Usuario = Depends(get_turno_actual),
    db: Session = Depends(get_db),
):
    if not db.get(Copia, data.copia_id):
        raise HTTPException(status_code=404, detail="Copia no encontrada")
    if not db.get(Socio, data.socio_id):
        raise HTTPException(status_code=404, detail="Socio no encontrado")
    dano = Dano(
        copia_id=data.copia_id,
        socio_id=data.socio_id,
        severidad=data.severidad,
        descripcion=data.descripcion,
        fecha=data.fecha or date.today(),
        id_usuario=usuario.id,
    )
    db.add(dano)
    db.commit()
    db.refresh(dano)
    return dano


@app.put("/api/danos/{dano_id}", response_model=DanoResponse)
def actualizar_dano(
    dano_id: int, data: DanoUpdate, db: Session = Depends(get_db)
):
    dano = db.get(Dano, dano_id)
    if not dano:
        raise HTTPException(status_code=404, detail="Daño no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(dano, key, value)
    db.commit()
    db.refresh(dano)
    return dano


@app.delete("/api/danos/{dano_id}")
def eliminar_dano(dano_id: int, db: Session = Depends(get_db)):
    dano = db.get(Dano, dano_id)
    if not dano:
        raise HTTPException(status_code=404, detail="Daño no encontrado")
    db.delete(dano)
    db.commit()
    return {"detail": "Daño eliminado"}


# ── Usuarios ────────────────────────────────────────────

@app.get("/api/usuarios/", response_model=list[UsuarioResponse])
def listar_usuarios(db: Session = Depends(get_db)):
    return db.query(Usuario).order_by(Usuario.id).all()


@app.get("/api/usuarios/{usuario_id}", response_model=UsuarioResponse)
def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


@app.post("/api/usuarios/", response_model=UsuarioResponse, status_code=201)
def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    if not data.turno:
        raise HTTPException(status_code=422, detail="El turno es obligatorio")
    usuario = Usuario(nombre=data.nombre, turno=data.turno, activo=True)
    db.add(usuario)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="El turno ya existe")
    db.refresh(usuario)
    return usuario


@app.put("/api/usuarios/{usuario_id}", response_model=UsuarioResponse)
def actualizar_usuario(
    usuario_id: int, data: UsuarioUpdate, db: Session = Depends(get_db)
):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(usuario, key, value)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="El turno ya existe")
    db.refresh(usuario)
    return usuario


@app.delete("/api/usuarios/{usuario_id}")
def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    try:
        db.delete(usuario)
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=409,
            detail="El usuario tiene registros asociados y no se puede eliminar",
        )
    return {"detail": "Usuario eliminado"}


# ── Auditoría ───────────────────────────────────────────

@app.get("/api/auditoria/", response_model=list[AuditoriaResponse])
def listar_auditoria(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    return (
        db.query(Auditoria)
        .order_by(Auditoria.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ── Turnos ──────────────────────────────────────────────

@app.get("/api/turno/actual", response_model=UsuarioTurnoResponse)
def obtener_turno_actual(usuario: Usuario = Depends(get_turno_actual)):
    return usuario


@app.get("/api/turno/validar")
def validar_cambio(
    turno_nuevo: str, usuario_actual: Usuario = Depends(get_turno_actual)
):
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
