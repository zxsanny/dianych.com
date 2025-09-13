docker stop dianych.com
docker rm dianych.com
docker login docker.azaion.com
docker pull docker.azaion.com/dianych:latest
docker run -p 3001:3000 \
          -v /root/dianych/images:/app/public/images \
          -e SECRET_COOKIE_PASSWORD="$(openssl rand -base64 48)" \
          --name dianych.com --restart always docker.azaion.com/dianych
