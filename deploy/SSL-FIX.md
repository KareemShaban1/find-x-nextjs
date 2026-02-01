# Fix ERR_CERT_COMMON_NAME_INVALID for findx.kareemsoft.org

The error means the HTTPS certificate does not match the domain the browser is using.

## 1. Check which domain the cert is for

On the server:

```bash
# If using Let's Encrypt (certbot)
sudo certbot certificates

# Or inspect the cert Nginx is using
echo | openssl s_client -servername findx.kareemsoft.org -connect findx.kareemsoft.org:443 2>/dev/null | openssl x509 -noout -subject -ext subjectAltName
```

The **Subject** or **subjectAltName** must include exactly **findx.kareemsoft.org** (and **www.findx.kareemsoft.org** if users visit that).

## 2. Issue or renew the certificate for findx.kareemsoft.org

### Option A – Certbot (Let's Encrypt)

**If you get `invalid PID number "" in "/run/nginx.pid"` or "nginx restart failed"**  
Your Nginx is likely managed by BaoTa/panel and uses a different PID path. Use one of the methods below instead of `certbot --nginx`.

#### A1. Certbot **webroot** (recommended – Nginx stays running)

Certbot only writes a file; Nginx serves it. No restart needed.

```bash
# Create the webroot path Let's Encrypt will use (must match your site root)
sudo mkdir -p /www/wwwroot/findx.kareemsoft.org/dist

# Get the cert (use the same path as your Nginx "root" for this site)
sudo certbot certonly --webroot \
  -w /www/wwwroot/findx.kareemsoft.org/dist \
  -d findx.kareemsoft.org -d www.findx.kareemsoft.org \
  --email shabankareem919@gmail.com \
  --agree-tos --no-eff-email
```

Then **manually** add SSL to your Nginx vhost (in the panel or edit the site’s Nginx config). Add inside the `server { ... }` for findx.kareemsoft.org:

```nginx
listen 443 ssl;
ssl_certificate     /etc/letsencrypt/live/findx.kareemsoft.org/fullchain.pem;
ssl_certificate_key /etc/letsencrypt/live/findx.kareemsoft.org/privkey.pem;
```

Reload Nginx from the **panel** (or `sudo /etc/init.d/nginx reload` / whatever the panel uses).

#### A2. Certbot **standalone** (Nginx must be stopped briefly)

Certbot listens on port 80. Stop Nginx, get the cert, then start Nginx again.

```bash
# Stop Nginx (use the panel’s “Stop” for Nginx, or:)
sudo systemctl stop nginx
# If the panel uses its own script:
# sudo /etc/init.d/nginx stop

sudo certbot certonly --standalone \
  -d findx.kareemsoft.org -d www.findx.kareemsoft.org \
  --email shabankareem919@gmail.com \
  --agree-tos --no-eff-email

# Start Nginx again (panel or:)
sudo systemctl start nginx
```

Then add the `ssl_certificate` and `ssl_certificate_key` lines to your Nginx server block as in A1.

#### A3. If you use the panel’s Nginx (no custom PID)

```bash
# Install if needed
sudo apt install certbot python3-certbot-nginx -y

# Issue/renew (only works if certbot can restart Nginx)
sudo certbot --nginx -d findx.kareemsoft.org -d www.findx.kareemsoft.org
```

### Option B – BaoTa / panel SSL

1. In the panel, open the site **findx.kareemsoft.org**.
2. Go to **SSL** or **HTTPS**.
3. Request/apply a certificate for **findx.kareemsoft.org** (and **www** if you use it).
4. Ensure this certificate is the one used for the **server block** that handles `findx.kareemsoft.org` (the same vhost that serves your site and `/api`).

## 3. Ensure one Nginx server block with one SSL cert

Your site, API, and dashboard are on the same host: **findx.kareemsoft.org**. There should be **one** server block (or one per server_name) that:

- Listens on 443 with `ssl` and the certificate for **findx.kareemsoft.org**.
- Handles `/`, `/api`, and `/dashboard` (as in `deploy/nginx-findx-single-domain.conf.example`).

If you have **two** server blocks (e.g. one for “main site” and one for “API”) and only one has a valid cert, the browser may get the wrong cert and show ERR_CERT_COMMON_NAME_INVALID. Prefer a single server block for `server_name findx.kareemsoft.org` with one SSL cert.

## 4. After fixing the cert

- Reload Nginx: `sudo nginx -t && sudo systemctl reload nginx`
- In the browser use **https://findx.kareemsoft.org** (and **https://findx.kareemsoft.org/dashboard**).
- Ensure the frontend and dashboard call the API as **https://findx.kareemsoft.org/api** (no other hostname). Env vars to check:
  - Frontend build: `VITE_API_URL=https://findx.kareemsoft.org/api`
  - Dashboard: `NEXT_PUBLIC_API_URL=https://findx.kareemsoft.org/api`

Once the certificate is valid for **findx.kareemsoft.org**, ERR_CERT_COMMON_NAME_INVALID will go away.
