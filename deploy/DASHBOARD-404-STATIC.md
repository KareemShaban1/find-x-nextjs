# Fix 404 for dashboard _next/static (chunks and CSS)

You see:
- `GET https://findx.kareemsoft.org/dashboard/_next/static/chunks/xxx.js` → 404
- `GET https://findx.kareemsoft.org/dashboard/_next/static/chunks/xxx.css` → 404

## Cause

Requests for `/dashboard/_next/static/...` are returning 404. That usually means either:
1. Next.js on port 3008 is not finding the files (wrong working directory or no `.next` there), or
2. Nginx was serving `_next` from disk with an alias that had the wrong path or missing trailing slashes.

## Fix: serve _next from disk with Nginx (alias with trailing slashes)

Use Nginx to serve `_next` files directly from the `.next` folder. **Trailing slashes are required** on both the location and the alias so paths resolve correctly.

### 1. Add the _next alias **before** the dashboard proxy

Insert this block **above** your existing `location ^~ /dashboard` block (so the more specific `_next` path is matched first):

```nginx
# Serve dashboard static files from disk (must be before "location ^~ /dashboard")
location ^~ /dashboard/_next/ {
    alias /www/wwwroot/findx.kareemsoft.org/dashboard/.next/;
}

# Dashboard proxy (HTML / API)
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

Notes:
- **Trailing slashes** on both `/dashboard/_next/` and `.../dashboard/.next/` are required.
- Replace `/www/wwwroot/findx.kareemsoft.org/dashboard` with your real dashboard path if different.

Reload Nginx:

```bash
sudo nginx -t && sudo nginx -s reload
```

### 2. Ensure `.next` exists at that path on the server

Nginx will 404 if the folder or files are missing. Do **one** of the following.

**Option A – Build on the server**

```bash
cd /www/wwwroot/findx.kareemsoft.org/dashboard

# Set env (use HTTPS for API)
echo 'NEXT_PUBLIC_API_URL=https://findx.kareemsoft.org/api' > .env.production
echo 'NEXT_PUBLIC_BASE_PATH=/dashboard' >> .env.production

npm ci
npm run build
pm2 restart findx-dashboard
```

**Option B – Build locally, then upload**

1. On your PC:

   ```bash
   cd dashboard
   rm -rf .next
   npm run build
   ```

2. Upload the whole `dashboard` folder to the server (including `.next`), so you have:
   - `/www/wwwroot/findx.kareemsoft.org/dashboard/.next/`
   - `/www/wwwroot/findx.kareemsoft.org/dashboard/.next/static/chunks/` (with the .js/.css files)

3. On the server:

   ```bash
   cd /www/wwwroot/findx.kareemsoft.org/dashboard
   npm ci
   pm2 restart findx-dashboard
   ```

### 3. Verify on the server

```bash
# Check that chunk files exist (names will vary per build)
ls /www/wwwroot/findx.kareemsoft.org/dashboard/.next/static/chunks/*.js | head -5
```

If that path exists and has files, the Nginx alias will serve them and the 404s should stop.

---

## 404 with "wrong" chunk names (e.g. 16ce65076d53109c.css not found)

If the browser requests chunks like `16ce65076d53109c.css` or `3baa48eb04dc4aaf.js` but `ls .next/static/chunks/` shows **different** hashes (e.g. `102f894cc892994d.js`), the HTML you see is from an **old build** and is **cached**. The server has a newer build with different chunk names.

**Fix:** force the browser to load fresh HTML and assets:

1. **Hard refresh:** `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac) on the dashboard page.
2. Or open the dashboard in a **private/incognito** window.
3. Or clear the site’s cache for `findx.kareemsoft.org` in the browser.

After that, the server will send the current HTML, which references the current chunk names (e.g. `102f894cc892994d.js`), and those files exist on disk so the 404s stop.

---

## Still 404 after hard refresh / incognito: PM2 may be using a different folder

If you still get 404 for chunk names like `16ce65076d53109c.css` even in incognito, the **HTML** is coming from the running Node app, and that app is using a **different** `.next` folder (older build or different path). PM2’s **working directory** might not be the folder where you ran `npm run build`.

**1. See where the dashboard app is running from**

On the server:

```bash
pm2 show findx-dashboard
```

In the output, find **exec cwd** or **script cwd**. That is the directory Next.js uses for `.next`.

**2. See which chunks that directory has**

```bash
# Replace EXEC_CWD with the path from step 1, e.g.:
ls /www/wwwroot/findx.kareemsoft.org/dashboard/.next/static/chunks/*.js | head -3
```

If the path from `pm2 show` is **different** (e.g. `/root/find-x/dashboard`), run the same `ls` for **that** path. If you see the **old** chunk names there (e.g. `16ce65076d53109c`), that’s the build the app is using.

**3. Fix: run and build in the same directory**

Either:

- **A)** Build in the directory PM2 uses:  
  `cd <EXEC_CWD from pm2 show>`  
  then `rm -rf .next && npm run build` and `pm2 restart findx-dashboard`,  
  or  

- **B)** Make PM2 use the directory where you already built (e.g. `/www/wwwroot/.../dashboard`):  
  Stop the app, then start it from that folder so `cwd` is correct:

```bash
pm2 delete findx-dashboard
cd /www/wwwroot/findx.kareemsoft.org/dashboard
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

Then hard refresh or incognito again; the HTML and chunks should match.

---

## exec cwd is correct but 404s continue: see what HTML the server returns

If **exec cwd** is already `/www/wwwroot/findx.kareemsoft.org/dashboard` (where you built), the app is using that folder. Check what the running app actually sends.

**On the server, run:**

```bash
# What chunk URLs are in the HTML from the running app?
curl -s http://127.0.0.1:3008/dashboard/login | grep -oE '_next/static/chunks/[^"'\'']+\.(js|css)' | head -10
```

Then:

```bash
# What chunk files exist on disk?
ls /www/wwwroot/findx.kareemsoft.org/dashboard/.next/static/chunks/*.js | head -5
```

- If the **curl** output shows names like `16ce65076d53109c` but **ls** shows `102f894cc...`, the process is serving an old in-memory build: do a **full restart** so it reloads from disk:

  ```bash
  pm2 delete findx-dashboard
  cd /www/wwwroot/findx.kareemsoft.org/dashboard
  pm2 start ecosystem.config.cjs
  pm2 save
  ```

- If the **curl** output already shows the same hashes as **ls**, the server is correct and the issue is cache in front (browser, CDN, or Nginx). Add no-cache for the dashboard proxy (see below) and try again in incognito.

**Optional: stop Nginx caching dashboard responses**

In the `location ^~ /dashboard` block (the proxy one, not the `_next/` alias), add:

```nginx
proxy_set_header Cache-Control "no-store, no-cache";
proxy_cache_bypass 1;
```

and reload Nginx. Then retry in incognito.

---

## Checklist

| Step | Action |
|------|--------|
| 1 | Add `location ^~ /dashboard/_next/` with `alias .../.next/` (trailing slashes) **before** `location ^~ /dashboard`. |
| 2 | Reload Nginx. |
| 3 | Ensure `.next` is present at the alias path (build on server or upload after local build). |
| 4 | Restart dashboard: `pm2 restart findx-dashboard`. |
