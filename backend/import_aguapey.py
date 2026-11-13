#!/usr/bin/env python
"""Importa el Excel AGUAPEY a la base: autor, editorial, libros y copias.

Uso:
    python import_aguapey.py
    python import_aguapey.py --archivo "C:\\ruta\\aguapey_db.xlsx"
    python import_aguapey.py --force     # borra el catálogo antes de importar

Reglas de importación acordadas:
  - Año: se extrae el primer año de 4 dígitos; si no hay, NULL.
  - Páginas: se extrae el primer número; si no hay, NULL.
  - ISBN: se conserva la primera aparición; los repetidos quedan NULL.
  - Inventario: se conserva la primera aparición; los repetidos quedan NULL.
  - Idioma: solo 'español' o 'inglés'; otro valor queda NULL.
  - Modalidad: 'domicilio', 'sala' o 'no disponible'; otro valor queda NULL.
"""
from __future__ import annotations

import argparse
import os
import re
import unicodedata
import zipfile
from xml.etree import ElementTree as ET

from sqlalchemy import func

from app import models  # noqa: F401
from app.config import Base, SessionLocal, engine
from app.models import Autor, Copia, Dano, Editorial, Libro, Prestamo

NS = {
    "m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "pr": "http://schemas.openxmlformats.org/package/2006/relationships",
}
TEXT_TAG = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}t"
REL_ID = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARCHIVO_DEFAULT = os.path.join(BASE_DIR, "database", "seed", "aguapey_db.xlsx")


# ── Lectura de XLSX sin dependencias externas ───────────

def _norm(valor: str) -> str:
    valor = unicodedata.normalize("NFKD", str(valor))
    valor = valor.encode("ascii", "ignore").decode("ascii")
    return re.sub(r"[^a-z0-9]+", "_", valor.lower()).strip("_")


def _col_idx(ref: str) -> int:
    letras = re.match(r"[A-Z]+", ref)
    n = 0
    for ch in letras.group(0) if letras else "":
        n = n * 26 + (ord(ch) - 64)
    return n - 1


def _cell_value(cell: ET.Element, shared: list[str]) -> str:
    tipo = cell.get("t")
    if tipo == "s":
        v = cell.find("m:v", NS)
        return shared[int(v.text)] if v is not None else ""
    if tipo == "inlineStr":
        return "".join(t.text or "" for t in cell.iter(TEXT_TAG))
    v = cell.find("m:v", NS)
    return v.text if v is not None and v.text is not None else ""


def leer_xlsx(path: str) -> dict[str, list[list[str]]]:
    z = zipfile.ZipFile(path)

    shared: list[str] = []
    if "xl/sharedStrings.xml" in z.namelist():
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root.findall("m:si", NS):
            shared.append("".join(t.text or "" for t in si.iter(TEXT_TAG)))

    wb = ET.fromstring(z.read("xl/workbook.xml"))
    rels = ET.fromstring(z.read("xl/_rels/workbook.xml.rels"))
    relmap = {r.get("Id"): r.get("Target") for r in rels.findall("pr:Relationship", NS)}

    hojas: dict[str, list[list[str]]] = {}
    for sh in wb.findall("m:sheets/m:sheet", NS):
        target = relmap[sh.get(REL_ID)].lstrip("/")
        if not target.startswith("xl/"):
            target = "xl/" + target
        root = ET.fromstring(z.read(target))

        filas: list[list[str]] = []
        for row in root.findall("m:sheetData/m:row", NS):
            valores = {}
            for cell in row.findall("m:c", NS):
                valores[_col_idx(cell.get("r"))] = _cell_value(cell, shared)
            if valores:
                filas.append([valores.get(i, "") for i in range(max(valores) + 1)])

        if filas:
            ancho = max(len(f) for f in filas)
            filas = [f + [""] * (ancho - len(f)) for f in filas]
        hojas[sh.get("name")] = filas

    return hojas


# ── Normalización de valores ────────────────────────────

def _texto(valor) -> str:
    return " ".join(str(valor).split()).strip() if valor is not None else ""


def _texto_o_none(valor) -> str | None:
    return _texto(valor) or None


def _anio(valor) -> int | None:
    m = re.search(r"(\d{4})", str(valor))
    return int(m.group(1)) if m else None


def _paginas(valor) -> int | None:
    m = re.match(r"\s*(\d+)", str(valor))
    return int(m.group(1)) if m else None


def _idioma(valor) -> str | None:
    t = _texto(valor).lower()
    if t in ("español", "espanol", "español."):
        return "español"
    if t in ("inglés", "inglés.", "ingles"):
        return "inglés"
    return None


def _modalidad(valor) -> str | None:
    t = _texto(valor).lower()
    return t if t in ("domicilio", "sala", "no disponible") else None


class Fila:
    """Acceso a columnas por nombre de encabezado."""

    def __init__(self, headers: list[str]):
        self.idx = {_norm(h): i for i, h in enumerate(headers)}

    def get(self, fila: list[str], nombre: str) -> str:
        i = self.idx.get(_norm(nombre))
        if i is None or i >= len(fila):
            return ""
        return fila[i]


# ── Importación ─────────────────────────────────────────

def limpiar_catalogo(db) -> None:
    db.query(Dano).delete()
    db.query(Prestamo).delete()
    db.query(Copia).delete()
    db.query(Libro).delete()
    db.query(Autor).delete()
    db.query(Editorial).delete()
    db.commit()


def main() -> None:
    parser = argparse.ArgumentParser(description="Importa aguapey_db.xlsx")
    parser.add_argument("--archivo", default=ARCHIVO_DEFAULT)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    hojas = leer_xlsx(args.archivo)
    if "Libros" not in hojas or "Ejemplares" not in hojas:
        raise SystemExit(f"El Excel no tiene las hojas 'Libros' y 'Ejemplares': {list(hojas)}")

    filas_libros = hojas["Libros"]
    filas_ejemplares = hojas["Ejemplares"]
    libros = Fila(filas_libros[0])
    ejemplares = Fila(filas_ejemplares[0])

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Libro).count() > 0:
            if not args.force:
                raise SystemExit(
                    "La tabla libros ya tiene datos. Usá --force para reimportar."
                )
            print(">>> --force: limpiando catálogo anterior...")
            limpiar_catalogo(db)

        autores_cache: dict[str, Autor] = {}
        editoriales_cache: dict[str, Editorial] = {}

        def get_autor(nombre: str) -> Autor | None:
            nombre = _texto_o_none(nombre)
            if not nombre:
                return None
            key = nombre.lower()
            if key in autores_cache:
                return autores_cache[key]
            autor = (
                db.query(Autor)
                .filter(func.lower(Autor.nombre_apellido) == key)
                .first()
            )
            if not autor:
                autor = Autor(nombre_apellido=nombre, tipo_autor="escritor")
                db.add(autor)
                db.flush()
            autores_cache[key] = autor
            return autor

        def get_editorial(nombre: str) -> Editorial | None:
            nombre = _texto_o_none(nombre)
            if not nombre:
                return None
            key = nombre.lower()
            if key in editoriales_cache:
                return editoriales_cache[key]
            editorial = (
                db.query(Editorial).filter(func.lower(Editorial.nombre) == key).first()
            )
            if not editorial:
                editorial = Editorial(nombre=nombre)
                db.add(editorial)
                db.flush()
            editoriales_cache[key] = editorial
            return editorial

        isbn_vistos: set[str] = set()
        libros_por_codigo: dict[str, int] = {}
        libros_creados = 0
        isbn_duplicados = 0

        for fila in filas_libros[1:]:
            codigo = _texto(libros.get(fila, "ID"))
            if not codigo:
                continue

            isbn = _texto_o_none(libros.get(fila, "ISBN"))
            if isbn:
                if isbn in isbn_vistos:
                    isbn = None
                    isbn_duplicados += 1
                else:
                    isbn_vistos.add(isbn)

            autor = get_autor(libros.get(fila, "Autor"))
            editorial = get_editorial(libros.get(fila, "Editorial"))

            libro = Libro(
                titulo=_texto_o_none(libros.get(fila, "Título")) or "Sin título",
                subtitulo=_texto_o_none(libros.get(fila, "Subtítulo")),
                id_autor=autor.id if autor else None,
                mencion_responsabilidad=_texto_o_none(
                    libros.get(fila, "Mención de responsabilidad")
                ),
                edicion=_texto_o_none(libros.get(fila, "Edición")),
                lugar_publicacion=_texto_o_none(libros.get(fila, "Lugar")),
                id_editorial=editorial.id if editorial else None,
                anio_publicacion=_anio(libros.get(fila, "Año")),
                isbn=isbn,
                paginas=_paginas(libros.get(fila, "Páginas")),
                serie=_texto_o_none(libros.get(fila, "Serie")),
                materias=_texto_o_none(libros.get(fila, "Materias")),
                genero_clasificacion=_texto_o_none(
                    libros.get(fila, "Género / clasificación")
                ),
                colaboradores=_texto_o_none(libros.get(fila, "Colaboradores")),
                nivel=_texto_o_none(libros.get(fila, "Nivel")),
                resumen=_texto_o_none(libros.get(fila, "Resumen")),
                contenido=_texto_o_none(libros.get(fila, "Contenido")),
                idioma=_idioma(libros.get(fila, "Idioma")),
            )
            db.add(libro)
            db.flush()
            libros_por_codigo[codigo] = libro.id
            libros_creados += 1

            if libros_creados % 100 == 0:
                db.commit()
                print(f"    ... {libros_creados} libros")

        db.commit()
        print(f"[OK] Libros importados: {libros_creados}")
        print(f"     ISBN duplicados -> NULL: {isbn_duplicados}")

        inv_vistos: set[str] = set()
        copias_creadas = 0
        inv_duplicados = 0
        sin_libro = 0

        for fila in filas_ejemplares[1:]:
            codigo = _texto(ejemplares.get(fila, "ID"))
            if not codigo:
                continue
            libro_id = libros_por_codigo.get(codigo)
            if not libro_id:
                sin_libro += 1
                continue

            inv = _texto_o_none(ejemplares.get(fila, "Inventario"))
            if inv:
                if inv in inv_vistos:
                    inv = None
                    inv_duplicados += 1
                else:
                    inv_vistos.add(inv)

            copia = Copia(
                libro_id=libro_id,
                inventario_num=inv,
                clasificacion=_texto_o_none(ejemplares.get(fila, "Clasif. (m)")),
                signatura=_texto_o_none(ejemplares.get(fila, "Signatura (n)")),
                modalidad=_modalidad(ejemplares.get(fila, "Modalidad (d)")),
                estado="disponible",
            )
            db.add(copia)
            copias_creadas += 1

            if copias_creadas % 200 == 0:
                db.commit()
                print(f"    ... {copias_creadas} copias")

        db.commit()
        print(f"[OK] Copias importadas: {copias_creadas}")
        print(f"     Inventarios duplicados -> NULL: {inv_duplicados}")
        print(f"     Filas de ejemplar sin libro: {sin_libro}")
        print(
            "[OK] Totales en base: "
            f"autores={db.query(Autor).count()}, "
            f"editoriales={db.query(Editorial).count()}, "
            f"libros={db.query(Libro).count()}, "
            f"copias={db.query(Copia).count()}"
        )
    finally:
        db.close()


if __name__ == "__main__":
    main()
