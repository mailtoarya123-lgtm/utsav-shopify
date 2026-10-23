FROM node:20-alpine AS base

# Install OpenSSL for Prisma
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Install dependencies based on the package-lock.json
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client and initialize SQLite database
RUN npx prisma generate && npx prisma db push --accept-data-loss

# Build the Remix application
ENV NODE_ENV=production
RUN npm run build

# Production image, copy all the files and run remix
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=10000
ENV SHOPIFY_APP_URL=https://utsav-shopify.onrender.com
ENV SHOPIFY_API_KEY=aba15c2b5828795eb89e10f73e91ff06
ENV SCOPES=read_themes,write_themes,read_script_tags,write_script_tags
ENV DATABASE_URL=file:/app/prisma/dev.sqlite

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/shopify.app.toml ./shopify.app.toml
COPY --from=builder /app/extensions ./extensions

EXPOSE 10000

# Automatically ensure SQLite database tables exist and start remix-serve on Render's assigned $PORT
CMD ["sh", "-c", "npx prisma db push --accept-data-loss || true && npx remix-serve build/server/index.js"]
