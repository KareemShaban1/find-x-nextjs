# How to reload Nginx when systemctl doesn't work

If you see `invalid PID number "" in "/run/nginx.pid"` or `nginx.service is not active`, Nginx was started by something else (e.g. BaoTa panel) and uses a different PID file.

## 1. Find the running Nginx process

On the server run:

```bash
ps aux | grep nginx
```

You might see something like:
- `nginx: master process /www/server/nginx/sbin/nginx`
- Or `nginx: master process /usr/sbin/nginx`

Note the **full path** of the binary (e.g. `/www/server/nginx/sbin/nginx`).

## 2. Find the PID file that Nginx is using

```bash
# Common BaoTa path
ls -la /www/server/nginx/logs/nginx.pid

# Or ask the running process (Linux)
cat /proc/$(pgrep -f "nginx: master")/cmdline 2>/dev/null | tr '\0' ' '
```

If you see a PID file under `/www/server/nginx/logs/`, use that for reload.

## 3. Reload using the correct binary and PID file

**If Nginx is under `/www/server/nginx/` (BaoTa):**

```bash
# Test config (use the panel's nginx binary)
sudo /www/server/nginx/sbin/nginx -t -c /www/server/nginx/conf/nginx.conf

# Reload (sends signal to master process)
sudo /www/server/nginx/sbin/nginx -s reload -c /www/server/nginx/conf/nginx.conf
```

If the config path is different, check:

```bash
ls /www/server/nginx/conf/
```

**Or** create the PID file and reload (only if the master process exists):

```bash
# Get master PID
NGINX_PID=$(pgrep -f "nginx: master" | head -1)
echo $NGINX_PID

# Reload by sending HUP to master
sudo kill -HUP $NGINX_PID
```

## 4. Reload from BaoTa panel

1. Log in to BaoTa.
2. Go to **Software Store** (or **App Store**) → **Nginx**.
3. Click **Reload** or **Restart**.

Or: **Website** → select **findx.kareemsoft.org** → **Settings** → **Nginx config** → after saving, there is often a **Reload** or **Restart Nginx** button.

## 5. After reload

Check that your vhost config is loaded:

```bash
# List loaded configs (path may vary)
sudo /www/server/nginx/sbin/nginx -T 2>/dev/null | grep -A2 "findx.kareemsoft.org"
```

Then test: **http://findx.kareemsoft.org/dashboard/login**
