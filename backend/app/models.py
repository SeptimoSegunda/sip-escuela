from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.config import Base


class Socio(Base):
    __tablename__ = "socios"
    __table_args__ = (
        CheckConstraint(
            "tipo IN ('estudiante', 'docente', 'otro')",
            name="ck_socios_tipo",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    apellido: Mapped[str] = mapped_column(String(100), nullable=False)
    dni: Mapped[str] = mapped_column(String(10), unique=True, nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(150), unique=True)
    tipo: Mapped[str] = mapped_column(String(20), nullable=False)
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
    tipo_autor: Mapped[str] = mapped_column(
        String(50), nullable=False, default="escritor"
    )


Index("ux_autor_nombre", func.lower(func.trim(Autor.nombre_apellido)), unique=True)


class Editorial(Base):
    __tablename__ = "editorial"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(200), nullable=False)


Index("ux_editorial_nombre", func.lower(func.trim(Editorial.nombre)), unique=True)


class Libro(Base):
    __tablename__ = "libros"
    __table_args__ = (
        CheckConstraint(
            "idioma IS NULL OR idioma IN ('español', 'inglés')",
            name="ck_libros_idioma",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    titulo: Mapped[str] = mapped_column(String(200), nullable=False)
    subtitulo: Mapped[Optional[str]] = mapped_column(String(150))
    id_autor: Mapped[Optional[int]] = mapped_column(ForeignKey("autor.id"))
    mencion_responsabilidad: Mapped[Optional[str]] = mapped_column(Text)
    edicion: Mapped[Optional[str]] = mapped_column(String(30))
    lugar_publicacion: Mapped[Optional[str]] = mapped_column(String(50))
    id_editorial: Mapped[Optional[int]] = mapped_column(ForeignKey("editorial.id"))
    anio_publicacion: Mapped[Optional[int]] = mapped_column(Integer)
    isbn: Mapped[Optional[str]] = mapped_column(String(25), unique=True)
    paginas: Mapped[Optional[int]] = mapped_column(Integer)
    serie: Mapped[Optional[str]] = mapped_column(String(150))
    materias: Mapped[Optional[str]] = mapped_column(Text)
    genero_clasificacion: Mapped[Optional[str]] = mapped_column(String(120))
    colaboradores: Mapped[Optional[str]] = mapped_column(String(200))
    nivel: Mapped[Optional[str]] = mapped_column(String(20))
    resumen: Mapped[Optional[str]] = mapped_column(Text)
    contenido: Mapped[Optional[str]] = mapped_column(Text)
    idioma: Mapped[Optional[str]] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    autor_detalle: Mapped[Optional["Autor"]] = relationship(foreign_keys=[id_autor])
    editorial_detalle: Mapped[Optional["Editorial"]] = relationship(
        foreign_keys=[id_editorial]
    )
    copias: Mapped[list["Copia"]] = relationship(back_populates="libro")


class Copia(Base):
    """Copia física de un libro (ejemplar con inventario y estado)."""

    __tablename__ = "copias"
    __table_args__ = (
        CheckConstraint(
            "modalidad IS NULL OR modalidad IN ('domicilio', 'sala', 'no disponible')",
            name="ck_copias_modalidad",
        ),
        CheckConstraint(
            "estado IN ('disponible', 'prestado', 'dañado', 'perdido')",
            name="ck_copias_estado",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    libro_id: Mapped[int] = mapped_column(ForeignKey("libros.id"), nullable=False)
    inventario_num: Mapped[Optional[str]] = mapped_column(String(15), unique=True)
    clasificacion: Mapped[Optional[str]] = mapped_column(String(15))
    signatura: Mapped[Optional[str]] = mapped_column(String(10))
    modalidad: Mapped[Optional[str]] = mapped_column(String(20))
    estado: Mapped[str] = mapped_column(
        String(20), default="disponible", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    libro: Mapped["Libro"] = relationship(back_populates="copias")


class Prestamo(Base):
    __tablename__ = "prestamo"
    __table_args__ = (
        CheckConstraint("fecha_limite >= fecha_prestamo", name="ck_prestamo_fechas"),
        CheckConstraint(
            "estado IN ('prestado', 'devuelto', 'moroso')",
            name="ck_prestamo_estado",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    id_prestamo: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    fecha_prestamo: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_limite: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_devolucion: Mapped[Optional[date]] = mapped_column(Date)
    estado: Mapped[str] = mapped_column(
        String(20), default="prestado", nullable=False
    )
    id_socio: Mapped[int] = mapped_column(ForeignKey("socios.id"), nullable=False)
    copia_id: Mapped[int] = mapped_column(ForeignKey("copias.id"), nullable=False)
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )

    socio: Mapped["Socio"] = relationship(foreign_keys=[id_socio])
    copia: Mapped["Copia"] = relationship(foreign_keys=[copia_id])
    usuario: Mapped["Usuario"] = relationship(
        foreign_keys=[id_usuario], back_populates="prestamos"
    )

    @property
    def libro(self) -> Optional["Libro"]:
        return self.copia.libro if self.copia else None


class Dano(Base):
    """Registro de daño físico a una copia de libro."""

    __tablename__ = "danos"
    __table_args__ = (
        CheckConstraint(
            "severidad IN ('leve', 'moderado', 'catastrofico')",
            name="ck_danos_severidad",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    copia_id: Mapped[int] = mapped_column(ForeignKey("copias.id"), nullable=False)
    socio_id: Mapped[int] = mapped_column(ForeignKey("socios.id"), nullable=False)
    severidad: Mapped[str] = mapped_column(String(20), nullable=False)
    descripcion: Mapped[str] = mapped_column(Text, nullable=False)
    fecha: Mapped[date] = mapped_column(Date, default=date.today, nullable=False)
    id_usuario: Mapped[int] = mapped_column(
        ForeignKey("usuarios.id"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    copia: Mapped["Copia"] = relationship(foreign_keys=[copia_id])
    socio: Mapped["Socio"] = relationship(foreign_keys=[socio_id])
    usuario: Mapped["Usuario"] = relationship(
        foreign_keys=[id_usuario], back_populates="danos"
    )

    @property
    def libro(self) -> Optional["Libro"]:
        return self.copia.libro if self.copia else None


class Usuario(Base):
    """Solo 2 filas fijas: mañana y tarde."""

    __tablename__ = "usuarios"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    nombre: Mapped[str] = mapped_column(String(100), nullable=False)
    turno: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    activo: Mapped[bool] = mapped_column(default=True, nullable=False)

    prestamos: Mapped[list["Prestamo"]] = relationship(back_populates="usuario")
    danos: Mapped[list["Dano"]] = relationship(back_populates="usuario")
    auditorias: Mapped[list["Auditoria"]] = relationship(back_populates="usuario")


class Auditoria(Base):
    """Log automático de mutaciones (POST, PUT, PATCH, DELETE)."""

    __tablename__ = "auditoria"
    __table_args__ = (
        CheckConstraint(
            "metodo IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')",
            name="ck_auditoria_metodo",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    endpoint: Mapped[str] = mapped_column(String(500), nullable=False)
    metodo: Mapped[str] = mapped_column(String(10), nullable=False)
    status_code: Mapped[int] = mapped_column(Integer, nullable=False)
    duracion_ms: Mapped[int] = mapped_column(Integer, nullable=False)
    id_usuario: Mapped[Optional[int]] = mapped_column(
        ForeignKey("usuarios.id", ondelete="SET NULL")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )

    usuario: Mapped[Optional["Usuario"]] = relationship(back_populates="auditorias")
