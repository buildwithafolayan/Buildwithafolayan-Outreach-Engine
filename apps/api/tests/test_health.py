from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


def test_health_reports_liveness_without_enabling_sending() -> None:
    app = create_app(Settings(app_env="test", global_sending_enabled=False))

    with TestClient(app) as client:
        response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "private-gmail-outreach-api",
        "environment": "test",
        "database": "not_checked",
    }
