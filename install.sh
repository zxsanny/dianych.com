#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
DOMAIN="${DIANYCH_DOMAIN:-dianych.com}"
WEBROOT="/var/www/certbot"
SITE_AVAIL="/etc/nginx/sites-available/dianych.com"
SITE_ENAB="/etc/nginx/sites-enabled/dianych.com"
CERT_LIVE="/etc/letsencrypt/live/${DOMAIN}"

mkdir -p "$ROOT/images"

if ! sudo -n true 2>/dev/null; then
  echo "install.sh needs sudo (nginx + certbot). Run: sudo -v && $0" >&2
  exit 1
fi

sudo mkdir -p "$WEBROOT"

write_http() {
  sudo tee "$SITE_AVAIL" >/dev/null <<END
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root ${WEBROOT};
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
END
}

write_https() {
  sudo tee "$SITE_AVAIL" >/dev/null <<END
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN};

    location /.well-known/acme-challenge/ {
        root ${WEBROOT};
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    server_name ${DOMAIN};

    ssl_certificate     ${CERT_LIVE}/fullchain.pem;
    ssl_certificate_key ${CERT_LIVE}/privkey.pem;

    client_max_body_size 20m;
    add_header X-Content-Type-Options nosniff always;
    add_header X-Frame-Options DENY always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Port 443;
    }
}
END
}

write_http
sudo ln -sfn "$SITE_AVAIL" "$SITE_ENAB"
sudo nginx -t
sudo systemctl reload nginx

HOST_IP="$(curl -4fsS --max-time 8 ifconfig.me || true)"
DNS_IP="$(
  { command -v dig >/dev/null && dig +short "$DOMAIN" A @8.8.8.8 | awk 'NF && $1 !~ /\.$/ {print $1; exit}'; } \
  || { command -v host >/dev/null && host "$DOMAIN" 8.8.8.8 | awk '/has address/{print $4; exit}'; } \
  || getent hosts "$DOMAIN" | awk '{print $1; exit}'
)"
if [[ -z "$HOST_IP" || -z "$DNS_IP" || "$HOST_IP" != "$DNS_IP" ]]; then
  echo "DNS ${DOMAIN} is ${DNS_IP:-unknown}; this host is ${HOST_IP:-unknown}." >&2
  echo "Point the A record to ${HOST_IP:-94.231.79.197} and re-run $0 for TLS." >&2
  exit 2
fi

sudo certbot certonly --webroot -w "$WEBROOT" -d "$DOMAIN" \
  --non-interactive --agree-tos --keep-until-expiring

sudo tee /etc/letsencrypt/renewal-hooks/deploy/reload-nginx >/dev/null <<'HOOK'
#!/bin/sh
nginx -t && systemctl reload nginx
HOOK
sudo chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx

write_https
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable --now certbot.timer
systemctl is-active certbot.timer
echo "TLS for ${DOMAIN} installed; certbot.timer renews automatically."
