# Smart Library Hub Deployment Guide

## Frontend Build

Create a `.env` file from `.env.example` and set the correct backend URLs.

Run:

```bash
npm install
npm run build
```

Deploy the generated `dist/` folder to any static hosting platform:

- Netlify
- Vercel
- Cloudflare Pages
- Firebase Hosting

## University Server Quick Start

Use these template files when you go to campus:

- Frontend template: [`.env.university.example`](/C:/Users/ABHI%20PATEL/Desktop/library-frontend/.env.university.example)
- Backend template: [`.env.university.example`](/C:/xampp/htdocs/library-backend/.env.university.example)

Recommended order on campus:

```bash
# Backend
composer install
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Optional seed data
php artisan db:seed
php artisan library:seed-books 1200

# Frontend
npm install
npm run build
```

Take screenshots of:

- deployed URL in browser
- login page
- books page
- admin panel
- successful migration output
- any database table proof if your tutor expects it

## Frontend Production Notes

- Set these in your frontend `.env`:

```env
VITE_API_BASE=https://your-backend-domain.com/api
VITE_UPLOADS_BASE=https://your-backend-domain.com/uploads
```

- Ensure your frontend domain is allowed by Laravel CORS.
- If deploying under HTTPS, use HTTPS API URLs only.

## Laravel Production Setup

Required steps:

```bash
composer install
php artisan key:generate
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

If using uploaded ebook files and generated covers:

- keep `public/uploads/`
- keep `storage/app/ebooks/`
- make sure web server can read these paths

## Recommended Laravel `.env`

Set these values in production:

```env
APP_NAME="Smart Library Hub"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-backend-domain.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your_email
MAIL_FROM_NAME="Smart Library Hub"

RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

## Security Checklist

- Replace demo admin signup code with an environment-based value.
- Do not keep `APP_DEBUG=true` in production.
- Use HTTPS for frontend and backend.
- Restrict file upload size and validate MIME types further for ebooks and images.
- Move any hardcoded API base URL to environment variables.
- Review custom token auth and rotate tokens on sensitive account changes if needed.

## Launch QA Checklist

- User signup/login works
- Admin login works
- Admin can create and update books
- PDF/EPUB upload works
- Cart and checkout flow works
- Razorpay payment verify works
- Purchased books unlock in profile
- Reader access works
- Borrow request flow works
- Notifications appear in profile
- Email notifications are being delivered
- Generated covers load correctly
- Infinite scroll works on books page

## Nice Next Improvements

- Add unread/read notification actions
- Add password reset flow
- Add queue worker for email sending
- Add webhook verification for Razorpay events
