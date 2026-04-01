FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
RUN npm ci

# Copy source
COPY . .

# Build args for API URL (baked into SSR/client bundle)
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
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
