# Start from the base image and install dependencies
FROM node:20-bookworm-slim AS deps

# Install libvips and other necessary build tools for sharp
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory for dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --include=optional

# Build the application
FROM deps AS builder
COPY . .
RUN npm run build

# Production image
FROM node:20-bookworm-slim AS runner
ENV NODE_ENV=production

# Install libvips runtime dependencies.
# This must be done here, as the final image is based on the slim image.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libvips \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy built application and required assets
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

# Re-install only production dependencies, including sharp, to ensure correct binaries.
# This prevents potential mismatches if built on a different architecture.
COPY package.json package-lock.json ./
RUN npm ci --production


# Create and switch to a non-root user
USER node

EXPOSE 3000
CMD ["node", "server.js"]
