# syntax=docker/dockerfile:1.7

# ---------- Build stage ----------
FROM node:22-alpine AS builder
WORKDIR /app

# Install deps
COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Build the app with the Node.js server preset for Nitro
COPY . .
ENV NODE_ENV=production
ENV NITRO_PRESET=node-server
ENV VITE_API_URL=https://api.worqgo.com
RUN npm run build

# ---------- Runtime stage ----------
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NITRO_PRESET=node-server
ENV HOST=0.0.0.0
ENV PORT=3001
ENV NITRO_PORT=3001
ENV NITRO_HOST=0.0.0.0
ENV VITE_API_URL=https://api.worqgo.com

# Nitro node-server preset outputs a fully self-contained bundle in .output
COPY --from=builder /app/.output ./.output
COPY --from=builder /app/package.json ./package.json

EXPOSE 3001

# Basic health check hitting the SSR server
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3001/ >/dev/null 2>&1 || exit 1

CMD ["node", ".output/server/index.mjs"]
