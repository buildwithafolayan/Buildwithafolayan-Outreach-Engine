from fastapi import APIRouter, Request, status

router = APIRouter(tags=["system"])


@router.get("/health", status_code=status.HTTP_200_OK)
def health(request: Request) -> dict[str, str]:
    """Liveness endpoint; database readiness is added with the persistence slice."""
    settings = request.app.state.settings
    return {
        "status": "ok",
        "service": "private-gmail-outreach-api",
        "environment": settings.app_env,
        "database": "not_checked",
    }
