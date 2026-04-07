FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# NEXT_PUBLIC_API_URL is baked into the client-side JS bundle at build time.
# Default '' → client calls use relative /api/* paths, proxied by Nginx.
# Only override for cross-origin API (e.g. https://api.example.com).
# INTERNAL_API_URL is read at runtime by the Node.js SSR server (not a build arg).
ARG NEXT_PUBLIC_API_URL=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Build Next.js (standalone output)
RUN npm run build

# Runtime image
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy standalone build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
