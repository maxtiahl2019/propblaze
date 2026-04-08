# Deploy PropSeller AI → Netlify (Demo)

## Option A: Drag & Drop (fastest, 2 min)

1. Build locally:
   ```bash
   cd propseller-app/frontend
   NEXT_PUBLIC_DEMO_MODE=true npm run build
   ```
2. Go to https://app.netlify.com
3. Drag the `.next` folder onto the Netlify drop zone
4. Done — you get a URL like `https://propseller-demo.netlify.app`

---

## Option B: Netlify CLI (recommended)

```bash
# Install CLI once
npm install -g netlify-cli

# In the frontend folder:
cd propseller-app/frontend

# Login
netlify login

# Deploy (demo mode, no backend)
NEXT_PUBLIC_DEMO_MODE=true netlify deploy --build --prod

# Or set env vars in Netlify dashboard and just run:
netlify deploy --build --prod
```

---

## Option C: GitHub → Netlify (auto-deploy)

1. Push the repo to GitHub
2. Connect repo in Netlify dashboard → New site from Git
3. Set build settings:
   - **Base directory:** `propseller-app/frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `propseller-app/frontend/.next`
4. Add environment variables in Netlify UI:
   - `NEXT_PUBLIC_DEMO_MODE` = `true`
   - `NEXT_PUBLIC_IMAGES_UNOPTIMIZED` = `true`
   - `NEXT_PUBLIC_API_URL` = (leave empty for demo, or set to backend URL)

---

## What works in demo mode

| Route | Works | Notes |
|-------|-------|-------|
| `/` | ✅ | Full landing page |
| `/listings` | ✅ | Public property listings |
| `/listings/[id]` | ✅ | Property detail page |
| `/dashboard` | ✅ | Owner dashboard (mock data) |
| `/properties/new` | ✅ | Property wizard (mock save) |
| `/properties/[id]` | ✅ | Campaign dashboard (mock) |
| `/admin` | ✅ | Admin overview |
| `/admin/properties` | ✅ | Moderation table |
| `/admin/agencies` | ✅ | Agency management |
| `/admin/distributions` | ✅ | Distribution campaigns |

All pages show a purple "🎭 DEMO MODE" banner.

---

## Connect real backend later

When backend is deployed (Railway / Render / EC2):
1. Remove `NEXT_PUBLIC_DEMO_MODE=true`
2. Set `NEXT_PUBLIC_API_URL=https://your-api.example.com`
3. Redeploy
