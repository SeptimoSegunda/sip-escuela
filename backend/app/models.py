from datetime import datetime

from sqlalchemy import String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.config import Base


class Alumno(Base):
    __tablename__ = "alumnos"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    matricula: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class Autor(Base):
    __tablename__ = "autor"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre_apellido: Mapped[str] = mapped_column(String(200), nullable=False)
    tipo_autor: Mapped[str] = mapped_column(String(50), nullable=False)


class Editorial(Base):
    __tablename__ = "editorial"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)


class Libro(Base):
    __tablename__ = "libros"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    titulo: Mapped[str] = mapped_column(String(300), nullable=False)
    subtitulo: Mapped[str | None] = mapped_column(String(300))
    autor: Mapped[str | None] = mapped_column(String(200))
    isbn: Mapped[str | None] = mapped_column(String(20))
    editorial: Mapped[str | None] = mapped_column(String(200))
    anio_publicacion: Mapped[int | None] = mapped_column(Integer)
    cantidad: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    libristica: Mapped[str | None] = mapped_column(String(50))
    numero_de_inventario: Mapped[str | None] = mapped_column(String(50))
    ubicacion: Mapped[str | None] = mapped_column(String(100))
    publicacion: Mapped[str | None] = mapped_column(String(100))
    colleccion: Mapped[str | None] = mapped_column(String(100))
    edicion: Mapped[str | None] = mapped_column(String(50))
    lugar_publicacion: Mapped[str | None] = mapped_column(String(100))
    temas: Mapped[str | None] = mapped_column(String(200))
    numero: Mapped[str | None] = mapped_column(String(50))
    termino_material: Mapped[str | None] = mapped_column(String(100))
    clasificacion: Mapped[str | None] = mapped_column(String(100))
    extension: Mapped[int | None] = mapped_column(Integer)
    nota_general: Mapped[str | None] = mapped_column(Text)
    nota_contenido: Mapped[str | None] = mapped_column(Text)
    id_editorial: Mapped[int | None] = mapped_column(ForeignKey("editorial.id"))
    id_autor: Mapped[int | None] = mapped_column(ForeignKey("autor.id"))


class Notebook(Base):
    __tablename__ = "notebooks"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    numero_inventario: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    estado: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class Prestamo(Base):
    __tablename__ = "prestamo"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_prestamo: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    fecha_prestamo: Mapped[str] = mapped_column(String(20), nullable=False)
    fecha_limite: Mapped[str] = mapped_column(String(20), nullable=False)
    estado: Mapped[str] = mapped_column(String(50), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    id_usuario: Mapped[int] = mapped_column(ForeignKey("usuario.id"), nullable=False)
    id_libro: Mapped[int | None] = mapped_column(ForeignKey("libros.id"))
    id_notebook: Mapped[int | None] = mapped_column(ForeignKey("notebooks.id"))
    id_alumno: Mapped[int] = mapped_column(ForeignKey("alumnos.id"), nullable=False)


class Usuario(Base):
    __tablename__ = "usuario"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    id_usuario: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    ano: Mapped[int | None] = mapped_column(Integer)
    turno: Mapped[str | None] = mapped_column(String(50))
    tipo_usuario: Mapped[str] = mapped_column(String(50), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
