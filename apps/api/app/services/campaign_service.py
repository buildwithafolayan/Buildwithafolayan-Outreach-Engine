import re
import uuid
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.states import EnrollmentEvent, EnrollmentState, transition_enrollment
from app.models.campaign import Campaign, CampaignContact, CampaignStep
from app.models.contact import Contact
from app.models.job import ActivityEvent, ScheduledJob


def render_template(template: str, contact: Contact) -> str:
    """Safely interpolate template placeholders with fallback default support."""
    result = template

    def replace_var(match: re.Match) -> str:
        expr = match.group(1).strip()
        parts = [p.strip() for p in expr.split("|")]
        key = parts[0]
        default_val = ""
        if len(parts) > 1 and "default:" in parts[1]:
            default_val = parts[1].split("default:")[1].strip().strip('"').strip("'")

        val = getattr(contact, key, None)
        if not val and key in ("first_name", "firstName"):
            val = contact.first_name
        elif not val and key in ("last_name", "lastName"):
            val = contact.last_name
        elif not val and key == "company":
            val = contact.company
        elif not val and key == "website":
            val = contact.website or ""
        elif not val and key == "city":
            val = contact.city or ""
        elif not val and key == "industry":
            val = contact.industry or ""

        return str(val) if val else default_val

    # Replace {{ key | default:"fallback" }} or {{ key }}
    result = re.sub(r"{{\s*([^}]+)\s*}}", replace_var, result)
    return result


async def enroll_contact_in_campaign(
    session: AsyncSession,
    campaign_id: uuid.UUID,
    contact_id: uuid.UUID,
) -> CampaignContact:
    """Enroll a contact into a campaign and schedule Step 1."""
    # Verify contact not already enrolled
    existing = await session.execute(
        select(CampaignContact).where(
            CampaignContact.campaign_id == campaign_id,
            CampaignContact.contact_id == contact_id,
        )
    )
    if existing.scalar_one_or_none():
        raise ValueError(f"Contact {contact_id} is already enrolled in campaign {campaign_id}")

    # Fetch Step 1
    step_res = await session.execute(
        select(CampaignStep).where(
            CampaignStep.campaign_id == campaign_id,
            CampaignStep.step_number == 1,
        )
    )
    step_1 = step_res.scalar_one_or_none()
    if not step_1:
        raise ValueError(f"Campaign {campaign_id} has no sequence steps defined.")

    now = datetime.now(timezone.utc)
    scheduled_for = now + timedelta(days=step_1.delay_days, hours=step_1.delay_hours)

    enrollment = CampaignContact(
        campaign_id=campaign_id,
        contact_id=contact_id,
        current_step=1,
        status=EnrollmentState.SCHEDULED.value,
        next_action_at=scheduled_for,
    )
    session.add(enrollment)
    await session.flush()

    # Create scheduled job
    job = ScheduledJob(
        campaign_contact_id=enrollment.id,
        step_number=1,
        scheduled_for=scheduled_for,
        status="PENDING",
        idempotency_key=f"job_{campaign_id}_{contact_id}_step1",
    )
    session.add(job)

    # Log activity event
    event = ActivityEvent(
        event_type="CONTACT_ENROLLED",
        contact_id=contact_id,
        campaign_id=campaign_id,
        details={
            "step_number": 1,
            "scheduled_for": scheduled_for.isoformat(),
        },
    )
    session.add(event)

    # Update contact master status
    contact_res = await session.execute(select(Contact).where(Contact.id == contact_id))
    contact = contact_res.scalar_one()
    contact.state = "ENROLLED"

    await session.commit()
    return enrollment
