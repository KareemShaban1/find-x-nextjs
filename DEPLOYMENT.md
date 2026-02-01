# Deploying Find X on a Contabo VPS

This guide walks you through deploying the Find X project (Laravel API, React frontend, Next.js dashboard) on a Contabo server (Ubuntu 22.04 LTS recommended).

## Architecture

| Part        | Tech        | Port (dev) | Production          |
|------------|-------------|------------|---------------------|
| Backend API| Laravel     | 8000       | Nginx → PHP-FPM     |
| Frontend   | Vite/React  | 5173       | Static files (Nginx)|
| Dashboard  | Next.js     | 3000       | Node (PM2) or Nginx |

---

## 1. Server Setup (Contabo)

### 1.1 Create a VPS

- Log in to [Contabo](https://contabo.com) and order a VPS (e.g. Cloud VPS S or M).
- Choose **Ubuntu 22.04**.
- Note the server IP and use SSH to connect:  
  `ssh root@YOUR_SERVER_IP`

### 1.2 Initial server configuration

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Create a deploy user (recommended)
sudo adduser findx
sudo usermod -aG sudo findx
sudo su - findx
```

### 1.3 Install required software

```bash
# PHP 8.2+ and extensions (Laravel)
sudo apt install -y php8.2-fpm php8.2-cli php8.2-mysql php8.2-sqlite3 \
  php8.2-mbstring php8.2-xml php8.2-curl php8.2-zip php8.2-gd php8.2-intl

# Node.js 20 LTS (for Next.js and building frontend)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Nginx
sudo apt install -y nginx

# Composer (Laravel)
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Git
sudo apt install -y git
```

### 1.4 (Optional) MySQL instead of SQLite

```bash
sudo apt install -y mysql-server
sudo mysql_secure_installation
# Create database and user:
sudo mysql -e "CREATE DATABASE findx; CREATE USER 'findx'@'localhost' IDENTIFIED BY 'YOUR_PASSWORD'; GRANT ALL ON findx.* TO 'findx'@'localhost'; FLUSH PRIVILEGES;"
```

---

## 2. Deploy the application

### 2.1 Clone the repository

```bash
sudo mkdir -p /var/www/findx
sudo chown findx:findx /var/www/findx
cd /var/www/findx
git clone https://github.com/YOUR_ORG/find-x.git .
# Or upload via SCP/SFTP if private
```

### 2.2 Backend (Laravel)

```bash
cd /var/www/findx/backend

# Install PHP dependencies
composer install --no-dev --optimize-autoloader

# Environment
cp .env.example .env
php artisan key:generate

# Edit .env for production
nano .env
```

Set in `backend/.env`:

```env
APP_NAME=FindX
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.yourdomain.com

# Database: SQLite (default) or MySQL
DB_CONNECTION=sqlite
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_DATABASE=findx
# DB_USERNAME=findx
# DB_PASSWORD=your_password

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database
```

```bash
# SQLite: create file and migrate
touch database/database.sqlite
# Or for MySQL: ensure DB exists, then:
php artisan migrate --force

# Storage and cache
php artisan storage:link
php artisan config:cache
php artisan route:cache
chmod -R 775 storage bootstrap/cache
sudo chown -R www-data:www-data storage bootstrap/cache
```

### 2.3 Frontend (Vite/React) – build static files

On the server (or on your machine and upload `dist/`):

```bash
cd /var/www/findx

# Create env for build (use your real API and dashboard URLs)
echo 'VITE_API_URL=https://api.yourdomain.com/api' > .env.production
echo 'VITE_DASHBOARD_URL=https://dashboard.yourdomain.com' >> .env.production

npm ci
npm run build
```

This produces `dist/` with static assets. Nginx will serve these (see below).

### 2.4 Dashboard (Next.js)

```bash
cd /var/www/findx/dashboard

# Environment
echo 'NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api' > .env.production

npm ci
npm run build
```

Run in production with Node (PM2 recommended):

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start dashboard
cd /var/www/findx/dashboard
pm2 start npm --name "findx-dashboard" -- start
pm2 save
pm2 startup   # Enable on boot
```

Dashboard will listen on `localhost:3000`; Nginx will proxy to it.

---

## 3. Nginx configuration

### 3.1 API (Laravel)

Create `/etc/nginx/sites-available/findx-api`:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /var/www/findx/backend/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
        fastcgi_hide_header X-Powered-By;
    }
}
```

### 3.2 Frontend (static)

Create `/etc/nginx/sites-available/findx-frontend`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    root /var/www/findx/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3.3 Dashboard (Next.js proxy)

Create `/etc/nginx/sites-available/findx-dashboard`:

```nginx
server {
    listen 80;
    server_name dashboard.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3.4 Enable sites and test

```bash
sudo ln -s /etc/nginx/sites-available/findx-api /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/findx-frontend /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/findx-dashboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4. SSL with Let's Encrypt (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com -d dashboard.yourdomain.com
```

Follow prompts. Certbot will adjust Nginx for HTTPS. Renewal is automatic.

After SSL, set in Laravel `.env`:

```env
APP_URL=https://api.yourdomain.com
```

And ensure frontend/dashboard `.env.production` use `https://` for API and dashboard URLs.

---

## 5. CORS (Laravel)

If frontend/dashboard use different domains, allow them in Laravel.

Edit `backend/config/cors.php`:

```php
'allowed_origins' => [
    'https://yourdomain.com',
    'https://www.yourdomain.com',
    'https://dashboard.yourdomain.com',
],
```

Then: `php artisan config:cache`

---

## 6. Operations

### Start/stop services

```bash
# PHP-FPM
sudo systemctl start php8.2-fpm
sudo systemctl enable php8.2-fpm

# Nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Dashboard (PM2)
pm2 start findx-dashboard
pm2 stop findx-dashboard
pm2 restart findx-dashboard
pm2 logs findx-dashboard
```

### Deploy updates

```bash
cd /var/www/findx
git pull

# Backend
cd backend
composer install --no-dev --optimize-autoloader
php artisan migrate --force
php artisan config:cache
php artisan route:cache

# Frontend
cd ..
npm ci && npm run build

# Dashboard
cd dashboard
npm ci && npm run build
pm2 restart findx-dashboard
```

### Logs

- Nginx: `/var/log/nginx/error.log`, `/var/log/nginx/access.log`
- Laravel: `backend/storage/logs/laravel.log`
- Dashboard: `pm2 logs findx-dashboard`

### File permissions (Laravel)

```bash
sudo chown -R www-data:www-data /var/www/findx/backend/storage /var/www/findx/backend/bootstrap/cache
chmod -R 775 /var/www/findx/backend/storage /var/www/findx/backend/bootstrap/cache
```

---

## 7. Environment summary

| Where              | Variable               | Example value                        |
|--------------------|------------------------|--------------------------------------|
| Backend `.env`     | `APP_URL`              | `https://api.yourdomain.com`         |
| Backend `.env`     | `DB_*`                 | SQLite or MySQL credentials          |
| Root `.env.production` (frontend build) | `VITE_API_URL`   | `https://api.yourdomain.com/api`     |
| Root `.env.production` (frontend build) | `VITE_DASHBOARD_URL` | `https://dashboard.yourdomain.com` |
| Dashboard `.env.production` | `NEXT_PUBLIC_API_URL` | `https://api.yourdomain.com/api` |

---

## 8. Single domain (optional)

If you use one domain with paths, e.g.:

- `yourdomain.com` → frontend  
- `yourdomain.com/api` → Laravel API  
- `yourdomain.com/dashboard` → Next.js dashboard  

you would use one Nginx server block with `location /api`, `location /dashboard`, and `location /` and proxy or alias accordingly. The apps must be configured to use the same origin (no cross-origin API URL). This is more involved; the subdomain setup above is simpler.

---

## 9. Troubleshooting

- **502 Bad Gateway**: Check PHP-FPM is running (`sudo systemctl status php8.2-fpm`) and the socket path in Nginx matches (`/var/run/php/php8.2-fpm.sock`).
- **API CORS errors**: Update `backend/config/cors.php` and run `php artisan config:cache`.
- **Dashboard blank or API errors**: Ensure `NEXT_PUBLIC_API_URL` and `VITE_API_URL` use the correct API URL (and HTTPS in production).
- **Storage uploads (images) 404**: Run `php artisan storage:link` and ensure Nginx serves `storage/app/public` or that Laravel is under the same domain and correct `APP_URL` is set.

For more on Contabo, see [Contabo Docs](https://contabo.com/en/support/).
