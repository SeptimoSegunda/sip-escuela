#!/usr/bin/env python
"""
Test suite completo para SIP-Escuela API.
Ejecuta: python test_api.py
"""
import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def print_test(name, success, detail=""):
    status = "[PASS]" if success else "[FAIL]"
    print(f"{status} | {name}")
    if detail:
        print(f"       {detail}")

def test_root():
    r = requests.get(f"{BASE_URL}/")
    return r.status_code == 200 and "funcionando" in r.json().get("message", "")

def test_turno_endpoints():
    """Tests del sistema de turnos"""
    results = []
    
    # 1. GET /api/turno/actual con header válido (mañana)
    r = requests.get(f"{BASE_URL}/api/turno/actual", headers={"X-Active-Shift": "mañana"})
    success = r.status_code == 200 and r.json().get("turno") == "mañana"
    results.append(("Turno actual - mañana", success, f"status={r.status_code}, data={r.json()}"))
    
    # 2. GET /api/turno/actual con header válido (tarde)
    r = requests.get(f"{BASE_URL}/api/turno/actual", headers={"X-Active-Shift": "tarde"})
    success = r.status_code == 200 and r.json().get("turno") == "tarde"
    results.append(("Turno actual - tarde", success, f"status={r.status_code}, data={r.json()}"))
    
    # 3. GET /api/turno/actual SIN header (debe fallar 400/422)
    r = requests.get(f"{BASE_URL}/api/turno/actual")
    success = r.status_code in (400, 422)
    results.append(("Turno actual - sin header", success, f"status={r.status_code}"))
    
    # 4. GET /api/turno/actual con header inválido
    r = requests.get(f"{BASE_URL}/api/turno/actual", headers={"X-Active-Shift": "noche"})
    success = r.status_code == 400
    results.append(("Turno actual - header inválido", success, f"status={r.status_code}"))
    
    # 5. Validar cambio de turno
    r = requests.get(f"{BASE_URL}/api/turno/validar?turno_nuevo=tarde", headers={"X-Active-Shift": "mañana"})
    success = r.status_code == 200 and "permitido" in r.json()
    results.append(("Validar cambio turno", success, f"status={r.status_code}, data={r.json()}"))
    
    return results

def test_crud_socios():
    """Tests CRUD Socios"""
    results = []
    headers = {"X-Active-Shift": "mañana", "Content-Type": "application/json"}
    
    # CREATE
    data = {
        "nombre": "Juan",
        "apellido": "Pérez",
        "email": "juan.perez@test.com",
        "tipo": "alumno",
        "matricula": "12345",
        "anio": "3",
        "turno": "mañana"
    }
    r = requests.post(f"{BASE_URL}/api/socios/", headers=headers, json=data)
    success = r.status_code == 201
    socio_id = r.json().get("id") if success else None
    results.append(("Socio CREATE", success, f"status={r.status_code}, id={socio_id}"))
    
    if not socio_id:
        return results
    
    # LIST
    r = requests.get(f"{BASE_URL}/api/socios/", headers=headers)
    success = r.status_code == 200 and isinstance(r.json(), list)
    results.append(("Socio LIST", success, f"status={r.status_code}, count={len(r.json())}"))
    
    # GET ONE
    r = requests.get(f"{BASE_URL}/api/socios/{socio_id}", headers=headers)
    success = r.status_code == 200 and r.json().get("email") == data["email"]
    results.append(("Socio GET ONE", success, f"status={r.status_code}"))
    
    # UPDATE
    r = requests.put(f"{BASE_URL}/api/socios/{socio_id}", headers=headers, json={"apellido": "Gómez"})
    success = r.status_code == 200 and r.json().get("apellido") == "Gómez"
    results.append(("Socio UPDATE", success, f"status={r.status_code}"))
    
    # DELETE
    r = requests.delete(f"{BASE_URL}/api/socios/{socio_id}", headers=headers)
    success = r.status_code == 200
    results.append(("Socio DELETE", success, f"status={r.status_code}"))
    
    return results

def test_crud_libros():
    """Tests CRUD Libros"""
    results = []
    headers = {"X-Active-Shift": "mañana", "Content-Type": "application/json"}
    
    data = {
        "titulo": "El Quijote",
        "autor": "Cervantes",
        "isbn": "978-84-376-0494-7",
        "editorial": "Alfaguara",
        "anio_publicacion": 2005,
        "cantidad": 3
    }
    r = requests.post(f"{BASE_URL}/api/libros/", headers=headers, json=data)
    success = r.status_code == 201
    libro_id = r.json().get("id") if success else None
    results.append(("Libro CREATE", success, f"status={r.status_code}, id={libro_id}"))
    
    if not libro_id:
        return results
    
    r = requests.get(f"{BASE_URL}/api/libros/", headers=headers)
    success = r.status_code == 200 and isinstance(r.json(), list)
    results.append(("Libro LIST", success, f"status={r.status_code}, count={len(r.json())}"))
    
    r = requests.get(f"{BASE_URL}/api/libros/{libro_id}", headers=headers)
    success = r.status_code == 200 and r.json().get("titulo") == "El Quijote"
    results.append(("Libro GET ONE", success, f"status={r.status_code}"))
    
    r = requests.put(f"{BASE_URL}/api/libros/{libro_id}", headers=headers, json={"cantidad": 5})
    success = r.status_code == 200 and r.json().get("cantidad") == 5
    results.append(("Libro UPDATE", success, f"status={r.status_code}"))
    
    r = requests.delete(f"{BASE_URL}/api/libros/{libro_id}", headers=headers)
    success = r.status_code == 200
    results.append(("Libro DELETE", success, f"status={r.status_code}"))
    
    return results

def test_prestamos_con_turno():
    """Tests de Préstamos validando que se use el turno del header"""
    results = []
    headers_manana = {"X-Active-Shift": "mañana", "Content-Type": "application/json"}
    headers_tarde = {"X-Active-Shift": "tarde", "Content-Type": "application/json"}
    
    # Usar IDs únicos para evitar colisiones con tests previos
    import uuid
    unique = str(uuid.uuid4())[:8]
    
    # Primero crear socio y libro necesarios (usar emails únicos para evitar duplicados)
    socio_data = {"nombre": "Test", "apellido": "Socio", "email": f"test.socio.{unique}@test.com", "tipo": "alumno"}
    r = requests.post(f"{BASE_URL}/api/socios/", headers=headers_manana, json=socio_data)
    socio_id = r.json().get("id") if r.status_code == 201 else None
    
    libro_data = {"titulo": f"Test Libro {unique}", "autor": "Test Autor", "cantidad": 1}
    r = requests.post(f"{BASE_URL}/api/libros/", headers=headers_manana, json=libro_data)
    libro_id = r.json().get("id") if r.status_code == 201 else None
    
    if not socio_id or not libro_id:
        results.append(("Prestamo SETUP", False, f"socio_id={socio_id}, libro_id={libro_id}"))
        return results
    
    # 1. Crear préstamo con turno mañana
    prestamo_data = {
        "id_prestamo": f"PREST-{unique}-001",
        "fecha_prestamo": "2024-10-01",
        "fecha_limite": "2024-10-08",
        "estado": "activo",
        "id_libro": libro_id,
        "id_socio": socio_id
    }
    r = requests.post(f"{BASE_URL}/api/prestamos/", headers=headers_manana, json=prestamo_data)
    success = r.status_code == 201
    prestamo_id = r.json().get("id") if success else None
    id_usuario_guardado = r.json().get("id_usuario") if success else None
    # Debe ser usuario.id = 1 (mañana)
    results.append(("Prestamo CREATE (mañana)", success, f"status={r.status_code}, id_usuario={id_usuario_guardado} (esperado: 1)"))
    
    if not prestamo_id:
        return results
    
    # 2. Crear préstamo con turno tarde
    prestamo_data["id_prestamo"] = f"PREST-{unique}-002"
    r = requests.post(f"{BASE_URL}/api/prestamos/", headers=headers_tarde, json=prestamo_data)
    success = r.status_code == 201
    id_usuario_guardado = r.json().get("id_usuario") if success else None
    # Debe ser usuario.id = 2 (tarde)
    results.append(("Prestamo CREATE (tarde)", success, f"status={r.status_code}, id_usuario={id_usuario_guardado} (esperado: 2)"))
    
    # 3. Listar préstamos
    r = requests.get(f"{BASE_URL}/api/prestamos/", headers=headers_manana)
    success = r.status_code == 200 and isinstance(r.json(), list)
    results.append(("Prestamo LIST", success, f"status={r.status_code}, count={len(r.json())}"))
    
    # 4. Verificar que el id_usuario se ignora del body y usa el del header
    prestamo_data["id_prestamo"] = f"PREST-{unique}-003"
    prestamo_data["id_usuario"] = 999  # Valor falso en body
    r = requests.post(f"{BASE_URL}/api/prestamos/", headers=headers_manana, json=prestamo_data)
    success = r.status_code == 201 and r.json().get("id_usuario") == 1
    results.append(("Prestamo ignora id_usuario del body", success, f"id_usuario guardado={r.json().get('id_usuario')} (esperado: 1)"))
    
    return results

def test_auditoria():
    """Tests de auditoría automática"""
    results = []
    headers = {"X-Active-Shift": "mañana", "Content-Type": "application/json"}
    
    # Hacer algunas operaciones que generen auditoría
    requests.post(f"{BASE_URL}/api/socios/", headers=headers, json={
        "nombre": "Audit", "apellido": "Test", "email": "audit@test.com", "tipo": "alumno"
    })
    requests.post(f"{BASE_URL}/api/libros/", headers=headers, json={
        "titulo": "Audit Libro", "autor": "Audit Autor", "cantidad": 1
    })
    
    # Consultar auditoría
    r = requests.get(f"{BASE_URL}/api/auditoria/", headers=headers)
    success = r.status_code == 200 and isinstance(r.json(), list)
    audits = r.json() if success else []
    # Verificar que tiene campos esperados
    if audits:
        first = audits[0]
        has_fields = all(k in first for k in ["endpoint", "metodo", "turno", "status_code", "duracion_ms"])
        results.append(("Auditoria campos correctos", has_fields, f"campos: {list(first.keys())}"))
    results.append(("Auditoria LIST", success, f"status={r.status_code}, count={len(audits)}"))
    
    # Verificar que registra el turno correcto (mañana o tarde)
    if audits:
        turnos_validos = {"mañana", "tarde", "desconocido"}
        turno_correcto = all(a.get("turno") in turnos_validos for a in audits)
        results.append(("Auditoria registra turno", turno_correcto, f"turnos únicos: {set(a.get('turno') for a in audits)}"))
    
    return results

def test_autores_editoriales():
    """Tests rápidos de Autores y Editoriales"""
    results = []
    headers = {"X-Active-Shift": "mañana", "Content-Type": "application/json"}
    
    # Autor
    r = requests.post(f"{BASE_URL}/api/autores/", headers=headers, json={"nombre_apellido": "Borges", "tipo_autor": "escritor"})
    success = r.status_code == 201
    results.append(("Autor CREATE", success, f"status={r.status_code}"))
    
    r = requests.get(f"{BASE_URL}/api/autores/", headers=headers)
    success = r.status_code == 200
    results.append(("Autor LIST", success, f"status={r.status_code}"))
    
    # Editorial
    r = requests.post(f"{BASE_URL}/api/editoriales/", headers=headers, json={"nombre": "Planeta"})
    success = r.status_code == 201
    results.append(("Editorial CREATE", success, f"status={r.status_code}"))
    
    r = requests.get(f"{BASE_URL}/api/editoriales/", headers=headers)
    success = r.status_code == 200
    results.append(("Editorial LIST", success, f"status={r.status_code}"))
    
    return results

def main():
    print("=" * 60)
    print("TEST SUITE - SIP-Escuela API")
    print("=" * 60)
    
    all_results = []
    
    # Root
    print("\n[ROOT]")
    success = test_root()
    print_test("Root endpoint", success)
    all_results.append(("Root", success))
    
    # Turnos
    print("\n[TURNOS]")
    for name, success, detail in test_turno_endpoints():
        print_test(name, success, detail)
        all_results.append((name, success))
    
    # CRUD Socios
    print("\n[CRUD SOCIOS]")
    for name, success, detail in test_crud_socios():
        print_test(name, success, detail)
        all_results.append((name, success))
    
    # CRUD Libros
    print("\n[CRUD LIBROS]")
    for name, success, detail in test_crud_libros():
        print_test(name, success, detail)
        all_results.append((name, success))
    
    # Préstamos con turnos
    print("\n[PRESTAMOS + TURNOS]")
    for name, success, detail in test_prestamos_con_turno():
        print_test(name, success, detail)
        all_results.append((name, success))
    
    # Auditoría
    print("\n[AUDITORIA]")
    for name, success, detail in test_auditoria():
        print_test(name, success, detail)
        all_results.append((name, success))
    
    # Autores/Editoriales
    print("\n[AUTORES / EDITORIALES]")
    for name, success, detail in test_autores_editoriales():
        print_test(name, success, detail)
        all_results.append((name, success))
    
    # Resumen
    print("\n" + "=" * 60)
    print("RESUMEN")
    print("=" * 60)
    passed = sum(1 for _, s in all_results if s)
    total = len(all_results)
    print(f"Total: {total} | Pass: {passed} | Fail: {total - passed}")
    
    if total - passed > 0:
        print("\n[FAIL] FALLOS:")
        for name, success in all_results:
            if not success:
                print(f"  - {name}")
        return 1
    else:
        print("\n[OK] TODOS LOS TESTS PASARON")
        return 0

if __name__ == "__main__":
    exit(main())