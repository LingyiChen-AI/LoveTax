# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=30001
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/lib/db/migrations ./lib/db/migrations
COPY --from=builder /app/scripts ./scripts
COPY --from=deps /app/node_modules ./node_modules
USER app
EXPOSE 30001
CMD ["sh", "-c", "npx tsx scripts/migrate.ts && npx tsx scripts/seed-admin.ts && node server.js"]
