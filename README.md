# FatScope – PROJECT_METABOLIC

Next.js 14 dashboard for CT Muscle & Fat Segmentation, ready for Vercel deployment.

## Stack

- **Next.js 14** (App Router) + TypeScript
- **Tailwind CSS** – dark medical theme
- **React Query** – server state management
- **Recharts** – future chart components
- **Axios** – HTTP client

## Architecture

```
Next.js (Vercel)          FastAPI backend (your server)
     │                            │
     │  /api/* rewrites ────────► │  /api/*
     │                            │  nnU-Net models
     │                            │  NIfTI processing
```

All `/api/*` calls are proxied to the FastAPI backend via Next.js rewrites.
The ML backend is **not** on Vercel – it runs on your own server with GPU.

## Quick start (dev)

```bash
cp .env.example .env.local
# Edit .env.local and set API_BASE_URL to your FastAPI server
npm install
npm run dev          # http://localhost:3000
```

## Deploy to Vercel

1. Push this folder to a GitHub repo (or the monorepo root)
2. Import project in Vercel, set root directory to `PROJECT_METABOLIC`
3. Add environment variable:
   - `API_BASE_URL` = URL of your FastAPI backend (e.g. `https://myserver.com`)
4. Deploy – Vercel builds on Linux, no filesystem issues

> **Note:** `npm run build` may fail locally on Windows drives that don't support
> `readlink` (e.g. network/RAM drives). It builds correctly on Vercel (Linux).

## Project structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout + providers
│   ├── page.tsx            # Main dashboard (3-column layout)
│   ├── providers.tsx       # React Query provider
│   ├── globals.css         # Tailwind + custom styles
│   ├── error.tsx           # Error boundary
│   └── not-found.tsx       # 404 page
├── components/
│   ├── layout/
│   │   └── Header.tsx      # Top nav bar
│   ├── dashboard/
│   │   ├── UploadZone.tsx  # CT scan upload with progress
│   │   ├── StudyList.tsx   # Left sidebar study list
│   │   ├── StudyActions.tsx # Run models + upload segs
│   │   └── MetricsPanel.tsx # Volume & L3 metrics
│   └── viewer/
│       └── SliceViewer.tsx  # CT slice viewer with overlays
├── lib/
│   ├── api.ts              # All API calls (axios)
│   └── utils.ts            # cn(), formatDate(), etc.
└── types/
    └── index.ts            # TypeScript interfaces
```

## API endpoints used

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/studies` | List all studies |
| GET | `/api/studies/:id` | Study detail + metrics |
| POST | `/api/upload` | Upload CT scan (.nii/.nii.gz) |
| POST | `/api/segmentations/upload/:id` | Upload pre-computed segmentations |
| POST | `/api/run/:id` | Run nnU-Net models (async job) |
| GET | `/api/jobs/:id` | Poll job status |
| GET | `/api/slices/:id?index=N` | Get slice as base64 PNG |
| POST | `/api/l3/:id` | Compute L3 sarcopenia metrics |
