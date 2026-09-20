from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict


# ── Socio ───────────────────────────────────────────────

class SocioCreate(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    tipo: str
    matricula: str | None = None
    anio: str | None = None
    turno: str | None = None


class SocioUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    email: EmailStr | None = None
    tipo: str | None = None
    matricula: str | None = None
    anio: str | None = None
    turno: str | None = None


class SocioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    email: str
    tipo: str
    matricula: str | None
    anio: str | None
    turno: str | None
    created_at: datetime
    updated_at: datetime


# ── Autor ───────────────────────────────────────────────

class AutorCreate(BaseModel):
    nombre_apellido: str
    tipo_autor: str


class AutorUpdate(BaseModel):
    nombre_apellido: str | None = None
    tipo_autor: str | None = None


class AutorResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre_apellido: str
    tipo_autor: str


# ── Editorial ───────────────────────────────────────────

class EditorialCreate(BaseModel):
    nombre: str


class EditorialUpdate(BaseModel):
    nombre: str | None = None


class EditorialResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str


# ── Libro ───────────────────────────────────────────────

class LibroCreate(BaseModel):
    titulo: str # si
    subtitulo: str | None = None #si
    autor: str | None = None #si
    isbn: str | None = None #si
    editorial: str | None = None #si
    anio_publicacion: int | None = None #si
    cantidad: int = 1 # falta
    libristica: str | None = None #si
    numero_de_inventario: str | None = None #si
    ubicacion: str | None = None #si 
    publicacion: str | None = None #si pero es año?
    colleccion: str | None = None
    edicion: str | None = None #si
    lugar_publicacion: str | None = None #si
    temas: str | None = None # no front \, se llama temas clave
    numero: str | None = None # tomo?
    termino_material: str | None = None #si
    clasificacion: str | None = None #si
    extension: int | None = None #si
    nota_general: str | None = None #si
    nota_contenido: str | None = None #si
    id_editorial: int | None = None #si
    id_autor: int | None = None #si


class LibroUpdate(BaseModel):
    titulo: str | None = None
    subtitulo: str | None = None
    autor: str | None = None
    isbn: str | None = None
    editorial: str | None = None
    anio_publicacion: int | None = None
    cantidad: int | None = None
    libristica: str | None = None
    numero_de_inventario: str | None = None
    ubicacion: str | None = None
    publicacion: str | None = None
    colleccion: str | None = None
    edicion: str | None = None
    lugar_publicacion: str | None = None
    temas: str | None = None
    numero: str | None = None
    termino_material: str | None = None
    clasificacion: str | None = None
    extension: int | None = None
    nota_general: str | None = None
    nota_contenido: str | None = None
    id_editorial: int | None = None
    id_autor: int | None = None


class LibroResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    subtitulo: str | None
    autor: str | None
    isbn: str | None
    editorial: str | None
    anio_publicacion: int | None
    cantidad: int
    created_at: datetime
    libristica: str | None
    numero_de_inventario: str | None
    ubicacion: str | None
    publicacion: str | None
    colleccion: str | None
    edicion: str | None
    lugar_publicacion: str | None
    temas: str | None
    numero: str | None
    termino_material: str | None
    clasificacion: str | None
    extension: int | None
    nota_general: str | None
    nota_contenido: str | None
    id_editorial: int | None
    id_autor: int | None


# ── Prestamo ────────────────────────────────────────────

class PrestamoCreate(BaseModel):
    id_prestamo: str
    fecha_prestamo: str
    fecha_limite: str
    estado: str
    id_usuario: int
    id_libro: int | None = None
    id_socio: int


class PrestamoUpdate(BaseModel):
    id_prestamo: str | None = None
    fecha_prestamo: str | None = None
    fecha_limite: str | None = None
    estado: str | None = None
    id_usuario: int | None = None
    id_libro: int | None = None
    id_socio: int | None = None


class PrestamoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_prestamo: str
    fecha_prestamo: str
    fecha_limite: str
    estado: str
    created_at: datetime
    updated_at: datetime
    id_usuario: int
    id_libro: int | None
    id_socio: int


# ── Usuario ─────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    nombre: str
    apellido: str
    id_usuario: str
    ano: int | None = None
    turno: str | None = None
    tipo_usuario: str
    email: EmailStr


class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    id_usuario: str | None = None
    ano: int | None = None
    turno: str | None = None
    tipo_usuario: str | None = None
    email: EmailStr | None = None


class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    id_usuario: str
    ano: int | None
    turno: str | None
    tipo_usuario: str
    email: str
