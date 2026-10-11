# Air Arabia Station PA — release candidate 5.0

An installable, responsive announcement console for station staff. This is a release candidate, **not a commissioned airport PA system**.

## Current delivery state

The code and automated checks are complete for this candidate. Production deployment and live voice verification remain blocked by the zero-spend requirement and missing approved voice resources. No premium provider, quota store, paid plan or billable resource has been enabled. The old Netlify site is unchanged.

The old Vercel deployment failed because `vercel.json` referenced `api/tts.js`, which was absent. This release includes that endpoint and a static build. Automatic Git deployments are disabled in `vercel.json` until hosting eligibility and costs are settled.

## What works

- Station code, local time zone and operating airline configuration; any station can enter its own city names.
- English, Arabic and Urdu scripts; row/zone boarding, final calls, assistance, disruptions and passenger paging. Fly Jinnah adds Urdu automatically.
- Review and edit every language independently. Unknown place names and free text are not automatically translated.
- Required flight/gate checks; configurable boarding zones instead of an assumed global boarding order.
- Two distinct steps: prepare all language audio, then explicitly tap Play. No automatic broadcast after a slow network response.
- Abort pending requests, reject stale completions, prevent overlapping playback and stop when the app leaves the foreground.
- Completion is recorded only after device playback ends. This cannot confirm physical airport PA delivery.
- Bounded offline audio storage (40 entries / 30 MiB) for non-personal flight scripts; no passenger or custom-script audio saved.
- Versioned offline app shell. Updates wait for old windows to close, rather than replacing code during playback.
- Install manifest and 192/512 px icons; mobile touch targets, no forced orientation, RTL script editing.
- No browser speech synthesis, unofficial Edge speech endpoint, hidden voice substitution, external fonts, trackers or paid fallback.
- Server-only speech credentials, per-station hashed access codes, shared atomic character allowances, escaped SSML, strict HD allowlist, live provider voice/locale verification, request timeout and bounded audio response.

## Run checks

Node.js 22 or newer; no npm dependencies are required.

```sh
npm test
npm run check
npm run build
```

`dist/` contains only public application assets. Vercel discovers `api/config.js` and `api/tts.js` separately. Never publish `.env` or server configuration as static files.

The tests use synthetic provider responses. They prove control flow and rejection behaviour, **not audible voice quality, Azure account access or handset compatibility**.

## Voice and cost constraints

The default is `PREMIUM_VOICE_ENABLED=false`, no credentials, no allowed voices and zero character allowances. In this state there are no outbound synthesis or Redis calls. The app can prepare scripts but cannot create audio.

Premium/HD voice synthesis cannot be promised free and unlimited. Azure F0 lists 500,000 neural characters per month; this is not a promise of free HD usage. Ordinary Guy/Hamdan/Asad neural voices must not be labelled HD.

Vercel's free Hobby plan restricts use to personal, non-commercial projects. Airline-wide operational use requires an eligible hosting arrangement. A Pro trial is not a permanent zero-cost solution. This release does not subscribe to a plan.

An existing company-funded entitlement could avoid a personal bill, but it still consumes resources and requires an explicit hosting/voice decision. Do not enable generation under the present strict zero-spend instruction.

## Integration configuration (administrator only)

After a separately approved cost/hosting decision, configure server secrets using `.env.example`. No keys belong in the browser or GitHub.

1. Select an existing Azure Speech region and resource; verify pricing, supported voice models and language availability for that resource.
2. Set `APPROVED_HD_VOICES` to a JSON array with `{id, name, language, locale}` for each voice/language pair. `language` is `en`, `ar` or `ur`; locale must be exact, such as `ar-AE`. Use the **actual** provider ShortName. Do not invent HD variants by adding a suffix.
3. Each request confirms that the configured ShortName and locale exist in the regional provider catalogue and are GA. Unsupported, preview or non-HD voices fail without a fallback. A catalogue omission intentionally blocks synthesis until resolved.
4. Supply unique, random station access codes of at least 24 characters. Store only their SHA-256 hex digests in `STATION_ACCESS_HASHES`, keyed by IATA station code. Staff enter the actual code in the app; it remains in memory. These codes are a controlled pilot access mechanism, not corporate SSO or named-user accountability.
5. Configure an existing Upstash Redis REST resource for shared atomic quotas. Set positive `MAX_DAILY_CHARACTERS` and `MAX_STATION_DAILY_CHARACTERS`. The quota counts the entire escaped SSML request conservatively; failed synthesis reservations are not refunded. An unavailable quota service blocks synthesis. Limits reset at UTC midnight.
6. Only after approval, set `PREMIUM_VOICE_ENABLED=true`. This is an enable switch, **not a financial spending cap**. Hosting, Redis and Azure each have their own costs. Character limits do not guarantee zero spend.

The endpoint uses official Azure Speech REST, `audio-24khz-96kbitrate-mono-mp3`, and original pitch/speed. HD voices do not support SSML prosody rate controls, so the UI does not simulate them by lowering playback pitch.

Request: `POST /api/tts`, JSON `{station, lang, voice, text}`, station code in `Authorization: Bearer …`. The provider key stays on the server. Automatic retries are intentionally absent: a lost response does not prove synthesis was unbilled.

## Deployment and rollout

- Target existing repository `flyaru/air-arabia-pa` and existing Vercel project `air-arabia-pa` (`prj_gIjgSTn64J8ZpX4o500YwXNgkxZ4`). Do not create a duplicate project.
- Preserve deployment protection. The existing Vercel project protects its deployment URLs with Vercel authentication. Ordinary station staff cannot be assumed to have access. Agree a supported staff access approach before rollout.
- Review the branch, run checks, confirm eligible hosting and provider costs, then deploy explicitly. Re-enable Git deployment only if desired after the deployment decision.
- Roll back to a known good commit if needed; never silently substitute lower-quality speech.

Before use across all stations, the remaining acceptance work includes physical iPhone/Android testing, PA routing and interruption tests, live multilingual voice/pronunciation approval, current operational-script approval, corporate access control, and workload testing against an agreed station count/concurrency target.

This is a PWA, not a native App Store/Play Store package. Current iOS Safari and Android Chrome are intended targets; every phone, old OS, background playback, lock-screen behaviour and airport output device cannot be guaranteed. Browser storage can be evicted. Offline means previously prepared audio only.

## Script provenance

Adapted from the user's existing repository and supplied GOM announcement page (Chapter 10, page 43, Rev.15+, 15 Aug 2024). This historical page does not prove current airline-wide procedures. The PDF itself is not included in the public repository. Zone/row choices are explicitly operator-controlled. Arabic/Urdu text and pronunciation still require operational language review.

## Official references

- https://vercel.com/docs/plans/hobby
- https://azure.microsoft.com/en-us/pricing/details/speech/
- https://learn.microsoft.com/en-us/azure/ai-services/speech-service/rest-text-to-speech
- https://learn.microsoft.com/en-us/azure/ai-services/speech-service/high-definition-voices
- https://upstash.com/docs/redis/features/restapi
