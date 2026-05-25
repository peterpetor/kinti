# R2 média (logók, borítóképek) beüzemelése

## 1) Bucket létrehozása

```bash
npx wrangler r2 bucket create kinti-media
npx wrangler r2 bucket create kinti-media-preview   # `wrangler pages dev`-hez
```

A `wrangler.toml` már bekötve mindkettőt `MEDIA` bindingre.

## 2) S3-API token (a presigned PUT-hoz kell)

Cloudflare dashboard → R2 → **Manage R2 API Tokens** → **Create API token**

- **Permissions:** _Object Read & Write_
- **Bucket scope:** csak `kinti-media` és `kinti-media-preview`
- **TTL:** rövid (90 nap), rotáljuk lejáratkor

A kapott három értéket írd a `.dev.vars`-ba (lásd `.dev.vars.example`),
éles környezetben pedig Pages secret-ként:

```bash
npx wrangler pages secret put R2_ACCOUNT_ID
npx wrangler pages secret put R2_ACCESS_KEY_ID
npx wrangler pages secret put R2_SECRET_ACCESS_KEY
```

> Ne keverjük össze az **account API tokennel** — a presign **S3 access key + secret**
> párost vár. A dashboard explicit „**Use S3-compatible API**” linken adja meg.

## 3) CORS

A böngészőből történő közvetlen PUT-hoz a bucketnek engedélyeznie kell a
domainjeinket. A `r2-cors.json` benne van a repo-ban; alkalmazd:

```bash
npx wrangler r2 bucket cors put kinti-media --file=r2-cors.json
npx wrangler r2 bucket cors put kinti-media-preview --file=r2-cors.json
```

Vagy a dashboardon: **R2 → bucket → Settings → CORS Policy → Edit**.

> A production domaint (`https://kinti.app` / saját Pages-domain) frissítsd
> a JSON-ban, mielőtt élesítenél.

## 4) Helyi fejlesztés — fontos tudnivaló

A presigned PUT URL **mindig a valódi R2-höz** vezet
(`<account>.r2.cloudflarestorage.com`), nem a Miniflare lokál-tárolóhoz.
Tehát `next dev` és `wrangler pages dev` alatt is **a valódi R2-be megy** a
feltöltés. Két praktikus mintázat:

- **Preview bucket:** a `.dev.vars`-ban `R2_BUCKET="kinti-media-preview"`,
  és a `wrangler.toml`-ban a `preview_bucket_name` ugyanez. Így fejlesztés
  közben sosem írunk a prod bucketbe, de tényleges R2-feltöltést tesztelünk.
- **Tisztító cron / kézi ürítés:** `npx wrangler r2 object delete ...` —
  fejlesztői forgalom ne hagyjon hátra szemetet.

A `/api/media/<key>` kiszolgáló a MEDIA bindingen át tölt — ez `wrangler pages
dev`-en pontosan a fenti bucketet látja, így a feltöltött kép közvetlenül
megjelenik a profilon és a kártyákon.

## 5) Adatfolyam (összefoglaló)

```
[Kliens] LogoUploader
   │
   │ 1) POST /api/owner/media-upload   { contentType }
   │    Clerk auth → getBusinessByOwner → key = logos/<bizId>/<uuid>.<ext>
   │    presignR2Put(key)  →  uploadUrl (5 min)
   │
   │ 2) PUT  <uploadUrl>   (közvetlenül R2-be, content-type fejléccel)
   │
   │ 3) POST /api/owner/media-commit   { key }
   │    Clerk auth → prefix-check → MEDIA.head(key) → setBusinessLogo
   │
   ▼
D1.businesses.logo_key = "logos/<bizId>/<uuid>.<ext>"

[Bárki] GET /api/media/logos/<bizId>/<uuid>.<ext>
   → MEDIA.get(key) → Response(obj.body) + immutable cache
```
