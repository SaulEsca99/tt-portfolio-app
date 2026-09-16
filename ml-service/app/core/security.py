"""
Seguridad interna: valida que cada request viene del backend de Next.js.

El flujo es:
  Next.js → Authorization: Bearer <ML_SERVICE_API_KEY> → FastAPI → verify_api_key

La key se lee de la variable de entorno ML_SERVICE_API_KEY.
La misma key se guarda como variable server-only en Vercel (NUNCA en el cliente).
"""
from fastapi import Security, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings

bearer_scheme = HTTPBearer()


async def verify_api_key(
    credentials: HTTPAuthorizationCredentials = Security(bearer_scheme),
) -> None:
    """
    Dependencia de FastAPI.
    Úsala en cada router: `dependencies=[Depends(verify_api_key)]`.
    """
    if credentials.credentials != settings.ML_SERVICE_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key.",
        )
