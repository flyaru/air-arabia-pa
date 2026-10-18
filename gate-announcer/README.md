# Air Arabia Gate Announcer — hosted edition

FastAPI + vanilla JavaScript. Vercel root directory: `gate-announcer`.

The 2026 GSA aerobridge calls are Zone A first, then Zones B + C. Remote calls remain separate. English source scripts are based on the supplied GOM extract; Arabic/Urdu are authored, unverified translations.

Fixes: no automatic sample cache queue at startup; playback request deadline 55 seconds, backend render deadline 45 seconds, Edge connection deadline 20 seconds; one retry is no longer multiplied across a large startup queue. Warm is explicit, sequential and stops after two failures. Hosted audio persists in the browser, with temporary server caching only. Export ZIP reads browser audio. Browser speech is an explicitly enabled last resort, not silently substituted neural audio.

Run locally: install requirements.txt, then `uvicorn index:app --port 8765`.

Hosted output: server-side neural audio still requires Edge connectivity. No API key or paid voice service is configured. Vercel plan restrictions and availability still apply. Piper models are not bundled in this hosted app.

Test: `python -m pytest -q` (install pytest and httpx). Real deployed generation must be checked independently of deterministic tests.

## Group airlines and quick calls
The operator picker supports the six codes in the supplied GSA: G9, 3O, E5, 3L, 9P and 4P. It updates the flight prefix; flight numbers accept 1–4 digits. Fly Jinnah is spoken as Fly Jinnah. Original GOM source remains visible; speech substitutes the selected operator. First, second and general final calls are authored in English, Arabic and Urdu; named passenger final calls remain available. Aerobridge first calls use Zone A; remote first calls offer the existing row/Zone C options. Station staff must select the applicable remote sequence.

The voice catalogue validates Edge voices and exposes all returned English, Arabic and Urdu neural voices, with Hamed, Hamdan, Fatima, Uzma and Asad among the preferred choices. Urdu is enabled in Settings. First-time audio generation requires internet; cached audio is saved in this browser. The hosted page itself must already be open for offline playback; a fresh offline page load is not supported. Edge is a third-party online service, with no availability or perpetual free-service guarantee.

## Administrator controls

Use **Admin** to sign in with username `admin`. The password is supplied only via
`PA_ADMIN_PASSWORD` on the server; never commit it or put it in browser JavaScript.
The panel controls voice availability and EN/AR/UR template wording for all users.
Edits retain typed `[placeholders]` and are labelled as administrator edited.
Voice restrictions apply to preview, render, server cache access, and browser cache
playback/export checks. Previously downloaded audio cannot be recalled.

Local mode stores settings and expiring sessions in `admin.sqlite3`. Hosted mode
requires an Upstash-compatible Redis REST store configured with
`UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`. These must be server secrets.
Hosted admin access fails closed until both storage and password are configured;
existing public announcements continue to work before activation. Do not use `/tmp`
or browser localStorage for shared administration. Provision only a free plan.
Sessions expire after eight hours; logout revokes the session. Settings updates use
revision checks to prevent overwriting another administrator's changes.

Validation: `python -m pytest -q tests/test_admin.py tests/test_app.py`.
