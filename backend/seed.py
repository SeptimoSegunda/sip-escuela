#!/usr/bin/env python
"""
Pobla la base de datos con los 2 turnos fijos y datos de ejemplo.
Ejecutar: python seed.py
"""
from app.config import SessionLocal, engine, Base
from app.models import Usuario, Libro, Copia, Socio, Prestamo, Dano
from datetime import datetime

# Crea tablas si no existen (util en dev)
Base.metadata.create_all(bind=engine)

db = SessionLocal()
try:
    # ── Usuarios de turno ──
    if not db.query(Usuario).filter(Usuario.turno == "mañana").first():
        db.add(Usuario(id=1, nombre="Turno Mañana", turno="mañana", activo=True))
    if not db.query(Usuario).filter(Usuario.turno == "tarde").first():
        db.add(Usuario(id=2, nombre="Turno Tarde", turno="tarde", activo=True))
    db.commit()

    # ── Libros (semilla mínima) ──
    SEED_LIBROS = [
        {"titulo": "Rayuela", "autor": "Julio Cortázar", "isbn": "978-950-511-356-9",
         "editorial": "Sudamericana", "anio_publicacion": 1963, "cantidad": 2,
         "ubicacion": "Estante 2, Sector A", "publicacion": "1963", "edicion": "1ª Edición",
         "lugar_publicacion": "Buenos Aires", "temas": "novela experimental"},
        {"titulo": "Ficciones", "autor": "Jorge Luis Borges", "isbn": "978-950-07-0924-0",
         "editorial": "Emecé", "anio_publicacion": 1944, "cantidad": 1,
         "ubicacion": "Estante 1, Sector B", "publicacion": "1944", "lugar_publicacion": "Buenos Aires"},
        {"titulo": "El túnel", "autor": "Ernesto Sábato", "isbn": "978-950-04-0247-3",
         "editorial": "Emecé", "anio_publicacion": 1948, "cantidad": 2,
         "ubicacion": "Estante 3, Sector A", "publicacion": "1948"},
        {"titulo": "Cien años de soledad", "autor": "Gabriel García Márquez",
         "isbn": "978-84-204-5325-1", "editorial": "Sudamericana", "anio_publicacion": 1967,
         "cantidad": 3, "ubicacion": "Estante 1, Sector A", "publicacion": "1967",
         "lugar_publicacion": "Buenos Aires", "temas": "realismo mágico"},
        {"titulo": "Martín Fierro", "autor": "José Hernández",
         "editorial": "Losada", "anio_publicacion": 1872, "cantidad": 1,
         "ubicacion": "Estante 2, Sector C", "publicacion": "1872", "temas": "poesía gauchesca"},
        {"titulo": "El eternauta", "autor": "Héctor Germán Oesterheld",
         "isbn": "978-987-04-0005-7", "editorial": "Record", "anio_publicacion": 1957,
         "cantidad": 2, "ubicacion": "Estante 6, Sector A", "publicacion": "1957",
         "temas": "ciencia ficción"},
    ]

    for datos in SEED_LIBROS:
        exists = db.query(Libro).filter(Libro.titulo == datos["titulo"]).first()
        if not exists:
            libro = Libro(**datos)
            db.add(libro)
            db.commit()
            db.refresh(libro)

            # Crear copias para cada libro
            for i in range(libro.cantidad):
                copia = Copia(
                    inventario_num=f"INV-{libro.id:04d}-{i+1:03d}",
                    estado="disponible",
                    libro_id=libro.id,
                )
                db.add(copia)
            db.commit()

    # ── Socios ──
    SEED_SOCIOS = [
        {"nombre": "Lucía", "apellido": "González", "email": "lucia@edu.ar", "tipo": "estudiante",
         "matricula": "10001", "anio": "3°A", "turno": "mañana"},
        {"nombre": "Tomás", "apellido": "Martínez", "email": "tomas@edu.ar", "tipo": "estudiante",
         "matricula": "10002", "anio": "2°B", "turno": "tarde"},
        {"nombre": "Valentina", "apellido": "Rodríguez", "email": "vale@edu.ar", "tipo": "estudiante",
         "matricula": "10003", "anio": "4°A", "turno": "mañana"},
        {"nombre": "Facundo", "apellido": "López", "email": "facu@edu.ar", "tipo": "estudiante",
         "matricula": "10004", "anio": "1°C", "turno": "tarde"},
        {"nombre": "Camila", "apellido": "Fernández", "email": "cami@edu.ar", "tipo": "estudiante",
         "matricula": "10005", "anio": "5°B", "turno": "mañana"},
        {"nombre": "Marcos", "apellido": "Díaz", "email": "marcos@edu.ar", "tipo": "estudiante",
         "matricula": "10006", "anio": "3°C", "turno": "tarde"},
        {"nombre": "Ana Laura", "apellido": "Pérez", "email": "aperez@edu.ar", "tipo": "docente",
         "matricula": "10007", "turno": "mañana"},
        {"nombre": "Diego", "apellido": "Suárez", "email": "diego@edu.ar", "tipo": "estudiante",
         "matricula": "10008", "anio": "2°A", "turno": "mañana"},
    ]

    for datos in SEED_SOCIOS:
        exists = db.query(Socio).filter(Socio.email == datos["email"]).first()
        if not exists:
            db.add(Socio(**datos))
    db.commit()

    print("[OK] Base de datos poblada con datos de ejemplo.")
except Exception as e:
    db.rollback()
    print(f"[ERROR] {e}")
finally:
    db.close()