# How to log in to Admin and Organization dashboard (server)

## 1. Login URL on the server

Open in your browser:

- **Login page:** `https://findx.kareemsoft.org/dashboard/login`  
  (or `http://findx.kareemsoft.org/dashboard/login` if you don’t use HTTPS yet)

After a successful login you are redirected to:

- **Admin dashboard:** `https://findx.kareemsoft.org/dashboard/admin` (role: `super_admin`)
- **Organization dashboard:** `https://findx.kareemsoft.org/dashboard/organization` (role: `organization_owner`)

---

## 2. Admin login (super_admin)

The **super admin** user is created by the Laravel database seeder.

### First-time setup: run the seeder

On the server:

```bash
cd /www/wwwroot/findx.kareemsoft.org/backend
php artisan db:seed
```

This creates (or updates) a user:

- **Email:** `admin@findx.com`
- **Password:** `password`
- **Role:** `super_admin`

### Log in as admin

1. Go to **https://findx.kareemsoft.org/dashboard/login**
2. Email: `admin@findx.com`
3. Password: `password`
4. Click **Sign in** → you are redirected to the **Admin** dashboard.

**Important:** Change this password in production (e.g. via Laravel Tinker or a “change password” feature if you add one).

### Create or reset admin via Tinker (optional)

```bash
cd /www/wwwroot/findx.kareemsoft.org/backend
php artisan tinker
```

Then in Tinker:

```php
// Create or update super admin
$user = \App\Models\User::updateOrCreate(
    ['email' => 'admin@findx.com'],
    [
        'name'     => 'Super Admin',
        'password' => bcrypt('YourNewPassword'),
        'role'     => 'super_admin',
    ]
);
echo "Admin OK: " . $user->email;
exit
```

---

## 3. Organization login (organization_owner)

**Organization** users have role `organization_owner` and must be linked to a **business** (so they can manage that business in the Organization dashboard).

### Option A: Register from the main website

1. Open the **main site:** `https://findx.kareemsoft.org`
2. Use the **Register** (or “List your business”) flow.
3. Register as a **business owner** – the API creates a user with role `organization_owner` and (if the flow creates it) a business linked to that user.
4. Then go to **https://findx.kareemsoft.org/dashboard/login** and sign in with the same email and password.

### Option B: Create organization user + business via Tinker

On the server:

```bash
cd /www/wwwroot/findx.kareemsoft.org/backend
php artisan tinker
```

Example: create a business, then a user linked to it:

```php
// Create a business first
$business = \App\Models\Business::create([
    'name'        => 'My Business',
    'slug'        => 'my-business',
    'description' => 'Description',
    'address'     => '123 Street',
    'city'        => 'Cairo',
    'state'       => 'Cairo',
    'phone'       => '+201234567890',
    'email'       => 'owner@example.com',
    'price_range' => 2,
    'is_open'     => true,
    'category_id' => 1, // use an existing category id
]);

// Create organization owner linked to this business
$user = \App\Models\User::create([
    'name'        => 'Business Owner',
    'email'       => 'owner@example.com',
    'password'    => bcrypt('YourPassword'),
    'role'        => 'organization_owner',
    'business_id' => $business->id,
]);

echo "Organization user: " . $user->email . " -> business_id " . $business->id;
exit
```

Then log in at **https://findx.kareemsoft.org/dashboard/login** with `owner@example.com` / `YourPassword`. You will be redirected to the **Organization** dashboard.

---

## 4. Summary

| Role               | Login URL                          | Default / example account              | After login redirects to   |
|--------------------|------------------------------------|----------------------------------------|---------------------------|
| **Admin**          | …/dashboard/login                  | admin@findx.com / password (from seed) | …/dashboard/admin         |
| **Organization**   | …/dashboard/login                  | Any org user (register or Tinker)      | …/dashboard/organization  |

- **Admin:** run `php artisan db:seed` once, then use `admin@findx.com` / `password` (change password in production).
- **Organization:** register from the main site or create user + business in Tinker, then use that email/password on the same login page.
