# Release checks — 12 October 2026

Passed: 17 Node tests; syntax checks; dependency-free static build.

Covered: all announcement templates in three languages, airport localisation, station/flight validation, operator-selected zones, cancellation generation guard, missing-script rejection, default zero-spend lock, HD-only voice configuration, per-station authentication, SSML escaping, method/origin/body rejection, unsupported locale and preview-voice rejection, shared quota denial and failure, successful mocked HD response, unauthorised requests, and no retries after provider failure.

Not verified: live provider synthesis, actual speech quality, PA output hardware, iPhone/Android installation and playback, visual browser rendering, offline storage eviction/recovery on physical devices, concurrent real station load, Vercel production deployment.

Production blockers: eligible zero-personal-cost commercial hosting; approved premium voice funding/entitlement and secrets; shared quota service; corporate access design; current script and pronunciation approval; physical-device/PA acceptance.

No paid service was enabled. No production readiness claim is made.
