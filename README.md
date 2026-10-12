# Air Arabia Station PA — Mobile release v6

The app provides airport boarding, delay, paging and gate-change announcement scripts for Air Arabia station staff.

## Free speaking mode (default)
1. Choose FREE · Phone voices.
2. Enter flight number, origin, destination and gate.
3. Choose the announcement. Boarding zones and row ranges are operator-selected, including separate Zone A, B, C or combined zones.
4. Select English, Arabic and optionally Urdu. Review and edit each script for correct flight information and pronunciation.
5. Confirm the script review, tap Prepare announcement and tap Play audio. Stop cancels spoken output.

In this mode the application calls the phone/browser's Web Speech synthesis, **not a server**. There is no TTS server error, voice subscription, API key or per-character fee. The user must have a browser that supports speech and the appropriate device voice/language. Voice quality depends on the handset; some voices use network access. Free does not mean verified HD. For a PA microphone, use the phone speaker and check volume and routing before public broadcasts.

The interface is designed to be installable (PWA) and mobile friendly. Offline speech is only possible if the operating system can speak using installed offline voices. All speech must be initiated by user action; the app stops playback on backgrounding.

## Optional HD voice
Premium verified Azure HD mode is still supported by the existing server code, but is disabled until specifically configured with an approved voice resource, an access code and quotas. It is never silently substituted for phone speech and does not automatically incur charges.

## Deployment
The v6 free-voice build (commit 04678880) was deployed on 12 October 2026 to existing Vercel project `air-arabia-pa` as a preview. The preview is publicly accessible after Vercel Authentication was disabled on this project. No paid voice service was enabled.

Vercel Hobby is intended for non-commercial activity; this build is a functional evaluation, **not a licensed production environment for every airline station**. Netlify's commercial-capable Free plan is a suitable alternative within its usage limits, provided an authorized Netlify account can publish the static build.

## Verification
Node tests and syntax checks passed on the deployment (17 tests). Those automated tests cover script generation and server guards, not audible phone voices. Physical iPhone/Android, Arabic/Urdu pronunciation, background interruptions, speaker routing and airport PA acceptance remain to be tested before operational authorization. Use approved current announcement scripts and station procedures.
