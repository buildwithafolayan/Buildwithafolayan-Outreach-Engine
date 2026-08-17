from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.core.config import Settings, get_settings


def create_app(settings: Settings | None = None) -> FastAPI:
    """Create the API without establishing external connections at import time."""
    app_settings = settings or get_settings()
    app = FastAPI(
        title="Private Gmail Outreach Engine API",
        version="0.1.0",
        docs_url="/docs" if app_settings.docs_enabled else None,
        redoc_url=None,
    )
    app.state.settings = app_settings
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[app_settings.web_origin],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE"],
        allow_headers=["Content-Type", "X-CSRF-Token"],
    )
    app.include_router(health_router, prefix="/api/v1")
    return app


app = create_app()
