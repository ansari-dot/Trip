# North Paradise Deployment Guide (Hostinger VPS)

## 1. Directory Structure on VPS
Recommended structure under `/var/www/northparadise`:
```
/var/www/northparadise/
├── backend/
│   ├── .env
│   ├── uploads/         <-- Images will be stored here
│   └── (server files)
├── frontend/
│   └── dist/            <-- Built client files
└── admin/
    └── dist/            <-- Built admin files
```

## 2. Handling the "Missing Images" Issue
The most common reason images disappear after deployment is hardcoded `localhost` URLs.

### Step A: Backend `.env` (on VPS: `/var/www/northparadise/backend/.env`)
Copy from `backend/.env.example`. No localhost in code — all URLs come from env:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://127.0.0.1:27017/north-paradise
JWT_SECRET=your-long-secret

# Public URL for /uploads image links (no trailing slash)
PUBLIC_URL=https://northparadisetreksandtours.com

# Allowed browser origins, comma-separated (no trailing slashes)
CLIENT_URL=https://northparadisetreksandtours.com,https://www.northparadisetreksandtours.com,https://admin.northparadisetreksandtours.com

CLIENT_SITE_URL=https://northparadisetreksandtours.com

GROQ_API_KEY=your_groq_key
```

### Step B: Frontend `.env` — build on VPS before `npm run build`
```env
VITE_API_URL=https://northparadisetreksandtours.com
VITE_SITE_URL=https://northparadisetreksandtours.com
VITE_WHATSAPP_NUMBER=923488142776
```
If nginx on the same domain proxies `/api` to Node, `VITE_API_URL` can match the site URL.

### Step C: Admin `.env` — build before `npm run build`
```env
VITE_API_URL=https://northparadisetreksandtours.com
```

### Step C: Folder Permissions
Nginx needs to read the `uploads` folder. Run these commands on your VPS:
```bash
sudo chown -R www-data:www-data /var/www/northparadise/backend/uploads
sudo chmod -R 755 /var/www/northparadise/backend/uploads
```

## 3. Nginx Setup
1. Copy the provided `.conf` files to `/etc/nginx/sites-available/`.
2. Link them:
   ```bash
   sudo ln -s /etc/nginx/sites-available/nginx_frontend.conf /etc/nginx/sites-enabled/
   sudo ln -s /etc/nginx/sites-available/nginx_admin.conf /etc/nginx/sites-enabled/
   ```
3. Test and restart:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 4. PM2 for Backend
Run your backend using PM2 to keep it alive:
```bash
cd /var/www/northparadise/backend
pm2 start index.js --name "np-backend"
pm2 save
```

## 5. Important: Git & Uploads
Do **NOT** track the `backend/uploads` folder in Git. 
Your root `.gitignore` already handles this. Images uploaded on the server stay on the server.
If you need to move images from local to server once, use `scp` or `rsync`:
```bash
rsync -avz backend/uploads/ root@your_vps_ip:/var/www/northparadise/backend/uploads/
```
