import time
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config import SessionLocal
from app.models import Auditoria


class AuditoriaMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.time()
        response = await call_next(request)

        # Solo auditar mutaciones
        if request.method in ("POST", "PUT", "PATCH", "DELETE"):
            turno = request.headers.get("X-Active-Shift", "desconocido").lower()
            db = SessionLocal()
            try:
                log = Auditoria(
                    endpoint=str(request.url),
                    metodo=request.method,
                    turno=turno,
                    status_code=response.status_code,
                    duracion_ms=int((time.time() - start) * 1000),
                    id_usuario=None  # Se podría resolver si querés, pero requiere query extra
                )
                db.add(log)
                db.commit()
            except Exception:
                db.rollback()
            finally:
                db.close()

        return response