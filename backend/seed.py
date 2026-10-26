#!/usr/bin/env python
"""
Pobla la tabla `usuarios` con los 2 turnos fijos.
Ejecutar: python seed.py
"""
from app.config import SessionLocal, engine, Base
from app.models import Usuario

# Crea tablas si no existen (util en dev)
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    # Turno Manana (id=1)
    if not db.query(Usuario).filter(Usuario.turno == "mañana").first():
        db.add(Usuario(id=1, nombre="Turno Mañana", turno="mañana", activo=True))

    # Turno Tarde (id=2)
    if not db.query(Usuario).filter(Usuario.turno == "tarde").first():
        db.add(Usuario(id=2, nombre="Turno Tarde", turno="tarde", activo=True))

    db.commit()
    print("[OK] Usuarios de turno creados/verificados.")
except Exception as e:
    db.rollback()
    print(f"[ERROR] Error: {e}")
finally:
    db.close()