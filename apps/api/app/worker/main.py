import argparse
import logging
import time

from app.core.config import get_settings

logger = logging.getLogger(__name__)


def run_once() -> None:
    """Foundation heartbeat; job claiming is introduced with the scheduler slice."""
    settings = get_settings()
    logger.info(
        "Worker heartbeat environment=%s global_sending_enabled=%s",
        settings.app_env,
        settings.global_sending_enabled,
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="Private Gmail Outreach worker")
    parser.add_argument("--once", action="store_true", help="emit one heartbeat and exit")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    if args.once:
        run_once()
        return

    logger.info("Worker started; no send handlers are registered in the foundation slice.")
    while True:
        run_once()
        time.sleep(30)
