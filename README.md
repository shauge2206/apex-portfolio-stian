# Apex Bergen Portfolio

Photography and videography portfolio for Apex Bergen. Built with Next.js and Cloudinary.

**Live site:** https://apex-portfolio-two.vercel.app
**Admin panel:** https://apex-portfolio-two.vercel.app/admin

---

## How it works

Content is stored in Cloudinary under the `apex/` folder:
- `apex/Logo/` — the logo image shown in the navbar
- `apex/{Category}/{Project}/` — photos and videos per project

The admin panel lets you manage thumbnails, ordering, and visibility without touching code. After making changes in admin, click **Publiser endringer** to update the live site.

---

## Local development

1. Clone the repo
2. Create `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dndi4tcz4
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...
   ADMIN_PASSWORD=...
   ```
3. Run the dev server:
   ```
   npm run dev
   ```
4. Open http://localhost:3000

---

## Deploying

Every push to `main` triggers a Vercel deployment automatically (if GitHub is connected).

To deploy manually:
```
vercel --prod
```

The build runs `scripts/fetch-portfolio.mjs` first, which fetches all Cloudinary data once and caches it. This keeps Cloudinary Admin API usage low (no rate limit issues).

---

## Admin panel

Go to `/admin` and enter the password from `.env.local` (`ADMIN_PASSWORD`).

What you can do:
- **Category thumbnails** — pick the cover image shown on the category grid
- **Project thumbnails** — pick the cover image for each project tile
- **Reorder** — drag projects or categories to change their order
- **Hide/show** — hide projects or categories from the public site
- **Publiser endringer** — publishes all pending changes to the live site

Changes to ordering, visibility, and thumbnails are saved instantly to JSON files in `data/`. They only go live when you click Publiser.

---

## Adding new content

1. Upload photos/videos to Cloudinary under `apex/{Category}/{Project}/`
2. Go to admin → click **Publiser endringer** to trigger a redeploy
   - Or push any change to `main` to trigger a fresh build that picks up new content

---

## Data files

The `data/` folder holds all admin settings as JSON files. These are committed to the repo so they persist across deployments:

| File | Purpose |
|------|---------|
| `portfolio-cache.json` | Cached Cloudinary content (regenerated on each build) |
| `thumbnails.json` | Custom thumbnail overrides per project |
| `category-thumbnails.json` | Custom thumbnail overrides per category |
| `hidden.json` | List of hidden project slugs |
| `hidden-categories.json` | List of hidden category slugs |
| `order.json` | Custom project order per category |
| `category-order.json` | Custom category order |
| `thumbnail-offsets.json` | Video frame offset (seconds) for project thumbnails |
| `category-thumbnail-offsets.json` | Video frame offset for category thumbnails |
| `thumbnail-focal-points.json` | Focal point (x/y) for project image crops |
| `category-thumbnail-focal-points.json` | Focal point for category image crops |

---

## Cloudinary rate limits

Cloudinary has two completely separate APIs with different limits:

### Admin API — rate limited
- Used to **discover content**: list folders, list files, get metadata
- Limit: **500 calls per hour** per Cloudinary account
- Resets 1 hour after the limit was first hit
- Requires your secret API key — never exposed to visitors

### Delivery CDN — no limit
- Used to **serve images and videos** to visitors' browsers
- Any URL like `https://res.cloudinary.com/dndi4tcz4/image/upload/...`
- Unlimited requests — this is what your site visitors use
- **Rate limiting never affects image/video loading on the live site**

---

## Why the Publish button exists

Admin actions (changing thumbnails, order, visibility) save instantly to JSON files in `data/`. They do **not** call Cloudinary.

Previously, saving in admin immediately refreshed the live page cache, which caused the app to re-fetch all content from Cloudinary. With multiple visitors or frequent admin saves, this would rapidly consume the 500/hour Admin API limit.

The **Publiser endringer** button decouples saving from publishing:
- Save as many changes as you want — zero Cloudinary calls
- Click Publish once when ready — this clears the page cache so the live site shows the latest data

---

## How builds avoid rate limits

Early in the project, deploying to Vercel hit the rate limit every time. The cause: Next.js uses 12 parallel build workers, and each one independently called Cloudinary to fetch all content (~42 API calls each × 12 workers = ~500 calls = limit hit).

The fix: a prebuild script (`scripts/fetch-portfolio.mjs`) runs **once** before the Next.js build starts. It fetches all Cloudinary data and writes it to `data/portfolio-cache.json`. The 12 build workers then read from that file — zero additional Cloudinary calls during the build.

**Total Admin API calls per deployment: ~42** (well within the 500/hour limit)

---

## Tech stack

- **Next.js 16** — framework
- **Cloudinary** — image/video storage and delivery
- **Tailwind CSS** — styling
- **Vercel** — hosting
