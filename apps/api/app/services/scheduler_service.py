import logging
import uuid
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.states import EnrollmentState, blocks_automated_sends
from app.models.campaign import Campaign, CampaignContact, CampaignStep
from app.models.contact import Contact
from app.models.job import ActivityEvent, ScheduledJob, SystemSettingsModel

logger = logging.getLogger(__name__)


async def claim_next_pending_job(
    session: AsyncSession, worker_id: str
) -> ScheduledJob | None:
    """Safely claim the next due job using SELECT ... FOR UPDATE SKIP LOCKED."""
    now = datetime.now(timezone.utc)

    # Check global sending state
    settings_res = await session.execute(
        select(SystemSettingsModel).where(SystemSettingsModel.id == 1)
    )
    settings = settings_res.scalar_one_or_none()
    if settings and not settings.global_sending_enabled:
        logger.info("Global sending is paused. No jobs will be claimed.")
        return None

    stmt = (
        select(ScheduledJob)
        .where(
            ScheduledJob.status == "PENDING",
            ScheduledJob.scheduled_for <= now,
        )
        .order_by(ScheduledJob.scheduled_for.asc())
        .limit(1)
        .with_for_update(skip_locked=True)
    )

    res = await session.execute(stmt)
    job = res.scalar_one_or_none()

    if not job:
        return None

    job.status = "PROCESSING"
    job.locked_at = now
    job.locked_by = worker_id
    job.attempt_count += 1
    await session.commit()
    return job


async def verify_and_prepare_send(
    session: AsyncSession, job_id: uuid.UUID
) -> dict | None:
    """Verify that a claimed job is still safe to send (contact not replied, campaign active)."""
    res = await session.execute(
        select(ScheduledJob)
        .options(
            selectinload(ScheduledJob.campaign_contact)
            .selectinload(CampaignContact.campaign),
            selectinload(ScheduledJob.campaign_contact)
            .selectinload(CampaignContact.contact),
        )
        .where(ScheduledJob.id == job_id)
    )
    job = res.scalar_one_or_none()
    if not job:
        return None

    enrollment = job.campaign_contact
    campaign = enrollment.campaign
    contact = enrollment.contact

    # Pre-send safety validations
    if campaign.status != "ACTIVE":
        job.status = "PENDING"  # Postpone until campaign is resumed
        await session.commit()
        return None

    if blocks_automated_sends(EnrollmentState(enrollment.status)):
        logger.warning(
            "Halting send for contact %s: status is %s",
            contact.email,
            enrollment.status,
        )
        job.status = "CANCELLED"
        await session.commit()
        return None

    if contact.state in ("REPLIED", "UNSUBSCRIBED", "BOUNCED"):
        job.status = "CANCELLED"
        enrollment.status = contact.state
        await session.commit()
        return None

    return {
        "job": job,
        "enrollment": enrollment,
        "campaign": campaign,
        "contact": contact,
    }
