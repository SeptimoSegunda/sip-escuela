import time

from sqlalchemy import func
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config import SessionLocal
from app.dependencies import normalizar_turno
from app.models import Auditoria, Usuario


class AuditoriaMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.time()
        response = await call_next(request)

        # Solo auditar mutaciones
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            id_usuario = None
            turno = request.headers.get("X-Active-Shift")

            if turno:
                turno = normalizar_turno(turno)
                db_usuario = SessionLocal()
                try:
                    usuario = (
                        db_usuario.query(Usuario)
                        .filter(
                            func.lower(Usuario.turno) == turno,
                            Usuario.activo == True,  # noqa: E712
                        )
                        .first()
                    )
                    id_usuario = usuario.id if usuario else None
                except Exception:
                    db_usuario.rollback()
                finally:
                    db_usuario.close()

            db = SessionLocal()
            try:
                log = Auditoria(
                    endpoint=request.url.path,
                    metodo=request.method,
                    status_code=response.status_code,
                    duracion_ms=int((time.time() - start) * 1000),
                    id_usuario=id_usuario,
                )
                db.add(log)
                db.commit()
            except Exception:
                db.rollback()
            finally:
                db.close()

        return response
