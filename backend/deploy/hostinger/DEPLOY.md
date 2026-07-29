# Hostinger VPS Deployment

## 1. Point Your Domain

- `A` record for `api.example.com` -> your VPS public IP
- Keep your frontend domain on Netlify, or point `www.example.com` separately if you later move it

## 2. Connect to VPS

```bash
ssh root@your-vps-ip
```

## 3. Install Docker + Compose plugin + Nginx

```bash
apt update && apt upgrade -y
apt install -y ca-certificates curl gnupg nginx
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable docker
systemctl enable nginx
```

## 4. Pull Project

```bash
mkdir -p /var/www/nlc
cd /var/www/nlc
git clone https://github.com/your-user/your-repo.git .
```

## 5. Configure Backend Env

```bash
cp backend/deploy/hostinger/.env.example backend/deploy/hostinger/.env
nano backend/deploy/hostinger/.env
```

## 6. Start Backend + Postgres

```bash
cd /var/www/nlc/backend/deploy/hostinger
docker compose up -d --build
docker compose ps
```

## 7. Configure Nginx Reverse Proxy

```bash
cp /var/www/nlc/backend/deploy/hostinger/nginx-nlc.conf /etc/nginx/sites-available/nlc-api
nano /etc/nginx/sites-available/nlc-api
ln -s /etc/nginx/sites-available/nlc-api /etc/nginx/sites-enabled/nlc-api
nginx -t
systemctl reload nginx
```

Replace `api.example.com` inside the file with your real backend domain.

## 8. Add SSL

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d api.example.com
```

## 9. Verify

- `https://api.example.com/api/actuator/health`
- `https://api.example.com/api/swagger-ui.html`
