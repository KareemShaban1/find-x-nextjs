# Deploy config examples

Use these on your Contabo (or any Ubuntu) server. See the main [DEPLOYMENT.md](../DEPLOYMENT.md) for full steps.

- **nginx-*.conf.example** – Copy to `/etc/nginx/sites-available/`, edit `server_name` and paths, then enable and reload Nginx.
- **env.production.example** – Copy to project root as `.env.production` before running `npm run build` for the frontend.

## PM2 – Find X Dashboard (port 3008)

From the **dashboard** folder:

```bash
cd /www/wwwroot/findx.kareemsoft.org/dashboard

# Remove any old/duplicate findx-dashboard processes
pm2 delete findx-dashboard

# Start with ecosystem file (single instance, port 3008)
pm2 start ecosystem.config.cjs

pm2 save
pm2 startup   # if not already set
```

If you prefer npm: `pm2 start npm --name "findx-dashboard" -- start` (must be run from the dashboard directory so `npm run start` uses the right package.json).
