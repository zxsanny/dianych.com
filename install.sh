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
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Port 443;
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