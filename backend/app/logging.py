import logging
import sys
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.config import settings


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware que imprime cada petición HTTP a stdout.

    Usa print() (no logging) para que uvicorn no pueda silenciarlo.
    Útil para confirmar que las peticiones del frontend llegan al backend.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.time()
        print(
            f"[HTTP] {request.method} {request.url.path} "
            f"| shift={request.headers.get('x-active-shift', '-')}"
        )
        response = await call_next(request)
        dur_ms = int((time.time() - start) * 1000)
        print(
            f"[HTTP] {request.method} {request.url.path} -> {response.status_code} "
            f"({dur_ms}ms)"
        )
        return response


def setup_logging() -> None:
    """Configura logging de forma explícita para que sobreviva al arranque de uvicorn.

    uvicorn reconfigura el logging raíz al iniciar, por lo que no usamos
    logging.basicConfig (solo tiene efecto si el raíz aún no tiene handlers).
    Añadimos un StreamHandler a stdout directamente al logger raíz.
    """
    root = logging.getLogger()
    level = logging.DEBUG if settings.DEBUG else logging.INFO
    root.setLevel(level)

    # Evitar handlers duplicados si setup_logging se llama más de una vez
    ya_tiene_stdout = any(
        isinstance(h, logging.StreamHandler) and getattr(h, "stream", None) is sys.stdout
        for h in root.handlers
    )
    if not ya_tiene_stdout:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(
            logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
        )
        root.addHandler(handler)

    # Logger propio de la app
    logger = logging.getLogger("sip")
    logger.setLevel(level)
    logger.propagate = True

    # Silenciar ruidos de librerías salvo que esté en DEBUG
    if not settings.DEBUG:
        for nombre in ("uvicorn.access", "uvicorn.error", "sqlalchemy.engine"):
            logging.getLogger(nombre).setLevel(logging.WARNING)


logger = logging.getLogger("sip")
