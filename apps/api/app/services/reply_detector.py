import logging
import uuid
from datetime import datetime, timezone
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.states import EnrollmentEvent, EnrollmentState, transition_enrollment
from app.models.campaign import CampaignContact
from app.models.contact import Contact
from app.models.job import ActivityEvent, ScheduledJob
from app.models.message import Reply

logger = logging.getLogger(__name__)


async def handle_detected_reply(
    session: AsyncSession,
    gmail_thread_id: str,
    gmail_message_id: str,
    sender_email: str,
    body_text: str,
    snippet: str | None = None,
    classification: str = "UNCLEAR",
    confidence: float = 0.0,
    reasoning: str | None = None,
    suggested_action: str | None = None,
) -> bool:
    """Instantly halt sequence follow-ups when a reply is detected for a contact/thread."""
    # Find matching campaign enrollment by thread or contact email
    res = await session.execute(
        select(CampaignContact)
        .join(Contact, CampaignContact.contact_id == Contact.id)
        .where(
            (CampaignContact.gmail_thread_id == gmail_thread_id)
            | (Contact.email == sender_email.lower().strip())
        )
    )
    enrollment = res.scalar_one_or_none()

    if not enrollment:
        logger.info(
            "No active campaign enrollment found for incoming reply from %s (thread: %s)",
            sender_email,
            gmail_thread_id,
        )
        return False

    now = datetime.now(timezone.utc)

    # 1. Transition enrollment state to REPLIED
    current_state = EnrollmentState(enrollment.status)
    new_state = transition_enrollment(current_state, EnrollmentEvent.REPLY_DETECTED)
    enrollment.status = new_state.value
    enrollment.reply_detected_at = now
    enrollment.next_action_at = None

    # 2. Cancel all pending scheduled jobs for this contact immediately
    await session.execute(
        update(ScheduledJob)
        .where(
            ScheduledJob.campaign_contact_id == enrollment.id,
            ScheduledJob.status == "PENDING",
        )
        .values(status="CANCELLED", last_error="Cancelled due to detected prospect reply")
    )

    # 3. Update master contact state
    await session.execute(
        update(Contact)
        .where(Contact.id == enrollment.contact_id)
        .values(state="REPLIED", updated_at=now)
    )

    # 4. Record Reply object
    reply = Reply(
        campaign_contact_id=enrollment.id,
        gmail_message_id=gmail_message_id,
        gmail_thread_id=gmail_thread_id,
        sender_email=sender_email,
        snippet=snippet,
        body_text=body_text,
        classification=classification,
        confidence=confidence,
        reasoning=reasoning,
        suggested_action=suggested_action,
        received_at=now,
    )
    session.add(reply)

    # 5. Log Activity Event
    event = ActivityEvent(
        event_type="REPLY_DETECTED",
        contact_id=enrollment.contact_id,
        campaign_id=enrollment.campaign_id,
        details={
            "sender_email": sender_email,
            "classification": classification,
            "snippet": snippet,
        },
    )
    session.add(event)

    await session.commit()
    logger.info(
        "Successfully stopped automated follow-ups for %s (Campaign: %s)",
        sender_email,
        enrollment.campaign_id,
    )
    return True
