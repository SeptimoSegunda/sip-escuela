#!/usr/bin/env python
"""Test suite de la API SIP-Escuela.

Ejecuta con el servidor levantado:
    python -m uvicorn app.main:app --port 8000
    python test_api.py
"""
import os
import uuid

import httpx

BASE_URL = os.environ.get("SIP_API_URL", "http://127.0.0.1:8000")
HEADERS = {"X-Active-Shift": "manana", "Content-Type": "application/json"}

RESULTADOS: list[tuple[str, bool]] = []


def req(method: str, path: str, **kwargs):
    headers = kwargs.pop("headers", HEADERS)
    return httpx.request(
        method, f"{BASE_URL}{path}", headers=headers, timeout=15, **kwargs
    )


def check(nombre: str, condicion: bool, detalle: str = "") -> bool:
    estado = "[PASS]" if condicion else "[FAIL]"
    print(f"{estado} | {nombre}")
    if detalle and not condicion:
        print(f"       {detalle}")
    RESULTADOS.append((nombre, condicion))
    return condicion


def _uid() -> str:
    return uuid.uuid4().hex[:8]


def _dni() -> str:
    return "9" + str(uuid.uuid4().int)[:7]


# ── Tests ───────────────────────────────────────────────

def test_root():
    r = req("GET", "/")
    check("Root responde", r.status_code == 200 and "funcionando" in r.json()["message"])


def test_turnos():
    r = req("GET", "/api/turno/actual", headers={"X-Active-Shift": "manana"})
    check("Turno actual mañana", r.status_code == 200 and r.json()["turno"] == "mañana")

    r = req("GET", "/api/turno/actual", headers={"X-Active-Shift": "tarde"})
    check("Turno actual tarde", r.status_code == 200 and r.json()["turno"] == "tarde")

    r = req("GET", "/api/turno/actual", headers={})
    check("Turno sin header -> 400", r.status_code == 400)

    r = req("GET", "/api/turno/actual", headers={"X-Active-Shift": "noche"})
    check("Turno inválido -> 400", r.status_code == 400)


def test_socios():
    dni = _dni()
    data = {
        "nombre": "Test",
        "apellido": "Socio",
        "dni": dni,
        "email": f"test.{_uid()}@test.com",
        "tipo": "estudiante",
    }
    r = req("POST", "/api/socios/", json=data)
    ok = check("Socio CREATE", r.status_code == 201, r.text)
    if not ok:
        return
    socio_id = r.json()["id"]

    r = req("POST", "/api/socios/", json={**data, "email": f"otro.{_uid()}@test.com"})
    check("Socio DNI duplicado -> 409", r.status_code == 409)

    r = req(
        "POST",
        "/api/socios/",
        json={"nombre": "Sin", "apellido": "Email", "dni": _dni(), "tipo": "otro"},
    )
    check("Socio sin email (opcional)", r.status_code == 201, r.text)
    if r.status_code == 201:
        req("DELETE", f"/api/socios/{r.json()['id']}")

    r = req("GET", f"/api/socios/?q={dni}")
    check(
        "Socio LIST con filtro",
        r.status_code == 200 and any(s["id"] == socio_id for s in r.json()),
    )

    r = req("GET", f"/api/socios/{socio_id}")
    check("Socio GET ONE", r.status_code == 200 and r.json()["dni"] == dni)

    r = req("PUT", f"/api/socios/{socio_id}", json={"nombre": "TestEditado"})
    check(
        "Socio UPDATE",
        r.status_code == 200 and r.json()["nombre"] == "TestEditado",
    )

    r = req("DELETE", f"/api/socios/{socio_id}")
    check("Socio DELETE", r.status_code == 200)


def test_autores_editoriales():
    uid = _uid()
    nombre_autor = f"Autor Test {uid}"
    r = req("POST", "/api/autores/", json={"nombre_apellido": nombre_autor})
    ok = check("Autor CREATE (201)", r.status_code == 201, r.text)
    autor_id = r.json()["id"] if ok else None

    r = req("POST", "/api/autores/", json={"nombre_apellido": nombre_autor})
    check(
        "Autor duplicado idempotente (200)",
        r.status_code == 200 and r.json()["id"] == autor_id,
    )

    r = req("GET", f"/api/autores/?q={uid}")
    check("Autor LIST con filtro", r.status_code == 200 and len(r.json()) == 1)

    nombre_ed = f"Editorial Test {uid}"
    r = req("POST", "/api/editoriales/", json={"nombre": nombre_ed})
    ok = check("Editorial CREATE (201)", r.status_code == 201, r.text)
    editorial_id = r.json()["id"] if ok else None

    r = req("POST", "/api/editoriales/", json={"nombre": nombre_ed})
    check(
        "Editorial duplicada idempotente (200)",
        r.status_code == 200 and r.json()["id"] == editorial_id,
    )

    r = req("GET", f"/api/editoriales/?q={uid}")
    check("Editorial LIST con filtro", r.status_code == 200 and len(r.json()) == 1)

    # Autor en uso -> 409
    r = req(
        "POST",
        "/api/libros/",
        json={"titulo": f"Libro uso {uid}", "id_autor": autor_id},
    )
    libro_id = r.json()["id"] if r.status_code == 201 else None
    r = req("DELETE", f"/api/autores/{autor_id}")
    check("Autor en uso -> 409", r.status_code == 409)

    if libro_id:
        req("DELETE", f"/api/libros/{libro_id}")
    r = req("DELETE", f"/api/autores/{autor_id}")
    check("Autor DELETE", r.status_code == 200)

    if editorial_id:
        r = req("DELETE", f"/api/editoriales/{editorial_id}")
        check("Editorial DELETE", r.status_code == 200)


def test_libros_copias():
    uid = _uid()

    autor = req("POST", "/api/autores/", json={"nombre_apellido": f"Cortázar {uid}"})
    editorial = req("POST", "/api/editoriales/", json={"nombre": f"Sudamericana {uid}"})
    autor_id = autor.json()["id"]
    editorial_id = editorial.json()["id"]

    data = {
        "titulo": f"Rayuela {uid}",
        "subtitulo": "Novela",
        "id_autor": autor_id,
        "id_editorial": editorial_id,
        "anio_publicacion": 1963,
        "isbn": f"978{uid}",
        "paginas": 600,
        "materias": "novela; latinoamericana",
        "idioma": "español",
    }
    r = req("POST", "/api/libros/", json=data)
    ok = check("Libro CREATE", r.status_code == 201, r.text)
    if not ok:
        return
    libro = r.json()
    libro_id = libro["id"]
    check(
        "Libro respuesta anidada autor/editorial",
        libro["autor_detalle"]["id"] == autor_id
        and libro["editorial_detalle"]["id"] == editorial_id,
    )

    r = req("POST", "/api/libros/", json={**data, "titulo": "Duplicado"})
    check("Libro ISBN duplicado -> 409", r.status_code == 409)

    r = req("POST", "/api/libros/", json={"titulo": "X", "id_autor": 999999})
    check("Libro autor inexistente -> 404", r.status_code == 404)

    r = req(
        "POST",
        "/api/libros/",
        json={
            "titulo": f"Atajo {uid}",
            "autor": f"Otro Autor {uid}",
            "editorial": f"Otra Editorial {uid}",
        },
    )
    check(
        "Libro con autor/editorial por nombre",
        r.status_code == 201
        and r.json()["id_autor"] is not None
        and r.json()["id_editorial"] is not None,
        r.text,
    )
    libro_atajo_id = r.json()["id"] if r.status_code == 201 else None

    inv = f"INV-{uid}"
    r = req(
        "POST",
        "/api/copias/",
        json={"libro_id": libro_id, "inventario_num": inv, "modalidad": "domicilio"},
    )
    ok = check("Copia CREATE", r.status_code == 201, r.text)
    copia_id = r.json()["id"] if ok else None

    r = req(
        "POST",
        "/api/copias/",
        json={"libro_id": libro_id, "inventario_num": inv},
    )
    check("Copia inventario duplicado -> 409", r.status_code == 409)

    r = req("GET", f"/api/libros/{libro_id}")
    check(
        "Libro GET con copias",
        r.status_code == 200 and len(r.json()["copias"]) == 1,
    )

    r = req("PUT", f"/api/libros/{libro_id}", json={"paginas": 601})
    check("Libro UPDATE", r.status_code == 200 and r.json()["paginas"] == 601)

    r = req("DELETE", f"/api/libros/{libro_id}")
    check("Libro con copia no se elimina -> 409", r.status_code == 409)

    r = req("PUT", f"/api/copias/{copia_id}", json={"estado": "dañado"})
    check("Copia UPDATE", r.status_code == 200 and r.json()["estado"] == "dañado")

    r = req("DELETE", f"/api/copias/{copia_id}")
    check("Copia DELETE", r.status_code == 200)

    r = req("DELETE", f"/api/libros/{libro_id}")
    check("Libro DELETE", r.status_code == 200)

    if libro_atajo_id:
        req("DELETE", f"/api/libros/{libro_atajo_id}")

    req("DELETE", f"/api/autores/{autor_id}")
    req("DELETE", f"/api/editoriales/{editorial_id}")


def _crear_base(uid: str):
    socio = req(
        "POST",
        "/api/socios/",
        json={
            "nombre": "Base",
            "apellido": uid,
            "dni": _dni(),
            "tipo": "estudiante",
        },
    ).json()
    libro = req(
        "POST",
        "/api/libros/",
        json={"titulo": f"Libro base {uid}", "autor": f"Autor base {uid}"},
    ).json()
    copia = req(
        "POST",
        "/api/copias/",
        json={"libro_id": libro["id"], "inventario_num": f"BASE-{uid}"},
    ).json()
    return socio, libro, copia


def _limpiar_base(socio, libro, copia):
    req("DELETE", f"/api/copias/{copia['id']}")
    req("DELETE", f"/api/libros/{libro['id']}")
    req("DELETE", f"/api/socios/{socio['id']}")


def test_prestamos():
    uid = _uid()
    socio, libro, copia = _crear_base(uid)

    data = {
        "id_prestamo": f"PRE-{uid}",
        "fecha_prestamo": "2026-11-01",
        "fecha_limite": "2026-11-15",
        "id_socio": socio["id"],
        "copia_id": copia["id"],
    }
    r = req("POST", "/api/prestamos/", json=data)
    ok = check("Prestamo CREATE", r.status_code == 201, r.text)
    if not ok:
        _limpiar_base(socio, libro, copia)
        return
    prestamo = r.json()
    prestamo_id = prestamo["id"]
    check("Prestamo id_usuario inyectado", prestamo["id_usuario"] == 1)
    check("Prestamo libro derivado de copia", prestamo["libro"]["id"] == libro["id"])

    r = req("GET", f"/api/copias/?libro_id={libro['id']}")
    check(
        "Copia pasa a prestado",
        r.status_code == 200 and r.json()[0]["estado"] == "prestado",
    )

    r = req("POST", "/api/prestamos/", json={**data, "id_prestamo": f"PRE2-{uid}"})
    check("Copia no disponible -> 409", r.status_code == 409)

    r = req(
        "PUT",
        f"/api/prestamos/{prestamo_id}",
        json={"estado": "devuelto"},
    )
    check(
        "Prestamo devolución",
        r.status_code == 200
        and r.json()["estado"] == "devuelto"
        and r.json()["fecha_devolucion"] is not None,
    )

    r = req("GET", f"/api/copias/?libro_id={libro['id']}")
    check(
        "Copia vuelve a disponible",
        r.status_code == 200 and r.json()[0]["estado"] == "disponible",
    )

    r = req("GET", "/api/prestamos/?estado=devuelto")
    check(
        "Prestamo LIST filtro estado",
        r.status_code == 200 and any(p["id"] == prestamo_id for p in r.json()),
    )

    r = req("DELETE", f"/api/prestamos/{prestamo_id}")
    check("Prestamo DELETE", r.status_code == 200)

    _limpiar_base(socio, libro, copia)


def test_danos():
    uid = _uid()
    socio, libro, copia = _crear_base(uid)

    data = {
        "copia_id": copia["id"],
        "socio_id": socio["id"],
        "severidad": "moderado",
        "descripcion": "Página rota",
    }
    r = req("POST", "/api/danos/", json=data)
    ok = check("Daño CREATE", r.status_code == 201, r.text)
    if not ok:
        _limpiar_base(socio, libro, copia)
        return
    dano = r.json()
    check("Daño id_usuario inyectado", dano["id_usuario"] == 1)
    check("Daño libro derivado de copia", dano["libro"]["id"] == libro["id"])
    check("Daño fecha por defecto", dano["fecha"] is not None)

    r = req("POST", "/api/danos/", json={**data, "severidad": "grave"})
    check("Daño severidad inválida -> 422", r.status_code == 422)

    r = req(
        "PUT", f"/api/danos/{dano['id']}", json={"descripcion": "Página reparada"}
    )
    check(
        "Daño UPDATE",
        r.status_code == 200 and r.json()["descripcion"] == "Página reparada",
    )

    r = req("DELETE", f"/api/danos/{dano['id']}")
    check("Daño DELETE", r.status_code == 200)

    _limpiar_base(socio, libro, copia)


def test_auditoria():
    r = req("GET", "/api/auditoria/?limit=20")
    ok = check("Auditoria LIST", r.status_code == 200 and len(r.json()) > 0)
    if not ok:
        return
    primero = r.json()[0]
    check(
        "Auditoria campos nuevos",
        {"endpoint", "metodo", "status_code", "duracion_ms", "id_usuario", "created_at"}
        <= set(primero.keys()),
    )
    check("Auditoria sin turno", "turno" not in primero)
    check(
        "Auditoria guarda solo la ruta",
        primero["endpoint"].startswith("/api/"),
    )
    check(
        "Auditoria registra id_usuario",
        any(a["id_usuario"] == 1 for a in r.json()),
    )


def main():
    print("=" * 60)
    print("TEST SUITE - SIP-Escuela API")
    print("=" * 60)

    for grupo, fn in (
        ("ROOT", test_root),
        ("TURNOS", test_turnos),
        ("SOCIOS", test_socios),
        ("AUTORES / EDITORIALES", test_autores_editoriales),
        ("LIBROS / COPIAS", test_libros_copias),
        ("PRESTAMOS", test_prestamos),
        ("DANOS", test_danos),
        ("AUDITORIA", test_auditoria),
    ):
        print(f"\n[{grupo}]")
        try:
            fn()
        except Exception as exc:  # noqa: BLE001
            check(f"{grupo} sin excepciones", False, repr(exc))

    print("\n" + "=" * 60)
    pasaron = sum(1 for _, ok in RESULTADOS if ok)
    total = len(RESULTADOS)
    print(f"RESUMEN: {pasaron}/{total} OK")
    print("=" * 60)
    fallidos = [n for n, ok in RESULTADOS if not ok]
    if fallidos:
        print("FALLOS:")
        for nombre in fallidos:
            print(f"  - {nombre}")
        return 1
    print("[OK] TODOS LOS TESTS PASARON")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
