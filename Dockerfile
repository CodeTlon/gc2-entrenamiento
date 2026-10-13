# syntax=docker/dockerfile:1
# Imagen de producción para Coolify (app + Postgres en la misma red interna; ver docker-compose.coolify.yml).
FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Sin DATABASE_URL en el build: las páginas con datos se renderizan por request.
# La URL pública se incrusta en sitemap, robots y metadatos: tiene que llegar como argumento de build.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_GA_ID
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL NEXT_PUBLIC_GA_ID=$NEXT_PUBLIC_GA_ID
RUN npm run build
# El script de migraciones se empaqueta en un solo archivo (el standalone de Next no trae drizzle ni su migrador).
RUN npx esbuild scripts/migrate.mts --bundle --platform=node --format=esm --external:pg-native --outfile=dist/migrate.mjs \
    --banner:js="import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"
# Alta de usuarios del dashboard dentro del contenedor (la base no tiene puerto público): docker exec <app> node scripts/crear-usuario.mjs <email> <nombre> admin
RUN npx esbuild scripts/crear-usuario.mts --bundle --platform=node --format=esm --external:pg-native --external:next --external:next/* --external:server-only --outfile=dist/crear-usuario.mjs \
    --banner:js="import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);"

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0 STORAGE_DIR=/data/storage
RUN addgroup -S app && adduser -S app -G app && mkdir -p /data/storage && chown app:app /data/storage
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build --chown=app:app /app/public ./public
COPY --from=build --chown=app:app /app/drizzle ./drizzle
COPY --from=build --chown=app:app /app/dist/migrate.mjs /app/dist/crear-usuario.mjs ./scripts/
COPY --chown=app:app docker-entrypoint.sh ./
USER app
VOLUME /data/storage
EXPOSE 3000
ENTRYPOINT ["sh", "docker-entrypoint.sh"]
