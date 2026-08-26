from datetime import datetime

from pydantic import BaseModel, EmailStr, ConfigDict


# ── Alumno ──────────────────────────────────────────────

class AlumnoCreate(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    matricula: str


class AlumnoUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    email: EmailStr | None = None
    matricula: str | None = None


class AlumnoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    email: str
    matricula: str
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
    titulo: str
    subtitulo: str | None = None
    autor: str | None = None
    isbn: str | None = None
    editorial: str | None = None
    anio_publicacion: int | None = None
    cantidad: int = 1
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


# ── Notebook ────────────────────────────────────────────

class NotebookCreate(BaseModel):
    numero_inventario: str
    estado: str


class NotebookUpdate(BaseModel):
    numero_inventario: str | None = None
    estado: str | None = None


class NotebookResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    numero_inventario: str
    estado: str
    created_at: datetime
    updated_at: datetime


# ── Prestamo ────────────────────────────────────────────

class PrestamoCreate(BaseModel):
    id_prestamo: str
    fecha_prestamo: str
    fecha_limite: str
    estado: str
    id_usuario: int
    id_libro: int | None = None
    id_notebook: int | None = None
    id_alumno: int


class PrestamoUpdate(BaseModel):
    id_prestamo: str | None = None
    fecha_prestamo: str | None = None
    fecha_limite: str | None = None
    estado: str | None = None
    id_usuario: int | None = None
    id_libro: int | None = None
    id_notebook: int | None = None
    id_alumno: int | None = None


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
    id_notebook: int | None
    id_alumno: int


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
