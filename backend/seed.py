#!/usr/bin/env python
"""Puebla los 2 turnos fijos.

Los socios quedan vacíos por decisión del proyecto; los libros se cargan
con import_aguapey.py.
"""
from app import models  # noqa: F401
from app.config import Base, SessionLocal, engine
from app.models import Usuario


def main() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        for turno, nombre in (("mañana", "Turno Mañana"), ("tarde", "Turno Tarde")):
            existe = db.query(Usuario).filter(Usuario.turno == turno).first()
            if not existe:
                db.add(Usuario(nombre=nombre, turno=turno, activo=True))
        db.commit()
        print("[OK] Usuarios sembrados (socios vacíos)")
    finally:
        db.close()


if __name__ == "__main__":
    main()
