# Air Arabia PA Console

HD Microsoft Edge Neural voices (male):
- English: `en-US-GuyNeural`
- Arabic (UAE Emirati): `ar-AE-HamdanNeural`
- Urdu: `ur-PK-AsadNeural` (auto for Fly Jinnah)

Default speed: **0.90x**

## Deploy with GitHub + Vercel (recommended)

### 1. Create GitHub repo
1. Go to https://github.com/new
2. Name it e.g. `air-arabia-pa`
3. Create (empty, no README)

### 2. Upload these files
Upload **all** files from this folder into the repo root:
- `index.html`, `style.css`, `app.js`
- `manifest.json`, `vercel.json`, `package.json`
- `api/tts.js` (must be inside the `api` folder)

Or with git locally:
```bash
git init
git add .
git commit -m "Air Arabia PA Console"
git branch -M main
git remote add origin https://github.com/YOUR_USER/air-arabia-pa.git
git push -u origin main
```

### 3. Deploy on Vercel
1. Go to https://vercel.com → Sign in with GitHub
2. **Add New Project** → Import your repo
3. Leave defaults → **Deploy**
4. Wait ~1 minute → open the live URL

Every `git push` to `main` will auto-update the site.

### API
TTS endpoint: `POST /api/tts`  
Body: `{ "text": "...", "voice": "ar-AE-HamdanNeural", "rate": "-10%" }`

## Language rules
- **Fly Jinnah** → EN + UAE Arabic + Urdu automatically
- **Other airlines** → EN + UAE Arabic (tick “Include Urdu” if needed)
