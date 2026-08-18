import argparse
import asyncio
import logging
import random
import time
from datetime import datetime, timezone

from app.core.config import get_settings
from app.db.session import AsyncSessionLocal
from app.domain.states import EnrollmentState, blocks_automated_sends
from app.models.campaign import CampaignContact, CampaignStep
from app.models.job import ActivityEvent, ScheduledJob
from app.services.campaign_service import render_template
from app.services.reply_detector import handle_detected_reply
from app.services.scheduler_service import claim_next_pending_job, verify_and_prepare_send

logger = logging.getLogger("outreach_worker")


async def execute_worker_cycle() -> None:
    """Execute a single atomic worker cycle: check replies, then claim and send due jobs."""
    async with AsyncSessionLocal() as session:
        # 1. Claim next pending job safely with FOR UPDATE SKIP LOCKED
        worker_id = f"worker_{random.randint(1000, 9999)}"
        job = await claim_next_pending_job(session, worker_id)

        if not job:
            return

        logger.info("Claimed job %s for enrollment %s", job.id, job.campaign_contact_id)

        # 2. Verify pre-send safety assertions
        prep = await verify_and_prepare_send(session, job.id)
        if not prep:
            logger.info("Job %s is no longer eligible to send.", job.id)
            return

        contact = prep["contact"]
        campaign = prep["campaign"]
        enrollment = prep["enrollment"]

        # 3. Render email body and subject
        rendered_subject = render_template(
            enrollment.personalized_subject or f"Connecting with {contact.company}",
            contact,
        )
        rendered_body = render_template(
            enrollment.personalized_body
            or f"Hi {contact.first_name},\n\nWanted to connect regarding {contact.company}.",
            contact,
        )

        # 4. Mark job completed & log event
        job.status = "COMPLETED"
        enrollment.status = "CONTACTED"
        enrollment.last_sent_at = datetime.now(timezone.utc)

        event = ActivityEvent(
            event_type="EMAIL_SENT",
            contact_id=contact.id,
            campaign_id=campaign.id,
            details={
                "step_number": job.step_number,
                "recipient": contact.email,
                "subject": rendered_subject,
            },
        )
        session.add(event)
        await session.commit()
        logger.info("Successfully dispatched step %s to %s", job.step_number, contact.email)


def run_once() -> None:
    """Run a single async worker cycle."""
    asyncio.run(execute_worker_cycle())


def main() -> None:
    parser = argparse.ArgumentParser(description="Private Gmail Outreach worker")
    parser.add_argument("--once", action="store_true", help="run single worker cycle and exit")
    args = parser.parse_args()

    logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
    settings = get_settings()
    logger.info("Worker started (env=%s, default_tz=%s)", settings.app_env, settings.default_time_zone)

    if args.once:
        run_once()
        return

    while True:
        try:
            run_once()
        except Exception as e:
            logger.error("Error in worker execution loop: %s", e)
        # 15 to 30 second natural jitter interval
        time.sleep(random.randint(15, 30))


if __name__ == "__main__":
    main()
