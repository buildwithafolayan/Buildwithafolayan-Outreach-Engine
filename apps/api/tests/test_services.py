import uuid
import pytest
from app.domain.states import EnrollmentEvent, EnrollmentState, blocks_automated_sends, transition_enrollment
from app.models.contact import Contact
from app.services.campaign_service import render_template


def test_template_rendering_with_values():
    contact = Contact(
        id=uuid.uuid4(),
        first_name="Alex",
        last_name="Mercer",
        email="alex@techcorp.io",
        company="TechCorp",
        industry="DevTools",
        state="READY",
    )
    template = "Hi {{ first_name }}, I noticed {{ company }} is in {{ industry }}."
    rendered = render_template(template, contact)
    assert rendered == "Hi Alex, I noticed TechCorp is in DevTools."


def test_template_rendering_with_fallback_defaults():
    contact = Contact(
        id=uuid.uuid4(),
        first_name="Alex",
        last_name="",
        email="alex@example.com",
        company="StartupX",
        industry=None,
        state="READY",
    )
    template = "Hi {{ first_name }}, how is {{ industry | default:'your industry' }} treating {{ company }}?"
    rendered = render_template(template, contact)
    assert rendered == "Hi Alex, how is your industry treating StartupX?"


def test_enrollment_state_transitions():
    assert transition_enrollment(EnrollmentState.ENROLLED, EnrollmentEvent.SCHEDULE) == EnrollmentState.SCHEDULED
    assert transition_enrollment(EnrollmentState.SCHEDULED, EnrollmentEvent.SEND_CLAIMED) == EnrollmentState.SENDING
    assert transition_enrollment(EnrollmentState.SENDING, EnrollmentEvent.SEND_CONFIRMED) == EnrollmentState.WAITING
    assert transition_enrollment(EnrollmentState.WAITING, EnrollmentEvent.REPLY_DETECTED) == EnrollmentState.REPLIED


def test_reply_blocks_automated_sends():
    assert blocks_automated_sends(EnrollmentState.REPLIED) is True
    assert blocks_automated_sends(EnrollmentState.UNSUBSCRIBED) is True
    assert blocks_automated_sends(EnrollmentState.PAUSED) is True
    assert blocks_automated_sends(EnrollmentState.SCHEDULED) is False
