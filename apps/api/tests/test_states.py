import pytest

from app.domain.states import (
    EnrollmentEvent,
    EnrollmentState,
    InvalidEnrollmentTransition,
    blocks_automated_sends,
    transition_enrollment,
)


def test_reply_stops_an_enrollment_waiting_for_a_follow_up() -> None:
    state = transition_enrollment(EnrollmentState.WAITING, EnrollmentEvent.REPLY_DETECTED)

    assert state is EnrollmentState.REPLIED
    assert blocks_automated_sends(state)


def test_unsubscribe_overrides_a_send_in_progress() -> None:
    state = transition_enrollment(EnrollmentState.SENDING, EnrollmentEvent.UNSUBSCRIBE)

    assert state is EnrollmentState.UNSUBSCRIBED
    assert blocks_automated_sends(state)


def test_completed_enrollment_cannot_be_scheduled_again_without_explicit_resume_path() -> None:
    with pytest.raises(InvalidEnrollmentTransition):
        transition_enrollment(EnrollmentState.COMPLETED, EnrollmentEvent.SCHEDULE)
