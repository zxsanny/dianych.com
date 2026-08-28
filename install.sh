cd /etc/nginx/sites-available

tee -a dianych.com << END
server {
    listen 443 ssl;
    server_name dianych.com;
    client_max_body_size 300M;

    location / {
        proxy_pass http://localhost:3001;  # API service running on port 3001
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$remote_addr;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Port 443;
        add_header X-Content-Type-Options nosniff always;
        add_header X-Frame-Options DENY always;
        add_header Referrer-Policy strict-origin-when-cross-origin always;
    }
    location /images/ {
        alias /root/dianych/images/;
        expires 1d;
        add_header Cache-Control "public, max-age=86400";
        add_header X-Content-Type-Options nosniff always;
    }
}

server {
     listen 80;
     server_name dianych.com;
     client_max_body_size 300M;

     # Redirect all HTTP requests to HTTPS
     return 301 https://\$host\$request_uri;
}
END
ln -s /etc/nginx/sites-available/dianych.com /etc/nginx/sites-enabled/

certbot --nginx -d dianych.com