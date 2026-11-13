from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

TipoSocio = Literal["estudiante", "docente", "otro"]
Idioma = Literal["español", "inglés"]
Modalidad = Literal["domicilio", "sala", "no disponible"]
EstadoCopia = Literal["disponible", "prestado", "dañado", "perdido"]
EstadoPrestamo = Literal["prestado", "devuelto", "moroso"]
SeveridadDano = Literal["leve", "moderado", "catastrofico"]


# ── Socio ───────────────────────────────────────────────

class SocioCreate(BaseModel):
    nombre: str
    apellido: str
    dni: str
    email: str | None = None
    tipo: TipoSocio


class SocioUpdate(BaseModel):
    nombre: str | None = None
    apellido: str | None = None
    dni: str | None = None
    email: str | None = None
    tipo: TipoSocio | None = None


class SocioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    apellido: str
    dni: str
    email: str | None
    tipo: str
    created_at: datetime
    updated_at: datetime


# ── Autor ───────────────────────────────────────────────

class AutorCreate(BaseModel):
    nombre_apellido: str
    tipo_autor: str | None = "escritor"


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


# ── Copia ───────────────────────────────────────────────

class CopiaCreate(BaseModel):
    libro_id: int
    inventario_num: str | None = None
    clasificacion: str | None = None
    signatura: str | None = None
    modalidad: Modalidad | None = None
    estado: EstadoCopia = "disponible"


class CopiaUpdate(BaseModel):
    inventario_num: str | None = None
    clasificacion: str | None = None
    signatura: str | None = None
    modalidad: Modalidad | None = None
    estado: EstadoCopia | None = None


class CopiaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    libro_id: int
    inventario_num: str | None
    clasificacion: str | None
    signatura: str | None
    modalidad: str | None
    estado: str
    created_at: datetime


# ── Libro ───────────────────────────────────────────────

class LibroCreate(BaseModel):
    titulo: str
    subtitulo: str | None = None
    id_autor: int | None = None
    autor: str | None = None  # atajo: se crea/reutiliza el autor por nombre
    mencion_responsabilidad: str | None = None
    edicion: str | None = None
    lugar_publicacion: str | None = None
    id_editorial: int | None = None
    editorial: str | None = None  # atajo: se crea/reutiliza la editorial por nombre
    anio_publicacion: int | None = None
    isbn: str | None = None
    paginas: int | None = None
    serie: str | None = None
    materias: str | None = None
    genero_clasificacion: str | None = None
    colaboradores: str | None = None
    nivel: str | None = None
    resumen: str | None = None
    contenido: str | None = None
    idioma: Idioma | None = None


class LibroUpdate(BaseModel):
    titulo: str | None = None
    subtitulo: str | None = None
    id_autor: int | None = None
    autor: str | None = None
    mencion_responsabilidad: str | None = None
    edicion: str | None = None
    lugar_publicacion: str | None = None
    id_editorial: int | None = None
    editorial: str | None = None
    anio_publicacion: int | None = None
    isbn: str | None = None
    paginas: int | None = None
    serie: str | None = None
    materias: str | None = None
    genero_clasificacion: str | None = None
    colaboradores: str | None = None
    nivel: str | None = None
    resumen: str | None = None
    contenido: str | None = None
    idioma: Idioma | None = None


class LibroResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    titulo: str
    subtitulo: str | None
    id_autor: int | None
    mencion_responsabilidad: str | None
    edicion: str | None
    lugar_publicacion: str | None
    id_editorial: int | None
    anio_publicacion: int | None
    isbn: str | None
    paginas: int | None
    serie: str | None
    materias: str | None
    genero_clasificacion: str | None
    colaboradores: str | None
    nivel: str | None
    resumen: str | None
    contenido: str | None
    idioma: str | None
    created_at: datetime
    autor_detalle: AutorResponse | None = None
    editorial_detalle: EditorialResponse | None = None
    copias: list[CopiaResponse] = []


# ── Prestamo ────────────────────────────────────────────

class PrestamoCreate(BaseModel):
    id_prestamo: str
    fecha_prestamo: date
    fecha_limite: date
    estado: EstadoPrestamo = "prestado"
    id_socio: int
    copia_id: int


class PrestamoUpdate(BaseModel):
    id_prestamo: str | None = None
    fecha_prestamo: date | None = None
    fecha_limite: date | None = None
    fecha_devolucion: date | None = None
    estado: EstadoPrestamo | None = None
    id_socio: int | None = None
    copia_id: int | None = None


class PrestamoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    id_prestamo: str
    fecha_prestamo: date
    fecha_limite: date
    fecha_devolucion: date | None
    estado: str
    id_socio: int
    copia_id: int
    id_usuario: int
    created_at: datetime
    updated_at: datetime
    socio: SocioResponse | None = None
    copia: CopiaResponse | None = None
    libro: LibroResponse | None = None


# ── Dano ────────────────────────────────────────────────

class DanoCreate(BaseModel):
    copia_id: int
    socio_id: int
    severidad: SeveridadDano
    descripcion: str
    fecha: date | None = None


class DanoUpdate(BaseModel):
    severidad: SeveridadDano | None = None
    descripcion: str | None = None
    fecha: date | None = None


class DanoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    copia_id: int
    socio_id: int
    severidad: str
    descripcion: str
    fecha: date
    id_usuario: int
    created_at: datetime
    socio: SocioResponse | None = None
    copia: CopiaResponse | None = None
    libro: LibroResponse | None = None


# ── Usuario ─────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    nombre: str
    turno: str | None = None


class UsuarioUpdate(BaseModel):
    nombre: str | None = None
    turno: str | None = None


class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    turno: str | None
    activo: bool


class UsuarioTurnoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    turno: str
    activo: bool


# ── Auditoria ───────────────────────────────────────────

class AuditoriaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    endpoint: str
    metodo: str
    status_code: int
    duracion_ms: int
    id_usuario: int | None
    created_at: datetime
