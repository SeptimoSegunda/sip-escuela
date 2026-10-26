from datetime import datetime
from typing import Optional

from sqlalchemy import String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config import Base


class Socio(Base):
    __tablename__ = "socios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(150), unique=True, nullable=False)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False)
    matricula: Mapped[Optional[str]] = mapped_column(String(20))
    anio: Mapped[Optional[str]] = mapped_column(String(20))
    turno: Mapped[Optional[str]] = mapped_column(String(50))
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
    subtitulo: Mapped[Optional[str]] = mapped_column(String(300))
    autor: Mapped[Optional[str]] = mapped_column(String(200))
    isbn: Mapped[Optional[str]] = mapped_column(String(20))
    editorial: Mapped[Optional[str]] = mapped_column(String(200))
    anio_publicacion: Mapped[Optional[int]] = mapped_column(Integer)
    cantidad: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    libristica: Mapped[Optional[str]] = mapped_column(String(50))
    numero_de_inventario: Mapped[Optional[str]] = mapped_column(String(50))
    ubicacion: Mapped[Optional[str]] = mapped_column(String(100))
    publicacion: Mapped[Optional[str]] = mapped_column(String(100))
    colleccion: Mapped[Optional[str]] = mapped_column(String(100))
    edicion: Mapped[Optional[str]] = mapped_column(String(50))
    lugar_publicacion: Mapped[Optional[str]] = mapped_column(String(100))
    temas: Mapped[Optional[str]] = mapped_column(String(200))
    numero: Mapped[Optional[str]] = mapped_column(String(50))
    termino_material: Mapped[Optional[str]] = mapped_column(String(100))
    clasificacion: Mapped[Optional[str]] = mapped_column(String(100))
    extension: Mapped[Optional[int]] = mapped_column(Integer)
    nota_general: Mapped[Optional[str]] = mapped_column(Text)
    nota_contenido: Mapped[Optional[str]] = mapped_column(Text)
    id_editorial: Mapped[Optional[int]] = mapped_column(ForeignKey("editorial.id"))
    id_autor: Mapped[Optional[int]] = mapped_column(ForeignKey("autor.id"))


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
    id_usuario: Mapped[int] = mapped_column(ForeignKey("usuarios.id"), nullable=False)
    id_libro: Mapped[Optional[int]] = mapped_column(ForeignKey("libros.id"))
    id_socio: Mapped[int] = mapped_column(ForeignKey("socios.id"), nullable=False)

    usuario: Mapped["Usuario"] = relationship(foreign_keys=[id_usuario])
    libro: Mapped[Optional["Libro"]] = relationship(foreign_keys=[id_libro])
    socio: Mapped["Socio"] = relationship(foreign_keys=[id_socio])


class Usuario(Base):
    """Solo 2 filas fijas: id=1 (mañana), id=2 (tarde)"""
    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    turno: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    activo: Mapped[bool] = mapped_column(default=True, nullable=False)

    prestamos: Mapped[list["Prestamo"]] = relationship(back_populates="usuario")
    auditorias: Mapped[list["Auditoria"]] = relationship(back_populates="usuario")


class Auditoria(Base):
    """Log automático de mutaciones (POST, PUT, PATCH, DELETE)"""
    __tablename__ = "auditoria"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    endpoint: Mapped[str] = mapped_column(String(500), nullable=False)
    metodo: Mapped[str] = mapped_column(String(10), nullable=False)
    turno: Mapped[str] = mapped_column(String(20), nullable=False)
    status_code: Mapped[int] = mapped_column(Integer, nullable=False)
    duracion_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    id_usuario: Mapped[Optional[int]] = mapped_column(ForeignKey("usuarios.id"))
    usuario: Mapped[Optional["Usuario"]] = relationship(back_populates="auditorias")