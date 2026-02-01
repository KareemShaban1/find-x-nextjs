# Deploy config examples

Use these on your Contabo (or any Ubuntu) server. See the main [DEPLOYMENT.md](../DEPLOYMENT.md) for full steps.

- **nginx-*.conf.example** – Copy to `/etc/nginx/sites-available/`, edit `server_name` and paths, then enable and reload Nginx.
- **env.production.example** – Copy to project root as `.env.production` before running `npm run build` for the frontend.
