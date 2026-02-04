# Fix 404 for dashboard and _next/static (findx.kareemsoft.org)

---

## Mixed content (blocked:mixed-content) when using HTTPS

If the site is served over **HTTPS** but the API is called with **HTTP**, the browser blocks the request (mixed content). The app now forces the API URL to **HTTPS** when the page is loaded over HTTPS, so existing builds work. For new builds, set:

- **Frontend:** `VITE_API_URL=https://findx.kareemsoft.org/api` and `VITE_DASHBOARD_URL=https://findx.kareemsoft.org/dashboard`
- **Dashboard:** `NEXT_PUBLIC_API_URL=https://findx.kareemsoft.org/api`

---

You see:
- `GET http://findx.kareemsoft.org/dashboard/login` → 404
- `GET http://findx.kareemsoft.org/_next/static/chunks/...` → 404

**Cause:** Either Nginx is not proxying `/dashboard` to the Next.js app, or the dashboard was built **without** `basePath`, so it serves at “root” and its assets are requested at `/_next/...` (which your frontend root doesn’t have).

---

## Fix 1: Nginx – proxy `/dashboard` to Node (port 3008)

Your Nginx config for `findx.kareemsoft.org` must send all `/dashboard` traffic to the Next.js app.

Add (or fix) this **before** the `location /` block:

```nginx
# Next.js dashboard – must be before "location /"
location /dashboard {
    proxy_pass http://127.0.0.1:3008;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

Then reload Nginx so the new config is used. **If you see "nginx.service is not active"**, Nginx is not managed by systemd (e.g. BaoTa). Use:

```bash
sudo nginx -t && sudo nginx -s reload
# Or: sudo /etc/init.d/nginx reload
# Or in BaoTa panel: Nginx → Reload
```

Make sure the Next.js app is running on 3008:

```bash
pm2 list
# findx-dashboard should be "online"
```

---

## Fix 2: Rebuild dashboard with basePath `/dashboard`

If the dashboard was built **without** `NEXT_PUBLIC_BASE_PATH=/dashboard`, it generates asset URLs like `/_next/...`. The browser then requests `findx.kareemsoft.org/_next/...`, which is served by your **frontend** (root), so you get 404.

Rebuild the dashboard with basePath set:

**On the server:**

```bash
cd /www/wwwroot/findx.kareemsoft.org/dashboard

# Set basePath for production (so assets are under /dashboard/_next/...)
echo 'NEXT_PUBLIC_API_URL=http://findx.kareemsoft.org/api' > .env.production
echo 'NEXT_PUBLIC_BASE_PATH=/dashboard' >> .env.production

# Rebuild
npm run build

# Restart the app
pm2 restart findx-dashboard
```

After this:
- Routes are under `/dashboard` (e.g. `/dashboard/login`, `/dashboard/admin`).
- Assets are under `/dashboard/_next/...`, so Nginx sends them to the same Next.js app via `location /dashboard`.

---

## Checklist

| Step | What to do |
|------|------------|
| 1 | Nginx: add or keep `location /dashboard { proxy_pass http://127.0.0.1:3008; ... }` **before** `location /`. |
| 2 | Dashboard: `.env.production` has `NEXT_PUBLIC_BASE_PATH=/dashboard`. |
| 3 | Dashboard: run `npm run build` and `pm2 restart findx-dashboard`. |
| 4 | Reload Nginx. |

Then open **http://findx.kareemsoft.org/dashboard/login** again; the page and `_next/static` assets should load.

---

## Fix 3: If `/dashboard/_next/...` still 404 (assets)

Your Nginx has a **regex** location for `.js` and `.css`:

```nginx
location ~ .*\.(js|css)?$ { expires 12h; access_log off; }
```

That matches **every** request ending in `.js` or `.css`, including `/dashboard/_next/static/.../file.js`. So Nginx serves those from the **frontend root** (dist/) instead of proxying to the dashboard → 404.

**Fix:** Exclude `/dashboard` from that regex so dashboard assets are proxied:

```nginx
# Only apply expires to frontend static files; do NOT match /dashboard/*
location ~ ^(?!/dashboard).*\.(js|css)?$ {
    expires 12h;
    access_log off;
}
```

Reload Nginx. Then `/dashboard/_next/static/...` requests will hit `location /dashboard` and be proxied to Node.

---

## Fix 4: Force `/dashboard` to win (use `^~`)

Some Nginx setups still let a regex run before the prefix. Make `/dashboard` win over **all** regex locations by using the **`^~`** modifier:

**Change:**
```nginx
location /dashboard {
```

**To:**
```nginx
location ^~ /dashboard {
```

So the block becomes:

```nginx
location ^~ /dashboard {
    proxy_pass http://127.0.0.1:3008;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

With `^~`, any URI starting with `/dashboard` is handled by this block and **no regex location** (including the js/css one) is checked. Reload Nginx after editing.

---

## Fix 5: Serve dashboard static files with Nginx (no proxy)

If `/dashboard/_next/static/...` still 404, the proxy may not be used for this vhost (e.g. another layer or config). **Serve the built files directly** so Nginx returns them from disk.

Add this **before** the `location ^~ /dashboard` proxy block:

```nginx
# Dashboard static files – serve .next from disk
location ^~ /dashboard/_next {
    alias /www/wwwroot/findx.kareemsoft.org/dashboard/.next;
}
```

So:
- `GET /dashboard/_next/static/chunks/16ce65076d53109c.css` → Nginx serves `.../dashboard/.next/static/chunks/16ce65076d53109c.css`
- Other `/dashboard/*` (e.g. `/dashboard/login`) still go to the proxy.

Reload Nginx (`sudo nginx -s reload` or panel).
