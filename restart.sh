docker stop dianych.com
docker rm dianych.com

# Ensure host images directory exists to mount
mkdir -p /var/www/dianych/images

# Align host directory ownership to container's default user UID (1000).
# Note: on the host this UID may map to a different username
chown -R 1000:1000 /var/www/dianych/images || true
chmod -R 0775 /var/www/dianych/images || true

# Run the container as non-root (Dockerfile sets USER node). No --user override needed.
docker run -p 3001:3000 \
          -v /var/www/dianych/images:/app/public/images:noexec,nosuid \
          --tmpfs /tmp:noexec,nosuid,size=512m \
          --read-only \
          -e SECRET_COOKIE_PASSWORD="$(openssl rand -base64 48)" \
          --name dianych.com --restart always docker.azaion.com/dianych
