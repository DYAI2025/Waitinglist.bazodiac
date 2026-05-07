# REQ-USA-error-code-rendered-verbatim: Frontend renders backend `error.code` verbatim, never synthesizes a fallback

**Type**: Usability

**Status**: Approved

**Priority**: Must-have

**Source**: [US-compute-cosmic-signature](../user-stories/US-compute-cosmic-signature.md)

**Source stakeholder**: [STK-prospective-user](../stakeholders.md)

## Description

When the backend returns `{ ok: false, error: { code, message, field? } }`, the frontend renders `error.code` verbatim (visible in the error UI alongside the localized `error.message`) and never synthesizes a fallback chart, interpretation, or signup confirmation on its own. The error UI surfaces a retry path where the user can re-attempt the failing operation.

## Acceptance Criteria

- Given an error envelope, when the chart card renders an error, then the visible code element contains the backend's `error.code` exactly (e.g., `FUFIRE_UNAVAILABLE`).
- Given an error envelope, when the interpretation modal renders an error, then the modal's code element contains `error.code` verbatim and the modal does not show synthesized headline/body/stats.
- Given an error envelope, when the newsletter form renders an error, then the form's status banner shows `error.code` (or its localized message) and does not pretend the signup succeeded.
- Given a failing endpoint, when the user clicks retry, then the original request is re-issued; on subsequent success the error UI is replaced with the success UI.
