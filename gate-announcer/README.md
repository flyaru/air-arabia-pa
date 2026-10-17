# Air Arabia Gate Announcer — hosted edition

FastAPI + vanilla JavaScript. Vercel root directory: `gate-announcer`.

The 2026 GSA aerobridge calls are Zone A first, then Zones B + C. Remote calls remain separate. English source scripts are based on the supplied GOM extract; Arabic/Urdu are authored, unverified translations.

Fixes: no automatic sample cache queue at startup; playback request deadline 55 seconds, backend render deadline 45 seconds, Edge connection deadline 20 seconds; one retry is no longer multiplied across a large startup queue. Warm is explicit, sequential and stops after two failures. Hosted audio persists in the browser, with temporary server caching only. Export ZIP reads browser audio. Browser speech is an explicitly enabled last resort, not silently substituted neural audio.

Run locally: install requirements.txt, then `uvicorn index:app --port 8765`.

Hosted output: server-side neural audio still requires Edge connectivity. No API key or paid voice service is configured. Vercel plan restrictions and availability still apply. Piper models are not bundled in this hosted app.

Test: `python -m pytest -q` (install pytest and httpx). Real deployed generation must be checked independently of deterministic tests.
