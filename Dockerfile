# syntax=docker/dockerfile:1.4

FROM node:20-alpine AS base

RUN apk update && apk add --no-cache tzdata
ENV TZ="America/Sao_Paulo"

FROM base as deps

ENV NODE_ENV development

WORKDIR /app

COPY --link package*.json ./

RUN npm ci

FROM base as prod-deps

ENV NODE_ENV production

WORKDIR /app

COPY --link --from=deps /app/node_modules ./node_modules
COPY --link package*.json ./
RUN npm prune --production


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

RUN npx prisma generate

RUN npm run build

FROM base AS prod

ENV NODE_ENV production

WORKDIR /app

COPY --link package.json ./
COPY --link prisma ./prisma
COPY --link --from=prod-deps /app/node_modules ./node_modules
COPY --link --from=builder /app/build/client ./build/client
COPY --link --from=builder /app/build/server ./build/server
COPY --link --from=builder /app/build/api ./build/api
COPY --link --from=builder /app/build/app.js ./build/app.js
COPY --link --from=builder /app/build/server.js ./build/server.js

RUN npx prisma generate

CMD ["npm", "run", "start"]
