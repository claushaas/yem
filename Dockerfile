# syntax=docker/dockerfile:1.4

FROM node:22-alpine3.20 AS base

    RUN apk update && apk add --no-cache tzdata
    ENV TZ="America/Sao_Paulo"

    FROM base AS deps

    ENV NODE_ENV development

    WORKDIR /app

    COPY --link package*.json ./

    RUN npm ci

FROM base AS prod-deps

    ENV NODE_ENV production

    WORKDIR /app

    COPY --link --from=deps /app/node_modules ./node_modules
    COPY --link package*.json ./
    RUN npm prune --omit=dev


FROM base AS dev

    ENV NODE_ENV development

    WORKDIR /app

    COPY --link --from=deps /app/node_modules ./node_modules
    COPY --link package*.json ./
    COPY --link . .

    RUN npx prisma generate

    EXPOSE 3001

    CMD ["npm", "run", "dev"]

FROM base AS builder

    ENV NODE_ENV production

    WORKDIR /app

    COPY --link package*.json ./
    COPY --link --from=deps /app/node_modules ./node_modules

    COPY --link . .

    RUN npx prisma generate && npm run build

FROM base AS prod

    ENV NODE_ENV production
    ENV PORT 3000

    WORKDIR /app

    COPY --link package.json ./
    COPY --link prisma ./prisma
    COPY --link --from=prod-deps /app/node_modules ./node_modules
    COPY --link --from=builder /app/build/client ./build/client
    COPY --link --from=builder /app/build/server ./build/server

    RUN npx prisma generate

    CMD ["npm", "run", "start"]
