# MKP Bikes redesign: backend handover

The redesign in `site/` is a **frontend only** change. It runs on the existing backend (the Next.js app
at mkpbikes.com.au: API routes, admin panel, database, S3, Klaviyo, email). No backend code, database or
admin changes are needed to launch it.

Audited against the live site on 26 Oct 2026 by reading the live JS bundles and calling the public endpoints.

## How to deploy

Serve the new pages from the **same domain** as the backend. Every call is a same-origin relative URL
(`/api/...`), and the API sends no CORS headers, so the new pages will not work from a different domain.

Keep these served by the existing Next.js app:

- `/api/*` (all endpoints below)
- `/admin`, `/admin/*`, `/login`, `/api/auth/*` (admin panel and NextAuth)
- `/_next/*` (only needed by the admin pages)

Replace the public pages with the files in `site/` and add rewrites so the **old URLs keep working**
(SEO, Google listing, Instagram links, old WhatsApp messages):

| Live URL | New file |
|---|---|
| `/` | `index.html` |
| `/bikes` | `bikes.html` |
| `/bikes/pre-owned` | `bikes.html?type=pre` |
| `/bikes/new-bikes` | `bikes.html?type=new` |
| `/bikes/:type/:slug` | `product.html?bike=:slug` |
| `/bikes?search=x` | `bikes.html?search=x` (already supported; also `?type=pre-owned`/`new-bikes`, `?category=`) |
| `/tavelo` | `tavelo.html` |
| `/bike-fitting` | `fitting.html` |
| `/book-fitting` | `book-fitting.html` |
| `/sell-your-bike` | `sell.html` |
| `/find-your-size` | `size.html` |
| `/request-a-bike` | `request.html` |
| `/about` | `about.html` |
| `/gallery` | `content.html` |
| `/article` | `articles.html` |
| `/article/:slug` | `article.html?slug=:slug` |
| `/favourites` | `index.html#favourites` (opens the favourites drawer) |
| `/guides`, `/guides/*`, `/deals` | not redesigned yet: keep the current pages or redirect to `/bikes` |

Easiest in Next.js: put the `site/` files in `public/` and add `rewrites()` in `next.config.js` for the
table above, then delete the old public page routes. Or use clean URLs in the new files directly; the
internal links are plain `*.html` hrefs and are easy to search and replace.

The sitemap (`/sitemap.xml`) and robots should keep listing the old clean URLs.

## Data the new frontend reads (all existing endpoints, unchanged)

| Feature | Endpoint | Where in the new code |
|---|---|---|
| All bikes (shop, homepage, Tavelo, chat, favourites) | `GET /api/bikes/paginated?limit=500` | `js/api.js` |
| One bike + grades (`componentConditions`) | `GET /api/bikes/:slug` | `js/api.js` (`MKP_API.bike`) |
| Articles list / one article | `GET /api/articles?page=1&limit=100`, `GET /api/articles/:slug` | `js/articles-live.js` |
| Videos (Our Content) | `GET /api/videos` | `content.html` |

`js/bikes-data.js` and `js/articles-data.js` are snapshots used only for instant first paint and as a fallback.
Once `/api` answers, the live data replaces them, so anything added, edited, discounted, archived or sold
in the admin shows on the new site with no rebuild.

Mapped from the admin data:

- **Type:** `type.slug` (`pre-owned`, `new-bikes`). `archived` and `inStock: false` are hidden.
- **Price:** `price`. If `isOnDeal` and `dealPrice` are set and the dates `dealStartDate`/`dealEndDate` are current, the deal price shows with the old price struck through plus an "On deal" badge.
- **Grades:** `componentConditions` (frameSet, wheelSet, groupSet, cockpit) and `condition`, shown as a percentage on a Low to High bar. Words map to fixed percentages: amazing 96, excellent 90, great 84, good 74, fair 58, poor 35. If the admin ever stores numbers 0 to 100, they are shown as-is.
- **Related:** `relatedProducts` (picked in the admin) shows first on product pages.
- **Other fields:** sizing, specs, features, images (S3 `src`), and `longDescription` (markdown).

## Forms and actions (all post to the existing endpoints, same payloads)

| Flow | Endpoint and body | New code |
|---|---|---|
| Request a bike | `POST /api/request-bike` `{name, phone, bikeModel, size, budget, notes}`. Size/budget use the exact enum values the backend validates, including `"$1,000 – $2,000"` | `request.html` |
| Email my size result | `POST /api/send-size-result` `{email, measurements, style, frameSize, sizeDescription}` | `size.html` |
| Footer newsletter | removed at the client's request (not used); handler for `POST /api/newsletter/subscribe` is still in `js/site.js` if it comes back | none |
| Homepage triathlete guide popup | `POST /api/klaviyo/subscribe` `{email, type:"triathlon"}` | `js/site.js` |
| Fitting page checklist popup (30s) | `POST /api/klaviyo/subscribe` `{email, type:"bikefit"}` | `js/site.js` |
| "Clicked Book Fitting" event | `POST /api/klaviyo-track` `{event, page_url, email}` (email from localStorage `klaviyo_email`, same key as live) | `[data-track]` in `js/site.js` |
| Bike Finder chat ("Tony"), typed messages | `POST /api/chat` `{histories, lastHistory}` | `js/chat.js` |
| Bike Finder chat, guided picks | `POST /api/recommendations` `{height, minBudget, maxBudget, bikeType}` | `js/chat.js` |
| Favourites | cookie `mkp_favourites` (JSON slugs, 30 days, path=/), same as live, so saved bikes carry over | `js/site.js` |
| Deposit / test ride / enquiries | WhatsApp `wa.me/61478165043` with the live wording and the live bike URL | `js/site.js` |
| Bike fit booking | Calendly `ash-mkp-bikes/comprehensive-bike-fit-mkp-bikes` | `book-fitting.html` |
| Admin link | footer "Admin Panel" goes to `/admin` | `js/site.js` |

Forms only post to `/api` when the page is on `*.mkpbikes.com.au`. In the local preview they fall back:

- Request a bike opens WhatsApp.
- Popups and the newsletter use the Klaviyo client API.
- `tools/dev-server.py` blocks form posts, so testing never creates real leads.

## Third-party scripts (same IDs as live, production domain only)

Loaded by `js/site.js` only when the hostname is mkpbikes.com.au:

- Google Tag Manager `GTM-TXV97Z5R` and `GTM-PGFC2PF6`
- Klaviyo onsite `RMdpdR`
- respond.io webchat `cId=99a288a24b32520fb838a04a2677885`. The Tony chat button sits above it on live.
- Auscycles tracking (`data.auscycles.com`, same pkey/connector as live)

Still to carry over from the old `<head>`:

- the LocalBusiness JSON-LD schema
- Google site verification `kkY_OoeNBHuIBMYF6RRw9TXKVgivlLUiu6pOZ2YGkD4`
- og/meta tags per page

## Found during the audit (existing backend issues, not caused by the redesign)

1. **`POST /api/chat` returns 500** on the live site right now. The AI side of the chat is down, and live visitors only get the fallback "Quick search mode". The new chat falls back the same way, to guided questions plus `/api/recommendations`, which works.
2. **`/api/recommendations` can return bikes that are no longer listed** (e.g. `cervelo-c2`). The new chat filters those out.
3. **`/api/recommendations` rejects `minBudget: 0`** ("Incomplete Memory"). The new chat sends 1 for "under $X".
4. **Address mismatch:** the site copy says 5/17 Kylie Place, but the JSON-LD schema and Google Business listing say 9/17. Pick one.

## Local preview against the real backend

```
./dev.sh            # python3 tools/dev-server.py 4173
```

This serves `site/` and forwards `GET /api/*` and the read-only chat endpoints to the live site. All other posts are blocked.
