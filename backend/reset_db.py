#!/usr/bin/env python
"""Recrea el esquema completo desde app/models.py.

ADVERTENCIA: borra todas las tablas del dominio y sus datos.
La tabla alembic_version no se toca (queda desincronizada a propósito).
"""
from app import models  # noqa: F401 - registra los modelos en Base.metadata
from app.config import Base, engine


def main() -> None:
    print(">>> Borrando esquema...")
    Base.metadata.drop_all(bind=engine)
    print(">>> Creando esquema...")
    Base.metadata.create_all(bind=engine)
    print("[OK] Esquema recreado")


if __name__ == "__main__":
    main()
