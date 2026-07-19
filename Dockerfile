# ============================================
# Optisafe.fr — Multi-stage Dockerfile
# Serves Next.js app (frontend + API routes)
# Also used by worker service with different CMD
# ============================================

# --- Stage 1: Dependencies ---
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# --- Stage 2: Build ---
FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Build worker (compile TypeScript)
RUN npx tsc --project tsconfig.worker.json

# --- Stage 3: Production ---
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy production dependencies
COPY --from=deps /app/node_modules ./node_modules

# Copy Prisma schema and generated client
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy Next.js build output
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Copy compiled worker
COPY --from=builder /app/dist ./dist

# Create contracts upload directory
RUN mkdir -p /data/contracts && chown nextjs:nodejs /data/contracts

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Default: run the Next.js app server
# Worker override: node dist/worker/index.js
CMD ["node", "server.js"]
