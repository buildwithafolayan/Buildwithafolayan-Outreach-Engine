from enum import StrEnum


class EnrollmentState(StrEnum):
    ENROLLED = "ENROLLED"
    SCHEDULED = "SCHEDULED"
    SENDING = "SENDING"
    WAITING = "WAITING"
    REPLIED = "REPLIED"
    PAUSED = "PAUSED"
    UNSUBSCRIBED = "UNSUBSCRIBED"
    BOUNCED = "BOUNCED"
    COMPLETED = "COMPLETED"
    ERROR = "ERROR"
    MANUALLY_STOPPED = "MANUALLY_STOPPED"


class EnrollmentEvent(StrEnum):
    SCHEDULE = "SCHEDULE"
    SEND_CLAIMED = "SEND_CLAIMED"
    SEND_CONFIRMED = "SEND_CONFIRMED"
    NEXT_STEP_DUE = "NEXT_STEP_DUE"
    REPLY_DETECTED = "REPLY_DETECTED"
    PAUSE = "PAUSE"
    RESUME = "RESUME"
    UNSUBSCRIBE = "UNSUBSCRIBE"
    BOUNCE = "BOUNCE"
    COMPLETE = "COMPLETE"
    FAIL = "FAIL"
    STOP = "STOP"


class InvalidEnrollmentTransition(ValueError):
    """Raised when an explicit workflow event cannot be applied safely."""


_REPLY_ELIGIBLE_STATES = {
    EnrollmentState.ENROLLED,
    EnrollmentState.SCHEDULED,
    EnrollmentState.SENDING,
    EnrollmentState.WAITING,
    EnrollmentState.PAUSED,
}

_TRANSITIONS: dict[tuple[EnrollmentState, EnrollmentEvent], EnrollmentState] = {
    (EnrollmentState.ENROLLED, EnrollmentEvent.SCHEDULE): EnrollmentState.SCHEDULED,
    (EnrollmentState.SCHEDULED, EnrollmentEvent.SEND_CLAIMED): EnrollmentState.SENDING,
    (EnrollmentState.SENDING, EnrollmentEvent.SEND_CONFIRMED): EnrollmentState.WAITING,
    (EnrollmentState.WAITING, EnrollmentEvent.NEXT_STEP_DUE): EnrollmentState.SCHEDULED,
    (EnrollmentState.WAITING, EnrollmentEvent.COMPLETE): EnrollmentState.COMPLETED,
    (EnrollmentState.PAUSED, EnrollmentEvent.RESUME): EnrollmentState.SCHEDULED,
    (EnrollmentState.ERROR, EnrollmentEvent.RESUME): EnrollmentState.SCHEDULED,
}


def transition_enrollment(
    current: EnrollmentState, event: EnrollmentEvent
) -> EnrollmentState:
    """Return the next state, keeping stop conditions higher priority than sending."""
    if event is EnrollmentEvent.UNSUBSCRIBE:
        return EnrollmentState.UNSUBSCRIBED
    if event is EnrollmentEvent.BOUNCE:
        return EnrollmentState.BOUNCED
    if event is EnrollmentEvent.STOP:
        return EnrollmentState.MANUALLY_STOPPED
    if event is EnrollmentEvent.REPLY_DETECTED and current in _REPLY_ELIGIBLE_STATES:
        return EnrollmentState.REPLIED
    if event is EnrollmentEvent.PAUSE and current in _REPLY_ELIGIBLE_STATES:
        return EnrollmentState.PAUSED
    if event is EnrollmentEvent.FAIL and current in {
        EnrollmentState.ENROLLED,
        EnrollmentState.SCHEDULED,
        EnrollmentState.SENDING,
        EnrollmentState.WAITING,
    }:
        return EnrollmentState.ERROR

    next_state = _TRANSITIONS.get((current, event))
    if next_state is None:
        raise InvalidEnrollmentTransition(f"Cannot apply {event} to {current}.")
    return next_state


def blocks_automated_sends(state: EnrollmentState) -> bool:
    return state in {
        EnrollmentState.REPLIED,
        EnrollmentState.PAUSED,
        EnrollmentState.UNSUBSCRIBED,
        EnrollmentState.BOUNCED,
        EnrollmentState.COMPLETED,
        EnrollmentState.ERROR,
        EnrollmentState.MANUALLY_STOPPED,
    }
