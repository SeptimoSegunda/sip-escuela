from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session

from app.config import get_db
from app.models import Usuario

TURNOS_VALIDOS = {"mañana": 1, "tarde": 2}


def get_turno_actual(
    x_active_shift: str = Header(..., alias="X-Active-Shift", description="Turno activo: 'mañana' o 'tarde'"),
    db: Session = Depends(get_db)
) -> Usuario:
    """
    Valida el header X-Active-Shift y devuelve el Usuario correspondiente.
    Lanza 400 si el header falta o es inválido.
    Lanza 404 si el turno no está configurado en BD.
    """
    turno = x_active_shift.lower().strip()
    if turno not in TURNOS_VALIDOS:
        raise HTTPException(
            status_code=400,
            detail="Header X-Active-Shift inválido. Use 'mañana' o 'tarde'."
        )

    usuario = db.query(Usuario).filter(Usuario.turno == turno, Usuario.activo == True).first()
    if not usuario:
        raise HTTPException(
            status_code=404,
            detail=f"Usuario para turno '{turno}' no configurado en la base de datos."
        )
    return usuario